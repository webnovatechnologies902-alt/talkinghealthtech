import Joi from 'joi'

const objectId = Joi.string().hex().length(24)
const optionalUrl = Joi.string().uri({ scheme: ['https'] }).max(2048).allow('')
const articleFields = {
  title: Joi.string().trim().min(5).max(180),
  slug: Joi.string().trim().lowercase().pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(200),
  excerpt: Joi.string().trim().min(10).max(500),
  content: Joi.string().min(20),
  featuredImage: optionalUrl,
  category: objectId,
  tags: Joi.array().items(Joi.string().trim().min(1).max(40)).max(20),
  status: Joi.string().valid('draft', 'published'),
  publishedAt: Joi.date().iso().allow(null),
  seoTitle: Joi.string().trim().max(180).allow(''),
  seoDescription: Joi.string().trim().max(320).allow(''),
}

export const createArticleSchema = Joi.object({
  ...articleFields,
  title: articleFields.title.required(),
  excerpt: articleFields.excerpt.required(),
  content: articleFields.content.required(),
  category: articleFields.category.required(),
}).min(1)

export const updateArticleSchema = Joi.object(articleFields).min(1)
