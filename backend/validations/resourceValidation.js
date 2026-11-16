import Joi from 'joi'

const secureUrl = Joi.string().uri({ scheme: ['https'] }).max(2048).allow('')
const slug = Joi.string().trim().lowercase().pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(200)
const categoryFields = {
  name: Joi.string().trim().min(2).max(80),
  slug,
  description: Joi.string().trim().max(500).allow(''),
  type: Joi.string().valid('article', 'podcast', 'event', 'glossary'),
  isActive: Joi.boolean(),
}
export const createCategorySchema = Joi.object({
  ...categoryFields,
  name: categoryFields.name.required(),
  type: categoryFields.type.required(),
}).min(1)
export const updateCategorySchema = Joi.object(categoryFields).min(1)

const glossaryFields = {
  term: Joi.string().trim().min(2).max(120),
  slug,
  definition: Joi.string().trim().min(5).max(3000),
  category: Joi.string().hex().length(24).allow(null),
  relatedTerms: Joi.array().items(Joi.string().hex().length(24)).max(50),
}
export const createGlossarySchema = Joi.object({
  ...glossaryFields,
  term: glossaryFields.term.required(),
  definition: glossaryFields.definition.required(),
}).min(1)
export const updateGlossarySchema = Joi.object(glossaryFields).min(1)

const eventFields = {
  title: Joi.string().trim().min(3).max(180),
  slug,
  description: Joi.string().trim().min(5).max(3000),
  image: secureUrl,
  location: Joi.string().trim().min(2).max(200),
  eventDate: Joi.date().iso(),
  registrationUrl: secureUrl,
  category: Joi.string().hex().length(24).allow(null),
  status: Joi.string().valid('draft', 'published', 'cancelled'),
}
export const createEventSchema = Joi.object({
  ...eventFields,
  title: eventFields.title.required(),
  description: eventFields.description.required(),
  location: eventFields.location.required(),
  eventDate: eventFields.eventDate.required(),
}).min(1)
export const updateEventSchema = Joi.object(eventFields).min(1)

const companyFields = {
  name: Joi.string().trim().min(2).max(120),
  slug,
  description: Joi.string().trim().min(10).max(3000),
  logo: secureUrl,
  website: secureUrl,
  sector: Joi.string().trim().max(120).allow(''),
  location: Joi.string().trim().max(200).allow(''),
  tags: Joi.array().items(Joi.string().trim().min(1).max(40)).max(30),
  status: Joi.string().valid('draft', 'published'),
  publishedAt: Joi.date().iso().allow(null),
}
export const createCompanySchema = Joi.object({
  ...companyFields,
  name: companyFields.name.required(),
  description: companyFields.description.required(),
}).min(1)
export const updateCompanySchema = Joi.object(companyFields).min(1)

const jobFields = {
  title: Joi.string().trim().min(3).max(180),
  slug,
  company: Joi.string().hex().length(24),
  description: Joi.string().trim().min(20).max(6000),
  location: Joi.string().trim().min(2).max(200),
  employmentType: Joi.string().valid('full-time', 'part-time', 'contract', 'casual', 'internship'),
  workplaceType: Joi.string().valid('onsite', 'hybrid', 'remote'),
  salaryRange: Joi.string().trim().max(120).allow(''),
  applicationUrl: Joi.string().uri({ scheme: ['https'] }).max(2048),
  closingDate: Joi.date().iso().allow(null),
  status: Joi.string().valid('draft', 'published'),
  publishedAt: Joi.date().iso().allow(null),
}
export const createJobSchema = Joi.object({
  ...jobFields,
  title: jobFields.title.required(),
  company: jobFields.company.required(),
  description: jobFields.description.required(),
  location: jobFields.location.required(),
  employmentType: jobFields.employmentType.required(),
  applicationUrl: jobFields.applicationUrl.required(),
}).min(1)
export const updateJobSchema = Joi.object(jobFields).min(1)

export const idParamSchema = Joi.object({ id: Joi.string().hex().length(24).required() })
