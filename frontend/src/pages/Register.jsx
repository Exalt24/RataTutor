import React, { useEffect, useState, useRef } from "react";
import { register } from "../services/authService";
import { useToast } from "../components/Toast/ToastContext";
import Form from "../components/Form";
import { User, Mail, Lock } from "lucide-react";
import "../styles/pages/register.css";
import { ArrowLeft } from "lucide-react";

const registerFields = [
  {
    name: "username",
    label: "Username",
    icon: User,
    placeholder: "e.g. Rata123",
  },
  {
    name: "email",
    label: "Email",
    icon: Mail,
    placeholder: "e.g. someone@example.com",
  },
  {
    name: "password",
    type: "password",
    label: "Password",
    icon: Lock,
    placeholder: "e.g. D@ntTe11",
  },
  {
    name: "confirmPassword",
    type: "password",
    label: "Confirm Password",
    icon: Lock,
    placeholder: "Confirm your password",
  },
];

export default function Register({ isActive, onGoLogin }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [bannerErrors, setBannerErrors] = useState([]);
  const [validities, setValidities] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [animationStage, setAnimationStage] = useState(0);
  const [sending, setSending] = useState(false);
  const [hideForm, setHideForm] = useState(false);


  const [titleKey, setTitleKey] = useState(0);
  const prevActive = useRef(false);

  const { showToast } = useToast();

  useEffect(() => {
    if (isActive) {
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setBannerErrors([]);
      setValidities({
        username: false,
        email: false,
        password: false,
        confirmPassword: false,
      });
      setAnimationStage(1);
      setSending(false);
      setHideForm(false);
    }

    if (!prevActive.current && isActive) {
      setTitleKey((k) => k + 1);
    }
    prevActive.current = isActive;
  }, [isActive]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleValidityChange = (field, ok) => {
    setValidities((prev) =>
      prev[field] === ok ? prev : { ...prev, [field]: ok }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBannerErrors([]);

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setBannerErrors(["Passwords do not match."]);
      return;
    }

    // Disable the button by setting sending to true
    setSending(true);

    try {
      // Attempt registration
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      });
    } catch (err) {
      // Error handling for failed registration
      const data = err.response?.data || {};
      const msgs = [];

      Object.entries(data).forEach(([key, val]) => {
        if (Array.isArray(val)) val.forEach((m) => msgs.push(m));
        else if (typeof val === "string") msgs.push(val);
      });
      setBannerErrors(msgs);
      setSending(false);  // Re-enable the button if the registration fails
      return;
    }

  // After successful registration
  setAnimationStage(2);
  setTimeout(() => {
    setAnimationStage(3);
    setTimeout(() => {
      setHideForm(true);

      showToast({
        variant: "success",
        title: "Registration successful!",
        subtitle: "Welcome aboard!",
      });

      setTimeout(onGoLogin, 1000);
    }, 1500);
  }, 1500);
};

const isDisabled =
  Object.values(validities).some((v) => !v) ||
  formData.password !== formData.confirmPassword ||
  sending;  // Button will be disabled when sending is true

  return (
    <>
      <div className="register-container">
        <div className="register-content-wrapper">
          {!hideForm && (
            <Form
              wrapperClass={`register-letter ${
                animationStage >= 2 ? "sending" : ""
              }`}
              enableTilt={true}
              title="Join RataTutor"
              titleKey={titleKey}
              fields={registerFields}
              formData={formData}
              onChange={handleChange}
              validities={validities}
              onValidityChange={handleValidityChange}
              bannerErrors={bannerErrors}
              onSubmit={handleSubmit}
              submitDisabled={sending || isDisabled}
              submitText="Register"
              submitTextDataHover="Join us!"
            />
          )}

          <div className="register-mailbox">
            <div
              className={`register-mailbox-slot ${
                animationStage >= 2 ? "highlight" : ""
              }`}
            ></div>
            <div className={`register-mailbox-flag ${sending ? "down" : ""}`}>
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
          onClick={(e) => {
            e.stopPropagation();
            onGoLogin();
          }}
        >
          <div role="button" aria-label="Go to Login">
            <ArrowLeft size={24} strokeWidth={2} />
          </div>

          <div className="slide-tag">
            <span>Already have an account?</span>
            <button
              type="button"
              className="slide-tag-link"
              onClick={(e) => {
                e.stopPropagation();
                onGoLogin();
              }}
            >
              Login here
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
