import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import crypto from 'crypto'

function generateApiKey(): string {
  return 'vk_live_' + crypto.randomBytes(24).toString('hex')
}

// GET /business/api-keys
export async function listApiKeys(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId
    const business = await prisma.business.findUnique({ where: { userId } })
    if (!business) return res.status(403).json({ success: false, message: 'İşletme profili bulunamadı' })

    const keys = await prisma.apiKey.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, isActive: true, lastUsedAt: true, createdAt: true,
        key: true, // maskeleme frontend'de yapılır
      },
    })

    // key'i maskele: ilk 12 char göster, geri kalanı ***
    const masked = keys.map(k => ({
      ...k,
      key: k.key.slice(0, 12) + '****' + k.key.slice(-4),
    }))

    return res.json({ success: true, data: { keys: masked } })
  } catch {
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}

// POST /business/api-keys
export async function createApiKey(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId
    const { name } = req.body
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Anahtar adı gerekli' })

    const business = await prisma.business.findUnique({ where: { userId } })
    if (!business) return res.status(403).json({ success: false, message: 'İşletme profili bulunamadı' })

    const activeCount = await prisma.apiKey.count({ where: { businessId: business.id, isActive: true } })
    if (activeCount >= 5) return res.status(400).json({ success: false, message: 'En fazla 5 aktif API anahtarı oluşturabilirsiniz' })

    const key = generateApiKey()
    const apiKey = await prisma.apiKey.create({
      data: { businessId: business.id, name: name.trim(), key },
    })

    // Sadece oluşturma anında tam key döndür
    return res.json({
      success: true,
      message: 'API anahtarı oluşturuldu. Bu anahtarı güvenli bir yerde saklayın, bir daha tam olarak gösterilmeyecek.',
      data: { id: apiKey.id, name: apiKey.name, key: apiKey.key, createdAt: apiKey.createdAt },
    })
  } catch {
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}

// DELETE /business/api-keys/:id
export async function revokeApiKey(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId
    const { id } = req.params

    const business = await prisma.business.findUnique({ where: { userId } })
    if (!business) return res.status(403).json({ success: false, message: 'İşletme profili bulunamadı' })

    const apiKey = await prisma.apiKey.findFirst({ where: { id, businessId: business.id } })
    if (!apiKey) return res.status(404).json({ success: false, message: 'Anahtar bulunamadı' })

    await prisma.apiKey.update({ where: { id }, data: { isActive: false } })
    return res.json({ success: true, message: 'API anahtarı iptal edildi' })
  } catch {
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}

// Middleware: API key ile kimlik doğrulama (harici entegrasyonlar için)
export async function authenticateApiKey(req: Request, res: Response, next: Function) {
  try {
    const authHeader = req.headers['x-api-key'] || req.headers.authorization
    const key = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader as string

    if (!key) return res.status(401).json({ success: false, message: 'API anahtarı gerekli' })

    const apiKey = await prisma.apiKey.findUnique({
      where: { key },
      include: { business: true },
    })

    if (!apiKey || !apiKey.isActive) {
      return res.status(401).json({ success: false, message: 'Geçersiz veya iptal edilmiş API anahtarı' })
    }

    // lastUsedAt güncelle
    await prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } })

    ;(req as any).business = apiKey.business
    ;(req as any).apiKeyId = apiKey.id
    next()
  } catch {
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}
