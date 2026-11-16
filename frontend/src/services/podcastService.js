import api from './api'

function queryParams(query) {
  return Object.fromEntries(new URLSearchParams(query))
}

export async function listPodcasts(query = '', signal) {
  const response = await api.get('/podcasts', { params: queryParams(query), signal })
  return { items: response.data.data ?? [], pagination: response.data.pagination }
}

export async function getPodcast(slug, signal) {
  const response = await api.get(`/podcasts/${encodeURIComponent(slug)}`, { signal })
  return response.data.data
}
