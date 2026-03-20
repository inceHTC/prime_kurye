import { Router } from 'express'
import { getBusinessReport, getAdminReport } from '../controllers/report.controller'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

router.get('/business', authenticate, authorize('BUSINESS'), getBusinessReport)
router.get('/admin', authenticate, authorize('ADMIN'), getAdminReport)

export default router