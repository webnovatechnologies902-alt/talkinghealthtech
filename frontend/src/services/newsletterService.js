import api from './api'

export async function subscribeToNewsletter(email) {
  const response = await api.post('/newsletter/subscribe', { email })
  return response.data
}

export async function unsubscribeFromNewsletter(token) {
  const response = await api.post('/newsletter/unsubscribe', { token })
  return response.data
}
