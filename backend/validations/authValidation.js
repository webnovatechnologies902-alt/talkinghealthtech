import Joi from 'joi'

const email = Joi.string().email().lowercase().trim().max(254)
const password = Joi.string().min(12).max(128)

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: email.required(),
  password: password.required(),
})

export const loginSchema = Joi.object({
  email: email.required(),
  password: Joi.string().min(1).max(128).required(),
})

export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  profileImage: Joi.string().uri({ scheme: ['https'] }).max(2048).allow(''),
}).min(1)

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(1).max(128).required(),
  newPassword: password.invalid(Joi.ref('currentPassword')).required(),
})
