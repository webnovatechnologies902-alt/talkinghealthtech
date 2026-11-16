import mongoose from 'mongoose'
import Category from '../models/Category.js'
import Company from '../models/Company.js'
import ApiError from '../utils/ApiError.js'

function getSort(sort, config) {
  const sorts = {
    latest: config.latestSort ?? { publishedAt: -1, createdAt: -1 },
    oldest: config.oldestSort ?? { publishedAt: 1, createdAt: 1 },
    title_asc: { [config.titleField]: 1 },
    title_desc: { [config.titleField]: -1 },
    popular: { views: -1, publishedAt: -1 },
    event_soonest: { eventDate: 1 },
  }
  return sorts[sort] ?? sorts.latest
}

async function buildFilters(config, query, isAdmin) {
  const filter = isAdmin ? {} : { ...(config.publicFilter ?? {}) }
  if (isAdmin && query.status && config.statusField) filter[config.statusField] = query.status

  if (config.categoryField && query.category) {
    const category = await Category.findOne({
      slug: query.category,
      ...(config.categoryType ? { type: config.categoryType } : {}),
      ...(isAdmin ? {} : { isActive: true }),
    }).select('_id').lean()
    if (!category) return null
    filter[config.categoryField] = category._id
  }
  if (config.companyField && query.company) filter[config.companyField] = query.company
  if (config.typeField && query.type) filter[config.typeField] = query.type
  if (config.upcomingOnly && !isAdmin) filter.eventDate = { $gte: new Date() }
  if (config.activeUntilField && !isAdmin) {
    filter.$or = [
      { [config.activeUntilField]: null },
      { [config.activeUntilField]: { $gte: new Date() } },
    ]
  }
  if (query.search) filter.$text = { $search: query.search }
  return filter
}

async function validateReferences(config, data, resourceId) {
  if (config.categoryField && data[config.categoryField] != null) {
    const categoryExists = await Category.exists({
      _id: data[config.categoryField],
      ...(config.categoryType ? { type: config.categoryType } : {}),
    })
    if (!categoryExists) throw new ApiError(400, 'The selected category is invalid')
  }

  if (config.companyField && data[config.companyField] != null) {
    const companyExists = await Company.exists({ _id: data[config.companyField] })
    if (!companyExists) throw new ApiError(400, 'The selected company is invalid')
  }

  if (config.relatedTermsField && data[config.relatedTermsField]) {
    const termIds = data[config.relatedTermsField]
    const relatedTermsModel = config.relatedTermsModel ?? config.Model
    if (relatedTermsModel === config.Model && resourceId && termIds.some((termId) => termId.toString() === resourceId.toString())) {
      throw new ApiError(400, 'A glossary term cannot reference itself')
    }
    const existingTerms = await relatedTermsModel.countDocuments({ _id: { $in: termIds } })
    if (existingTerms !== new Set(termIds.map(String)).size) {
      throw new ApiError(400, 'One or more related glossary terms are invalid')
    }
  }
}

export async function listResources(config, query, isAdmin = false) {
  const page = query.page
  const limit = query.limit
  const filter = await buildFilters(config, query, isAdmin)
  if (filter === null) return { documents: [], pagination: { page, limit, total: 0, totalPages: 0 } }

  const skip = (page - 1) * limit
  const sort = getSort(query.sort, config)
  let find = config.Model.find(filter)
  if (config.listSelect) find = find.select(config.listSelect)
  if (config.populate) find = find.populate(config.populate)
  if (query.search) find = find.select({ score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' }, ...sort })
  else find = find.sort(sort)
  const [documents, total] = await Promise.all([
    find.skip(skip).limit(limit).lean(),
    config.Model.countDocuments(filter),
  ])
  return {
    documents,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

export async function getResource(config, identifier, isAdmin = false) {
  const filter = mongoose.isValidObjectId(identifier)
    ? { _id: identifier }
    : { slug: identifier }
  if (!isAdmin && config.publicFilter) Object.assign(filter, config.publicFilter)
  if (config.populate) {
    const resource = await config.Model.findOne(filter).populate(config.populate)
    if (!resource) throw new ApiError(404, `${config.singular} not found`)
    return resource
  }
  const resource = await config.Model.findOne(filter)
  if (!resource) throw new ApiError(404, `${config.singular} not found`)
  return resource
}

export async function createResource(config, data, user) {
  const payload = { ...data }
  await validateReferences(config, payload)
  if (config.authorField) payload[config.authorField] = user._id
  if (config.slugField && !payload[config.slugField]) {
    payload[config.slugField] = config.slugify(payload[config.titleField])
  }
  if (config.statusField && payload[config.statusField] === 'published' && !payload.publishedAt) {
    payload.publishedAt = new Date()
  }
  return config.Model.create(payload)
}

export async function updateResource(config, id, changes) {
  const update = { ...changes }
  await validateReferences(config, update, id)
  if (config.slugField && update[config.titleField] && !update[config.slugField]) {
    update[config.slugField] = config.slugify(update[config.titleField])
  }
  if (config.statusField && update[config.statusField] === 'published' && !update.publishedAt) {
    update.publishedAt = new Date()
  }
  const resource = await config.Model.findByIdAndUpdate(id, { $set: update }, {
    new: true,
    runValidators: true,
  }).populate(config.populate ?? [])
  if (!resource) throw new ApiError(404, `${config.singular} not found`)
  return resource
}

export async function deleteResource(config, id) {
  const resource = await config.Model.findByIdAndDelete(id)
  if (!resource) throw new ApiError(404, `${config.singular} not found`)
  return resource
}
