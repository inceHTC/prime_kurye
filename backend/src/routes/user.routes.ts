import { Router } from 'express'
import { updateProfile, updatePassword, uploadAvatar, uploadAvatarMiddleware } from '../controllers/user.controller'
import { authenticate } from '../middleware/auth'

const router = Router()

router.use(authenticate)
router.patch('/profile', updateProfile)
router.patch('/password', updatePassword)
router.post('/avatar', (req, res, next) => {
  uploadAvatarMiddleware(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message })
    next()
  })
}, uploadAvatar)

export default router