import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLoading } from '../components/Loading/LoadingContext';
import { useToast } from '../components/Toast/ToastContext';
import { updateProfile } from "../services/authService";
import avatarPlaceholder from '../assets/r1.png';

const EditProfileScreen = ({ onBack, profileData, fetchProfileData }) => {
  const [avatarPreview, setAvatarPreview] = useState(avatarPlaceholder);
  const [formData, setFormData] = useState({
    full_name: profileData.full_name || '',
    username: profileData.username || '',
    email: profileData.email || '',
    bio: profileData.bio || '',
    avatar: profileData.avatar || '', // Store avatar selection as a string
  });
  const [isAvatarModalOpen, setAvatarModalOpen] = useState(false); // Track modal visibility

  const { showLoading, hideLoading } = useLoading();  // Use loading context
  const { showToast } = useToast();  // Use toast context

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle avatar selection (trigger modal)
  const handleAvatarChange = () => {
    setAvatarModalOpen(true); // Open the avatar selection modal (currently commented out)
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    showLoading();  // Show loading spinner

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
      showToast({
        variant: 'error',
        title: 'Failed to update profile!',
        subtitle: 'Please try again later.',
      });
    } finally {
      hideLoading();
    }
  };


  return (
    <div className="space-y-6 text-xs sm:text-sm max-w-6xl mx-auto px-4">
      <div className="exam-card exam-card--alt p-8 space-y-8">
        <div className="flex items-center justify-between border-b border-gray-200 pb-6">
          <div className="flex space-x-3">
            <button 
              onClick={onBack}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition"
            >
              <ArrowLeft size={28} className="text-gray-600" />
            </button>
            <h2 className="text-xl">Edit Profile</h2>
          </div>
          <button 
            onClick={handleSubmit}
            data-hover="Save Changes" 
            className="exam-button-mini py-1.5 px-4 text-xs sm:text-sm"
          >
            Save Changes
          </button>
        </div>
        
        {/* Avatar Upload */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-32 h-32 rounded-full overflow-hidden relative group">
            <img
              src={avatarPreview}
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
            <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
              <span className="text-white text-xs font-medium">Change Photo</span>
            </label>
            <button 
              type="button"
              className="absolute inset-0 w-full h-full cursor-pointer" 
              onClick={handleAvatarChange} 
            />
          </div>
          <p className="text-gray-500 text-xs">Click to change profile picture</p>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="label-text block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name || ''}
                onChange={handleChange}
                className="label-text w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="label-text block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username || ''}
                onChange={handleChange}
                className="label-text w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="label-text block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="label-text w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="label-text block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio || ''}
                placeholder='Tell us about yourself...'
                onChange={handleChange}
                rows="3"
                className="label-text w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              />
            </div>
          </div>
        </div>
  
        {/* Avatar Selection Modal (Commented out for now) 
        {isAvatarModalOpen && (
          // AvatarSelectionModal will be uncommented once the modal is implemented
          // <AvatarSelectionModal
          //   onSelect={handleAvatarSelect}
          //   onClose={() => setAvatarModalOpen(false)}
          // />
        )}*/}
        
      </div>
    </div>
  );
};

export default EditProfileScreen;
