"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initiateEscrow = initiateEscrow;
exports.confirmDelivery = confirmDelivery;
exports.getCourierEarnings = getCourierEarnings;
exports.calculateWeeklyPayouts = calculateWeeklyPayouts;
exports.getPayouts = getPayouts;
exports.completePayout = completePayout;
const prisma_1 = require("../lib/prisma");
const COMMISSION_RATE = 0.20; // %20 sistem komisyonu
const TAX_RATE = 0.18; // %18 KDV
// ================================
// KURYE PAKETİ ALDI — MÜŞTERİ ÖDEME YAPAR
// ================================
async function initiateEscrow(req, res) {
    try {
        const { orderId } = req.body;
        const userId = req.user.userId;
        const business = await prisma_1.prisma.business.findUnique({ where: { userId } });
        if (!business) {
            return res.status(403).json({ success: false, message: 'İşletme profili bulunamadı' });
        }
        const order = await prisma_1.prisma.order.findUnique({
            where: { id: orderId },
            include: { business: true }
        });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Sipariş bulunamadı' });
        }
        if (order.business.userId !== userId) {
            return res.status(403).json({ success: false, message: 'Bu siparişe erişim yetkiniz yok' });
        }
        if (order.status !== 'PICKING_UP') {
            return res.status(400).json({ success: false, message: 'Kurye henüz paketi almadı' });
        }
        if (order.escrowStatus === 'HELD') {
            return res.status(400).json({ success: false, message: 'Ödeme zaten yapılmış' });
        }
        // Komisyon ve vergi hesapla
        const commissionAmount = order.price * COMMISSION_RATE;
        const taxAmount = commissionAmount * TAX_RATE;
        const courierAmount = order.price - commissionAmount - taxAmount;
        // Escrow'a al
        const updated = await prisma_1.prisma.order.update({
            where: { id: orderId },
            data: {
                escrowAmount: order.price,
                escrowStatus: 'HELD',
                isPaid: true,
                paidAt: new Date(),
                commissionAmount,
                courierAmount,
                taxAmount,
                status: 'IN_TRANSIT',
            },
        });
        return res.json({
            success: true,
            message: 'Ödeme alındı, havuzda bekliyor',
            data: {
                orderId: updated.id,
                escrowAmount: updated.escrowAmount,
                courierAmount,
                commissionAmount,
                taxAmount,
            },
        });
    }
    catch (error) {
        console.error('Escrow error:', error);
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// ALICI TESLİMİ ONAYLADI
// ================================
async function confirmDelivery(req, res) {
    try {
        const { orderId } = req.body;
        const userId = req.user.userId;
        const business = await prisma_1.prisma.business.findUnique({ where: { userId } });
        if (!business) {
            return res.status(403).json({ success: false, message: 'İşletme profili bulunamadı' });
        }
        const order = await prisma_1.prisma.order.findUnique({
            where: { id: orderId },
            include: { courier: true }
        });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Sipariş bulunamadı' });
        }
        if (order.businessId !== business.id) {
            return res.status(403).json({ success: false, message: 'Bu siparişe erişim yetkiniz yok' });
        }
        if (order.status !== 'DELIVERED') {
            return res.status(400).json({ success: false, message: 'Sipariş henüz teslim edilmedi' });
        }
        if (order.escrowStatus !== 'HELD') {
            return res.status(400).json({ success: false, message: 'Escrow durumu uygun değil' });
        }
        // Escrow'u serbest bırak
        await prisma_1.prisma.order.update({
            where: { id: orderId },
            data: {
                escrowStatus: 'RELEASED',
                confirmedAt: new Date(),
            },
        });
        // Kurye bakiyesini güncelle
        if (order.courierId && order.courierAmount) {
            await prisma_1.prisma.courier.update({
                where: { id: order.courierId },
                data: {
                    weeklyEarnings: { increment: order.courierAmount },
                    totalEarnings: { increment: order.courierAmount },
                    pendingPayout: { increment: order.courierAmount },
                    totalDeliveries: { increment: 1 },
                },
            });
        }
        return res.json({
            success: true,
            message: 'Teslimat onaylandı, ödeme kuryeye aktarıldı',
            data: { orderId, courierAmount: order.courierAmount },
        });
    }
    catch (error) {
        console.error('Confirm delivery error:', error);
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// KURYE BAKİYE VE KAZANÇ BİLGİSİ
// ================================
async function getCourierEarnings(req, res) {
    try {
        const userId = req.user.userId;
        const courier = await prisma_1.prisma.courier.findUnique({
            where: { userId },
            include: {
                orders: {
                    where: {
                        escrowStatus: 'RELEASED',
                        deliveredAt: {
                            gte: new Date(new Date().setDate(new Date().getDate() - 7)),
                        },
                    },
                    select: {
                        id: true, trackingCode: true, price: true, courierAmount: true,
                        deliveredAt: true, recipientName: true,
                    },
                    orderBy: { deliveredAt: 'desc' },
                },
                payouts: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
            },
        });
        if (!courier) {
            return res.status(404).json({ success: false, message: 'Kurye profili bulunamadı' });
        }
        return res.json({
            success: true,
            data: {
                weeklyEarnings: courier.weeklyEarnings,
                totalEarnings: courier.totalEarnings,
                pendingPayout: courier.pendingPayout,
                recentDeliveries: courier.orders,
                recentPayouts: courier.payouts,
            },
        });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// ADMİN — HAFTALIK ÖDEME HESAPLA
// ================================
async function calculateWeeklyPayouts(req, res) {
    try {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        // Bekleyen ödemesi olan kuryeler
        const couriers = await prisma_1.prisma.courier.findMany({
            where: { pendingPayout: { gt: 0 } },
            include: { user: { select: { fullName: true, email: true, phone: true } } },
        });
        const payouts = await Promise.all(couriers.map(async (courier) => {
            const grossAmount = courier.pendingPayout;
            const commission = grossAmount * COMMISSION_RATE;
            const tax = commission * TAX_RATE;
            const netAmount = grossAmount - commission - tax;
            const payout = await prisma_1.prisma.payout.create({
                data: {
                    courierId: courier.id,
                    amount: grossAmount,
                    commission,
                    tax,
                    netAmount,
                    weekStart,
                    weekEnd,
                    status: 'PENDING',
                },
            });
            // Kurye bekleyen ödemeyi sıfırla
            await prisma_1.prisma.courier.update({
                where: { id: courier.id },
                data: {
                    pendingPayout: 0,
                    weeklyEarnings: 0,
                },
            });
            return {
                courier: courier.user.fullName,
                grossAmount,
                commission,
                tax,
                netAmount,
                payoutId: payout.id,
            };
        }));
        return res.json({
            success: true,
            message: `${payouts.length} kurye için ödeme hesaplandı`,
            data: { payouts, weekStart, weekEnd },
        });
    }
    catch (error) {
        console.error('Payout error:', error);
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// ADMİN — ÖDEME LİSTESİ
// ================================
async function getPayouts(req, res) {
    try {
        const payouts = await prisma_1.prisma.payout.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                courier: {
                    include: { user: { select: { fullName: true, phone: true } } },
                },
            },
        });
        const totalPending = payouts
            .filter(p => p.status === 'PENDING')
            .reduce((sum, p) => sum + p.netAmount, 0);
        const totalCommission = payouts
            .reduce((sum, p) => sum + p.commission, 0);
        const totalTax = payouts
            .reduce((sum, p) => sum + p.tax, 0);
        return res.json({
            success: true,
            data: { payouts, totalPending, totalCommission, totalTax },
        });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// ADMİN — ÖDEME TAMAMLA
// ================================
async function completePayout(req, res) {
    try {
        const { payoutId } = req.params;
        const { note } = req.body;
        const payout = await prisma_1.prisma.payout.update({
            where: { id: payoutId },
            data: {
                status: 'PAID',
                paidAt: new Date(),
                note,
            },
            include: {
                courier: {
                    include: { user: { select: { fullName: true } } },
                },
            },
        });
        return res.json({
            success: true,
            message: `${payout.courier.user.fullName} için ödeme tamamlandı`,
            data: payout,
        });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
