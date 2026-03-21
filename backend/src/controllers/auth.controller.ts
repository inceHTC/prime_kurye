import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../lib/jwt'
import { validationResult } from 'express-validator'

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12')

export async function register(req: Request, res: Response) {
  try {
const errors = validationResult(req)
if (!errors.isEmpty()) {
  const firstError = errors.array()[0]
  return res.status(400).json({ 
    success: false, 
    message: firstError.msg,
    errors: errors.array() 
  })
}
    const { email, phone, fullName, password, role, companyName, taxNumber } = req.body
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    })
    if (existing) {
      const field = existing.email === email ? 'E-posta' : 'Telefon'
      return res.status(409).json({ success: false, message: `${field} zaten kayıtlı` })
    }
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS)
    const user = await prisma.user.create({
      data: {
        email, phone, fullName,
        password: hashedPassword,
        role: role || 'INDIVIDUAL',
        ...(role === 'COURIER'
          ? { courier: { create: {} } }
          : { business: { create: { companyName: companyName || fullName, taxNumber: taxNumber || null } } }
        ),
      },
      select: { id: true, email: true, phone: true, fullName: true, role: true, createdAt: true },
    })
    const tokenPayload = { userId: user.id, email: user.email, role: user.role }
    const accessToken = generateAccessToken(tokenPayload)
    const refreshToken = generateRefreshToken(tokenPayload)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    })
    return res.status(201).json({
      success: true,
      message: 'Kayıt başarılı',
      data: { user, accessToken, refreshToken },
    })
  } catch (error) {
    console.error('Register error:', error)
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}

export async function login(req: Request, res: Response) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ success: false, message: 'E-posta veya şifre hatalı' })
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Hesabınız askıya alınmış' })
    }
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'E-posta veya şifre hatalı' })
    }
    const tokenPayload = { userId: user.id, email: user.email, role: user.role }
    const accessToken = generateAccessToken(tokenPayload)
    const refreshToken = generateRefreshToken(tokenPayload)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    })
    return res.json({
      success: true,
      message: 'Giriş başarılı',
      data: {
        user: { id: user.id, email: user.email, phone: user.phone, fullName: user.fullName, role: user.role },
        accessToken,
        refreshToken,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const { refreshToken: token } = req.body
    if (!token) {
      return res.status(400).json({ success: false, message: 'Refresh token gerekli' })
    }
    const payload = verifyRefreshToken(token)
    const stored = await prisma.refreshToken.findUnique({ where: { token } })
    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ success: false, message: 'Geçersiz refresh token' })
    }
    await prisma.refreshToken.delete({ where: { token } })
    const newAccessToken = generateAccessToken({ userId: payload.userId, email: payload.email, role: payload.role })
    const newRefreshToken = generateRefreshToken({ userId: payload.userId, email: payload.email, role: payload.role })
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)
    await prisma.refreshToken.create({
      data: { token: newRefreshToken, userId: payload.userId, expiresAt },
    })
    return res.json({ success: true, data: { accessToken: newAccessToken, refreshToken: newRefreshToken } })
  } catch {
    return res.status(401).json({ success: false, message: 'Geçersiz refresh token' })
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const { refreshToken: token } = req.body
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } })
    }
    return res.json({ success: true, message: 'Çıkış yapıldı' })
  } catch {
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    const anyReq = req as any
    const user = await prisma.user.findUnique({
      where: { id: anyReq.user!.userId },
      select: {
        id: true, email: true, phone: true, fullName: true,
        role: true, avatar: true, isVerified: true, createdAt: true,
        business: { select: { id: true, companyName: true, balance: true } },
        courier: { select: { id: true, vehicle: true, isOnline: true, isApproved: true, rating: true } },
      },
    })
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' })
    }
    return res.json({ success: true, data: user })
  } catch {
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}
