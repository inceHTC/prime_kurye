"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("../controllers/report.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/business', auth_1.authenticate, (0, auth_1.authorize)('BUSINESS'), report_controller_1.getBusinessReport);
router.get('/admin', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), report_controller_1.getAdminReport);
exports.default = router;
