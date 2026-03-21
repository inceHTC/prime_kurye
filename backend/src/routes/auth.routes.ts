import { Router } from 'express'
import { body } from 'express-validator'
import { register, login, refreshToken, logout, getMe } from '../controllers/auth.controller'
import { authenticate } from '../middleware/auth'

const router = Router()

const registerValidation = [
  body('email').isEmail().withMessage('Geçerli bir e-posta girin'),
  body('phone')
    .matches(/^(\+90|0)?[0-9]{10}$/)
    .withMessage('Geçerli bir telefon numarası girin'),
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Ad soyad 2-100 karakter olmalı'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Şifre en az 8 karakter olmalı'),
  body('role')
    .optional()
    .isIn(['INDIVIDUAL', 'BUSINESS', 'COURIER'])
    .withMessage('Geçersiz rol'),
]

const loginValidation = [
  body('email').isEmail().withMessage('Geçerli bir e-posta girin'),
  body('password').notEmpty().withMessage('Şifre gerekli'),
]

router.post('/register', registerValidation, register)
router.post('/login', loginValidation, login)
router.post('/refresh', refreshToken)
router.post('/logout', logout)
router.get('/me', authenticate, getMe)

export default router
