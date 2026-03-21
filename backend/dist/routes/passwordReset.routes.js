"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passwordreset_controller_1 = require("../controllers/passwordreset.controller");
const router = (0, express_1.Router)();
router.post('/forgot', passwordreset_controller_1.forgotPassword);
router.post('/reset', passwordreset_controller_1.resetPassword);
router.get('/verify/:token', passwordreset_controller_1.verifyResetToken);
exports.default = router;
