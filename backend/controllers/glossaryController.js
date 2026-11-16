import Glossary from '../models/Glossary.js'
import slugify from '../utils/slugify.js'
import { createResourceController } from './resourceController.js'

export default createResourceController({
  Model: Glossary,
  singular: 'Glossary term',
  plural: 'Glossary terms',
  titleField: 'term',
  slugField: 'slug',
  slugify,
  categoryField: 'category',
  categoryType: 'glossary',
  relatedTermsField: 'relatedTerms',
  listSelect: '-relatedTerms',
  populate: [{ path: 'category', select: 'name slug' }],
})
