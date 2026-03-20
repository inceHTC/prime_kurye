import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

// ================================
// İŞLETME RAPORLARI
// ================================
export async function getBusinessReport(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId
    const { period = '30' } = req.query // gün sayısı

    const business = await prisma.business.findUnique({ where: { userId } })
    if (!business) {
      return res.status(403).json({ success: false, message: 'İşletme profili bulunamadı' })
    }

    const days = parseInt(period as string)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Tüm siparişler
    const orders = await prisma.order.findMany({
      where: {
        businessId: business.id,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Genel istatistikler
    const totalOrders = orders.length
    const deliveredOrders = orders.filter(o => o.status === 'DELIVERED')
    const cancelledOrders = orders.filter(o => o.status === 'CANCELLED')
    const activeOrders = orders.filter(o =>
      ['PENDING', 'CONFIRMED', 'PICKING_UP', 'IN_TRANSIT'].includes(o.status)
    )

    const totalSpent = deliveredOrders.reduce((sum, o) => sum + o.price, 0)
    const avgOrderValue = deliveredOrders.length > 0
      ? totalSpent / deliveredOrders.length
      : 0
    const successRate = totalOrders > 0
      ? (deliveredOrders.length / totalOrders) * 100
      : 0

    // Günlük sipariş dağılımı
    const dailyMap: Record<string, { orders: number; spent: number }> = {}
    orders.forEach(order => {
      const day = order.createdAt.toISOString().split('T')[0]
      if (!dailyMap[day]) dailyMap[day] = { orders: 0, spent: 0 }
      dailyMap[day].orders++
      if (order.status === 'DELIVERED') {
        dailyMap[day].spent += order.price
      }
    })

    const dailyStats = Object.entries(dailyMap)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Teslimat tipine göre dağılım
    const deliveryTypeStats = {
      EXPRESS: orders.filter(o => o.deliveryType === 'EXPRESS').length,
      SAME_DAY: orders.filter(o => o.deliveryType === 'SAME_DAY').length,
      SCHEDULED: orders.filter(o => o.deliveryType === 'SCHEDULED').length,
    }

    // Durum dağılımı
    const statusStats = {
      PENDING: orders.filter(o => o.status === 'PENDING').length,
      CONFIRMED: orders.filter(o => o.status === 'CONFIRMED').length,
      PICKING_UP: orders.filter(o => o.status === 'PICKING_UP').length,
      IN_TRANSIT: orders.filter(o => o.status === 'IN_TRANSIT').length,
      DELIVERED: deliveredOrders.length,
      CANCELLED: cancelledOrders.length,
      FAILED: orders.filter(o => o.status === 'FAILED').length,
    }

    // En çok gönderim yapılan adresler
    const addressMap: Record<string, number> = {}
    orders.forEach(o => {
      const key = o.recipientAddress.split(',')[0].trim()
      addressMap[key] = (addressMap[key] || 0) + 1
    })
    const topAddresses = Object.entries(addressMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([address, count]) => ({ address, count }))

    return res.json({
      success: true,
      data: {
        period: days,
        summary: {
          totalOrders,
          deliveredOrders: deliveredOrders.length,
          cancelledOrders: cancelledOrders.length,
          activeOrders: activeOrders.length,
          totalSpent: Math.round(totalSpent * 100) / 100,
          avgOrderValue: Math.round(avgOrderValue * 100) / 100,
          successRate: Math.round(successRate * 10) / 10,
        },
        dailyStats,
        deliveryTypeStats,
        statusStats,
        topAddresses,
        recentOrders: orders.slice(0, 10),
      },
    })
  } catch (error) {
    console.error('Report error:', error)
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}

// ================================
// ADMİN GENEL RAPOR
// ================================
export async function getAdminReport(req: Request, res: Response) {
  try {
    const { period = '30' } = req.query
    const days = parseInt(period as string)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: startDate } },
      orderBy: { createdAt: 'desc' },
    })

    const deliveredOrders = orders.filter(o => o.status === 'DELIVERED')
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.price, 0)
    const totalCommission = deliveredOrders.reduce((sum, o) => sum + (o.commissionAmount || 0), 0)
    const totalTax = deliveredOrders.reduce((sum, o) => sum + (o.taxAmount || 0), 0)
    const totalCourierPayouts = deliveredOrders.reduce((sum, o) => sum + (o.courierAmount || 0), 0)

    // Günlük gelir
    const dailyMap: Record<string, { orders: number; revenue: number; commission: number }> = {}
    deliveredOrders.forEach(order => {
      const day = order.createdAt.toISOString().split('T')[0]
      if (!dailyMap[day]) dailyMap[day] = { orders: 0, revenue: 0, commission: 0 }
      dailyMap[day].orders++
      dailyMap[day].revenue += order.price
      dailyMap[day].commission += order.commissionAmount || 0
    })

    const dailyStats = Object.entries(dailyMap)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // En aktif kuryeler
    const courierMap: Record<string, { name: string; deliveries: number; earnings: number }> = {}
    deliveredOrders.forEach(order => {
      if (order.courierId) {
        if (!courierMap[order.courierId]) {
          courierMap[order.courierId] = { name: '', deliveries: 0, earnings: 0 }
        }
        courierMap[order.courierId].deliveries++
        courierMap[order.courierId].earnings += order.courierAmount || 0
      }
    })

    const topCouriers = await Promise.all(
      Object.entries(courierMap)
        .sort((a, b) => b[1].deliveries - a[1].deliveries)
        .slice(0, 5)
        .map(async ([courierId, data]) => {
          const courier = await prisma.courier.findUnique({
            where: { id: courierId },
            include: { user: { select: { fullName: true } } },
          })
          return {
            name: courier?.user?.fullName || 'Bilinmiyor',
            deliveries: data.deliveries,
            earnings: Math.round(data.earnings * 100) / 100,
          }
        })
    )

    return res.json({
      success: true,
      data: {
        period: days,
        summary: {
          totalOrders: orders.length,
          deliveredOrders: deliveredOrders.length,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalCommission: Math.round(totalCommission * 100) / 100,
          totalTax: Math.round(totalTax * 100) / 100,
          totalCourierPayouts: Math.round(totalCourierPayouts * 100) / 100,
          successRate: orders.length > 0
            ? Math.round((deliveredOrders.length / orders.length) * 1000) / 10
            : 0,
        },
        dailyStats,
        topCouriers,
      },
    })
  } catch (error) {
    console.error('Admin report error:', error)
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}