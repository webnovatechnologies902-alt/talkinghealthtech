import api from './api'

function queryParams(query) {
  return Object.fromEntries(new URLSearchParams(query))
}

export async function listJobs(query = '', signal) {
  const response = await api.get('/jobs', { params: queryParams(query), signal })
  return { items: response.data.data ?? [], pagination: response.data.pagination }
}

export async function getJob(slug, signal) {
  const response = await api.get(`/jobs/${encodeURIComponent(slug)}`, { signal })
  return response.data.data
}
