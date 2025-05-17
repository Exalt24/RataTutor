// src/components/ValidatedInput.jsx
import React, { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { defaultValidators } from '../utils/validation'

const ValidatedInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  validate,
  compareValue,
  icon: LeftIcon,
  required = false,
  onValidityChange,
}) => {
  const [show, setShow] = useState(false)

  const validator = validate ?? defaultValidators[name]

  const error = (() => {
    if (!value) return ''
    if (!validator) return ''
    return name === 'confirmPassword'
      ? validator(value, compareValue)
      : validator(value)
  })()

  const isValid = !!value && !error

  useEffect(() => {
    onValidityChange(name, isValid)
  }, [name, isValid, onValidityChange])

  return (
    <div className="form-group relative mb-4">
      <label className="handwriting-accent">{label}</label>
      <div className="input-with-icon">
        {LeftIcon && <LeftIcon size={16} className="left-icon" />}
        <input
          name={name}
          type={
            type === 'password'
              ? show
                ? 'text'
                : 'password'
              : type
          }
          value={value}
          onChange={onChange}
          className="form-input"
          placeholder={placeholder}
          required={required}
        />
        {type === 'password' && (
          <button
            type="button"
            className="toggle-btn"
            onClick={() => setShow(v => !v)}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="errors-form-per-field">{error}</p>}
    </div>
  )
}

export default ValidatedInput
