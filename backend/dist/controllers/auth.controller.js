"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.refreshToken = refreshToken;
exports.logout = logout;
exports.getMe = getMe;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../lib/prisma");
const jwt_1 = require("../lib/jwt");
const express_validator_1 = require("express-validator");
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');
async function register(req, res) {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const firstError = errors.array()[0];
            return res.status(400).json({
                success: false,
                message: firstError.msg,
                errors: errors.array()
            });
        }
        const { email, phone, fullName, password, role, companyName, taxNumber } = req.body;
        const existing = await prisma_1.prisma.user.findFirst({
            where: { OR: [{ email }, { phone }] },
        });
        if (existing) {
            const field = existing.email === email ? 'E-posta' : 'Telefon';
            return res.status(409).json({ success: false, message: `${field} zaten kayıtlı` });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, BCRYPT_ROUNDS);
        const user = await prisma_1.prisma.user.create({
            data: {
                email, phone, fullName,
                password: hashedPassword,
                role: role || 'INDIVIDUAL',
                ...(role === 'COURIER'
                    ? { courier: { create: {} } }
                    : { business: { create: { companyName: companyName || fullName, taxNumber: taxNumber || null } } }),
            },
            select: { id: true, email: true, phone: true, fullName: true, role: true, createdAt: true },
        });
        const tokenPayload = { userId: user.id, email: user.email, role: user.role };
        const accessToken = (0, jwt_1.generateAccessToken)(tokenPayload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(tokenPayload);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await prisma_1.prisma.refreshToken.create({
            data: { token: refreshToken, userId: user.id, expiresAt },
        });
        return res.status(201).json({
            success: true,
            message: 'Kayıt başarılı',
            data: { user, accessToken, refreshToken },
        });
    }
    catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
async function login(req, res) {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const { email, password } = req.body;
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ success: false, message: 'E-posta veya şifre hatalı' });
        }
        if (!user.isActive) {
            return res.status(403).json({ success: false, message: 'Hesabınız askıya alınmış' });
        }
        const isValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'E-posta veya şifre hatalı' });
        }
        const tokenPayload = { userId: user.id, email: user.email, role: user.role };
        const accessToken = (0, jwt_1.generateAccessToken)(tokenPayload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(tokenPayload);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await prisma_1.prisma.refreshToken.create({
            data: { token: refreshToken, userId: user.id, expiresAt },
        });
        return res.json({
            success: true,
            message: 'Giriş başarılı',
            data: {
                user: { id: user.id, email: user.email, phone: user.phone, fullName: user.fullName, role: user.role },
                accessToken,
                refreshToken,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
async function refreshToken(req, res) {
    try {
        const { refreshToken: token } = req.body;
        if (!token) {
            return res.status(400).json({ success: false, message: 'Refresh token gerekli' });
        }
        const payload = (0, jwt_1.verifyRefreshToken)(token);
        const stored = await prisma_1.prisma.refreshToken.findUnique({ where: { token } });
        if (!stored || stored.expiresAt < new Date()) {
            return res.status(401).json({ success: false, message: 'Geçersiz refresh token' });
        }
        await prisma_1.prisma.refreshToken.delete({ where: { token } });
        const newAccessToken = (0, jwt_1.generateAccessToken)({ userId: payload.userId, email: payload.email, role: payload.role });
        const newRefreshToken = (0, jwt_1.generateRefreshToken)({ userId: payload.userId, email: payload.email, role: payload.role });
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await prisma_1.prisma.refreshToken.create({
            data: { token: newRefreshToken, userId: payload.userId, expiresAt },
        });
        return res.json({ success: true, data: { accessToken: newAccessToken, refreshToken: newRefreshToken } });
    }
    catch {
        return res.status(401).json({ success: false, message: 'Geçersiz refresh token' });
    }
}
async function logout(req, res) {
    try {
        const { refreshToken: token } = req.body;
        if (token) {
            await prisma_1.prisma.refreshToken.deleteMany({ where: { token } });
        }
        return res.json({ success: true, message: 'Çıkış yapıldı' });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
async function getMe(req, res) {
    try {
        const anyReq = req;
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: anyReq.user.userId },
            select: {
                id: true, email: true, phone: true, fullName: true,
                role: true, avatar: true, isVerified: true, createdAt: true,
                business: { select: { id: true, companyName: true, balance: true } },
                courier: { select: { id: true, vehicle: true, isOnline: true, isApproved: true, rating: true } },
            },
        });
        if (!user) {
            return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
        }
        return res.json({ success: true, data: user });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
