import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";
import { User, Lock } from "lucide-react";
import Form from "../components/Form";
import "../styles/pages/login.css";

const loginFields = [
  {
    name: "username",
    label: "Username",
    icon: User,
    placeholder: "Enter your username",
  },
  {
    name: "password",
    type: "password",
    label: "Password",
    icon: Lock,
    placeholder: "Enter your password",
  },
];

export default function Login({ isActive, onGoRegister }) {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [bannerErrors, setBannerErrors] = useState([]);
  const [validities, setValidities] = useState({
    username: false,
    password: false,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isPulledOut, setIsPulledOut] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    if (isActive) {
      setFormData({ username: "", password: "" });
      setBannerErrors([]);
      setValidities({ username: false, password: false });
      setIsOpen(false);
      setIsPulledOut(false);
    }
  }, [isActive]);

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
    setBannerErrors([]);

    try {
      await login(formData);
      nav("/dashboard", { replace: true });
    } catch (err) {
      const data = err.response?.data || {};

      const msgs = [];
      Object.entries(data).forEach(([key, val]) => {
        if (Array.isArray(val)) val.forEach((m) => msgs.push(m));
        else if (typeof val === "string") msgs.push(val);
      });
      setBannerErrors(msgs);
    }
  };

  const isDisabled = !validities.username || !validities.password;

  const handlePaperClick = (e) => {
    e.stopPropagation();
    if (isOpen && !isPulledOut) setIsPulledOut(true);
  };
  const handleOutsideClick = () => {
    if (isPulledOut) {
      setIsPulledOut(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="login-container" onClick={handleOutsideClick}>
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
              title="Welcome Back!"
              fields={loginFields}
              formData={formData}
              onChange={handleChange}
              validities={validities}
              onValidityChange={handleValidityChange}
              bannerErrors={bannerErrors}
              onSubmit={handleSubmit}
              submitDisabled={isDisabled}
              submitText="Sign In"
              submitTextDataHover="Welcome back!"
            />
          </div>
        )}

        <div className="envelope-side left"></div>
        <div className="envelope-side right"></div>
        <div className="envelope-front"></div>
        <div className="envelope-flap"></div>
      </div>

      <div
        className="slide-arrow"
        onClick={(e) => {
          e.stopPropagation();
          onGoRegister();
        }}
      >
        →
      </div>
    </div>
  );
}
