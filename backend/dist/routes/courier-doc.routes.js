"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const courierDoc_controller_1 = require("../controllers/courierDoc.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Kurye belge yükleme
router.post('/upload', auth_1.authenticate, (0, auth_1.authorize)('COURIER'), courierDoc_controller_1.upload.fields([
    { name: 'identityDoc', maxCount: 1 }, // Kimlik
    { name: 'licenseDoc', maxCount: 1 }, // Ehliyet
    { name: 'vehicleDoc', maxCount: 1 }, // Araç ruhsatı
    { name: 'criminalRecord', maxCount: 1 }, // Sabıka kaydı
]), courierDoc_controller_1.uploadCourierDocuments);
// Kurye belgelerini getir
router.get('/my', auth_1.authenticate, (0, auth_1.authorize)('COURIER'), courierDoc_controller_1.getCourierDocuments);
// Sözleşme imzala
router.post('/sign-contract', auth_1.authenticate, (0, auth_1.authorize)('COURIER'), courierDoc_controller_1.signContract);
// Admin — kurye belgelerini görüntüle
router.get('/admin/:courierId', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), courierDoc_controller_1.getAdminCourierDocuments);
exports.default = router;
