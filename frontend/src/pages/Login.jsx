import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/authService'

export default function Login() {
  const [creds, setCreds] = useState({ username: '', password: '' })
  const nav = useNavigate()

  const submit = async e => {
    e.preventDefault()
    try {
      await login(creds)
      nav('/dashboard', { replace: true })
    } catch {
      alert('Invalid credentials')
    }
  }

  return (
    <form onSubmit={submit} className="p-8 space-y-4">
      <input
        type="text"
        placeholder="Username"
        value={creds.username}
        onChange={e => setCreds({ ...creds, username: e.target.value })}
        className="border p-2 w-full"
      />
      <input
        type="password"
        placeholder="Password"
        value={creds.password}
        onChange={e => setCreds({ ...creds, password: e.target.value })}
        className="border p-2 w-full"
      />
      <button type="submit" className="bg-purple-600 text-white px-4 py-2">Log In</button>
    </form>
  )
}
