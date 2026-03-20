"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = getStats;
exports.getAllOrders = getAllOrders;
exports.assignCourier = assignCourier;
exports.getAllCouriers = getAllCouriers;
exports.approveCourier = approveCourier;
exports.getAllBusinesses = getAllBusinesses;
const prisma_1 = require("../lib/prisma");
// ================================
// GENEL İSTATİSTİKLER
// ================================
async function getStats(req, res) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [totalOrders, activeOrders, deliveredOrders, totalCouriers, totalBusinesses, todayOrders,] = await Promise.all([
            prisma_1.prisma.order.count(),
            prisma_1.prisma.order.count({ where: { status: { in: ['PENDING', 'CONFIRMED', 'PICKING_UP', 'IN_TRANSIT'] } } }),
            prisma_1.prisma.order.count({ where: { status: 'DELIVERED' } }),
            prisma_1.prisma.courier.count(),
            prisma_1.prisma.business.count(),
            prisma_1.prisma.order.findMany({ where: { createdAt: { gte: today } } }),
        ]);
        const todayRevenue = todayOrders.reduce((sum, o) => sum + o.price, 0);
        return res.json({
            success: true,
            data: {
                totalOrders,
                activeOrders,
                deliveredOrders,
                totalCouriers,
                totalBusinesses,
                todayRevenue: Math.round(todayRevenue * 100) / 100,
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
        const { page = 1, limit = 50, status } = req.query;
        const where = {};
        if (status)
            where.status = status;
        const [orders, total] = await Promise.all([
            prisma_1.prisma.order.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                include: {
                    courier: { include: { user: { select: { fullName: true, phone: true } } } },
                    business: { include: { user: { select: { fullName: true } } } },
                },
            }),
            prisma_1.prisma.order.count({ where }),
        ]);
        return res.json({ success: true, data: { orders, total } });
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
            data: {
                courierId,
                status: 'PICKING_UP',
            },
        });
        return res.json({ success: true, message: 'Kurye atandı', data: order });
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
        const couriers = await prisma_1.prisma.courier.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { fullName: true, email: true, phone: true, createdAt: true } },
                _count: { select: { orders: true } },
            },
        });
        return res.json({ success: true, data: { couriers } });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// KURYE ONAYLA / REDDET
// ================================
async function approveCourier(req, res) {
    try {
        const { id } = req.params;
        const { isApproved } = req.body;
        const courier = await prisma_1.prisma.courier.update({
            where: { id },
            data: { isApproved },
        });
        return res.json({
            success: true,
            message: isApproved ? 'Kurye onaylandı' : 'Kurye reddedildi',
            data: courier,
        });
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
        const businesses = await prisma_1.prisma.business.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { fullName: true, email: true, phone: true } },
                _count: { select: { orders: true } },
            },
        });
        return res.json({ success: true, data: { businesses } });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
