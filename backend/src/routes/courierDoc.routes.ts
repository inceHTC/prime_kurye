import { Router } from 'express'
import {
  upload,
  uploadCourierDocuments,
  getCourierDocuments,
  signContract,
  getAdminCourierDocuments,
} from '../controllers/courierDoc.controller'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

// Kurye belge yükleme
router.post(
  '/upload',
  authenticate,
  authorize('COURIER'),
  upload.fields([
    { name: 'identityDoc', maxCount: 1 },    // Kimlik
    { name: 'licenseDoc', maxCount: 1 },     // Ehliyet
    { name: 'vehicleDoc', maxCount: 1 },     // Araç ruhsatı
    { name: 'criminalRecord', maxCount: 1 }, // Sabıka kaydı
  ]),
  uploadCourierDocuments
)

// Kurye belgelerini getir
router.get('/my', authenticate, authorize('COURIER'), getCourierDocuments)

// Sözleşme imzala
router.post('/sign-contract', authenticate, authorize('COURIER'), signContract)

// Admin — kurye belgelerini görüntüle
router.get('/admin/:courierId', authenticate, authorize('ADMIN'), getAdminCourierDocuments)

export default router