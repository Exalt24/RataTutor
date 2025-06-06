import { ArrowLeft, X } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useLoading } from '../components/Loading/LoadingContext';
import { useToast } from '../components/Toast/ToastContext';
import ValidatedInput from '../components/ValidatedInput';
import { updateProfile } from "../services/authService";
import { avatarCombinations, getCurrentAvatar } from '../utils/avatarUtils';

const AvatarSelectionModal = ({ isOpen, onClose, currentAvatar, onSave }) => {
  // Initialize with currentAvatar
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);

  const handleSave = () => {
    onSave(selectedAvatar);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleClose} // Close when clicking backdrop
    >
      <div 
        className="bg-white rounded-3xl max-w-xl w-full max-h-[125vh] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400/50 shadow-2xl"
        onClick={(e) => e.stopPropagation()} // Prevent close when clicking modal content
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <h3 className="label-text text-xl font-bold text-gray-800">Choose Avatar</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Preview */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div 
                className="w-32 h-32 rounded-full flex items-center justify-center overflow-hidden shadow-xl border-4 border-white relative"
                style={{ backgroundColor: selectedAvatar?.backgroundColor || '#7BA7CC' }}
              >
                {selectedAvatar ? (
                  <img
                    src={selectedAvatar.avatarUrl}
                    alt={selectedAvatar.displayName}
                    className="w-24 h-24 object-cover rounded-full z-10 relative"
                    style={{ 
                      filter: 'contrast(1.2) brightness(1.1)',
                      transform: 'scale(1.1)'
                    }}
                  />
                ) : (
                  <div className="text-white text-sm font-medium">Select Avatar</div>
                )}
              </div>
            </div>
          </div>

          {/* Avatar Grid */}
          <div>
            <h4 className="label-text text-lg font-semibold text-gray-800 mb-4">Select Your Avatar</h4>
            <div className="grid grid-cols-5 gap-3 max-h-96 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400/50">
              {avatarCombinations.map(avatarCombo => (
                <div
                  key={avatarCombo.id}
                  className={`relative group cursor-pointer transition-all duration-300 ${
                    selectedAvatar?.id === avatarCombo.id 
                      ? 'transform scale-105' 
                      : 'hover:transform hover:scale-105'
                  }`}
                  onClick={() => setSelectedAvatar(avatarCombo)}
                >
                  {/* Avatar Circle */}
                  <div className="relative w-20 h-20 mx-auto">
                    <div 
                      className={`w-full h-full rounded-full overflow-hidden border-3 transition-all relative ${
                        selectedAvatar?.id === avatarCombo.id 
                          ? 'border-blue-500' 
                          : 'border-gray-200 group-hover:border-blue-300'
                      }`}
                      style={{ backgroundColor: avatarCombo.backgroundColor }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img
                          src={avatarCombo.avatarUrl}
                          alt={avatarCombo.displayName}
                          className="w-14 h-14 object-cover rounded-full z-10 relative"
                          style={{ 
                            filter: 'contrast(1.2) brightness(1.1)',
                            transform: 'scale(1.1)'
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Selection indicator */}
                    {selectedAvatar?.id === avatarCombo.id && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Price/Free label */}
                  <div className="text-center mt-2">
                    {avatarCombo.isFree ? (
                      <span className="label-text text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        Free
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full flex items-center justify-center">
                        <span className="text-blue-500 mr-1">💎</span>
                        {avatarCombo.cost}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-100 bg-gray-50 rounded-b-3xl">
          <button
            onClick={handleClose}
            className="label-text px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            data-hover="Save Avatar"
            className="exam-button-mini px-6 py-3"
            onClick={handleSave}
          >
            Save Avatar
          </button>
        </div>
      </div>
    </div>
  );
};

const EditProfileScreen = ({ onBack, profileData, fetchProfileData }) => {
  // Early return if profileData is not available (during logout)
  if (!profileData) {
    return <div>Loading...</div>;
  }

  // Fix 1: Stabilize currentAvatar calculation with proper dependencies
  const currentAvatar = useMemo(() => {
    return getCurrentAvatar(profileData);
  }, [profileData.avatar, profileData.id]); // Only depend on specific stable fields

  // Fix 2: Use lazy initialization to avoid dependency issues
  const [selectedAvatar, setSelectedAvatar] = useState(() => currentAvatar);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  
  // Initialize form data with lazy initialization
  const [formData, setFormData] = useState(() => ({
    full_name: profileData.full_name || '',
    username: profileData.username || '',
    email: profileData.email || '',
    bio: profileData.bio || '',
    avatar: profileData.avatar || currentAvatar.id.toString(),
  }));
  
  // Initialize validities with lazy initialization  
  const [validities, setValidities] = useState(() => ({
    full_name: !!(profileData.full_name),
    username: !!(profileData.username),
    email: !!(profileData.email),
    bio: true, // Bio is optional
  }));
  
  const [serverErrors, setServerErrors] = useState({});
  // ✅ NEW: Add banner errors for general validation messages
  const [bannerErrors, setBannerErrors] = useState([]);

  const { showLoading, hideLoading } = useLoading();
  const { showToast } = useToast();

  // Handle form input changes - MEMOIZED to prevent re-renders
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear server error for this field when user starts typing
    setServerErrors(prev => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
    
    // ✅ NEW: Clear banner errors when user starts making changes
    if (bannerErrors.length > 0) {
      setBannerErrors([]);
    }
  }, [bannerErrors.length]);

  // Handle validation state changes - MEMOIZED to prevent infinite re-renders
  const handleValidityChange = useCallback((field, isValid) => {
    setValidities(prev => {
      // Only update if the validity actually changed
      if (prev[field] !== isValid) {
        return { ...prev, [field]: isValid };
      }
      return prev;
    });
  }, []);

  // Handle avatar selection - MEMOIZED
  const handleAvatarSave = useCallback((avatar) => {
    setSelectedAvatar(avatar);
    setFormData(prev => ({ ...prev, avatar: avatar.id.toString() }));
  }, []);

  // Fix 5: Calculate hasChanges without depending on unstable references
  const hasChanges = useMemo(() => {
    const original = {
      full_name: profileData.full_name || '',
      username: profileData.username || '',
      email: profileData.email || '',
      bio: profileData.bio || '',
      avatar: profileData.avatar || currentAvatar.id.toString(),
    };
    
    return Object.keys(formData).some(key => 
      formData[key] !== original[key]
    );
  }, [
    formData, 
    profileData.full_name, 
    profileData.username, 
    profileData.email, 
    profileData.bio, 
    profileData.avatar, 
    currentAvatar.id
  ]);

  const allRequiredFieldsValid = useMemo(() => {
    return Object.entries(validities).every(([field, isValid]) => {
      if (field === 'bio') return true; // Bio is optional
      return isValid;
    });
  }, [validities]);

  const isSaveDisabled = useMemo(() => {
    return !hasChanges || !allRequiredFieldsValid;
  }, [hasChanges, allRequiredFieldsValid]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Early return if button should be disabled (safety check)
    if (isSaveDisabled) return;

    // ✅ NEW: Clear all errors at start
    setServerErrors({});
    setBannerErrors([]);
    showLoading();

    try {
      // Update the profile data
      await updateProfile(formData);

      // Refetch profile data after successful update
      await fetchProfileData();

      showToast({
        variant: 'success',
        title: 'Profile updated successfully!',
        subtitle: 'Your profile has been updated.',
      });
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error);
      
      // ✅ ENHANCED: Handle both field-specific AND general errors
      const errorData = error.response?.data || {};
      const fieldErrors = {};
      const generalErrors = [];
      
      Object.entries(errorData).forEach(([key, val]) => {
        const errorMessages = Array.isArray(val) ? val : [val];
        
        // Check if this is a field-specific error
        const isFieldError = ['username', 'email', 'full_name', 'bio', 'avatar'].includes(key);
        
        if (isFieldError) {
          fieldErrors[key] = errorMessages[0]; // Take first error message
        } else {
          // General errors (non_field_errors, etc.)
          generalErrors.push(...errorMessages);
        }
      });
      
      // Set field-specific errors
      if (Object.keys(fieldErrors).length > 0) {
        setServerErrors(fieldErrors);
      }
      
      // Set general errors
      if (generalErrors.length > 0) {
        setBannerErrors(generalErrors);
      }
      
      // Show appropriate toast
      if (Object.keys(fieldErrors).length > 0 || generalErrors.length > 0) {
        showToast({
          variant: 'error',
          title: 'Validation Error',
          subtitle: 'Please fix the errors below.',
        });
      } else {
        showToast({
          variant: 'error',
          title: 'Failed to update profile!',
          subtitle: 'Please try again later.',
        });
      }
    } finally {
      hideLoading();
    }
  };

  return (
    <>
      <div className="space-y-6 text-xs sm:text-sm max-w-6xl mx-auto px-4">
        <div className="exam-card exam-card--alt">
          <div className="flex items-center justify-between border-b border-gray-200 pb-6">
            <div className="flex space-x-3">
              <button 
                onClick={onBack}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition"
              >
                <ArrowLeft size={25} className="text-gray-600" />
              </button>
              <h3>Edit Profile</h3>
            </div>
            <button 
              onClick={handleSubmit}
              disabled={isSaveDisabled}
              data-hover={
                isSaveDisabled 
                  ? (hasChanges ? "Fix errors to save" : "No changes to save")
                  : "Save Changes"
              }
              className={`exam-button-mini py-1.5 px-4 text-xs sm:text-sm transition-all ${
                isSaveDisabled ? 
                'opacity-50 cursor-not-allowed' : 
                'hover:scale-105'
              }`}
            >
              Save Changes
            </button>
          </div>

          {/* ✅ NEW: Banner Errors Display */}
          {bannerErrors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Please fix the following errors:
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc list-inside space-y-1">
                      {bannerErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <div 
                className="relative w-32 h-32 rounded-full overflow-hidden cursor-pointer shadow-xl border-4 border-white transition-all duration-300 group-hover:scale-105"
                style={{ backgroundColor: selectedAvatar.backgroundColor }}
                onClick={() => setIsAvatarModalOpen(true)}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={selectedAvatar.avatarUrl}
                    alt="User Avatar"
                    className="w-24 h-24 object-cover rounded-full z-10 relative"
                    style={{ 
                      filter: 'contrast(1.2) brightness(1.1)',
                      transform: 'scale(1.1)'
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="text-white text-sm font-medium">Change</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-gray-500 text-xs">Click to change profile picture</p>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <ValidatedInput
                variant="profile"
                label="Full Name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
                onValidityChange={handleValidityChange}
                errorMessage={serverErrors.full_name}
                required
              />
              <ValidatedInput
                variant="profile"
                label="Username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                onValidityChange={handleValidityChange}
                errorMessage={serverErrors.username}
                required
              />
            </div>

            <div className="space-y-6">
              <ValidatedInput
                variant="profile"
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onValidityChange={handleValidityChange}
                errorMessage={serverErrors.email}
                required
              />
              <ValidatedInput
                variant="profile"
                label="Bio"
                name="bio"
                type="textarea"
                value={formData.bio}
                onChange={handleChange}
                onValidityChange={handleValidityChange}
                errorMessage={serverErrors.bio}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Selection Modal */}
      <AvatarSelectionModal
        key={isAvatarModalOpen ? 'open' : 'closed'} // Force remount to reset state
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={currentAvatar}
        onSave={handleAvatarSave}
      />
    </>
  );
};

export default EditProfileScreen;