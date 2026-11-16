import Joi from 'joi'

const podcastFields = {
  title: Joi.string().trim().min(3).max(180),
  slug: Joi.string().trim().lowercase().pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(200),
  description: Joi.string().trim().min(5).max(2000),
  thumbnail: Joi.string().uri({ scheme: ['https'] }).max(2048).allow(''),
  audioUrl: Joi.string().uri({ scheme: ['https'] }).max(2048).allow(''),
  videoUrl: Joi.string().uri({ scheme: ['https'] }).max(2048).allow(''),
  host: Joi.string().trim().min(2).max(120),
  guests: Joi.array().items(Joi.string().trim().min(1).max(120)).max(30),
  category: Joi.string().hex().length(24).allow(null),
  company: Joi.string().hex().length(24).allow(null),
  relatedTerms: Joi.array().items(Joi.string().hex().length(24)).max(50),
  duration: Joi.number().integer().min(0).max(10000),
  status: Joi.string().valid('draft', 'published'),
  publishedAt: Joi.date().iso().allow(null),
}

export const createPodcastSchema = Joi.object({
  ...podcastFields,
  title: podcastFields.title.required(),
  description: podcastFields.description.required(),
  host: podcastFields.host.required(),
}).min(1)

export const updatePodcastSchema = Joi.object(podcastFields).min(1)
