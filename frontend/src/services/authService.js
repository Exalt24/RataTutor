import axios from 'axios'
import { AUTH_URL } from '../config'

// —————— Token Helpers ——————
export function saveTokens({ access, refresh }) {
  localStorage.setItem('access_token', access)
  localStorage.setItem('refresh_token', refresh)
}

export function clearTokens() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

export function isLoggedIn() {
  return Boolean(localStorage.getItem('access_token'))
}

export async function login({ username, password }) {
  const res = await axios.post(
    `${AUTH_URL}login/`,
    { username, password }
  )
  saveTokens(res.data)
  return res.data
}

export async function register({ username, email, password }) {
  const res = await axios.post(
    `${AUTH_URL}register/`,
    { username, email, password }
  )
  return res.data
}

export async function logout() {
  const refresh = localStorage.getItem('refresh_token')
  const access  = localStorage.getItem('access_token')
  try {
    await axios.post(
      `${AUTH_URL}logout/`,
      { refresh },
      {
        headers: {
          Authorization: `Bearer ${access}`,
          'Content-Type': 'application/json',
        }
      }
    )
  } catch {
    // ignore
  } finally {
    clearTokens()
  }
}

export async function refreshToken() {
  const refresh = localStorage.getItem('refresh_token')
  if (!refresh) throw new Error('No refresh token available')
  const res = await axios.post(
    `${AUTH_URL}refresh/`,
    { refresh }
  )
  saveTokens(res.data)
  return res.data.access
}
