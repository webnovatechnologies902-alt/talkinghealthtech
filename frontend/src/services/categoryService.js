import api from './api'

export async function listCategories(params = {}, signal) {
  const response = await api.get('/categories', { params, signal })
  return response.data.data ?? []
}
