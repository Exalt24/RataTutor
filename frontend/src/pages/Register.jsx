import React, { useEffect, useState } from 'react'
import { register } from '../services/auth'
import Toast from '../components/Toast'
import ValidatedInput from '../components/ValidatedInput'
import { User, Mail, Lock } from 'lucide-react'
import '../styles/register.css'

export default function Register({ isActive, onGoLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [validities, setValidities] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  })
  const [animationStage, setAnimationStage] = useState(0)
  const [sending, setSending] = useState(false)
  const [hideForm, setHideForm] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (isActive) {
      setFormData({ username: '', email: '', password: '', confirmPassword: '' })
      setErrors({})
      setValidities({ username: false, email: false, password: false, confirmPassword: false })
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

  const handleValidityChange = (field, isValid) => {
    setValidities(prev => ({ ...prev, [field]: isValid }))
  }

  const isDisabled =
    Object.values(validities).some(v => !v) ||
    formData.password !== formData.confirmPassword

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
        username: formData.username,
        email: formData.email,
        password: formData.password,
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
                <ValidatedInput
                  label="Username"
                  name="username"
                  icon={User}
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. Rata123"
                  required
                  onValidityChange={handleValidityChange}
                />
                <ValidatedInput
                  label="Email"
                  name="email"
                  icon={Mail}
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. someone@example.com"
                  required
                  onValidityChange={handleValidityChange}
                />
                <ValidatedInput
                  label="Password"
                  name="password"
                  icon={Lock}
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="e.g. D@ntTe11"
                  required
                  onValidityChange={handleValidityChange}
                />
                <ValidatedInput
                  label="Confirm Password"
                  name="confirmPassword"
                  icon={Lock}
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  compareValue={formData.password}
                  onValidityChange={isValid =>
                    handleValidityChange('confirmPassword', isValid)
                  }
                />
                <button
                  type="submit"
                  className="exam-button w-full"
                  disabled={isDisabled}
                  data-hover={!isDisabled ? 'Join Us!' : undefined}
                >
                  REGISTER
                </button>
              </form>
            </div>
          )}
          <div className="register-mailbox">
            <div className={`register-mailbox-slot ${animationStage >= 2 ? 'highlight' : ''}`}></div>
            <div className={`register-mailbox-flag ${sending ? 'down' : ''}
`}>
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
