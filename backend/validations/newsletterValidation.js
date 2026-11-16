import Joi from 'joi'

export const newsletterEmailSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().max(254).required(),
}).unknown(false)

export const unsubscribeTokenSchema = Joi.object({
  token: Joi.string().hex().length(64).required(),
}).unknown(false)

export const newsletterCampaignSchema = Joi.object({
  subject: Joi.string().trim().min(4).max(160).required(),
  content: Joi.string().trim().min(20).max(10000).required(),
}).unknown(false)
