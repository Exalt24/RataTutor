import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { confirmPasswordReset } from "../services/authService";
import { Lock } from "lucide-react";
import Form from "../components/Form";
import { useToast } from "../components/Toast/ToastContext";
import "../styles/pages/password-reset.css";

const resetFields = [
  {
    name: "password",
    type: "password",
    label: "New Password",
    icon: Lock,
  },
  {
    name: "confirmPassword",
    type: "password",
    label: "Confirm Password",
    icon: Lock,
  },
];

export default function PasswordReset() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [validities, setValidities] = useState({
    password: false,
    confirmPassword: false,
  });
  const [bannerErrors, setBannerErrors] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isPulledOut, setIsPulledOut] = useState(false);

  const nav = useNavigate();
  const { uid, token } = useParams();
  const { showToast } = useToast();

  useEffect(() => {
    setFormData({ password: "", confirmPassword: "" });
    setValidities({ password: false, confirmPassword: false });
    setBannerErrors([]);
    setIsOpen(false);
    setIsPulledOut(false);
  }, []);

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

    if (formData.password !== formData.confirmPassword) {
      setBannerErrors(["New password and confirmation must match."]);
      return;
    }

    try {
      await confirmPasswordReset({
        uid,
        token,
        new_password: formData.password,
        confirm_password: formData.confirmPassword,
      });

      showToast({
        variant: "success",
        title: "Password Reset",
        subtitle: "Your password has been reset. Please log in.",
      });

      nav("/login");
    } catch (err) {
      const data = err.response?.data || {};
      const msgs = [];

      Object.entries(data).forEach(([key, val]) => {
        if (Array.isArray(val)) val.forEach((m) => msgs.push(m));
        else if (typeof val === "string") msgs.push(val);
      });

      setBannerErrors(msgs.length > 0 ? msgs : ["Reset failed. Try again."]);
    }
  };

  const isDisabled = !validities.password || !validities.confirmPassword;

  const handlePaperClick = (e) => {
    e.stopPropagation();
    if (isOpen && !isPulledOut) setIsPulledOut(true);
  };

  const handleOutsideClick = () => {
    if (isPulledOut) {
      setIsPulledOut(false);
      setIsOpen(false);
      setFormData({ password: "", confirmPassword: "" });
      setValidities({ password: false, confirmPassword: false });
      setBannerErrors([]);
    }
  };

  return (
    <div className="password-reset-container" onClick={handleOutsideClick}>
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
                <span className="pixel-accent">Click to open</span>
                <div className="pull-arrow">↑</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="letter-slideIn" onClick={(e) => e.stopPropagation()}>
            <Form
              wrapperClass="letter2"
              enableTilt={true}
              title="Password Reset"
              titleKey={0}
              fields={resetFields}
              formData={formData}
              onChange={handleChange}
              validities={validities}
              onValidityChange={handleValidityChange}
              bannerErrors={bannerErrors}
              onSubmit={handleSubmit}
              submitDisabled={isDisabled}
              submitText="Change Password"
              submitTextDataHover="Submit"
            />
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
