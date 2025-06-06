import React, { useState, useEffect, useCallback } from 'react';
import { X, FileText, Info, Globe, Pin, AlertCircle } from 'lucide-react';
import { createMaterial } from '../services/apiService';
import { trackActivityAndNotify, createCombinedSuccessMessage} from '../utils/streakNotifications';
import { useLoading } from '../components/Loading/LoadingContext';
import { useToast } from '../components/Toast/ToastContext';
import ValidatedInput from '../components/ValidatedInput';

const CreateMaterialModal = ({ isOpen, onClose, onCreated, onRefreshMaterials}) => {
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

  // Memoized handlers to prevent infinite re-renders
  const handleTitleChange = useCallback((e) => {
    setFormData(prev => ({
      ...prev,
      title: e.target.value
    }));
  }, []);

  const handleDescriptionChange = useCallback((e) => {
    setFormData(prev => ({
      ...prev,
      description: e.target.value
    }));
  }, []);

  const handleTitleValidityChange = useCallback((field, isValid) => {
    setValidities(prev => ({
      ...prev,
      title: isValid
    }));
  }, []);

  const handleDescriptionValidityChange = useCallback((field, isValid) => {
    setValidities(prev => ({
      ...prev,
      description: isValid
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBannerErrors([]);
    setSubmitting(true);
    showLoading();

    try {
      // Create the material
      const res = await createMaterial(formData);
      
      // 🔥 Track activity but suppress immediate notification (same as CreateFlashcards)
      const streakResult = await trackActivityAndNotify(showToast, true);
      
      // 🔥 Create combined message using helper function (same as CreateFlashcards)
      const baseTitle = "Material created successfully!";
      const baseSubtitle = `"${formData.title}" is ready for content.`;
      
      const combinedMessage = createCombinedSuccessMessage(baseTitle, baseSubtitle, streakResult);
      
      // 🔥 Show single combined toast (same as CreateFlashcards)
      showToast({
        variant: "success",
        title: combinedMessage.title,
        subtitle: combinedMessage.subtitle,
      });

      onCreated(res.data);

      // 🔥 ALSO refresh all data to get updated streak
      if (onRefreshMaterials) {
        await onRefreshMaterials();
      }

      onClose();
      
    } catch (err) {
      // Enhanced error handling pattern from auth components
      const data = err.response?.data || {};
      const msgs = [];

      // Handle different error response formats
      if (data.detail) {
        msgs.push(data.detail);
      } else {
        Object.entries(data).forEach(([key, val]) => {
          if (Array.isArray(val)) {
            val.forEach((m) => msgs.push(typeof m === 'string' ? m : JSON.stringify(m)));
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleClose}>
      <div className="letter-no-lines max-w-md" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center mb-4 p-3">
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
          <div className="space-y-4 p-3">
            {/* Title Field - Uses materialTitle validator */}
            <ValidatedInput
              label="Title"
              name="materialTitle"
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              icon={FileText}
              required={true}
              onValidityChange={handleTitleValidityChange}
              disabled={submitting}
              variant="profile"
              placeholder="Enter material title"
            />

            {/* Description Field - Uses materialDescription validator */}
            <ValidatedInput
              label="Description (Optional)"
              name="materialDescription"
              type="textarea"
              value={formData.description}
              onChange={handleDescriptionChange}
              icon={Info}
              required={false}
              onValidityChange={handleDescriptionValidityChange}
              rows={3}
              disabled={submitting}
              variant="profile"
              placeholder="Enter material description (optional)"
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