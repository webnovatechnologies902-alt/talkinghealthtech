import api from './api'

export async function sendContactMessage(payload) {
  const response = await api.post('/contact', payload)
  return response.data
}
