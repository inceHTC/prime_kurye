"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
exports.uploadCourierDocuments = uploadCourierDocuments;
exports.getCourierDocuments = getCourierDocuments;
exports.signContract = signContract;
exports.getAdminCourierDocuments = getAdminCourierDocuments;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const prisma_1 = require("../lib/prisma");
// ================================
// MULTER AYARLARI
// ================================
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(process.cwd(), 'uploads', 'courier-docs');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const userId = req.user?.userId || 'unknown';
        const ext = path_1.default.extname(file.originalname);
        const name = `${userId}-${file.fieldname}-${Date.now()}${ext}`;
        cb(null, name);
    },
});
const fileFilter = (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.pdf', '.webp'];
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
        cb(null, true);
    }
    else {
        cb(new Error('Sadece JPG, PNG ve PDF dosyaları yüklenebilir'));
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
// ================================
// KURYE BELGELERİ YÜKLE
// ================================
async function uploadCourierDocuments(req, res) {
    try {
        const userId = req.user.userId;
        const files = req.files;
        if (!files || Object.keys(files).length === 0) {
            return res.status(400).json({ success: false, message: 'Dosya yüklenmedi' });
        }
        const courier = await prisma_1.prisma.courier.findUnique({ where: { userId } });
        if (!courier) {
            return res.status(404).json({ success: false, message: 'Kurye profili bulunamadı' });
        }
        const docPaths = {};
        Object.entries(files).forEach(([field, fileArr]) => {
            if (fileArr?.[0]) {
                docPaths[field] = `/uploads/courier-docs/${fileArr[0].filename}`;
            }
        });
        // Belgeleri kaydet
        await prisma_1.prisma.courier.update({
            where: { userId },
            data: {
                identityDoc: docPaths.identityDoc,
                licenseDoc: docPaths.licenseDoc,
                vehicleDoc: docPaths.vehicleDoc,
                criminalRecord: docPaths.criminalRecord,
                documentsSubmitted: true,
                documentsSubmittedAt: new Date(),
            },
        });
        return res.json({
            success: true,
            message: 'Belgeler başarıyla yüklendi',
            data: docPaths,
        });
    }
    catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ success: false, message: 'Yükleme başarısız' });
    }
}
// ================================
// KURYE BELGELERİNİ GETİR
// ================================
async function getCourierDocuments(req, res) {
    try {
        const userId = req.user.userId;
        const courier = await prisma_1.prisma.courier.findUnique({
            where: { userId },
            select: {
                identityDoc: true,
                licenseDoc: true,
                vehicleDoc: true,
                criminalRecord: true,
                documentsSubmitted: true,
                documentsSubmittedAt: true,
                isApproved: true,
                contractSigned: true,
                contractSignedAt: true,
            },
        });
        if (!courier) {
            return res.status(404).json({ success: false, message: 'Kurye profili bulunamadı' });
        }
        return res.json({ success: true, data: courier });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// SÖZLEŞME İMZALA
// ================================
async function signContract(req, res) {
    try {
        const userId = req.user.userId;
        const { agreed } = req.body;
        if (!agreed) {
            return res.status(400).json({ success: false, message: 'Sözleşme onayı gerekli' });
        }
        const courier = await prisma_1.prisma.courier.findUnique({ where: { userId } });
        if (!courier) {
            return res.status(404).json({ success: false, message: 'Kurye profili bulunamadı' });
        }
        if (!courier.documentsSubmitted) {
            return res.status(400).json({ success: false, message: 'Önce belgelerinizi yüklemelisiniz' });
        }
        await prisma_1.prisma.courier.update({
            where: { userId },
            data: {
                contractSigned: true,
                contractSignedAt: new Date(),
            },
        });
        return res.json({ success: true, message: 'Sözleşme imzalandı' });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
// ================================
// ADMİN — BELGELERİ GÖRÜNTÜLE
// ================================
async function getAdminCourierDocuments(req, res) {
    try {
        const { courierId } = req.params;
        const courier = await prisma_1.prisma.courier.findUnique({
            where: { id: courierId },
            include: {
                user: { select: { fullName: true, email: true, phone: true } },
            },
        });
        if (!courier) {
            return res.status(404).json({ success: false, message: 'Kurye bulunamadı' });
        }
        return res.json({ success: true, data: courier });
    }
    catch {
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
}
