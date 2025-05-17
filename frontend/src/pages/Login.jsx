import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/authService'
import '../styles/exam-theme.css'

export default function Login({ onGoRegister }) {
  const [creds, setCreds] = useState({ username: '', password: '' })
  const [isOpen, setIsOpen] = useState(false)
  const [isPulledOut, setIsPulledOut] = useState(false)
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

  const handlePaperClick = e => {
    e.stopPropagation()
    if (isOpen && !isPulledOut) setIsPulledOut(true)
  }

  const handleOutsideClick = () => {
    if (isPulledOut) {
      setIsPulledOut(false)
      setIsOpen(false)
    }
  }

  return (
    <div className="login-container" onClick={handleOutsideClick}>
      <div
        className={`envelope ${isOpen ? 'open' : ''} ${
          isPulledOut ? 'form-pulled' : ''
        }`}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => {
          if (!isPulledOut) setIsOpen(false)
        }}
      >
        <div className="envelope-back"></div>
        <div className="envelope-content">
          {!isPulledOut ? (
            <div className="paper-peek" onClick={handlePaperClick}>
              <div className="paper-content">
                <span className="handwriting-accent">Click to open</span>
                <div className="pull-arrow mb-40">↑</div>
              </div>
            </div>
          ) : (
            <div
              className="letter"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="letter-title">Welcome Back!</h2>
              <div className="letter-content">
                <form onSubmit={submit} className="login-form">
                  <div className="form-group">
                    <label className="handwriting-accent">Username</label>
                    <input
                      type="text"
                      value={creds.username}
                      onChange={e =>
                        setCreds({ ...creds, username: e.target.value })
                      }
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="handwriting-accent">Password</label>
                    <input
                      type="password"
                      value={creds.password}
                      onChange={e =>
                        setCreds({ ...creds, password: e.target.value })
                      }
                      className="form-input"
                      required
                    />
                  </div>

                  <button type="submit" className="exam-button">
                    Sign In
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
        <div className="envelope-side left"></div>
        <div className="envelope-side right"></div>
        <div className="envelope-front"></div>
        <div className="envelope-flap"></div>
      </div>

      {/* right arrow to switch to Register */}
      <div
        className="slide-arrow"
        onClick={e => { e.stopPropagation(); onGoRegister() }}
      >
        →
      </div>
    </div>
  )
}
