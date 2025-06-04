import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { defaultValidators } from "../utils/validation";
import "../styles/components/validated-input.css";

export default function ValidatedInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  validate,
  compareValue,
  icon: LeftIcon,
  required = false,
  onValidityChange,
  errorMessage: serverError = "",
  // Textarea specific props
  rows = 3,
  cols,
  disabled = false,
  ...otherProps
}) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);

  const validator = validate ?? defaultValidators[name];

  const clientError = (() => {
    if (!value) return "";
    if (!validator) return "";
    return name === "confirmPassword"
      ? validator(value, compareValue)
      : validator(value);
  })();

  const error = serverError || clientError;
  const isValid = !!value && !error;

  useEffect(() => {
    onValidityChange(name, isValid);
  }, [name, isValid, onValidityChange]);

  const isActive = focused || !!value;

  // Common props for both input and textarea
  const commonProps = {
    id: name,
    name: name,
    value: value,
    onChange: onChange,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    required: required,
    disabled: disabled,
    ...otherProps
  };

  // Render textarea
  if (type === "textarea") {
    return (
      <div
        className={`form-field ${isActive ? "active" : ""} ${
          error ? "invalid" : ""
        }`}
      >
        <div className="input-with-icon">
          {LeftIcon && <LeftIcon size={16} className="left-icon" />}
          <textarea
            {...commonProps}
            rows={rows}
            cols={cols}
            className="form-input form-textarea"
          />
          <label htmlFor={name}>{label}</label>
        </div>

        {error && <p className="errors-form-per-field">{error}</p>}
      </div>
    );
  }

  // Render regular input
  return (
    <div
      className={`form-field ${isActive ? "active" : ""} ${
        error ? "invalid" : ""
      }`}
    >
      <div className="input-with-icon">
        {LeftIcon && <LeftIcon size={16} className="left-icon" />}
        <input
          {...commonProps}
          type={type === "password" ? (show ? "text" : "password") : type}
          className="form-input"
        />
        <label htmlFor={name}>{label}</label>
        {type === "password" && (
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShow((v) => !v)}
            disabled={disabled}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      {error && <p className="errors-form-per-field">{error}</p>}
    </div>
  );
}