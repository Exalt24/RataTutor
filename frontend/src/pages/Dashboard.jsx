import { useEffect, useState } from 'react'
import api from '../services/api'
import { logout } from '../services/authService'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [msg, setMsg] = useState('')
  const nav = useNavigate()

  useEffect(() => {
    api.get('ping/')
       .then(r => setMsg(r.data.message))
       .catch(() => setMsg('Error'))
  }, [])

  const doLogout = () => {
    logout()
    nav('/login', { replace: true })
  }

  return (
    <div className="p-8 space-y-4">
      <h1>Dashboard</h1>
      <p>API says: {msg}</p>
      <button onClick={doLogout} className="bg-red-500 text-white px-4 py-2">Logout</button>
    </div>
  )
}
