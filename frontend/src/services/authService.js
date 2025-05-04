import api from './api'
const REFRESH_ENDPOINT = 'refresh/'

export function saveTokens({ access, refresh }) {
  localStorage.setItem('access_token', access)
  localStorage.setItem('refresh_token', refresh)
}

export function clearTokens() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

export async function login({ username, password }) {
  const res = await api.post('login/', { username, password })
  saveTokens(res.data)
  return res.data
}

export async function logout() {
  try {
    const refresh = localStorage.getItem('refresh_token')
    await api.post('logout/', { refresh })
  } catch (e) {
    // ignore
  } finally {
    clearTokens()
  }
}

export async function refreshToken() {
  const refresh = localStorage.getItem('refresh_token')
  if (!refresh) throw new Error('No refresh token')
  const res = await api.post(REFRESH_ENDPOINT, { refresh })
  saveTokens(res.data)
  return res.data.access
}

export function isLoggedIn() {
    return !!localStorage.getItem('access_token')
}
