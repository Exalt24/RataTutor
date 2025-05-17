// src/pages/Register.jsx
import { useEffect, useState } from 'react'
import { register } from '../services/authService'
import '../styles/exam-theme.css'

export default function Register({ onGoLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [animationStage, setAnimationStage] = useState(0)
  const [sending, setSending] = useState(false)
  const [hideForm, setHideForm] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    setAnimationStage(1)
  }, [])

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      })
    } catch (err) {
      const detail = err.response?.data?.detail || 'Registration failed'
      alert(detail)
      return
    }

    setAnimationStage(2)
    setTimeout(() => {
      setAnimationStage(3)
      setSending(true)
      setTimeout(() => {
        setHideForm(true)
        setSuccess(true)
        // after success, slide back to login
        setTimeout(() => onGoLogin(), 300)
      }, 800)
    }, 600)
  }

  return (
    <div className="register-container">
      <div className="register-content-wrapper">
        {!hideForm && (
          <div className={`register-letter ${animationStage >= 2 ? 'sending' : ''}`}>
            <h2 className="letter-title">Join RataTutor</h2>
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

      <div className={`register-success-message ${success ? 'visible' : ''}`}>
        <span className="pixel-accent">Registration successful!</span>
        <span className="handwriting-accent" style={{ marginLeft: '0.5rem' }}>
          Welcome aboard!
        </span>
      </div>
      
      <div
       className="slide-arrow left"
       onClick={e => { e.stopPropagation(); onGoLogin() }}
      >        
      ←
      </div>
    </div>
  )
}
