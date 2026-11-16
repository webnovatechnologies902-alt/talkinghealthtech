import { Router } from 'express'
import { listContactMessages, listNewsletterSubscribers } from '../controllers/adminController.js'
import { protect } from '../middleware/authMiddleware.js'
import requireAdmin from '../middleware/adminMiddleware.js'
import validate from '../middleware/validateMiddleware.js'
import Joi from 'joi'
import { sendCampaign } from '../controllers/newsletterController.js'
import { newsletterCampaignSchema } from '../validations/newsletterValidation.js'
import rateLimit from 'express-rate-limit'

const router = Router()
const subscriberQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).max(10_000).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  subscribed: Joi.boolean(),
}).unknown(false)

router.get('/newsletter-subscribers', protect, requireAdmin, validate(subscriberQuerySchema, 'query'), listNewsletterSubscribers)
router.get('/contact-messages', protect, requireAdmin, validate(subscriberQuerySchema, 'query'), listContactMessages)
router.post('/newsletter-campaign', protect, requireAdmin, rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 1,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'A newsletter campaign was already sent recently; try again later' },
}), validate(newsletterCampaignSchema), sendCampaign)

export default router
