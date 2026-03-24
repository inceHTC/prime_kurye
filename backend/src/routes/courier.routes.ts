import { Router } from 'express'
import {
  getCourierOrders,
  updateCourierStatus,
  updateCourierLocation,
  acceptOrder,
  updateOrderStatus,
  uploadDeliveryProof,
  uploadProofMiddleware,
} from '../controllers/courier.controller'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

router.use(authenticate)
router.use(authorize('COURIER', 'ADMIN'))

router.get('/orders', getCourierOrders)
router.patch('/status', updateCourierStatus)
router.patch('/location', updateCourierLocation)
router.patch('/orders/:id/accept', acceptOrder)
router.patch('/orders/:id/status', updateOrderStatus)
router.post('/orders/:id/proof', (req, res, next) => {
  uploadProofMiddleware(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message })
    next()
  })
}, uploadDeliveryProof)

export default router
