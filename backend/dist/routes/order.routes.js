"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const order_controller_1 = require("../controllers/order.controller");
const auth_1 = require("../middleware/auth");
const order_controller_2 = require("../controllers/order.controller");
const router = (0, express_1.Router)();
const orderValidation = [
    (0, express_validator_1.body)('senderName').trim().notEmpty().withMessage('Gönderici adı gerekli'),
    (0, express_validator_1.body)('senderPhone').notEmpty().withMessage('Gönderici telefonu gerekli'),
    (0, express_validator_1.body)('senderAddress').notEmpty().withMessage('Alım adresi gerekli'),
    (0, express_validator_1.body)('senderLat').isNumeric().withMessage('Geçerli koordinat gerekli'),
    (0, express_validator_1.body)('senderLng').isNumeric().withMessage('Geçerli koordinat gerekli'),
    (0, express_validator_1.body)('recipientName').trim().notEmpty().withMessage('Alıcı adı gerekli'),
    (0, express_validator_1.body)('recipientPhone').notEmpty().withMessage('Alıcı telefonu gerekli'),
    (0, express_validator_1.body)('recipientAddress').notEmpty().withMessage('Teslimat adresi gerekli'),
    (0, express_validator_1.body)('recipientLat').isNumeric().withMessage('Geçerli koordinat gerekli'),
    (0, express_validator_1.body)('recipientLng').isNumeric().withMessage('Geçerli koordinat gerekli'),
    (0, express_validator_1.body)('packageDesc').notEmpty().withMessage('Paket açıklaması gerekli'),
];
// Public
router.get('/track/:code', order_controller_1.trackOrder);
router.post('/estimate', order_controller_1.estimatePrice);
// Auth gerekli
router.post('/', auth_1.authenticate, orderValidation, order_controller_1.createOrder);
router.get('/', auth_1.authenticate, order_controller_1.getOrders);
router.get('/:id', auth_1.authenticate, order_controller_1.getOrder);
router.patch('/:id/cancel', auth_1.authenticate, order_controller_2.cancelOrder);
exports.default = router;
