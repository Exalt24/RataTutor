import React, { useState, useEffect } from 'react';
import { X, FileText, Info, Globe, Pin, AlertCircle } from 'lucide-react';
import { createMaterial } from '../services/apiService';
import { useLoading } from '../components/Loading/LoadingContext';
import { useToast } from '../components/Toast/ToastContext';
import ValidatedInput from '../components/ValidatedInput';
import { defaultValidators } from '../utils/validation';

const CreateMaterialModal = ({ isOpen, onClose, onCreated }) => {
  const { showLoading, hideLoading } = useLoading();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    public: false,
    pinned: false,
  });
  
  const [bannerErrors, setBannerErrors] = useState([]);
  const [validities, setValidities] = useState({
    title: false,
    description: true, // Optional field
  });
  
  const [submitting, setSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        public: false,
        pinned: false,
      });
      setBannerErrors([]);
      setValidities({
        title: false,
        description: true,
      });
      setSubmitting(false);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleValidityChange = (field, isValid) => {
    setValidities(prev => ({
      ...prev,
      [field]: isValid
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBannerErrors([]);
    setSubmitting(true);
    showLoading();

    try {
      const res = await createMaterial(formData);
      
      // Show success toast
      showToast({
        variant: "success",
        title: "Material created successfully!",
        subtitle: `"${formData.title}" is ready for content.`,
      });

      // Notify parent and close modal
      onCreated(res.data);
      onClose();
      
    } catch (err) {
      // ✅ Enhanced error handling pattern from auth components
      const data = err.response?.data || {};
      const msgs = [];

      // Handle different error response formats
      if (data.detail) {
        msgs.push(data.detail);
      } else {
        Object.entries(data).forEach(([key, val]) => {
          if (Array.isArray(val)) {
            val.forEach((m) => msgs.push(m));
          } else if (typeof val === "string") {
            msgs.push(val);
          }
        });
      }

      // Fallback error message
      if (msgs.length === 0) {
        msgs.push('Failed to create material. Please try again.');
      }

      setBannerErrors(msgs);
      
    } finally {
      setSubmitting(false);
      hideLoading();
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  const isDisabled = !validities.title || submitting;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold label-text">Create New Material</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
            disabled={submitting}
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Error Banner */}
        {bannerErrors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                {bannerErrors.map((error, idx) => (
                  <p key={idx}>{error}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Title Field */}
            <ValidatedInput
              label="Title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              validate={defaultValidators.materialTitle}
              icon={FileText}
              required={true}
              onValidityChange={handleValidityChange}
              disabled={submitting}
            />

            {/* Description Field */}
            <ValidatedInput
              label="Description (Optional)"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleChange}
              validate={defaultValidators.materialDescription}
              icon={Info}
              required={false}
              onValidityChange={handleValidityChange}
              rows={3}
              disabled={submitting}
            />

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="material-public"
                  name="public"
                  checked={formData.public}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-[#1b81d4] focus:ring-[#7BA7CC]/30"
                  disabled={submitting}
                />
                <label htmlFor="material-public" className="flex items-center space-x-1 text-sm label-text">
                  <Globe size={16} />
                  <span>Make this material public</span>
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="material-pinned"
                  name="pinned"
                  checked={formData.pinned}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-[#1b81d4] focus:ring-[#7BA7CC]/30"
                  disabled={submitting}
                />
                <label htmlFor="material-pinned" className="flex items-center space-x-1 text-sm label-text">
                  <Pin size={16} />
                  <span>Pin this material</span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="label-text px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="exam-button-mini"
              data-hover={submitting ? "Creating..." : "Create"}
              disabled={isDisabled}
            >
              {submitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMaterialModal;