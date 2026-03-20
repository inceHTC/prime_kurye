import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../lib/jwt'

export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token bulunamadı' })
    }
    const token = authHeader.split(' ')[1] ?? ''
    const payload = verifyAccessToken(token)
    ;(req as any).user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    }
    next()
  } catch {
    return res.status(401).json({ success: false, message: 'Geçersiz token' })
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user
    if (!user) {
      return res.status(401).json({ success: false, message: 'Giriş yapmanız gerekiyor' })
    }
    if (!roles.includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Yetkiniz yok' })
    }
    next()
  }
}