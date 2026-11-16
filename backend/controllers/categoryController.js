import Category from '../models/Category.js'
import Article from '../models/Article.js'
import Podcast from '../models/Podcast.js'
import Event from '../models/Event.js'
import Glossary from '../models/Glossary.js'
import ApiError from '../utils/ApiError.js'
import asyncHandler from '../utils/asyncHandler.js'
import slugify from '../utils/slugify.js'
import { createResourceController } from './resourceController.js'

const controller = createResourceController({
  Model: Category,
  singular: 'Category',
  plural: 'Categories',
  titleField: 'name',
  slugField: 'slug',
  slugify,
  typeField: 'type',
  publicFilter: { isActive: true },
  latestSort: { name: 1 },
  oldestSort: { name: 1 },
  listSelect: 'name slug description type isActive',
})

export const list = controller.list
export const get = controller.get
export const create = controller.create
export const update = controller.update
export const remove = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  const [articles, podcasts, events, glossary] = await Promise.all([
    Article.exists({ category: id }),
    Podcast.exists({ category: id }),
    Event.exists({ category: id }),
    Glossary.exists({ category: id }),
  ])
  if (articles || podcasts || events || glossary) throw new ApiError(409, 'Category is in use and cannot be deleted')
  return controller.remove(req, res, next)
})
