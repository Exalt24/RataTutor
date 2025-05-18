import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/auth'
import { User, Lock } from 'lucide-react'
import ValidatedInput from '../components/ValidatedInput'
import '../styles/pages/login.css'

export default function Login({ isActive, onGoRegister }) {
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [serverErrors, setServerErrors] = useState({})
  const [isOpen, setIsOpen] = useState(false)
  const [isPulledOut, setIsPulledOut] = useState(false)
  const [validities, setValidities] = useState({ username: false, password: false })
  const nav = useNavigate()

  useEffect(() => {
    if (isActive) {
      setFormData({ username: '', password: '' })
      setServerErrors({})
      setIsOpen(false)
      setIsPulledOut(false)
      setValidities({ username: false, password: false })
    }
  }, [isActive])

  const submit = async e => {
    e.preventDefault()
    setServerErrors({})
    try {
      await login(formData)
      nav('/dashboard', { replace: true })
    } catch (err) {
      setServerErrors(err.response?.data || {})
    }
  }

  const handleValidityChange = (field, isValid) => {
    setValidities(prev => ({ ...prev, [field]: isValid }))
  }

  const isDisabled =
    !validities.username ||
    !validities.password ||
    Object.keys(serverErrors).length > 0

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

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="login-container" onClick={handleOutsideClick}>
      <div
        className={`envelope ${isOpen ? 'open' : ''} ${
          isPulledOut ? 'form-pulled' : ''
        }`}
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
              {serverErrors.non_field_errors?.map((msg, i) => (
                <p key={i} className="errors-form-all">{msg}</p>
              ))}
              <form onSubmit={submit} className="login-form">
                <ValidatedInput
                  label="Username"
                  name="username"
                  icon={User}
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  required
                  onValidityChange={handleValidityChange}
                />
                <ValidatedInput
                  label="Password"
                  name="password"
                  type="password"
                  icon={Lock}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  onValidityChange={handleValidityChange}
                />
                <button
                  type="submit"
                  className="exam-button w-full py-2"
                  disabled={isDisabled}
                  data-hover={!isDisabled ? 'Welcome Back!' : undefined}
                >
                  Sign In
                </button>
              </form>
            </div>
          )}
        </div>
        <div className="envelope-side left"></div>
        <div className="envelope-side right"></div>
        <div className="envelope-front"></div>
        <div className="envelope-flap"></div>
      </div>
      <div className="slide-arrow" onClick={e => { e.stopPropagation(); onGoRegister() }}>
        →
      </div>
    </div>
  )
}
