import api from './api'

function queryParams(query) {
  return Object.fromEntries(new URLSearchParams(query))
}

export async function listCompanies(query = '', signal) {
  const response = await api.get('/companies', { params: queryParams(query), signal })
  return { items: response.data.data ?? [], pagination: response.data.pagination }
}

export async function getCompany(slug, signal) {
  const response = await api.get(`/companies/${encodeURIComponent(slug)}`, { signal })
  return response.data.data
}
