import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { prisma } from '../lib/prisma'

// ================================
// AVATAR UPLOAD
// ================================
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'uploads', 'avatars')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const userId = (req as any).user?.userId || 'unknown'
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `avatar-${userId}-${Date.now()}${ext}`)
  },
})

export const uploadAvatarMiddleware = multer({
  storage: avatarStorage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp']
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true)
    else cb(new Error('Sadece JPG, PNG ve WebP yüklenebilir'))
  },
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
}).single('avatar')

export async function uploadAvatar(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId
    const file = req.file
    if (!file) return res.status(400).json({ success: false, message: 'Dosya seçilmedi' })

    const avatarUrl = `/uploads/avatars/${file.filename}`

    // Eski avatarı sil
    const existing = await prisma.user.findUnique({ where: { id: userId }, select: { avatar: true } })
    if (existing?.avatar) {
      const oldPath = path.join(process.cwd(), existing.avatar)
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
    }

    await prisma.user.update({ where: { id: userId }, data: { avatar: avatarUrl } })

    return res.json({ success: true, data: { avatarUrl } })
  } catch {
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12')

// ================================
// PROFİL GÜNCELLE
// ================================
export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId
    const { fullName, phone, companyName } = req.body

    // Telefon başka kullanıcıda var mı?
    if (phone) {
      const existing = await prisma.user.findFirst({
        where: { phone, NOT: { id: userId } },
      })
      if (existing) {
        return res.status(409).json({ success: false, message: 'Bu telefon numarası zaten kullanılıyor' })
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName && { fullName }),
        ...(phone && { phone }),
      },
      select: { id: true, email: true, phone: true, fullName: true, role: true },
    })

    // İşletme adı güncelle
    if (companyName && user.role === 'BUSINESS') {
      await prisma.business.update({
        where: { userId },
        data: { companyName },
      })
    }

    return res.json({ success: true, message: 'Profil güncellendi', data: user })
  } catch {
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}

// ================================
// ŞİFRE DEĞİŞTİR
// ================================
export async function updatePassword(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Tüm alanlar zorunlu' })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' })
    }

    // Mevcut şifreyi kontrol et
    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Mevcut şifre hatalı' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return res.json({ success: true, message: 'Şifre başarıyla değiştirildi' })
  } catch {
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}