import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { subscribe, unsubscribe } from '../controllers/newsletterController.js'
import validate from '../middleware/validateMiddleware.js'
import { newsletterEmailSchema, unsubscribeTokenSchema } from '../validations/newsletterValidation.js'

const router = Router()
const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many newsletter requests; try again later' },
})

router.post('/subscribe', newsletterLimiter, validate(newsletterEmailSchema), subscribe)
router.post('/unsubscribe', newsletterLimiter, validate(unsubscribeTokenSchema), unsubscribe)

export default router
