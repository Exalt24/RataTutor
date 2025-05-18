import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Login from '../pages/Login'
import Register from '../pages/Register'
import '../styles/components/auth-switcher.css'

export default function AuthSwitcher() {
  const location = useLocation()
  const navigate = useNavigate()

  const initial = location.pathname === '/register' ? 1 : 0
  const [page, setPage] = useState(initial)

  useEffect(() => {
    navigate(page === 0 ? '/login' : '/register', { replace: true })
  }, [page, navigate])

  return (
    <div className="exam-container">
      <div
        className="horizontal-scroll"
        style={{ transform: `translateX(-${page * 100}vw)` }}
      >
        <section className="section bg-color-1">
          <Login
            isActive={page === 0}
            onGoRegister={() => setPage(1)}
          />
        </section>
        <section className="section bg-color-2">
          <Register
            isActive={page === 1}
            onGoLogin={() => setPage(0)}
          />
        </section>
      </div>
    </div>
  )
}
