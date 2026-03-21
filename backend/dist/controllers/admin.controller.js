"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = getStats;
exports.getAllOrders = getAllOrders;
exports.getOrderDetail = getOrderDetail;
exports.assignCourier = assignCourier;
exports.updateOrderStatus = updateOrderStatus;
exports.getAllUsers = getAllUsers;
exports.getUserDetail = getUserDetail;
exports.toggleUserStatus = toggleUserStatus;
exports.getAllCouriers = getAllCouriers;
exports.getCourierDetail = getCourierDetail;
exports.approveCourier = approveCourier;
exports.updateCourierIban = updateCourierIban;
exports.getEscrowStatus = getEscrowStatus;
exports.getPayouts = getPayouts;
exports.calculateWeeklyPayouts = calculateWeeklyPayouts;
exports.completePayout = completePayout;
exports.getSettings = getSettings;
exports.updateSettings = updateSettings;
exports.getAllBusinesses = getAllBusinesses;
const prisma_1 = require("../lib/prisma");
const COMMISSION_RATE = 0.20;
const TAX_RATE = 0.18;
// ================================
// GENEL İSTATİSTİKLER
// ================================
async function getStats(req, res) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(today);
        monthAgo.setDate(monthAgo.getDate() - 30);
        const [totalOrders, activeOrders, deliveredOrders, cancelledOrders, totalUsers, totalCouriers, activeCouriers, totalBusinesses, todayOrders, weekOrders, escrowHeld, totalRevenue, totalCommission, pendingPayouts,] = await Promise.all([
            prisma_1.prisma.order.count(),
            prisma_1.prisma.order.count({ where: { status: { in: ['PENDING', 'CONFIRMED', 'PICKING_UP', 'IN_TRANSIT'] } } }),
            prisma_1.prisma.order.count({ where: { status: 'DELIVERED' } }),
            prisma_1.prisma.order.count({ where: { status: 'CANCELLED' } }),
            prisma_1.prisma.user.count({ where: { role: { in: ['INDIVIDUAL', 'BUSINESS'] } } }),
            prisma_1.prisma.courier.count(),
            prisma_1.prisma.courier.count({ where: { isOnline: true, isApproved: true } }),
            prisma_1.prisma.business.count(),
            prisma_1.prisma.order.findMany({ where: { createdAt: { gte: today } } }),
            prisma_1.prisma.order.findMany({ where: { createdAt: { gte: weekAgo } } }),
            prisma_1.prisma.order.aggregate({ where: { escrowStatus: 'HELD' }, _sum: { escrowAmount: true } }),
            prisma_1.prisma.order.aggregate({ where: { status: 'DELIVERED' }, _sum: { price: true } }),
            prisma_1.prisma.order.aggregate({ where: { status: 'DELIVERED' }, _sum: { commissionAmount: true } }),
            prisma_1.prisma.payout.aggregate({ where: { status: 'PENDING' }, _sum: { netAmount: true } }),
        ]);
        const todayRevenue = todayOrders.reduce((s, o) => s + o.price, 0);
        const weekRevenue = weekOrders.reduce((s, o) => s + o.price, 0);
        return res.json({
            success: true,
            data: {
                orders: { total: totalOrders, active: activeOrders, delivered: deliveredOrders, cancelled: cancelledOrders, today: todayOrders.length, week: weekOrders.length },
                users: { total: totalUsers, businesses: totalBusinesses, couriers: totalCouriers, activeCouriers },
                finance: {
                    escrowHeld: escrowHeld._sum.escrowAmount || 0,
                    totalRevenue: totalRevenue._sum.price || 0,
                    totalCommission: totalCommission._sum.commissionAmount || 0,
                    pendingPayouts: pendingPayouts._sum.netAmount || 0,
                    todayRevenue, weekRevenue,
                },
            },
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// TÜM SİPARİŞLER
// ================================
async function getAllOrders(req, res) {
    try {
        const { page = 1, limit = 20, status, search } = req.query;
        const where = {};
        if (status && status !== 'ALL')
            where.status = status;
        if (search) {
            where.OR = [
                { trackingCode: { contains: search, mode: 'insensitive' } },
                { recipientName: { contains: search, mode: 'insensitive' } },
                { senderName: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [orders, total] = await Promise.all([
            prisma_1.prisma.order.findMany({
                where, orderBy: { createdAt: 'desc' },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                include: {
                    courier: { include: { user: { select: { fullName: true, phone: true } } } },
                    business: { include: { user: { select: { fullName: true, email: true } } } },
                },
            }),
            prisma_1.prisma.order.count({ where }),
        ]);
        return res.json({ success: true, data: { orders, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) } });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// SİPARİŞ DETAYI
// ================================
async function getOrderDetail(req, res) {
    try {
        const { id } = req.params;
        const order = await prisma_1.prisma.order.findUnique({
            where: { id },
            include: {
                courier: { include: { user: true } },
                business: { include: { user: true } },
            },
        });
        if (!order)
            return res.status(404).json({ success: false, message: 'Sipariş bulunamadı' });
        return res.json({ success: true, data: order });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// SİPARİŞE KURYE ATA
// ================================
async function assignCourier(req, res) {
    try {
        const { id } = req.params;
        const { courierId } = req.body;
        const order = await prisma_1.prisma.order.update({
            where: { id },
            data: { courierId, status: 'PICKING_UP', assignedAt: new Date() },
        });
        return res.json({ success: true, message: 'Kurye atandı', data: order });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// SİPARİŞ DURUMU GÜNCELLE (ADMIN)
// ================================
async function updateOrderStatus(req, res) {
    try {
        const { id } = req.params;
        const { status, note } = req.body;
        const data = { status };
        if (status === 'DELIVERED')
            data.deliveredAt = new Date();
        if (status === 'CANCELLED')
            data.cancelReason = note || 'Admin tarafından iptal edildi';
        const order = await prisma_1.prisma.order.update({ where: { id }, data });
        return res.json({ success: true, message: 'Durum güncellendi', data: order });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// TÜM KULLANICILAR
// ================================
async function getAllUsers(req, res) {
    try {
        const { page = 1, limit = 20, role, search, isActive } = req.query;
        const where = {};
        if (role && role !== 'ALL')
            where.role = role;
        if (isActive !== undefined)
            where.isActive = isActive === 'true';
        if (search) {
            where.OR = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [users, total] = await Promise.all([
            prisma_1.prisma.user.findMany({
                where, orderBy: { createdAt: 'desc' },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                select: {
                    id: true, fullName: true, email: true, phone: true,
                    role: true, isActive: true, isVerified: true, createdAt: true,
                    business: { select: { id: true, companyName: true, balance: true, _count: { select: { orders: true } } } },
                    courier: { select: { id: true, isApproved: true, isOnline: true, rating: true, totalDeliveries: true, pendingPayout: true } },
                },
            }),
            prisma_1.prisma.user.count({ where }),
        ]);
        return res.json({ success: true, data: { users, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) } });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// KULLANICI DETAYI
// ================================
async function getUserDetail(req, res) {
    try {
        const { id } = req.params;
        const user = await prisma_1.prisma.user.findUnique({
            where: { id },
            include: {
                business: { include: { orders: { orderBy: { createdAt: 'desc' }, take: 10 } } },
                courier: { include: { orders: { orderBy: { createdAt: 'desc' }, take: 10 }, payouts: { orderBy: { createdAt: 'desc' }, take: 5 } } },
            },
        });
        if (!user)
            return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
        return res.json({ success: true, data: user });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// KULLANICI AKTİF/PASİF
// ================================
async function toggleUserStatus(req, res) {
    try {
        const { id } = req.params;
        const user = await prisma_1.prisma.user.findUnique({ where: { id } });
        if (!user)
            return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
        const updated = await prisma_1.prisma.user.update({
            where: { id },
            data: { isActive: !user.isActive },
        });
        return res.json({ success: true, message: updated.isActive ? 'Hesap aktif edildi' : 'Hesap askıya alındı', data: { isActive: updated.isActive } });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// TÜM KURYELER
// ================================
async function getAllCouriers(req, res) {
    try {
        const { page = 1, limit = 20, isApproved, isOnline, search } = req.query;
        const where = {};
        if (isApproved !== undefined)
            where.isApproved = isApproved === 'true';
        if (isOnline !== undefined)
            where.isOnline = isOnline === 'true';
        if (search) {
            where.user = {
                OR: [
                    { fullName: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } },
                ]
            };
        }
        const [couriers, total] = await Promise.all([
            prisma_1.prisma.courier.findMany({
                where, orderBy: { createdAt: 'desc' },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                include: {
                    user: { select: { id: true, fullName: true, email: true, phone: true, isActive: true, createdAt: true } },
                    _count: { select: { orders: true } },
                },
            }),
            prisma_1.prisma.courier.count({ where }),
        ]);
        return res.json({ success: true, data: { couriers, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) } });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// KURYE DETAYI
// ================================
async function getCourierDetail(req, res) {
    try {
        const { id } = req.params;
        const courier = await prisma_1.prisma.courier.findUnique({
            where: { id },
            include: {
                user: true,
                orders: { orderBy: { createdAt: 'desc' }, take: 20 },
                payouts: { orderBy: { createdAt: 'desc' }, take: 10 },
            },
        });
        if (!courier)
            return res.status(404).json({ success: false, message: 'Kurye bulunamadı' });
        return res.json({ success: true, data: courier });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// KURYE ONAYLA/REDDET
// ================================
async function approveCourier(req, res) {
    try {
        const { id } = req.params;
        const { isApproved, note } = req.body;
        const courier = await prisma_1.prisma.courier.update({
            where: { id },
            data: { isApproved },
            include: { user: { select: { fullName: true } } },
        });
        return res.json({ success: true, message: isApproved ? 'Kurye onaylandı' : 'Kurye reddedildi', data: courier });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// KURYE IBAN GÜNCELLE
// ================================
async function updateCourierIban(req, res) {
    try {
        const { id } = req.params;
        const { iban, bankName } = req.body;
        const courier = await prisma_1.prisma.courier.update({
            where: { id },
            data: { iban, bankName },
        });
        return res.json({ success: true, message: 'IBAN güncellendi', data: courier });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// HAVUZ (ESCROW) DURUMU
// ================================
async function getEscrowStatus(req, res) {
    try {
        const [held, released, refunded, pendingConfirm] = await Promise.all([
            prisma_1.prisma.order.aggregate({ where: { escrowStatus: 'HELD' }, _sum: { escrowAmount: true }, _count: true }),
            prisma_1.prisma.order.aggregate({ where: { escrowStatus: 'RELEASED' }, _sum: { escrowAmount: true }, _count: true }),
            prisma_1.prisma.order.aggregate({ where: { escrowStatus: 'REFUNDED' }, _sum: { escrowAmount: true }, _count: true }),
            prisma_1.prisma.order.findMany({
                where: { status: 'DELIVERED', escrowStatus: 'HELD' },
                orderBy: { deliveredAt: 'asc' },
                take: 20,
                include: {
                    courier: { include: { user: { select: { fullName: true } } } },
                    business: { include: { user: { select: { fullName: true } } } },
                },
            }),
        ]);
        return res.json({
            success: true,
            data: {
                held: { amount: held._sum.escrowAmount || 0, count: held._count },
                released: { amount: released._sum.escrowAmount || 0, count: released._count },
                refunded: { amount: refunded._sum.escrowAmount || 0, count: refunded._count },
                pendingConfirm,
            },
        });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// HAKEDİŞ LİSTESİ
// ================================
async function getPayouts(req, res) {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const where = {};
        if (status && status !== 'ALL')
            where.status = status;
        const [payouts, total, summary] = await Promise.all([
            prisma_1.prisma.payout.findMany({
                where, orderBy: { createdAt: 'desc' },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                include: {
                    courier: {
                        include: { user: { select: { fullName: true, phone: true } } },
                    },
                },
            }),
            prisma_1.prisma.payout.count({ where }),
            prisma_1.prisma.payout.aggregate({
                where: { status: 'PENDING' },
                _sum: { netAmount: true, amount: true, commission: true, tax: true },
                _count: true,
            }),
        ]);
        return res.json({
            success: true,
            data: {
                payouts, total,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
                summary: {
                    pendingCount: summary._count,
                    pendingTotal: summary._sum.netAmount || 0,
                    totalGross: summary._sum.amount || 0,
                    totalCommission: summary._sum.commission || 0,
                    totalTax: summary._sum.tax || 0,
                },
            },
        });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// HAFTALİK HAKEDİŞ HESAPLA
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
        const couriers = await prisma_1.prisma.courier.findMany({
            where: { pendingPayout: { gt: 0 } },
            include: { user: { select: { fullName: true, email: true, phone: true } } },
        });
        if (couriers.length === 0) {
            return res.json({ success: true, message: 'Bekleyen hakediş yok', data: { payouts: [] } });
        }
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
                    netAmount: Math.round(netAmount * 100) / 100,
                    weekStart,
                    weekEnd,
                    status: 'PENDING',
                    iban: courier.iban,
                    bankName: courier.bankName,
                },
            });
            await prisma_1.prisma.courier.update({
                where: { id: courier.id },
                data: { pendingPayout: 0, weeklyEarnings: 0 },
            });
            return {
                courier: courier.user.fullName,
                phone: courier.user.phone,
                iban: courier.iban,
                bankName: courier.bankName,
                grossAmount: Math.round(grossAmount * 100) / 100,
                commission: Math.round(commission * 100) / 100,
                tax: Math.round(tax * 100) / 100,
                netAmount: Math.round(netAmount * 100) / 100,
                payoutId: payout.id,
            };
        }));
        return res.json({
            success: true,
            message: `${payouts.length} kurye için hakediş hesaplandı`,
            data: { payouts, weekStart, weekEnd },
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// HAKEDİŞ ÖDE
// ================================
async function completePayout(req, res) {
    try {
        const { payoutId } = req.params;
        const { note } = req.body;
        const payout = await prisma_1.prisma.payout.update({
            where: { id: payoutId },
            data: { status: 'PAID', paidAt: new Date(), note },
            include: { courier: { include: { user: { select: { fullName: true } } } } },
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
// ================================
// SİSTEM AYARLARI GETİR
// ================================
async function getSettings(req, res) {
    try {
        let settings = await prisma_1.prisma.systemSettings.findFirst();
        if (!settings) {
            settings = await prisma_1.prisma.systemSettings.create({ data: {} });
        }
        return res.json({ success: true, data: settings });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// SİSTEM AYARLARI GÜNCELLE
// ================================
async function updateSettings(req, res) {
    try {
        const userId = req.user.userId;
        let settings = await prisma_1.prisma.systemSettings.findFirst();
        if (!settings) {
            settings = await prisma_1.prisma.systemSettings.create({ data: { ...req.body, updatedBy: userId } });
        }
        else {
            settings = await prisma_1.prisma.systemSettings.update({
                where: { id: settings.id },
                data: { ...req.body, updatedBy: userId },
            });
        }
        return res.json({ success: true, message: 'Ayarlar güncellendi', data: settings });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// TÜM İŞLETMELER
// ================================
async function getAllBusinesses(req, res) {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const where = {};
        if (search) {
            where.OR = [
                { companyName: { contains: search, mode: 'insensitive' } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
            ];
        }
        const [businesses, total] = await Promise.all([
            prisma_1.prisma.business.findMany({
                where, orderBy: { createdAt: 'desc' },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                include: {
                    user: { select: { fullName: true, email: true, phone: true, isActive: true, createdAt: true, role: true } },
                    _count: { select: { orders: true } },
                },
            }),
            prisma_1.prisma.business.count({ where }),
        ]);
        return res.json({ success: true, data: { businesses, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) } });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
