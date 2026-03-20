import { Router } from 'express'
import {
  getCourierOrders,
  updateCourierStatus,
  updateCourierLocation,
  acceptOrder,
  updateOrderStatus,
} from '../controllers/courier.controller'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

// Tüm kurye route'ları auth gerektirir
router.use(authenticate)
router.use(authorize('COURIER', 'ADMIN'))

router.get('/orders', getCourierOrders)
router.patch('/status', updateCourierStatus)
router.patch('/location', updateCourierLocation)
router.patch('/orders/:id/accept', acceptOrder)
router.patch('/orders/:id/status', updateOrderStatus)

export default router