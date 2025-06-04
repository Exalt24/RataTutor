import { Mail } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Form from "../components/Form";
import { useToast } from "../components/Toast/ToastContext";
import { requestPasswordReset } from "../services/authService";
import "../styles/pages/forgot-password.css";

const forgotPasswordFields = [
  {
    name: "email",
    label: "Email",
    icon: Mail,
  },
];

export default function ForgotPassword() {
  const [formData, setFormData] = useState({ email: "" });
  const [validities, setValidities] = useState({ email: false });

  const nav = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    // reset state when this component mounts
    setFormData({ email: "" });
    setValidities({ email: false });
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
          "If an account with that email exists, you'll receive a reset link.",
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

  return (
    <div className="forgot-password-container">
      <Form
        wrapperClass="letter1"
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
    </div>
  );
}
