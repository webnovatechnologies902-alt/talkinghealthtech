import { listResources } from './contentService.js'

export async function listArticles(config, query, isAdmin = false) {
  return listResources(config, query, isAdmin)
}
