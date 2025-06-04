import React, { useState } from 'react'
import { ArrowLeft, X} from 'lucide-react';
import { useLoading } from '../components/Loading/LoadingContext';
import { useToast } from '../components/Toast/ToastContext';
import { updateProfile } from "../services/authService";

// Import your local avatar images
import avatar1 from '../assets/avatar1.png'
import avatar2 from '../assets/avatar2.png'
import avatar3 from '../assets/avatar3.png'

// Background colors
const backgroundColors = [
  { name: 'Blue', hex: '#7BA7CC' },
  { name: 'Coral', hex: '#FFB5A7' },
  { name: 'Lavender', hex: '#D8B7FF' },
];

// Generate 9 avatar combinations (3 avatars × 3 backgrounds)
const generateAvatarCombinations = () => {
  const baseAvatars = [
    { id: 1, url: avatar1, name: 'Avatar 1' },
    { id: 2, url: avatar2, name: 'Avatar 2' },
    { id: 3, url: avatar3, name: 'Avatar 3' },
  ];

  const avatarCombinations = [];
  let combinationId = 1;

  baseAvatars.forEach(avatar => {
    backgroundColors.forEach(bg => {
      avatarCombinations.push({
        id: combinationId++,
        avatarId: avatar.id,
        avatarUrl: avatar.url,
        avatarName: avatar.name,
        backgroundColor: bg.hex,
        backgroundName: bg.name,
        displayName: `${avatar.name} - ${bg.name}`,
        isFree: true // You can adjust this logic
      });
    });
  });

  return avatarCombinations;
};

const avatarCombinations = generateAvatarCombinations();

const AvatarSelectionModal = ({ isOpen, onClose, currentAvatar, onSave }) => {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);

  const handleSave = () => {
    onSave(selectedAvatar);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h3 className="text-xl font-bold text-gray-800">Choose Avatar</h3>
          </div>
          <button
            onClick={onClose}
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
              {/* Gradient ring effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full opacity-20 blur-sm"></div>
            </div>
          </div>

          {/* Avatar Grid */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Select Your Avatar</h4>
            <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
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
                          ? 'border-blue-500 shadow-lg shadow-blue-200' 
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
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
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
            onClick={onClose}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
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

const EditProfileScreen = ({ onBack }) => {
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(avatarCombinations[0]);

  const handleAvatarSave = (avatar) => {
    setSelectedAvatar(avatar);
  };

  const handleSaveChanges = () => {
    console.log('Saving changes...', {
      avatar: selectedAvatar
    });
  };

  return (
    <>
      <div className="space-y-6 text-xs sm:text-sm max-w-6xl mx-auto px-4">
        {/* Edit Profile Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          <div className="flex items-center justify-between border-b border-gray-200 pb-6">
            <div className="flex space-x-3">
              <button 
                onClick={onBack}
                className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft size={24} className="text-gray-600" />
              </button>
              <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
            </div>
            <button 
              data-hover="Save Changes"
              className="exam-button-mini px-6 py-3"
              onClick={handleSaveChanges}
            >
              Save Changes
            </button>
          </div>
          
          {/* Avatar Upload */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              {/* Gradient ring effect - behind everything */}
              <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full opacity-20 blur-md group-hover:opacity-30 transition-opacity pointer-events-none -z-10"></div>
              
              <div 
                className="relative w-40 h-40 rounded-full overflow-hidden cursor-pointer shadow-2xl border-4 border-white transition-all duration-300 group-hover:scale-105 z-10"
                style={{ backgroundColor: selectedAvatar.backgroundColor }}
                onClick={() => setIsAvatarModalOpen(true)}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={selectedAvatar.avatarUrl}
                    alt="User Avatar"
                    className="w-32 h-32 object-cover rounded-full z-10 relative"
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
            
            <div className="text-center">
              <p className="text-gray-600 text-sm font-medium">Tap to change your avatar</p>
              <p className="text-gray-400 text-xs mt-1">Choose from our collection of avatar combinations</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Full Name</label>
                <input
                  type="text"
                  defaultValue="Nikka Joie Mendoza"
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Username</label>
                <input
                  type="text"
                  defaultValue="@bananachips"
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Email</label>
                <input
                  type="email"
                  defaultValue="nikka@example.com"
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Bio</label>
                <textarea
                  defaultValue="Student and aspiring developer"
                  rows="4"
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none bg-gray-50 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                <div>
                  <p className="font-semibold text-gray-800">Email Notifications</p>
                  <p className="text-sm text-gray-600 mt-1">Receive updates about your account</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <div>
                  <p className="font-semibold text-gray-800">Dark Mode</p>
                  <p className="text-sm text-gray-600 mt-1">Switch to dark theme</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Selection Modal */}
      <AvatarSelectionModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={selectedAvatar}
        onSave={handleAvatarSave}
      />
    </>
  );
};

export default EditProfileScreen;