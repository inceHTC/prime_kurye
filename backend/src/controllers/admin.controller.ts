import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

// ================================
// GENEL İSTATİSTİKLER
// ================================
export async function getStats(req: Request, res: Response) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      totalOrders,
      activeOrders,
      deliveredOrders,
      totalCouriers,
      totalBusinesses,
      todayOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: { in: ['PENDING', 'CONFIRMED', 'PICKING_UP', 'IN_TRANSIT'] } } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.courier.count(),
      prisma.business.count(),
      prisma.order.findMany({ where: { createdAt: { gte: today } } }),
    ])

    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.price, 0)

    return res.json({
      success: true,
      data: {
        totalOrders,
        activeOrders,
        deliveredOrders,
        totalCouriers,
        totalBusinesses,
        todayRevenue: Math.round(todayRevenue * 100) / 100,
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}

// ================================
// TÜM SİPARİŞLER
// ================================
export async function getAllOrders(req: Request, res: Response) {
  try {
    const { page = 1, limit = 50, status } = req.query
    const where: any = {}
    if (status) where.status = status

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          courier: { include: { user: { select: { fullName: true, phone: true } } } },
          business: { include: { user: { select: { fullName: true } } } },
        },
      }),
      prisma.order.count({ where }),
    ])

    return res.json({ success: true, data: { orders, total } })
  } catch {
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}

// ================================
// SİPARİŞE KURYE ATA
// ================================
export async function assignCourier(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { courierId } = req.body

    const order = await prisma.order.update({
      where: { id },
      data: {
        courierId,
        status: 'PICKING_UP',
      },
    })

    return res.json({ success: true, message: 'Kurye atandı', data: order })
  } catch {
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}

// ================================
// TÜM KURYELER
// ================================
export async function getAllCouriers(req: Request, res: Response) {
  try {
    const couriers = await prisma.courier.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true, email: true, phone: true, createdAt: true } },
        _count: { select: { orders: true } },
      },
    })

    return res.json({ success: true, data: { couriers } })
  } catch {
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}

// ================================
// KURYE ONAYLA / REDDET
// ================================
export async function approveCourier(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { isApproved } = req.body

    const courier = await prisma.courier.update({
      where: { id },
      data: { isApproved },
    })

    return res.json({
      success: true,
      message: isApproved ? 'Kurye onaylandı' : 'Kurye reddedildi',
      data: courier,
    })
  } catch {
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}

// ================================
// TÜM İŞLETMELER
// ================================
export async function getAllBusinesses(req: Request, res: Response) {
  try {
    const businesses = await prisma.business.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true, email: true, phone: true } },
        _count: { select: { orders: true } },
      },
    })

    return res.json({ success: true, data: { businesses } })
  } catch {
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}