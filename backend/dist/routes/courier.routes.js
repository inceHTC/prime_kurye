"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const courier_controller_1 = require("../controllers/courier.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Tüm kurye route'ları auth gerektirir
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)('COURIER', 'ADMIN'));
router.get('/orders', courier_controller_1.getCourierOrders);
router.patch('/status', courier_controller_1.updateCourierStatus);
router.patch('/location', courier_controller_1.updateCourierLocation);
router.patch('/orders/:id/accept', courier_controller_1.acceptOrder);
router.patch('/orders/:id/status', courier_controller_1.updateOrderStatus);
exports.default = router;
