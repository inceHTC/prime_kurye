"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = updateProfile;
exports.updatePassword = updatePassword;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../lib/prisma");
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');
// ================================
// PROFİL GÜNCELLE
// ================================
async function updateProfile(req, res) {
    try {
        const userId = req.user.userId;
        const { fullName, phone, companyName } = req.body;
        // Telefon başka kullanıcıda var mı?
        if (phone) {
            const existing = await prisma_1.prisma.user.findFirst({
                where: { phone, NOT: { id: userId } },
            });
            if (existing) {
                return res.status(409).json({ success: false, message: 'Bu telefon numarası zaten kullanılıyor' });
            }
        }
        const user = await prisma_1.prisma.user.update({
            where: { id: userId },
            data: {
                ...(fullName && { fullName }),
                ...(phone && { phone }),
            },
            select: { id: true, email: true, phone: true, fullName: true, role: true },
        });
        // İşletme adı güncelle
        if (companyName && user.role === 'BUSINESS') {
            await prisma_1.prisma.business.update({
                where: { userId },
                data: { companyName },
            });
        }
        return res.json({ success: true, message: 'Profil güncellendi', data: user });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// ŞİFRE DEĞİŞTİR
// ================================
async function updatePassword(req, res) {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Tüm alanlar zorunlu' });
        }
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
        }
        // Mevcut şifreyi kontrol et
        const isValid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Mevcut şifre hatalı' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, BCRYPT_ROUNDS);
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        return res.json({ success: true, message: 'Şifre başarıyla değiştirildi' });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
