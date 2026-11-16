import Job from '../models/Job.js'
import slugify from '../utils/slugify.js'
import { createResourceController } from './resourceController.js'

export default createResourceController({
  Model: Job,
  singular: 'Job',
  plural: 'Jobs',
  titleField: 'title',
  slugField: 'slug',
  slugify,
  statusField: 'status',
  companyField: 'company',
  publicFilter: { status: 'published' },
  activeUntilField: 'closingDate',
  populate: [{ path: 'company', select: 'name slug logo website' }],
})
