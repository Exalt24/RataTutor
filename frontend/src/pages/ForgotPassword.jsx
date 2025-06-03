// src/pages/ForgotPassword.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestPasswordReset } from "../services/auth";
import { Mail } from "lucide-react";
import Form from "../components/Form";
import { useToast } from "../components/Toast/ToastContext";
import "../styles/pages/forgot-password.css";

const forgotPasswordFields = [
  {
    name: "email",
    label: "Email",
    icon: Mail,
    placeholder: "Enter your email",
  },
];

export default function ForgotPassword() {
  const [formData, setFormData] = useState({ email: "" });
  const [validities, setValidities] = useState({ email: false });
  const [isOpen, setIsOpen] = useState(false);
  const [isPulledOut, setIsPulledOut] = useState(false);

  const nav = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    // reset state when this component mounts
    setFormData({ email: "" });
    setValidities({ email: false });
    setIsOpen(false);
    setIsPulledOut(false);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleValidityChange = (field, ok) => {
    setValidities((prev) =>
      prev[field] === ok ? prev : { ...prev, [field]: ok }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await requestPasswordReset({ email: formData.email });
      showToast({
        variant: "success",
        title: "Email Sent",
        subtitle:
          "If an account with that email exists, you’ll receive a reset link.",
      });
    } catch (err) {
      const data = err.response?.data || {};
      const msgs = [];
      Object.entries(data).forEach(([key, val]) => {
        if (Array.isArray(val)) val.forEach((m) => msgs.push(m));
        else if (typeof val === "string") msgs.push(val);
      });
      showToast({
        variant: "error",
        title: "Unable to send reset link",
        subtitle: msgs.join(" "),
      });
    }
  };

  const isDisabled = !validities.email;

  const handlePaperClick = (e) => {
    e.stopPropagation();
    if (isOpen && !isPulledOut) setIsPulledOut(true);
  };
  const handleOutsideClick = () => {
    if (isPulledOut) {
      setIsPulledOut(false);
      setIsOpen(false);
      setFormData({ email: "" });
      setValidities({ email: false });
    }
  };

  return (
    <div className="forgot-password-container" onClick={handleOutsideClick}>
      <div
        className={`envelope ${isOpen ? "open" : ""} ${
          isPulledOut ? "form-pulled" : ""
        }`}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => !isPulledOut && setIsOpen(false)}
      >
        <div className="envelope-back"></div>

        {!isPulledOut ? (
          <div className="envelope-content">
            <div className="paper-peek" onClick={handlePaperClick}>
              <div className="paper-content">
                <span className="handwriting-accent">Click to open</span>
                <div className="pull-arrow">↑</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="letter-slideIn" onClick={(e) => e.stopPropagation()}>
            <Form
              wrapperClass="letter"
              enableTilt={true}
              title="Forgot Password"
              titleKey={0}
              fields={forgotPasswordFields}
              formData={formData}
              onChange={handleChange}
              validities={validities}
              onValidityChange={handleValidityChange}
              bannerErrors={[]}
              onSubmit={handleSubmit}
              submitDisabled={isDisabled}
              submitText="Send Reset Link"
              submitTextDataHover="Check your email"
            />

            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline focus:outline-none"
                onClick={() => nav("/login")}
              >
                Back to Login
              </button>
            </div>
          </div>
        )}

        <div className="envelope-side left"></div>
        <div className="envelope-side right"></div>
        <div className="envelope-front"></div>
        <div className="envelope-flap"></div>
      </div>
    </div>
  );
}
