import Article from '../models/Article.js'
import { listArticles } from '../services/articleService.js'
import slugify from '../utils/slugify.js'
import { createResourceController } from './resourceController.js'

const config = {
  Model: Article,
  singular: 'Article',
  plural: 'Articles',
  titleField: 'title',
  slugField: 'slug',
  slugify,
  authorField: 'author',
  statusField: 'status',
  categoryField: 'category',
  categoryType: 'article',
  publicFilter: { status: 'published' },
  listSelect: '-content',
  populate: [
    { path: 'author', select: 'name profileImage' },
    { path: 'category', select: 'name slug' },
  ],
}

export default createResourceController({
  ...config,
  listService: (query, isAdmin) => listArticles(config, query, isAdmin),
})
