"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const registerValidation = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Geçerli bir e-posta girin'),
    (0, express_validator_1.body)('phone')
        .matches(/^(\+90|0)?[0-9]{10}$/)
        .withMessage('Geçerli bir telefon numarası girin'),
    (0, express_validator_1.body)('fullName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Ad soyad 2-100 karakter olmalı'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Şifre en az 8 karakter olmalı'),
    (0, express_validator_1.body)('role')
        .optional()
        .isIn(['BUSINESS', 'COURIER'])
        .withMessage('Geçersiz rol'),
];
const loginValidation = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Geçerli bir e-posta girin'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Şifre gerekli'),
];
router.post('/register', registerValidation, auth_controller_1.register);
router.post('/login', loginValidation, auth_controller_1.login);
router.post('/refresh', auth_controller_1.refreshToken);
router.post('/logout', auth_controller_1.logout);
router.get('/me', auth_1.authenticate, auth_controller_1.getMe);
exports.default = router;
