import React from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import ValidatedInput from './ValidatedInput'
import '../styles/components/form.css'
import { CircleAlert } from 'lucide-react'

export default function Form({
  wrapperClass = '',
  title,
  fields,
  formData,
  onChange,
  validities,
  onValidityChange,
  bannerErrors = [],
  onSubmit,
  submitDisabled,
  submitText,
  submitTextDataHover,
  enableTilt = false,
}) {
  const mouseX  = useMotionValue(0)
  const mouseY  = useMotionValue(0)
  const rotateY = useTransform(mouseX, [-150,150], [-10,10])
  const rotateX = useTransform(mouseY, [-100,100], [8,-8])

  function handleMouseMove(e) {
    if (!enableTilt) return
    const r = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - r.left   - r.width/2)
    mouseY.set(e.clientY - r.top    - r.height/2)
  }
  function handleMouseLeave() {
    if (!enableTilt) return
    mouseX.set(0)
    mouseY.set(0)
  }

  const Wrapper = enableTilt ? motion.div : 'div'
  const wrapperProps = enableTilt
    ? {
        style: { perspective: 600, rotateX, rotateY },
        onMouseMove: handleMouseMove,
        onMouseLeave: handleMouseLeave,
      }
    : {}

  return (
    <Wrapper className={wrapperClass} {...wrapperProps}>
      <div className="form-wrapper">
        <h2 className="form-title">{title}</h2>

        {bannerErrors.length > 0 && (
          <div className="form-banner-error">
            <CircleAlert className="banner-icon" />
            <ul className="banner-list">
              {bannerErrors.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={onSubmit} className="form">
          {fields.map(({ name, label, type = 'text', icon: Icon, placeholder }) => (
            <ValidatedInput
              key={name}
              label={label}
              name={name}
              type={type}
              icon={Icon}
              value={formData[name]}
              onChange={onChange}
              placeholder={placeholder}
              required
              onValidityChange={onValidityChange}
              compareValue={name === 'confirmPassword' ? formData.password : undefined}
            />
          ))}

          <button
            type="submit"
            className="exam-button w-full"
            disabled={submitDisabled}
            data-hover={submitTextDataHover}
          >
            {submitText}
          </button>
        </form>
      </div>
    </Wrapper>
  )
}
