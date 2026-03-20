import { Router } from 'express'
import { updateProfile, updatePassword } from '../controllers/user.controller'
import { authenticate } from '../middleware/auth'

const router = Router()

router.use(authenticate)
router.patch('/profile', updateProfile)
router.patch('/password', updatePassword)

export default router