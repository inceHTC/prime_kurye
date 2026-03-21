"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
exports.verifyResetToken = verifyResetToken;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const resend_1 = require("resend");
const prisma_1 = require("../lib/prisma");
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');
// Rastgele token üret
function generateResetToken() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36) + Math.random().toString(36).slice(2);
}
// ================================
// ŞİFRE SIFIRLAMA İSTEĞİ
// ================================
async function forgotPassword(req, res) {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'E-posta adresi gerekli' });
        }
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        // Güvenlik: kullanıcı yoksa da başarılı döndür
        if (!user) {
            return res.json({ success: true, message: 'E-posta gönderildi' });
        }
        // Token oluştur (1 saat geçerli)
        const token = generateResetToken();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);
        // Eski tokenları sil, yenisini ekle
        await prisma_1.prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
        await prisma_1.prisma.passwordResetToken.create({
            data: { token, userId: user.id, expiresAt },
        });
        const resetUrl = `${process.env.CLIENT_URL}/sifremi-unuttum/yenile?token=${token}`;
        // E-posta gönder
        await resend.emails.send({
            from: 'Prime Kurye <noreply@primekurye.com>',
            to: user.email,
            subject: 'Şifre Sıfırlama Talebi',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background:#faf9f7;font-family:'Helvetica Neue',Arial,sans-serif;">
          <div style="max-width:560px;margin:40px auto;padding:0 20px;">
            
            <!-- Header -->
            <div style="background:#1c0800;borderRadius:12px 12px 0 0;padding:28px 32px;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">
                PRIME<span style="color:#c8860a;">KURYE</span>
              </h1>
            </div>

            <!-- Body -->
            <div style="background:#fff;padding:36px 32px;border:1px solid rgba(28,8,0,0.08);border-top:none;">
              <h2 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#1c0800;">
                Şifre Sıfırlama
              </h2>
              <p style="margin:0 0 8px;font-size:15px;color:#7a6050;line-height:1.65;">
                Merhaba <strong>${user.fullName}</strong>,
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#7a6050;line-height:1.65;">
                Hesabınız için şifre sıfırlama talebinde bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz.
              </p>

              <div style="text-align:center;margin-bottom:28px;">
                <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background:#c8860a;color:#1c0800;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;">
                  Şifremi Sıfırla
                </a>
              </div>

              <p style="margin:0 0 8px;font-size:13px;color:#a89080;line-height:1.65;">
                Bu link <strong>1 saat</strong> geçerlidir. Eğer bu talebi siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz.
              </p>
              <p style="margin:0;font-size:12px;color:#c8a880;word-break:break-all;">
                ${resetUrl}
              </p>
            </div>

            <!-- Footer -->
            <div style="background:#faf9f7;padding:20px 32px;border:1px solid rgba(28,8,0,0.06);border-top:none;border-radius:0 0 12px 12px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#a89080;">
                © ${new Date().getFullYear()} Prime Kurye · İstanbul, Türkiye
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
        });
        return res.json({ success: true, message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi' });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// ŞİFRE SIFIRLAMA DOĞRULA
// ================================
async function resetPassword(req, res) {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ success: false, message: 'Token ve şifre gerekli' });
        }
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Şifre en az 8 karakter olmalı' });
        }
        const resetToken = await prisma_1.prisma.passwordResetToken.findUnique({
            where: { token },
            include: { user: true },
        });
        if (!resetToken) {
            return res.status(400).json({ success: false, message: 'Geçersiz veya kullanılmış token' });
        }
        if (resetToken.expiresAt < new Date()) {
            await prisma_1.prisma.passwordResetToken.delete({ where: { token } });
            return res.status(400).json({ success: false, message: 'Token süresi dolmuş. Yeni talep oluşturun.' });
        }
        // Şifreyi güncelle
        const hashedPassword = await bcryptjs_1.default.hash(password, BCRYPT_ROUNDS);
        await prisma_1.prisma.user.update({
            where: { id: resetToken.userId },
            data: { password: hashedPassword },
        });
        // Token ve tüm refresh token'ları sil
        await prisma_1.prisma.passwordResetToken.delete({ where: { token } });
        await prisma_1.prisma.refreshToken.deleteMany({ where: { userId: resetToken.userId } });
        return res.json({ success: true, message: 'Şifreniz başarıyla güncellendi' });
    }
    catch (error) {
        console.error('Reset password error:', error);
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// TOKEN DOĞRULA (frontend için)
// ================================
async function verifyResetToken(req, res) {
    try {
        const { token } = req.params;
        const resetToken = await prisma_1.prisma.passwordResetToken.findUnique({
            where: { token },
            include: { user: { select: { fullName: true, email: true } } },
        });
        if (!resetToken || resetToken.expiresAt < new Date()) {
            return res.status(400).json({ success: false, message: 'Geçersiz veya süresi dolmuş token' });
        }
        return res.json({
            success: true,
            data: { email: resetToken.user.email, fullName: resetToken.user.fullName },
        });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
