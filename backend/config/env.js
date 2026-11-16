import dotenv from 'dotenv'
import Joi from 'joi'

dotenv.config()

const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().port().default(5000),
  MONGO_URI: Joi.string().uri({ scheme: ['mongodb', 'mongodb+srv'] }).required(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().pattern(/^\d+[smhd]$/).default('1d'),
  FRONTEND_URL: Joi.string().uri({ scheme: ['http', 'https'] }).required(),
  TRUST_PROXY: Joi.alternatives().try(
    Joi.number().integer().min(0).max(10),
    Joi.string().valid('false', 'loopback', 'linklocal', 'uniquelocal'),
  ).default('false'),
  COOKIE_SECURE: Joi.boolean().truthy('true').falsy('false').default(false),
  COOKIE_SAME_SITE: Joi.string().valid('strict', 'lax', 'none').default('lax'),
  ADMIN_NAME: Joi.string().min(2).max(100).optional(),
  ADMIN_EMAIL: Joi.string().email().lowercase().optional(),
  ADMIN_PASSWORD: Joi.string().min(12).max(128).optional(),
  CLOUDINARY_CLOUD_NAME: Joi.string().allow('').optional(),
  CLOUDINARY_API_KEY: Joi.string().allow('').optional(),
  CLOUDINARY_API_SECRET: Joi.string().allow('').optional(),
  SMTP_HOST: Joi.string().trim().allow('').default(''),
  SMTP_PORT: Joi.number().port().default(587),
  SMTP_SECURE: Joi.boolean().truthy('true').falsy('false').default(false),
  SMTP_USER: Joi.string().allow('').default(''),
  SMTP_PASSWORD: Joi.string().allow('').default(''),
  SMTP_FROM_EMAIL: Joi.string().email().allow('').default(''),
  CONTACT_EMAIL: Joi.string().email().allow('').default(''),
}).unknown(true)

const { value, error } = schema.validate(process.env, { abortEarly: false, convert: true })
if (error) {
  const issues = error.details.map(({ message }) => message).join('; ')
  throw new Error(`Invalid environment configuration: ${issues}`)
}

if (value.COOKIE_SAME_SITE === 'none' && !value.COOKIE_SECURE) {
  throw new Error('COOKIE_SECURE must be true when COOKIE_SAME_SITE=none')
}
if (value.NODE_ENV === 'production' && !value.COOKIE_SECURE) {
  throw new Error('COOKIE_SECURE must be true in production')
}

const cloudinaryValues = [
  value.CLOUDINARY_CLOUD_NAME,
  value.CLOUDINARY_API_KEY,
  value.CLOUDINARY_API_SECRET,
]
if (cloudinaryValues.some(Boolean) && !cloudinaryValues.every(Boolean)) {
  throw new Error('Configure all three Cloudinary values or leave all three empty')
}
if (Boolean(value.SMTP_HOST) !== Boolean(value.SMTP_FROM_EMAIL)) {
  throw new Error('Configure both SMTP_HOST and SMTP_FROM_EMAIL, or leave both empty')
}
if (Boolean(value.SMTP_USER) !== Boolean(value.SMTP_PASSWORD)) {
  throw new Error('Configure both SMTP_USER and SMTP_PASSWORD, or leave both empty')
}

export const env = Object.freeze({
  nodeEnv: value.NODE_ENV,
  port: value.PORT,
  mongoUri: value.MONGO_URI,
  jwtSecret: value.JWT_SECRET,
  jwtExpiresIn: value.JWT_EXPIRES_IN,
  frontendUrl: new URL(value.FRONTEND_URL).origin,
  trustProxy: value.TRUST_PROXY === 'false' ? false : value.TRUST_PROXY,
  cookieSecure: value.COOKIE_SECURE,
  cookieSameSite: value.COOKIE_SAME_SITE,
  adminName: value.ADMIN_NAME,
  adminEmail: value.ADMIN_EMAIL,
  adminPassword: value.ADMIN_PASSWORD,
  cloudinaryCloudName: value.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: value.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: value.CLOUDINARY_API_SECRET,
  smtpHost: value.SMTP_HOST,
  smtpPort: value.SMTP_PORT,
  smtpSecure: value.SMTP_SECURE,
  smtpUser: value.SMTP_USER,
  smtpPassword: value.SMTP_PASSWORD,
  smtpFromEmail: value.SMTP_FROM_EMAIL,
  contactEmail: value.CONTACT_EMAIL,
  smtpConfigured: Boolean(value.SMTP_HOST && value.SMTP_FROM_EMAIL),
})
