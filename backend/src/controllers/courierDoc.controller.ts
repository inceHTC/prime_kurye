import { Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { prisma } from '../lib/prisma'

// ================================
// MULTER AYARLARI
// ================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'courier-docs')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const userId = (req as any).user?.userId || 'unknown'
    const ext = path.extname(file.originalname)
    const name = `${userId}-${file.fieldname}-${Date.now()}${ext}`
    cb(null, name)
  },
})

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.pdf', '.webp']
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowed.includes(ext)) {
    cb(null, true)
  } else {
    cb(new Error('Sadece JPG, PNG ve PDF dosyaları yüklenebilir'))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

// ================================
// KURYE BELGELERİ YÜKLE
// ================================
export async function uploadCourierDocuments(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId
    const files = req.files as Record<string, Express.Multer.File[]>

    if (!files || Object.keys(files).length === 0) {
      return res.status(400).json({ success: false, message: 'Dosya yüklenmedi' })
    }

    const courier = await prisma.courier.findUnique({ where: { userId } })
    if (!courier) {
      return res.status(404).json({ success: false, message: 'Kurye profili bulunamadı' })
    }

    const docPaths: Record<string, string> = {}
    Object.entries(files).forEach(([field, fileArr]) => {
      if (fileArr?.[0]) {
        docPaths[field] = `/uploads/courier-docs/${fileArr[0].filename}`
      }
    })

    // Belgeleri kaydet
    await prisma.courier.update({
      where: { userId },
      data: {
        identityDoc: docPaths.identityDoc,
        licenseDoc: docPaths.licenseDoc,
        vehicleDoc: docPaths.vehicleDoc,
        criminalRecord: docPaths.criminalRecord,
        documentsSubmitted: true,
        documentsSubmittedAt: new Date(),
      },
    })

    return res.json({
      success: true,
      message: 'Belgeler başarıyla yüklendi',
      data: docPaths,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json({ success: false, message: 'Yükleme başarısız' })
  }
}

// ================================
// KURYE BELGELERİNİ GETİR
// ================================
export async function getCourierDocuments(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId

    const courier = await prisma.courier.findUnique({
      where: { userId },
      select: {
        identityDoc: true,
        licenseDoc: true,
        vehicleDoc: true,
        criminalRecord: true,
        documentsSubmitted: true,
        documentsSubmittedAt: true,
        isApproved: true,
        contractSigned: true,
        contractSignedAt: true,
      },
    })

    if (!courier) {
      return res.status(404).json({ success: false, message: 'Kurye profili bulunamadı' })
    }

    return res.json({ success: true, data: courier })
  } catch {
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}

// ================================
// SÖZLEŞME İMZALA
// ================================
export async function signContract(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId
    const { agreed } = req.body

    if (!agreed) {
      return res.status(400).json({ success: false, message: 'Sözleşme onayı gerekli' })
    }

    const courier = await prisma.courier.findUnique({ where: { userId } })
    if (!courier) {
      return res.status(404).json({ success: false, message: 'Kurye profili bulunamadı' })
    }

    if (!courier.documentsSubmitted) {
      return res.status(400).json({ success: false, message: 'Önce belgelerinizi yüklemelisiniz' })
    }

    await prisma.courier.update({
      where: { userId },
      data: {
        contractSigned: true,
        contractSignedAt: new Date(),
      },
    })

    return res.json({ success: true, message: 'Sözleşme imzalandı' })
  } catch {
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}

// ================================
// ADMİN — BELGELERİ GÖRÜNTÜLE
// ================================
export async function getAdminCourierDocuments(req: Request, res: Response) {
  try {
    const { courierId } = req.params

    const courier = await prisma.courier.findUnique({
      where: { id: courierId },
      include: {
        user: { select: { fullName: true, email: true, phone: true } },
      },
    })

    if (!courier) {
      return res.status(404).json({ success: false, message: 'Kurye bulunamadı' })
    }

    return res.json({ success: true, data: courier })
  } catch {
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}