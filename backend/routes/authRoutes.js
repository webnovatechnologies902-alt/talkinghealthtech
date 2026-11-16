import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import {
  changePassword,
  login,
  logout,
  me,
  register,
} from '../controllers/authController.js'
import { updateProfile } from '../controllers/userController.js'
import { protect } from '../middleware/authMiddleware.js'
import validate from '../middleware/validateMiddleware.js'
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from '../validations/authValidation.js'

const router = Router()
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts; try again later' },
})

router.post('/register', authLimiter, validate(registerSchema), register)
router.post('/login', authLimiter, validate(loginSchema), login)
router.post('/logout', protect, logout)
router.get('/me', protect, me)
router.put('/update-profile', protect, validate(updateProfileSchema), updateProfile)
router.put('/change-password', protect, validate(changePasswordSchema), changePassword)

export default router
