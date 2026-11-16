import api from './api'

function getUser(response) {
  return response.data.data.user
}

export async function register(credentials) {
  return getUser(await api.post('/auth/register', credentials))
}

export async function login(credentials) {
  return getUser(await api.post('/auth/login', credentials))
}

export async function logout() {
  await api.post('/auth/logout')
}

export async function getCurrentUser(config) {
  const params = { ...config?.params, sessionCheck: Date.now() }
  return getUser(await api.get('/auth/me', { ...config, params }))
}

export async function updateProfile(profile) {
  return getUser(await api.put('/auth/update-profile', profile))
}

export async function changePassword(passwords) {
  return getUser(await api.put('/auth/change-password', passwords))
}
