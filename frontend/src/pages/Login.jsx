import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/authService'
import '../styles/exam-theme.css'

export default function Login({ onGoRegister }) {
  const [creds, setCreds] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState({})              // ← holds field & global errors
  const [isOpen, setIsOpen] = useState(false)
  const [isPulledOut, setIsPulledOut] = useState(false)
  const nav = useNavigate()

  const submit = async e => {
    e.preventDefault()
    setErrors({})                                        // clear old errors
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
                {/* non-field errors */}
                {errors.non_field_errors?.map((msg, i) => (
                  <p key={i} className="text-red-500 text-center">{msg}</p>
                ))}

                <form onSubmit={submit} className="login-form">
                  {/* Username */}
                  <div className="form-group">
                    <label className="handwriting-accent">Username</label>
                    <input
                      type="text"
                      value={creds.username}
                      onChange={e => setCreds({ ...creds, username: e.target.value })}
                      className="form-input"
                      required
                    />
                    {errors.username?.map((msg, i) => (
                      <p key={i} className="text-red-500 text-sm">{msg}</p>
                    ))}
                  </div>

                  {/* Password */}
                  <div className="form-group">
                    <label className="handwriting-accent">Password</label>
                    <input
                      type="password"
                      value={creds.password}
                      onChange={e => setCreds({ ...creds, password: e.target.value })}
                      className="form-input"
                      required
                    />
                    {errors.password?.map((msg, i) => (
                      <p key={i} className="text-red-500 text-sm">{msg}</p>
                    ))}
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
      <div className="slide-arrow" onClick={e => { e.stopPropagation(); onGoRegister() }}>
        →
      </div>
    </div>
  )
}
