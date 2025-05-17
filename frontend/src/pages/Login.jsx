// src/pages/Login.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/authService'
import '../styles/login.css'

export default function Login({ isActive, onGoRegister }) {
  const [creds, setCreds] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState({})
  const [isOpen, setIsOpen] = useState(false)
  const [isPulledOut, setIsPulledOut] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const nav = useNavigate()

  useEffect(() => {
    if (isActive) {
      setCreds({ username: '', password: '' })
      setErrors({})
      setIsOpen(false)
      setIsPulledOut(false)
      setShowPassword(false)
    }
  }, [isActive])

  const submit = async e => {
    e.preventDefault()
    setErrors({})
    try {
      await login(creds)
      nav('/dashboard', { replace: true })
    } catch (err) {
      const data = err.response?.data
      if (data) setErrors(data)
      else alert('Invalid credentials')
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
        className={`envelope ${isOpen ? 'open' : ''} ${isPulledOut ? 'form-pulled' : ''}`}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => { if (!isPulledOut) setIsOpen(false) }}
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
            <div className="letter" onClick={e => e.stopPropagation()}>
              <h2 className="letter-title">Welcome Back!</h2>
              <div className="letter-content">
                {errors.non_field_errors?.map((msg, i) => (
                  <p key={i} className="errors-form-all">{msg}</p>
                ))}
                <form onSubmit={submit} className="login-form">
                  <div className="form-group">
                    <label className="handwriting-accent">Username</label>
                    <input
                      type="text"
                      value={creds.username}
                      onChange={e => setCreds({ ...creds, username: e.target.value })}
                      className="form-input"
                      placeholder="Enter your username"
                      required
                    />
                    {errors.username?.map((msg, i) => (
                      <p key={i} className="errors-form-per-field">{msg}</p>
                    ))}
                  </div>
                  <div className="form-group">
                    <label className="handwriting-accent">Password</label>
                    <div className="input-with-icon">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={creds.password}
                        onChange={e => setCreds({ ...creds, password: e.target.value })}
                        className="form-input"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        className="toggle-btn"
                        onClick={() => setShowPassword(v => !v)}
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.password?.map((msg, i) => (
                      <p key={i} className="errors-form-per-field">{msg}</p>
                    ))}
                  </div>
                  <button type="submit" className="exam-button" data-hover="Start Cooking!">
                    Sign In
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
        <div
          className="envelope-side left"
        ></div>
        <div
          className="envelope-side right"
        ></div>
        <div
          className="envelope-front"
        ></div>
        <div
          className="envelope-flap"
        ></div>
      </div>
      <div className="slide-arrow" onClick={e => { e.stopPropagation(); onGoRegister() }}>
        →
      </div>
    </div>
  )
}
