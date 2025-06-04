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
  variant = "default", // "default", "profile", or "card"
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
    onValidityChange?.(name, isValid);
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

  // Card variant styling (for flashcards)
  if (variant === "card") {
    if (type === "textarea") {
      return (
        <div>
          <label className="label-text block text-sm font-medium text-gray-700 mb-2">
            {label} {required && "*"}
          </label>
          <textarea
            {...commonProps}
            rows={rows}
            cols={cols}
            className={`label-text w-full p-4 border rounded-lg bg-white focus:bg-white focus:ring-2 focus:ring-[#7BA7CC]/30 focus:border-[#1b81d4] transition-colors outline-none resize-none ${
              error 
                ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                : 'border-gray-200'
            }`}
          />
          {error && (
            <p className="mt-1 text-xs text-red-600">
              {error}
            </p>
          )}
        </div>
      );
    }

    return (
      <div>
        <label className="label-text block text-sm font-medium text-gray-700 mb-2">
          {label} {required && "*"}
        </label>
        <div className="relative">
          <input
            {...commonProps}
            type={type === "password" ? (show ? "text" : "password") : type}
            className={`label-text w-full p-4 border rounded-lg bg-white focus:bg-white focus:ring-2 focus:ring-[#7BA7CC]/30 focus:border-[#1b81d4] transition-colors outline-none ${
              error 
                ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                : 'border-gray-200'
            } ${type === "password" ? 'pr-12' : ''}`}
          />
          {type === "password" && (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShow((v) => !v)}
              disabled={disabled}
            >
              {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }

  // Profile variant styling
  if (variant === "profile") {
    if (type === "textarea") {
      return (
        <div>
          <label className="label-text block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
          <textarea
            {...commonProps}
            rows={rows}
            cols={cols}
            className={`label-text w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none ${
              error ? 'border-red-500 ring-red-500' : ''
            }`}
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      );
    }

    return (
      <div>
        <label className="label-text block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <div className="relative">
          <input
            {...commonProps}
            type={type === "password" ? (show ? "text" : "password") : type}
            className={`label-text w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
              error ? 'border-red-500 ring-red-500' : ''
            } ${type === "password" ? 'pr-12' : ''}`}
          />
          {type === "password" && (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShow((v) => !v)}
              disabled={disabled}
            >
              {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  // Default variant (existing styling)
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