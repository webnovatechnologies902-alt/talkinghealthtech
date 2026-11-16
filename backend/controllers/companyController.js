import Company from '../models/Company.js'
import Job from '../models/Job.js'
import Podcast from '../models/Podcast.js'
import ApiError from '../utils/ApiError.js'
import asyncHandler from '../utils/asyncHandler.js'
import slugify from '../utils/slugify.js'
import { createResourceController } from './resourceController.js'

const controller = createResourceController({
  Model: Company,
  singular: 'Company',
  plural: 'Companies',
  titleField: 'name',
  slugField: 'slug',
  slugify,
  statusField: 'status',
  publicFilter: { status: 'published' },
  listSelect: '-__v',
})

const removeCompany = controller.remove
controller.remove = asyncHandler(async (req, res, next) => {
  const [job, podcast] = await Promise.all([
    Job.exists({ company: req.params.id }),
    Podcast.exists({ company: req.params.id }),
  ])
  if (job || podcast) {
    throw new ApiError(409, 'Company is linked to jobs or podcast episodes and cannot be deleted')
  }
  return removeCompany(req, res, next)
})

export default controller
