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

// Boğaz eşiği: doğusu Anadolu, batısı Avrupa
// Sarıyer gibi Avrupa'nın kuzey ucu (lng>29.05) ve Beykoz (Asia) ayrımı için
// lat 40.85-41.30 aralığında lng 29.05 sınırı kullanılır
function isAsianSide(lat: number, lng: number): boolean {
  // Adalar hariç: lng > 29.05 ve İstanbul sınırları içinde → Anadolu
  if (lat >= 40.78 && lat <= 41.30 && lng > 29.05) return true
  return false
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Kademeli km ücreti: 0-10km→9₺, 10-25km→7₺, 25km+→5₺
function tieredKmCost(km: number): number {
  if (km <= 10) return km * 9
  if (km <= 25) return 10 * 9 + (km - 10) * 7
  return 10 * 9 + 15 * 7 + (km - 25) * 5
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const birdKm    = haversineKm(lat1, lng1, lat2, lng2)
  const crossSide = isAsianSide(lat1, lng1) !== isAsianSide(lat2, lng2)
  const roadKm    = Math.max(3, birdKm * (crossSide ? 1.85 : 1.35))
  return Math.round(roadKm * 10) / 10
}

function calculatePrice(
  roadKm: number,
  deliveryType: string,
  isFragile = false,
  packageWeight = 1,
  _packageValue = 0,
  fees = { fragileFee: 30, weightFeeLight: 30, weightFeeHeavy: 60 },
  config = {
    EXPRESS:   { multiplier: 1.40, min: 110 },
    SAME_DAY:  { multiplier: 1.00, min:  80 },
    SCHEDULED: { multiplier: 0.85, min:  68 },
  },
): number {
  const BASE    = 65
  const kmCost  = tieredKmCost(roadKm)
  const fragile = isFragile ? fees.fragileFee : 0
  const weight  = packageWeight > 15 ? fees.weightFeeHeavy : packageWeight > 5 ? fees.weightFeeLight : 0
  const subtotal = BASE + kmCost + fragile + weight

  const { multiplier, min } = config[deliveryType as keyof typeof config] ?? config.EXPRESS

  return Math.max(min, Math.round(subtotal * multiplier))
}

async function getSettingsFees() {
  try {
    const s = await prisma.systemSettings.findFirst()
    return {
      fees: {
        fragileFee: s?.fragileFee ?? 30,
        weightFeeLight: s?.weightFeeLight ?? 30,
        weightFeeHeavy: s?.weightFeeHeavy ?? 60,
      },
      config: {
        EXPRESS:   { multiplier: s?.pricePerKmMoto ?? 1.40, min: s?.basePriceExpress ?? 110 },
        SAME_DAY:  { multiplier: s?.pricePerKmCar  ?? 1.00, min: s?.basePriceSameDay  ??  80 },
        SCHEDULED: { multiplier: s?.pricePerKmBike ?? 0.85, min: s?.basePriceScheduled ??  68 },
      },
    }
  } catch {
    return {
      fees: { fragileFee: 30, weightFeeLight: 30, weightFeeHeavy: 60 },
      config: {
        EXPRESS:   { multiplier: 1.40, min: 110 },
        SAME_DAY:  { multiplier: 1.00, min:  80 },
        SCHEDULED: { multiplier: 0.85, min:  68 },
      },
    }
  }
}

export async function estimatePrice(req: Request, res: Response) {
  try {
    const { senderLat, senderLng, recipientLat, recipientLng, deliveryType, isFragile, packageWeight } = req.body
    const crossSide = isAsianSide(Number(senderLat), Number(senderLng)) !== isAsianSide(Number(recipientLat), Number(recipientLng))
    const distance  = calculateDistance(Number(senderLat), Number(senderLng), Number(recipientLat), Number(recipientLng))
    const { fees, config } = await getSettingsFees()
    const price     = calculatePrice(distance, deliveryType || 'EXPRESS', isFragile, Number(packageWeight) || 1, 0, fees, config)
    const bridgeExtra = crossSide ? 20 : 0
    const speedFactor = deliveryType === 'EXPRESS' ? 3.0 : 3.8
    const estimatedMinutes = Math.max(20, Math.round(distance * speedFactor) + bridgeExtra)

    return res.json({ success: true, data: { distance, price, estimatedMinutes, crossSide } })
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

    const distance = calculateDistance(Number(senderLat), Number(senderLng), Number(recipientLat), Number(recipientLng))
    const { fees, config } = await getSettingsFees()
    const price = calculatePrice(distance, deliveryType, isFragile, Number(packageWeight) || 1, 0, fees, config)
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
        senderLat: true,
        senderLng: true,
        recipientAddress: true,
        recipientLat: true,
        recipientLng: true,
        recipientName: true,
        recipientPhone: true,
        price: true,
        escrowStatus: true,
        deliveryProofUrl: true,
        createdAt: true,
        estimatedAt: true,
        deliveredAt: true,
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
