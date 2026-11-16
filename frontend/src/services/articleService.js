import api from './api'

function queryParams(query) {
  return Object.fromEntries(new URLSearchParams(query))
}

export async function listArticles(query = '', signal) {
  const response = await api.get('/articles', { params: queryParams(query), signal })
  return { items: response.data.data ?? [], pagination: response.data.pagination }
}

export async function getArticle(slug, signal) {
  const response = await api.get(`/articles/${encodeURIComponent(slug)}`, { signal })
  return response.data.data
}
