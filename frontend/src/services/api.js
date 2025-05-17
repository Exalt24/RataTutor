// src/services/api.js
import axios from 'axios'
import { API_URL, AUTH_URL } from '../config'
import { refreshToken, clearTokens } from './authService'

const api = axios.create({
  baseURL: API_URL,              // e.g. '/api/'
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('access_token')
  if (token) {
    cfg.headers['Authorization'] = `Bearer ${token}`
  }
  return cfg
})

api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const newAccess = await refreshToken()
        original.headers['Authorization'] = `Bearer ${newAccess}`
        return api(original)
      } catch {
        clearTokens()
        window.location.href = AUTH_URL + 'login/'
      }
    }
    return Promise.reject(err)
  }
)

export default api
