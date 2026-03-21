"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)('ADMIN'));
// İstatistikler
router.get('/stats', admin_controller_1.getStats);
// Siparişler
router.get('/orders', admin_controller_1.getAllOrders);
router.get('/orders/:id', admin_controller_1.getOrderDetail);
router.patch('/orders/:id/assign', admin_controller_1.assignCourier);
router.patch('/orders/:id/status', admin_controller_1.updateOrderStatus);
// Kullanıcılar
router.get('/users', admin_controller_1.getAllUsers);
router.get('/users/:id', admin_controller_1.getUserDetail);
router.patch('/users/:id/toggle', admin_controller_1.toggleUserStatus);
// Kuryeler
router.get('/couriers', admin_controller_1.getAllCouriers);
router.get('/couriers/:id', admin_controller_1.getCourierDetail);
router.patch('/couriers/:id/approve', admin_controller_1.approveCourier);
router.patch('/couriers/:id/iban', admin_controller_1.updateCourierIban);
// İşletmeler
router.get('/businesses', admin_controller_1.getAllBusinesses);
// Finans
router.get('/escrow', admin_controller_1.getEscrowStatus);
router.get('/payouts', admin_controller_1.getPayouts);
router.post('/payouts/calculate', admin_controller_1.calculateWeeklyPayouts);
router.patch('/payouts/:payoutId/complete', admin_controller_1.completePayout);
// Sistem ayarları
router.get('/settings', admin_controller_1.getSettings);
router.patch('/settings', admin_controller_1.updateSettings);
exports.default = router;
