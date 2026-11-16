import Event from '../models/Event.js'
import slugify from '../utils/slugify.js'
import { createResourceController } from './resourceController.js'

export default createResourceController({
  Model: Event,
  singular: 'Event',
  plural: 'Events',
  titleField: 'title',
  slugField: 'slug',
  slugify,
  statusField: 'status',
  categoryField: 'category',
  categoryType: 'event',
  publicFilter: { status: 'published' },
  upcomingOnly: true,
  latestSort: { eventDate: 1 },
  oldestSort: { eventDate: -1 },
  populate: [{ path: 'category', select: 'name slug' }],
})
