import { Router } from 'express'
import { forgotPassword, resetPassword, verifyResetToken } from '../controllers/passwordreset.controller'

const router = Router()

router.post('/forgot-password', forgotPassword) 


router.post('/reset-password', resetPassword) 

router.get('/verify/:token', verifyResetToken)

export default router
