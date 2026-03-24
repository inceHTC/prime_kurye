import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

export async function getSavedAddresses(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId
    const addresses = await prisma.savedAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })
    return res.json({ success: true, data: addresses })
  } catch {
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}

export async function createSavedAddress(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId
    const { label, address, lat, lng, isDefault } = req.body

    if (!label || !address) {
      return res.status(400).json({ success: false, message: 'Etiket ve adres zorunludur' })
    }

    if (isDefault) {
      await prisma.savedAddress.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      })
    }

    const saved = await prisma.savedAddress.create({
      data: {
        userId,
        label,
        address,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        isDefault: isDefault || false,
      },
    })
    return res.status(201).json({ success: true, data: saved })
  } catch {
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}

export async function deleteSavedAddress(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId
    const { id } = req.params

    const existing = await prisma.savedAddress.findUnique({ where: { id } })
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ success: false, message: 'Adres bulunamadı' })
    }

    await prisma.savedAddress.delete({ where: { id } })
    return res.json({ success: true, message: 'Adres silindi' })
  } catch {
    return res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
}
