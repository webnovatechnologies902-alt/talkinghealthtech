import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { submitContactMessage } from '../controllers/contactController.js'
import validate from '../middleware/validateMiddleware.js'
import { contactMessageSchema } from '../validations/contactValidation.js'

const router = Router()
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many contact requests; try again later' },
})

router.post('/', contactLimiter, validate(contactMessageSchema), submitContactMessage)

export default router
