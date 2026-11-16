import { Router } from 'express'
import { updateProfile } from '../controllers/userController.js'
import { protect } from '../middleware/authMiddleware.js'
import validate from '../middleware/validateMiddleware.js'
import { updateProfileSchema } from '../validations/authValidation.js'

const router = Router()
router.put('/profile', protect, validate(updateProfileSchema), updateProfile)

export default router
