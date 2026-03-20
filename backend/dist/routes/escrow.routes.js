"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const escrow_controller_1 = require("../controllers/escrow.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Müşteri — paketi teslim alınca ödeme yap
router.post('/initiate', auth_1.authenticate, (0, auth_1.authorize)('BUSINESS'), escrow_controller_1.initiateEscrow);
// Müşteri — teslimi onayla
router.post('/confirm', auth_1.authenticate, (0, auth_1.authorize)('BUSINESS'), escrow_controller_1.confirmDelivery);
// Kurye — kazanç bilgisi
router.get('/courier/earnings', auth_1.authenticate, (0, auth_1.authorize)('COURIER'), escrow_controller_1.getCourierEarnings);
// Admin — haftalık ödeme hesapla
router.post('/admin/calculate', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), escrow_controller_1.calculateWeeklyPayouts);
// Admin — ödeme listesi
router.get('/admin/payouts', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), escrow_controller_1.getPayouts);
// Admin — ödeme tamamla
router.patch('/admin/payouts/:payoutId/complete', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), escrow_controller_1.completePayout);
exports.default = router;
