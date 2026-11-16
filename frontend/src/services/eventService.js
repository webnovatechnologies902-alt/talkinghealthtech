import api from './api'

function queryParams(query) {
  return Object.fromEntries(new URLSearchParams(query))
}

export async function listEvents(query = '', signal) {
  const response = await api.get('/events', { params: queryParams(query), signal })
  return { items: response.data.data ?? [], pagination: response.data.pagination }
}

export async function getEvent(slug, signal) {
  const response = await api.get(`/events/${encodeURIComponent(slug)}`, { signal })
  return response.data.data
}
