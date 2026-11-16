import api from './api'

const resourcePaths = {
  articles: '/articles',
  podcasts: '/podcasts',
  events: '/events',
  glossary: '/glossary',
  categories: '/categories',
  companies: '/companies',
  jobs: '/jobs',
}

export async function listAdminContent(type, query = {}, signal) {
  const path = resourcePaths[type]
  if (!path) throw new Error('Unsupported content type.')

  const response = await api.get(path, { params: query, signal })
  return { items: response.data.data ?? [], pagination: response.data.pagination }
}

export async function createAdminContent(type, payload) {
  const path = resourcePaths[type]
  if (!path) throw new Error('Unsupported content type.')

  const response = await api.post(path, payload)
  return response.data.data
}

export async function updateAdminContent(type, id, payload) {
  const path = resourcePaths[type]
  if (!path) throw new Error('Unsupported content type.')

  const response = await api.put(`${path}/${encodeURIComponent(id)}`, payload)
  return response.data.data
}

export async function deleteAdminContent(type, id) {
  const path = resourcePaths[type]
  if (!path) throw new Error('Unsupported content type.')

  await api.delete(`${path}/${encodeURIComponent(id)}`)
}
