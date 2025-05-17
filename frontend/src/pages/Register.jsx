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

  useEffect(() => {
    if (isActive) {
      setFormData({ username: '', email: '', password: '', confirmPassword: '' })
      setErrors({})
      setAnimationStage(1)
      setSending(false)
      setHideForm(false)
      setSuccess(false)
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
        setTimeout(() => handleGoLogin(), 2000)
      }, 2500)
    }, 2000)
  }

  return (
    <>
      <div className="register-container">
        <div className="register-content-wrapper">
          {!hideForm && (
            <div className={`register-letter ${animationStage >= 2 ? 'sending' : ''}`}>
              <h2 className="letter-title">Join RataTutor</h2>
              {errors.non_field_errors?.map((msg, i) => (
                <p key={i} className="text-red-500 text-center">{msg}</p>
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
                    required
                  />
                  {errors.username?.map((msg, i) => (
                    <p key={i} className="text-red-500 text-sm">{msg}</p>
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
                    required
                  />
                  {errors.email?.map((msg, i) => (
                    <p key={i} className="text-red-500 text-sm">{msg}</p>
                  ))}
                </div>
                <div className="form-group">
                  <label className="handwriting-accent">Password</label>
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                  {errors.password?.map((msg, i) => (
                    <p key={i} className="text-red-500 text-sm">{msg}</p>
                  ))}
                </div>
                <div className="form-group">
                  <label className="handwriting-accent">Confirm Password</label>
                  <input
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                  {errors.confirm_password?.map((msg, i) => (
                    <p key={i} className="text-red-500 text-sm">{msg}</p>
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
        <div
          className="slide-arrow left"
          onClick={e => { e.stopPropagation(); handleGoLogin() }}
        >
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
