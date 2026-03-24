import { Router } from 'express'
import { getSavedAddresses, createSavedAddress, deleteSavedAddress } from '../controllers/address.controller'
import { authenticate } from '../middleware/auth'

const router = Router()

router.use(authenticate)
router.get('/', getSavedAddresses)
router.post('/', createSavedAddress)
router.delete('/:id', deleteSavedAddress)

export default router
