import api from './api'

function queryParams(query) {
  return Object.fromEntries(new URLSearchParams(query))
}

export async function listGlossaryTerms(query = '', signal) {
  const response = await api.get('/glossary', { params: queryParams(query), signal })
  return { items: response.data.data ?? [], pagination: response.data.pagination }
}

export async function getGlossaryTerm(slug, signal) {
  const response = await api.get(`/glossary/${encodeURIComponent(slug)}`, { signal })
  return response.data.data
}
