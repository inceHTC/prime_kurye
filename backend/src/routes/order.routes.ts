import { Router } from 'express'
import { body } from 'express-validator'
import {
  createOrder,
  getOrders,
  getOrder,
  estimatePrice,
  trackOrder,
  cancelOrder
} from '../controllers/order.controller'
import { authenticate } from '../middleware/auth'

const router = Router()

// Sipariş Doğrulama Kuralları
const orderValidation = [
  body('senderName').trim().notEmpty().withMessage('Gönderici adı gerekli'),
  body('senderPhone').notEmpty().withMessage('Gönderici telefonu gerekli'),
  body('senderAddress').notEmpty().withMessage('Alım adresi gerekli'),
  body('senderLat').isNumeric().withMessage('Geçerli koordinat gerekli'),
  body('senderLng').isNumeric().withMessage('Geçerli koordinat gerekli'),
  body('recipientName').trim().notEmpty().withMessage('Alıcı adı gerekli'),
  body('recipientPhone').notEmpty().withMessage('Alıcı telefonu gerekli'),
  body('recipientAddress').notEmpty().withMessage('Teslimat adresi gerekli'),
  body('recipientLat').isNumeric().withMessage('Geçerli koordinat gerekli'),
  body('recipientLng').isNumeric().withMessage('Geçerli koordinat gerekli'),
  body('packageDesc').notEmpty().withMessage('Paket açıklaması gerekli'),
  
  // YENİ: Eklediğimiz alanlar için opsiyonel doğrulamalar
  body('isFragile').optional().isBoolean().withMessage('Hassas paket bilgisi boolean olmalı'),
  body('packageValue').optional().isNumeric().withMessage('Paket değeri sayı olmalı'),
  body('deliveryType').isIn(['EXPRESS', 'SAME_DAY', 'SCHEDULED']).withMessage('Geçersiz teslimat tipi')
]

// === PUBLIC YOLLAR (Giriş gerektirmez) ===
router.get('/track/:code', trackOrder)
router.post('/estimate', estimatePrice) // Fiyat hesaplama için giriş şartı koymuyoruz, herkes görebilsin.

// === AUTH GEREKLİ YOLLAR (Sadece giriş yapanlar) ===
router.post('/', authenticate, orderValidation, createOrder) // Sipariş oluştururken doğrulama devrede
router.get('/', authenticate, getOrders)
router.get('/:id', authenticate, getOrder)
router.patch('/:id/cancel', authenticate, cancelOrder)

export default router