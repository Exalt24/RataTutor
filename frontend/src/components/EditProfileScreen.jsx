import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import avatarPlaceholder from '../assets/r1.png';
import { getProfile, updateProfile } from "../services/authService";

const EditProfileScreen = ({ onBack }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    bio: '',
    avatar: '',
  });

  const [avatarPreview, setAvatarPreview] = useState(avatarPlaceholder);

  // Load profile data on mount
  useEffect(() => {
    getProfile().then(data => {
      setFormData({
        username: data.username || '',
        email: data.email || '',
        full_name: data.full_name || '',
        bio: data.bio || '',
        avatar: data.avatar || '',
      });
      if (data.avatar) {
        setAvatarPreview(data.avatar);
      }
    }).catch(err => console.error('Error fetching profile:', err));
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle avatar upload
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result }));
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      await updateProfile(formData);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error);
      alert('Failed to update profile. Please try again.');
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
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarChange} 
              />
            </label>
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
                value={formData.full_name}
                onChange={handleChange}
                className="label-text w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="label-text block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
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
                value={formData.email}
                onChange={handleChange}
                className="label-text w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="label-text block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="3"
                className="label-text w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              />
            </div>
          </div>
        </div>

        {/* Additional Settings */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-6">Additional Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-xs text-gray-500">Receive updates about your account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-xs text-gray-500">Switch to dark theme</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileScreen;
