"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimatePrice = estimatePrice;
exports.createOrder = createOrder;
exports.getOrders = getOrders;
exports.getOrder = getOrder;
exports.trackOrder = trackOrder;
exports.cancelOrder = cancelOrder;
const prisma_1 = require("../lib/prisma");
const express_validator_1 = require("express-validator");
// Takip kodu üret
function generateTrackingCode() {
    const prefix = 'PK';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
}
// Fiyat hesapla
function calculatePrice(distance, deliveryType, vehicle) {
    const basePrices = {
        EXPRESS: 136.90,
        SAME_DAY: 94.90,
        SCHEDULED: 110.90,
    };
    const perKm = {
        MOTORCYCLE: 4.90,
        CAR: 7.90,
        BICYCLE: 3.50,
    };
    const base = basePrices[deliveryType] || 136.90;
    const kmPrice = (perKm[vehicle] || 4.90) * distance;
    const expressMultiplier = deliveryType === 'EXPRESS' ? 1 : 0.9;
    return Math.round((base + kmPrice) * expressMultiplier * 100) / 100;
}
// Mesafe hesapla (Haversine)
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}
// ================================
// FİYAT HESAPLA
// ================================
async function estimatePrice(req, res) {
    try {
        const { senderLat, senderLng, recipientLat, recipientLng, deliveryType, vehicle } = req.body;
        const distance = calculateDistance(senderLat, senderLng, recipientLat, recipientLng);
        const price = calculatePrice(distance, deliveryType || 'EXPRESS', vehicle || 'MOTORCYCLE');
        const estimatedMinutes = deliveryType === 'EXPRESS' ? Math.round(distance * 3 + 20) : Math.round(distance * 3 + 60);
        return res.json({
            success: true,
            data: { distance, price, estimatedMinutes },
        });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// SİPARİŞ OLUŞTUR
// ================================
async function createOrder(req, res) {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const userId = req.user.userId;
        // İşletme profilini bul
        const business = await prisma_1.prisma.business.findUnique({ where: { userId } });
        if (!business) {
            return res.status(403).json({ success: false, message: 'İşletme profili bulunamadı' });
        }
        const { senderName, senderPhone, senderAddress, senderLat, senderLng, senderNotes, recipientName, recipientPhone, recipientAddress, recipientLat, recipientLng, recipientNotes, packageDesc, packageWeight, isFragile, packageValue, deliveryType, vehicle, scheduledAt, insuranceValue, } = req.body;
        const distance = calculateDistance(senderLat, senderLng, recipientLat, recipientLng);
        const price = calculatePrice(distance, deliveryType, vehicle);
        const trackingCode = generateTrackingCode();
        const order = await prisma_1.prisma.order.create({
            data: {
                trackingCode,
                deliveryType: deliveryType || 'EXPRESS',
                senderName, senderPhone, senderAddress,
                senderLat: parseFloat(senderLat), senderLng: parseFloat(senderLng),
                senderNotes,
                recipientName, recipientPhone, recipientAddress,
                recipientLat: parseFloat(recipientLat), recipientLng: parseFloat(recipientLng),
                recipientNotes,
                packageDesc, packageWeight: parseFloat(packageWeight) || 1,
                isFragile: isFragile || false,
                packageValue: packageValue ? parseFloat(packageValue) : null,
                price,
                insuranceValue: insuranceValue ? parseFloat(insuranceValue) : null,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                businessId: business.id,
            },
        });
        return res.status(201).json({
            success: true,
            message: 'Sipariş oluşturuldu',
            data: order,
        });
    }
    catch (error) {
        console.error('Create order error:', error);
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// SİPARİŞLERİ LİSTELE
// ================================
async function getOrders(req, res) {
    try {
        const userId = req.user.userId;
        const { page = 1, limit = 10, status } = req.query;
        const business = await prisma_1.prisma.business.findUnique({ where: { userId } });
        if (!business) {
            return res.status(403).json({ success: false, message: 'İşletme profili bulunamadı' });
        }
        const where = { businessId: business.id };
        if (status)
            where.status = status;
        const [orders, total] = await Promise.all([
            prisma_1.prisma.order.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                include: {
                    courier: {
                        include: { user: { select: { fullName: true, phone: true, avatar: true } } }
                    }
                }
            }),
            prisma_1.prisma.order.count({ where }),
        ]);
        return res.json({
            success: true,
            data: {
                orders,
                total,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// SİPARİŞ DETAYI
// ================================
async function getOrder(req, res) {
    try {
        const { id } = req.params;
        const order = await prisma_1.prisma.order.findUnique({
            where: { id },
            include: {
                courier: {
                    include: { user: { select: { fullName: true, phone: true, avatar: true } } }
                },
                business: {
                    include: { user: { select: { fullName: true, phone: true } } }
                }
            }
        });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Sipariş bulunamadı' });
        }
        return res.json({ success: true, data: order });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// TAKİP KODU İLE SORGULA (public)
// ================================
async function trackOrder(req, res) {
    try {
        const { code } = req.params;
        const order = await prisma_1.prisma.order.findUnique({
            where: { trackingCode: code },
            select: {
                id: true, trackingCode: true, status: true, deliveryType: true,
                senderAddress: true, recipientAddress: true,
                estimatedAt: true, deliveredAt: true, createdAt: true,
                courier: {
                    select: {
                        currentLat: true, currentLng: true,
                        user: { select: { fullName: true, phone: true } }
                    }
                }
            }
        });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Sipariş bulunamadı' });
        }
        return res.json({ success: true, data: order });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// SİPARİŞ İPTAL ET
// ================================
async function cancelOrder(req, res) {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const business = await prisma_1.prisma.business.findUnique({ where: { userId } });
        if (!business) {
            return res.status(403).json({ success: false, message: 'İşletme profili bulunamadı' });
        }
        const order = await prisma_1.prisma.order.findUnique({ where: { id } });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Sipariş bulunamadı' });
        }
        if (order.businessId !== business.id) {
            return res.status(403).json({ success: false, message: 'Bu siparişi iptal edemezsiniz' });
        }
        // Sadece bekleyen veya onaylanan siparişler iptal edilebilir
        if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: 'Kurye yola çıktıktan sonra sipariş iptal edilemez'
            });
        }
        const updated = await prisma_1.prisma.order.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });
        return res.json({ success: true, message: 'Sipariş iptal edildi', data: updated });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
