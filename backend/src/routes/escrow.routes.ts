import { Router } from 'express'
import {
  initiateEscrow,
  confirmDelivery,
  getCourierEarnings,
  calculateWeeklyPayouts,
  getPayouts,
  completePayout,
} from '../controllers/escrow.controller'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

// Müşteri — paketi teslim alınca ödeme yap
router.post('/initiate', authenticate, authorize('BUSINESS'), initiateEscrow)

// Müşteri — teslimi onayla
router.post('/confirm', authenticate, authorize('BUSINESS'), confirmDelivery)

// Kurye — kazanç bilgisi
router.get('/courier/earnings', authenticate, authorize('COURIER'), getCourierEarnings)

// Admin — haftalık ödeme hesapla
router.post('/admin/calculate', authenticate, authorize('ADMIN'), calculateWeeklyPayouts)

// Admin — ödeme listesi
router.get('/admin/payouts', authenticate, authorize('ADMIN'), getPayouts)

// Admin — ödeme tamamla
router.patch('/admin/payouts/:payoutId/complete', authenticate, authorize('ADMIN'), completePayout)

export default router