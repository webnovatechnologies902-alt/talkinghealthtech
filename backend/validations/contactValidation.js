import Joi from 'joi'

export const contactMessageSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email().lowercase().max(254).required(),
  message: Joi.string().trim().min(10).max(5000).required(),
}).unknown(false)
