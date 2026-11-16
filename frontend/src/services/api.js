import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 15000,
  withCredentials: true,
  headers: { Accept: 'application/json' },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message
    if (message) error.message = message

    const endpoint = error.config?.url ?? ''
    const isSessionLookup = /\/auth\/(login|register|me)(?:\?|$)/.test(endpoint)
    if (error.response?.status === 401 && !isSessionLookup && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:session-expired'))
    }

    return Promise.reject(error)
  },
)

export default api
