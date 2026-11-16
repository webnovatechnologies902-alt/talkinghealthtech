import Joi from 'joi'

const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).max(10_000).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(100).allow(''),
  category: Joi.string().trim().max(100),
  company: Joi.string().hex().length(24),
  type: Joi.string().valid('article', 'podcast', 'event', 'glossary'),
  sort: Joi.string().valid('latest', 'oldest', 'title_asc', 'title_desc', 'popular', 'event_soonest').default('latest'),
  status: Joi.string().valid('draft', 'published', 'cancelled'),
}).unknown(false)

export default listQuerySchema
