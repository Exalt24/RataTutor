import { motion, useMotionValue, useTransform } from "framer-motion";
import { CircleAlert } from "lucide-react";
import React from "react";
import "../styles/components/form.css";
import ValidatedInput from "./ValidatedInput";

function AnimatedTitle({
  text,
  className,
  underlinePath = "M0,10 Q75,0 150,10 Q225,20 300,10",
  underlineHoverPath = "M0,10 Q75,20 150,10 Q225,0 300,10",
  duration = 1.2,
}) {
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration, ease: "easeInOut" },
    },
  };

  return (
    <div className={`animated-title ${className}`}>
      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        whileHover={{ scale: 1.02 }}
        className="form-title"
      >
        {text}
      </motion.h2>
      <motion.svg
        width="100%"
        height="20"
        viewBox="0 0 300 20"
        className="title-underline"
      >
        <motion.path
          d={underlinePath}
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          variants={pathVariants}
          initial="hidden"
          animate="visible"
          whileHover={{
            d: underlineHoverPath,
            transition: { duration: 0.8 },
          }}
        />
      </motion.svg>
    </div>
  );
}

export default function Form({
  wrapperClass = "",
  title,
  titleKey,
  fields,
  formData,
  onChange,
  onValidityChange,
  bannerErrors = [],
  onSubmit,
  submitDisabled,
  submitText,
  submitTextDataHover,
  enableTilt = false,
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateY = useTransform(mouseX, [-150, 150], [-10, 10]);
  const rotateX = useTransform(mouseY, [-100, 100], [8, -8]);

  function handleMouseMove(e) {
    if (!enableTilt) return;
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - r.left - r.width / 2);
    mouseY.set(e.clientY - r.top - r.height / 2);
  }
  function handleMouseLeave() {
    if (!enableTilt) return;
    mouseX.set(0);
    mouseY.set(0);
  }

  const Wrapper = enableTilt ? motion.div : "div";
  const wrapperProps = enableTilt
    ? {
        style: { perspective: 600, rotateX, rotateY },
        onMouseMove: handleMouseMove,
        onMouseLeave: handleMouseLeave,
        transition: { type: "spring", stiffness: 60, damping: 15 },
      }
    : {};

  return (
    <Wrapper className={wrapperClass} {...wrapperProps}>
      <div className="form-wrapper">
        <AnimatedTitle key={titleKey} text={title} />

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
          {fields.map(
            ({ name, label, type = "text", icon: Icon, placeholder }) => (
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
                compareValue={
                  name === "confirmPassword" ? formData.password : undefined
                }
              />
            )
          )}

          <button
            type="submit"
            className="exam-button w-full"
            disabled={submitDisabled}
            data-hover={submitTextDataHover}
          >
            {submitText}
          </button>

          <div className="mt-4 text-center">
            {title === "Welcome Back!" ? (
              <button
                type="button"
                className="label-text text-sm text-gray-600 hover:underline focus:outline-none"
                onClick={() => window.location.href = "/forgot-password"}
              >
                Forgot password?
              </button>
            ) : (title === "Forgot Password" || title === "Password Reset") ? (
              <button
                type="button"
                className="label-text text-sm text-gray-600 hover:underline focus:outline-none"
                onClick={() => window.location.href = "/login"}
              >
                Back to Login
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </Wrapper>
  );
}
