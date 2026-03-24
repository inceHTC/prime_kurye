import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth'
import { listApiKeys, createApiKey, revokeApiKey } from '../controllers/apikey.controller'

const router = Router()

router.use(authenticate)
router.use(authorize('BUSINESS'))

router.get('/', listApiKeys)
router.post('/', createApiKey)
router.delete('/:id', revokeApiKey)

export default router
