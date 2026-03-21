"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const order_controller_1 = require("../controllers/order.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Sipariş Doğrulama Kuralları
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
    // YENİ: Eklediğimiz alanlar için opsiyonel doğrulamalar
    (0, express_validator_1.body)('isFragile').optional().isBoolean().withMessage('Hassas paket bilgisi boolean olmalı'),
    (0, express_validator_1.body)('packageValue').optional().isNumeric().withMessage('Paket değeri sayı olmalı'),
    (0, express_validator_1.body)('deliveryType').isIn(['EXPRESS', 'SAME_DAY', 'SCHEDULED']).withMessage('Geçersiz teslimat tipi')
];
// === PUBLIC YOLLAR (Giriş gerektirmez) ===
router.get('/track/:code', order_controller_1.trackOrder);
router.post('/estimate', order_controller_1.estimatePrice); // Fiyat hesaplama için giriş şartı koymuyoruz, herkes görebilsin.
// === AUTH GEREKLİ YOLLAR (Sadece giriş yapanlar) ===
router.post('/', auth_1.authenticate, orderValidation, order_controller_1.createOrder); // Sipariş oluştururken doğrulama devrede
router.get('/', auth_1.authenticate, order_controller_1.getOrders);
router.get('/:id', auth_1.authenticate, order_controller_1.getOrder);
router.patch('/:id/cancel', auth_1.authenticate, order_controller_1.cancelOrder);
exports.default = router;
