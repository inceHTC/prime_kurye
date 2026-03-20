import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

// ================================
// KURYE SİPARİŞLERİ
// ================================
export async function getCourierOrders(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId

    const courier = await prisma.courier.findUnique({ where: { userId } })
    if (!courier) {
      return res.status(403).json({ success: false, message: 'Kurye profili bulunamadı' })
    }

    // Aktif siparişler (atanmış veya devam eden)
    const activeOrders = await prisma.order.findMany({
      where: {
        courierId: courier.id,
        status: { in: ['PICKING_UP', 'IN_TRANSIT'] },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Bekleyen siparişler (henüz atanmamış, kurye müsaitse)
const pendingOrders = courier.isOnline ? await prisma.order.findMany({
  where: {
    status: 'CONFIRMED',
    courierId: null,
    pendingCourierIds: { has: courier.id },
  },
  orderBy: { createdAt: 'asc' },
  take: 5,
}) : []

    // Bugünkü istatistikler
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayOrders = await prisma.order.findMany({
      where: {
        courierId: courier.id,
        status: 'DELIVERED',
        deliveredAt: { gte: today },
      },
    })

    const todayEarnings = todayOrders.reduce((sum, o) => sum + o.price * 0.80, 0) // %80 kurye payı

    return res.json({
      success: true,
      data: {
        orders: [...activeOrders, ...pendingOrders],
        isOnline: courier.isOnline,
        stats: {
          todayDeliveries: todayOrders.length,
          todayEarnings: Math.round(todayEarnings * 100) / 100,
          rating: courier.rating,
          totalDeliveries: courier.totalDeliveries,
        },
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}

// ================================
// KURYE DURUM GÜNCELLE (online/offline)
// ================================
export async function updateCourierStatus(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId
    const { isOnline } = req.body

    const courier = await prisma.courier.update({
      where: { userId },
      data: { isOnline },
    })

    return res.json({
      success: true,
      message: isOnline ? 'Çevrimiçi oldunuz' : 'Çevrimdışı oldunuz',
      data: { isOnline: courier.isOnline },
    })
  } catch {
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}

// ================================
// KURYE KONUM GÜNCELLE
// ================================
export async function updateCourierLocation(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId
    const { lat, lng } = req.body

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Konum bilgisi gerekli' })
    }

    await prisma.courier.update({
      where: { userId },
      data: {
        currentLat: parseFloat(lat),
        currentLng: parseFloat(lng),
        locationUpdated: new Date(),
      },
    })

    return res.json({ success: true, message: 'Konum güncellendi' })
  } catch {
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}

// ================================
// SİPARİŞ KABUL ET
// ================================
export async function acceptOrder(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId
    const { id } = req.params

    const courier = await prisma.courier.findUnique({ where: { userId } })
    if (!courier) {
      return res.status(403).json({ success: false, message: 'Kurye profili bulunamadı' })
    }

    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) {
      return res.status(404).json({ success: false, message: 'Sipariş bulunamadı' })
    }

    if (order.status !== 'CONFIRMED') {
      return res.status(400).json({ success: false, message: 'Bu sipariş kabul edilemez' })
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        courierId: courier.id,
        status: 'PICKING_UP',
      },
    })

    return res.json({ success: true, message: 'Sipariş kabul edildi', data: updated })
  } catch {
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}

// ================================
// SİPARİŞ DURUMU GÜNCELLE
// ================================
export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId
    const { id } = req.params
    const { status } = req.body

    const courier = await prisma.courier.findUnique({ where: { userId } })
    if (!courier) {
      return res.status(403).json({ success: false, message: 'Kurye profili bulunamadı' })
    }

    const order = await prisma.order.findUnique({ where: { id } })
    if (!order || order.courierId !== courier.id) {
      return res.status(403).json({ success: false, message: 'Bu siparişi güncelleyemezsiniz' })
    }

    const updateData: any = { status }
    if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date()
      // Kurye istatistiklerini güncelle
      await prisma.courier.update({
        where: { id: courier.id },
        data: { totalDeliveries: { increment: 1 } },
      })
    }

    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
    })

    return res.json({ success: true, message: 'Durum güncellendi', data: updated })
  } catch {
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}