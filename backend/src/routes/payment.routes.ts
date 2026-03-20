import { Router } from 'express'
import {
  initializePayment,
  checkPaymentResult,
  getPaymentHistory,
} from '../controllers/payment.controller'
import { authenticate } from '../middleware/auth'

const router = Router()

router.post('/initialize', authenticate, initializePayment)
router.post('/result', checkPaymentResult)
router.get('/history', authenticate, getPaymentHistory)

export default router