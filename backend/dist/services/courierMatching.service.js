"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findNearestCouriers = findNearestCouriers;
exports.assignOrderToCourier = assignOrderToCourier;
exports.retryOrderAssignment = retryOrderAssignment;
exports.checkOrderTimeouts = checkOrderTimeouts;
const prisma_1 = require("../lib/prisma");
// ================================
// HAVERSINE MESAFE HESAPLA (km)
// ================================
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
// ================================
// EN YAKIN KURYELERİ BUL
// ================================
async function findNearestCouriers(senderLat, senderLng, limit = 3, excludeIds = []) {
    const couriers = await prisma_1.prisma.courier.findMany({
        where: {
            isOnline: true,
            isApproved: true,
            id: { notIn: excludeIds },
            currentLat: { not: null },
            currentLng: { not: null },
        },
        select: {
            id: true,
            userId: true,
            currentLat: true,
            currentLng: true,
        },
    });
    const withDistance = couriers
        .map(c => ({
        courierId: c.id,
        userId: c.userId,
        distance: calculateDistance(senderLat, senderLng, c.currentLat, c.currentLng),
    }))
        .filter(c => c.distance <= 15)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);
    return withDistance;
}
// ================================
// SİPARİŞ ATAMA (RACE CONDITION KORUMALI)
// ================================
async function assignOrderToCourier(orderId, courierId) {
    try {
        await prisma_1.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId },
                select: { id: true, status: true, courierId: true },
            });
            if (!order)
                throw new Error('Sipariş bulunamadı');
            if (order.status !== 'CONFIRMED')
                throw new Error('Sipariş artık müsait değil');
            if (order.courierId !== null)
                throw new Error('Sipariş zaten alındı');
            const courier = await tx.courier.findUnique({
                where: { id: courierId },
                select: { id: true, isOnline: true, isApproved: true },
            });
            if (!courier || !courier.isOnline || !courier.isApproved) {
                throw new Error('Kurye müsait değil');
            }
            await tx.order.update({
                where: {
                    id: orderId,
                    courierId: null,
                    status: 'CONFIRMED',
                },
                data: {
                    courierId,
                    status: 'PICKING_UP',
                    assignedAt: new Date(),
                },
            });
        });
        return { success: true, message: 'Sipariş başarıyla atandı' };
    }
    catch (error) {
        return { success: false, message: error.message || 'Atama başarısız' };
    }
}
// ================================
// KURYE BULUNAMADIYSA YENİDEN DENE
// ================================
async function retryOrderAssignment(orderId) {
    const order = await prisma_1.prisma.order.findUnique({
        where: { id: orderId },
        select: {
            id: true,
            status: true,
            courierId: true,
            senderLat: true,
            senderLng: true,
            assignmentAttempts: true,
            rejectedCourierIds: true,
            pendingCourierIds: true,
        },
    });
    if (!order || order.status !== 'CONFIRMED' || order.courierId)
        return;
    if ((order.assignmentAttempts || 0) >= 3) {
        await prisma_1.prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'CANCELLED',
                cancelReason: 'Uygun kurye bulunamadı',
            },
        });
        console.log(`Sipariş ${orderId} iptal edildi: Uygun kurye bulunamadı`);
        return;
    }
    const excludeIds = order.rejectedCourierIds || [];
    const nearestCouriers = await findNearestCouriers(order.senderLat, order.senderLng, 3, excludeIds);
    if (nearestCouriers.length === 0) {
        await prisma_1.prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'CANCELLED',
                cancelReason: 'Bölgede aktif kurye bulunamadı',
            },
        });
        return;
    }
    // duplicate önleme
    const newCourierIds = nearestCouriers
        .map(c => c.courierId)
        .filter(id => !(order.pendingCourierIds || []).includes(id));
    await prisma_1.prisma.order.update({
        where: { id: orderId },
        data: {
            assignmentAttempts: { increment: 1 },
            pendingCourierIds: {
                push: newCourierIds,
            },
        },
    });
    console.log(`Sipariş ${orderId} için ${newCourierIds.length} kuryeye bildirim gönderildi`);
}
// ================================
// ZAMAN AŞIMI KONTROLÜ (CRON JOB)
// ================================
async function checkOrderTimeouts() {
    const now = new Date();
    const pickupTimeout = new Date(now.getTime() - 45 * 60 * 1000);
    const timedOutPickups = await prisma_1.prisma.order.findMany({
        where: {
            status: 'PICKING_UP',
            assignedAt: { lt: pickupTimeout },
        },
        select: { id: true, courierId: true },
    });
    for (const order of timedOutPickups) {
        const updateData = {
            status: 'CONFIRMED',
            courierId: null,
            assignedAt: null,
        };
        // ✅ NULL SAFE FIX
        if (order.courierId) {
            updateData.rejectedCourierIds = {
                push: order.courierId,
            };
        }
        await prisma_1.prisma.order.update({
            where: { id: order.id },
            data: updateData,
        });
        await retryOrderAssignment(order.id);
        console.log(`Sipariş ${order.id}: Kurye zaman aşımı, yeniden atanıyor`);
    }
    const confirmTimeout = new Date(now.getTime() - 30 * 60 * 1000);
    const unacceptedOrders = await prisma_1.prisma.order.findMany({
        where: {
            status: 'CONFIRMED',
            courierId: null,
            createdAt: { lt: confirmTimeout },
        },
        select: { id: true },
    });
    for (const order of unacceptedOrders) {
        await retryOrderAssignment(order.id);
    }
}
