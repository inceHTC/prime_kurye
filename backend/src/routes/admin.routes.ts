import { Router } from 'express'
import {
  getStats,
  getAllOrders,
  assignCourier,
  getAllCouriers,
  approveCourier,
  getAllBusinesses,
} from '../controllers/admin.controller'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

router.use(authenticate)
router.use(authorize('ADMIN'))

router.get('/stats', getStats)
router.get('/orders', getAllOrders)
router.patch('/orders/:id/assign', assignCourier)
router.get('/couriers', getAllCouriers)
router.patch('/couriers/:id/approve', approveCourier)
router.get('/businesses', getAllBusinesses)

export default router