// src/pages/Register.jsx
import { useEffect, useState } from 'react'
import { register } from '../services/authService'
import Toast from '../components/Toast'
import '../styles/register.css'

export default function Register({ isActive, onGoLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [animationStage, setAnimationStage] = useState(0)
  const [sending, setSending] = useState(false)
  const [hideForm, setHideForm] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (isActive) {
      setFormData({ username: '', email: '', password: '', confirmPassword: '' })
      setErrors({})
      setAnimationStage(1)
      setSending(false)
      setHideForm(false)
      setSuccess(false)
      setShowPassword(false)
    }
  }, [isActive])

  useEffect(() => {
    setAnimationStage(1)
  }, [])

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleGoLogin = () => {
    setSuccess(false)
    setHideForm(false)
    setAnimationStage(1)
    onGoLogin()
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setErrors({})
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirm_password: ['Passwords do not match.'] })
      return
    }
    try {
      await register({
        username:         formData.username,
        email:            formData.email,
        password:         formData.password,
        confirm_password: formData.confirmPassword,
      })
    } catch (err) {
      setErrors(err.response?.data || {})
      return
    }
    setAnimationStage(2)
    setTimeout(() => {
      setAnimationStage(3)
      setSending(true)
      setTimeout(() => {
        setHideForm(true)
        setSuccess(true)
        setTimeout(() => handleGoLogin(), 1000)
      }, 1500)
    }, 1500)
  }

  return (
    <>
      <div className="register-container">
        <div className="register-content-wrapper">
          {!hideForm && (
            <div className={`register-letter ${animationStage >= 2 ? 'sending' : ''}`}>
              <h2 className="letter-title">Join RataTutor</h2>
              {errors.non_field_errors?.map((msg, i) => (
                <p key={i} className="errors-form-all">{msg}</p>
              ))}
              <form onSubmit={handleSubmit} className="register-form">
                <div className="form-group">
                  <label className="handwriting-accent">Username</label>
                  <input
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Rata123"
                    required
                  />
                  {errors.username?.map((msg, i) => (
                    <p key={i} className="errors-form-per-field">{msg}</p>
                  ))}
                </div>
                <div className="form-group">
                  <label className="handwriting-accent">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. someone@example.com"
                    required
                  />
                  {errors.email?.map((msg, i) => (
                    <p key={i} className="errors-form-per-field">{msg}</p>
                  ))}
                </div>
                <div className="form-group password-toggle">
                  <label className="handwriting-accent">Password</label>
                  <div className="input-with-icon">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="e.g. D@ntTe11"
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
                <div className="form-group">
                  <label className="handwriting-accent">Confirm Password</label>
                  <input
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. D@ntTe11"
                    required
                  />
                  {errors.confirm_password?.map((msg, i) => (
                    <p key={i} className="errors-form-per-field">{msg}</p>
                  ))}
                </div>
                <button type="submit" className="exam-button" data-hover="Join Us!">
                  REGISTER
                </button>
              </form>
            </div>
          )}
          <div className="register-mailbox">
            <div className={`register-mailbox-slot ${animationStage >= 2 ? 'highlight' : ''}`}></div>
            <div className={`register-mailbox-flag ${sending ? 'down' : ''}`}>
              <div className="register-mailbox-flag-head"></div>
            </div>
            {animationStage === 2 && (
              <div className="register-paper-trail">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="register-paper-trail-item" />
                ))}
              </div>
            )}
            {animationStage === 3 && (
              <div className="register-delivery-particles">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="register-delivery-particle" />
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="slide-arrow left" onClick={e => { e.stopPropagation(); handleGoLogin() }}>
          ←
        </div>
      </div>
      <Toast visible={success} variant="success">
        <span className="pixel-accent">Registration successful!</span>
        <span className="handwriting-accent" style={{ marginLeft: '.5rem' }}>
          Welcome aboard!
        </span>
      </Toast>
    </>
  )
}
