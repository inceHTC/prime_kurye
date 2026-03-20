import { Request, Response } from 'express'
import Iyzipay from 'iyzipay'
import { prisma } from '../lib/prisma'

const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY!,
  secretKey: process.env.IYZICO_SECRET_KEY!,
  uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
})

// ================================
// ÖDEME BAŞLAT
// ================================
export async function initializePayment(req: Request, res: Response) {
  try {
    const { orderId } = req.body

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { business: { include: { user: true } } }
    })

    if (!order) {
      return res.status(404).json({ success: false, message: 'Sipariş bulunamadı' })
    }

    if (order.isPaid) {
      return res.status(400).json({ success: false, message: 'Bu sipariş zaten ödendi' })
    }

    const user = order.business.user
    const price = order.price.toFixed(2)
    const nameParts = user.fullName.split(' ')
    const firstName = nameParts[0] || 'Ad'
    const lastName = nameParts.slice(1).join(' ') || 'Soyad'

    const request: any = {
      locale: 'TR',
      conversationId: order.id,
      price,
      paidPrice: price,
      currency: 'TRY',
      basketId: order.id,
      paymentGroup: 'PRODUCT',
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/odeme/sonuc`,
      enabledInstallments: [1, 2, 3],
      buyer: {
        id: user.id,
        name: firstName,
        surname: lastName,
        gsmNumber: user.phone,
        email: user.email,
        identityNumber: '11111111111',
        registrationAddress: order.senderAddress,
        ip: req.ip || '85.34.78.112',
        city: 'Istanbul',
        country: 'Turkey',
      },
      shippingAddress: {
        contactName: order.recipientName,
        city: 'Istanbul',
        country: 'Turkey',
        address: order.recipientAddress,
      },
      billingAddress: {
        contactName: user.fullName,
        city: 'Istanbul',
        country: 'Turkey',
        address: order.senderAddress,
      },
      basketItems: [
        {
          id: order.id,
          name: `Kurye Hizmeti - ${order.trackingCode}`,
          category1: 'Teslimat',
          itemType: 'VIRTUAL',
          price,
        },
      ],
    }

    iyzipay.checkoutFormInitialize.create(request, (err: any, result: any) => {
      if (err) {
        console.error('Iyzico error:', err)
        return res.status(500).json({ success: false, message: 'Ödeme başlatılamadı' })
      }

      if (result.status !== 'success') {
        return res.status(400).json({
          success: false,
          message: result.errorMessage || 'Ödeme başlatılamadı',
        })
      }

      return res.json({
        success: true,
        data: {
          checkoutFormContent: result.checkoutFormContent,
          token: result.token,
        },
      })
    })
  } catch (error) {
    console.error('Payment error:', error)
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}

// ================================
// ÖDEME SONUCU KONTROL
// ================================
export async function checkPaymentResult(req: Request, res: Response) {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({ success: false, message: 'Token gerekli' })
    }

    const request: any = { locale: 'TR', token }

    iyzipay.checkoutForm.retrieve(request, async (err: any, result: any) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Ödeme sorgulanamadı' })
      }

      if (result.status !== 'success' || result.paymentStatus !== 'SUCCESS') {
        return res.status(400).json({
          success: false,
          message: 'Ödeme başarısız',
        })
      }

      const orderId = result.basketId
      await prisma.order.update({
        where: { id: orderId },
        data: { isPaid: true, status: 'CONFIRMED' },
      })

      return res.json({
        success: true,
        message: 'Ödeme başarılı',
        data: {
          paymentId: result.paymentId,
          orderId,
          paidPrice: result.paidPrice,
        },
      })
    })
  } catch {
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}

// ================================
// ÖDEME GEÇMİŞİ
// ================================
export async function getPaymentHistory(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId

    const business = await prisma.business.findUnique({ where: { userId } })
    if (!business) {
      return res.status(403).json({ success: false, message: 'İşletme profili bulunamadı' })
    }

    const orders = await prisma.order.findMany({
      where: { businessId: business.id, isPaid: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true, trackingCode: true, price: true,
        status: true, createdAt: true,
        recipientName: true, recipientAddress: true,
      },
    })

    const totalSpent = orders.reduce((sum, o) => sum + o.price, 0)

    return res.json({
      success: true,
      data: { orders, totalSpent: Math.round(totalSpent * 100) / 100 },
    })
  } catch {
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}