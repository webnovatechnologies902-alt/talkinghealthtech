import api from './api'

export async function listNewsletterSubscribers(query = '', signal) {
  const params = new URLSearchParams(query)
  const response = await api.get('/admin/newsletter-subscribers', {
    params: { page: params.get('page') ?? 1, limit: 20 },
    signal,
  })
  return { items: response.data.data ?? [], pagination: response.data.pagination }
}

export async function listContactMessages(query = '', signal) {
  const params = new URLSearchParams(query)
  const response = await api.get('/admin/contact-messages', {
    params: { page: params.get('page') ?? 1, limit: 20 },
    signal,
  })
  return { items: response.data.data ?? [], pagination: response.data.pagination }
}

export async function sendNewsletterCampaign(payload) {
  const response = await api.post('/admin/newsletter-campaign', payload, { timeout: 0 })
  return response.data
}
