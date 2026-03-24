import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { prisma } from '../lib/prisma'
import { findNearestCouriers } from '../services/courierMatching.service'
import { emitOrderUpdate, emitNewOrderToCourier } from '../lib/socket'
import {
  sendOrderCreatedEmail,
  sendCancelledEmail,
} from '../services/email.service'

function generateTrackingCode(): string {
  const prefix = 'PK'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${prefix}${timestamp}${random}`
}

function calculatePrice(distance: number, deliveryType: string, isFragile = false, packageValue = 0): number {
  const basePrices: Record<string, number> = {
    EXPRESS: 136.9,
    SAME_DAY: 94.9,
    SCHEDULED: 110.9,
  }

  const kmPrice = 4.9 * distance
  const base = basePrices[deliveryType] || 136.9
  const multiplier = deliveryType === 'EXPRESS' ? 1 : 0.9
  let totalPrice = (base + kmPrice) * multiplier

  if (isFragile) totalPrice += 25
  if (packageValue > 0) totalPrice += packageValue * 0.02

  return Math.round(totalPrice * 100) / 100
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const earthRadiusKm = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2

  return Math.round(earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10
}

export async function estimatePrice(req: Request, res: Response) {
  try {
    const { senderLat, senderLng, recipientLat, recipientLng, deliveryType, isFragile, packageValue } = req.body
    const distance = calculateDistance(senderLat, senderLng, recipientLat, recipientLng)
    const price = calculatePrice(distance, deliveryType || 'EXPRESS', isFragile, Number(packageValue) || 0)
    const estimatedMinutes = deliveryType === 'EXPRESS' ? Math.round(distance * 3 + 20) : Math.round(distance * 3 + 60)

    return res.json({ success: true, data: { distance, price, estimatedMinutes } })
  } catch {
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}

export async function createOrder(req: Request, res: Response) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const userId = (req as any).user.userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { business: true },
    })

    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' })
    }

    if (user.role === 'COURIER' || user.role === 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Bu hesap tipi sipariş oluşturamaz' })
    }

    const business = user.business ?? await prisma.business.create({
      data: {
        userId,
        companyName: user.fullName,
      },
    })

    const {
      senderName,
      senderPhone,
      senderAddress,
      senderLat,
      senderLng,
      senderNotes,
      recipientName,
      recipientPhone,
      recipientAddress,
      recipientLat,
      recipientLng,
      recipientNotes,
      packageDesc,
      packageWeight,
      isFragile,
      packageValue,
      deliveryType,
      insuranceValue,
      scheduledAt,
    } = req.body

    const distance = calculateDistance(senderLat, senderLng, recipientLat, recipientLng)
    const price = calculatePrice(distance, deliveryType, isFragile, Number(packageValue) || 0)
    const trackingCode = generateTrackingCode()

    const order = await prisma.order.create({
      data: {
        trackingCode,
        deliveryType: deliveryType || 'EXPRESS',
        vehicle: 'MOTORCYCLE',
        senderName,
        senderPhone,
        senderAddress,
        senderLat: parseFloat(senderLat),
        senderLng: parseFloat(senderLng),
        senderNotes,
        recipientName,
        recipientPhone,
        recipientAddress,
        recipientLat: parseFloat(recipientLat),
        recipientLng: parseFloat(recipientLng),
        recipientNotes,
        packageDesc,
        packageWeight: parseFloat(packageWeight) || 1,
        isFragile: isFragile || false,
        packageValue: packageValue ? parseFloat(packageValue) : null,
        price,
        insuranceValue: insuranceValue ? parseFloat(insuranceValue) : null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        businessId: business.id,
        status: 'CONFIRMED',
      },
    })

    const nearestCouriers = await findNearestCouriers(parseFloat(senderLat), parseFloat(senderLng), 3)
    if (nearestCouriers.length > 0) {
      await prisma.order.update({
        where: { id: order.id },
        data: { pendingCourierIds: nearestCouriers.map((courier) => courier.courierId) },
      })
      // Yakın kuryeler socket ile anlık bildirim al
      nearestCouriers.forEach(c => emitNewOrderToCourier(c.courierId, order))
    }

    // Müşteriye e-posta gönder
    try {
      await sendOrderCreatedEmail(user.email, {
        fullName: user.fullName,
        trackingCode,
        recipientName,
        recipientAddress,
        price,
        deliveryType: deliveryType || 'EXPRESS',
      })
    } catch (e) { console.error('Order email error:', e) }

    return res.status(201).json({ success: true, message: 'Sipariş oluşturuldu', data: order })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}

export async function getOrders(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId
    const { page = 1, limit = 10, status } = req.query
    const business = await prisma.business.findUnique({ where: { userId } })

    if (!business) {
      return res.status(403).json({ success: false, message: 'İşletme profili bulunamadı' })
    }

    const where: any = { businessId: business.id }
    if (status) where.status = status

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          courier: {
            include: {
              user: {
                select: { fullName: true, phone: true },
              },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ])

    return res.json({
      success: true,
      data: { orders, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) },
    })
  } catch {
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}

export async function getOrder(req: Request, res: Response) {
  try {
    const { id } = req.params
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        courier: { include: { user: { select: { fullName: true, phone: true } } } },
        business: { include: { user: { select: { fullName: true, phone: true } } } },
      },
    })

    if (!order) {
      return res.status(404).json({ success: false, message: 'Sipariş bulunamadı' })
    }

    return res.json({ success: true, data: order })
  } catch {
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}

export async function trackOrder(req: Request, res: Response) {
  try {
    const { code } = req.params
    const order = await prisma.order.findUnique({
      where: { trackingCode: code },
      select: {
        id: true,
        trackingCode: true,
        status: true,
        deliveryType: true,
        senderAddress: true,
        recipientAddress: true,
        price: true,
        createdAt: true,
        courier: {
          select: {
            currentLat: true,
            currentLng: true,
            user: { select: { fullName: true, phone: true } },
          },
        },
      },
    })

    if (!order) {
      return res.status(404).json({ success: false, message: 'Sipariş bulunamadı' })
    }

    return res.json({ success: true, data: order })
  } catch {
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}

export async function cancelOrder(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { reason } = req.body
    const userId = (req as any).user?.userId

    const existing = await prisma.order.findUnique({
      where: { id },
      include: { business: { include: { user: true } } },
    })

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Sipariş bulunamadı' })
    }

    // Kurye yoldayken iptal yasak
    if (['PICKING_UP', 'IN_TRANSIT'].includes(existing.status)) {
      return res.status(400).json({ success: false, message: 'Kurye yoldayken sipariş iptal edilemez' })
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelReason: reason || 'Müşteri tarafından iptal edildi',
      },
    })

    // Socket bildirimi
    emitOrderUpdate(existing.trackingCode, { status: 'CANCELLED', trackingCode: existing.trackingCode })

    // E-posta
    try {
      const ownerUser = existing.business?.user
      if (ownerUser) {
        await sendCancelledEmail(ownerUser.email, {
          fullName: ownerUser.fullName,
          trackingCode: existing.trackingCode,
        })
      }
    } catch (e) { console.error('Cancel email error:', e) }

    return res.json({ success: true, message: 'Sipariş iptal edildi', data: updated })
  } catch {
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}

export const autoConfirmDeliveries = async () => {
  try {
    const confirmationThreshold = new Date()
    confirmationThreshold.setHours(confirmationThreshold.getHours() - 24)

    const result = await prisma.order.updateMany({
      where: {
        status: 'DELIVERED',
        deliveredAt: { lt: confirmationThreshold },
        confirmedAt: null,
      },
      data: {
        confirmedAt: new Date(),
        status: 'DELIVERED',
        escrowStatus: 'RELEASED',
      },
    })

    if (result.count > 0) {
      console.log(`[Cron] ${result.count} adet sipariş otomatik onaylandı.`)
    }
  } catch (error) {
    console.error('[Cron Error] autoConfirmDeliveries hatası:', error)
  }
}
