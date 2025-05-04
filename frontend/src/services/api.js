import axios from 'axios'
import { API_URL, AUTH_URL } from '../config'
import { refreshToken, clearTokens } from './authService'

const instance = axios.create({
  baseURL: API_URL,           // e.g. '/api/'
  headers: { 'Content-Type': 'application/json' },
})

// attach access token on each request
instance.interceptors.request.use(cfg => {
  const token = localStorage.getItem('access_token')
  if (token) cfg.headers['Authorization'] = `Bearer ${token}`
  return cfg
})

// on 401, try refreshing once, then retry original request
instance.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const newAccess = await refreshToken()
        original.headers['Authorization'] = `Bearer ${newAccess}`
        return instance(original)
      } catch (_e) {
        clearTokens()
        window.location.href = AUTH_URL + 'login/'  // redirect to your login page
      }
    }
    return Promise.reject(err)
  }
)

export default instance
