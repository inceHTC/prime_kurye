import { Router } from 'express'
import {
  getStats, getAllOrders, getOrderDetail, assignCourier, updateOrderStatus,
  getAllUsers, getUserDetail, toggleUserStatus,
  getAllCouriers, getCourierDetail, approveCourier, updateCourierIban,
  getEscrowStatus, getPayouts, calculateWeeklyPayouts, completePayout,
  getSettings, updateSettings, getAllBusinesses,
} from '../controllers/admin.controller'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()
router.use(authenticate)
router.use(authorize('ADMIN'))

// İstatistikler
router.get('/stats', getStats)

// Siparişler
router.get('/orders', getAllOrders)
router.get('/orders/:id', getOrderDetail)
router.patch('/orders/:id/assign', assignCourier)
router.patch('/orders/:id/status', updateOrderStatus)

// Kullanıcılar
router.get('/users', getAllUsers)
router.get('/users/:id', getUserDetail)
router.patch('/users/:id/toggle', toggleUserStatus)

// Kuryeler
router.get('/couriers', getAllCouriers)
router.get('/couriers/:id', getCourierDetail)
router.patch('/couriers/:id/approve', approveCourier)
router.patch('/couriers/:id/iban', updateCourierIban)

// İşletmeler
router.get('/businesses', getAllBusinesses)

// Finans
router.get('/escrow', getEscrowStatus)
router.get('/payouts', getPayouts)
router.post('/payouts/calculate', calculateWeeklyPayouts)
router.patch('/payouts/:payoutId/complete', completePayout)

// Sistem ayarları
router.get('/settings', getSettings)
router.patch('/settings', updateSettings)

export default router