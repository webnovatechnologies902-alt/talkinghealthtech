import Podcast from '../models/Podcast.js'
import Glossary from '../models/Glossary.js'
import slugify from '../utils/slugify.js'
import { createResourceController } from './resourceController.js'

export default createResourceController({
  Model: Podcast,
  singular: 'Podcast',
  plural: 'Podcasts',
  titleField: 'title',
  slugField: 'slug',
  slugify,
  statusField: 'status',
  categoryField: 'category',
  categoryType: 'podcast',
  companyField: 'company',
  relatedTermsField: 'relatedTerms',
  relatedTermsModel: Glossary,
  publicFilter: { status: 'published' },
  populate: [
    { path: 'category', select: 'name slug' },
    { path: 'company', select: 'name slug logo website' },
    { path: 'relatedTerms', select: 'term slug' },
  ],
})
