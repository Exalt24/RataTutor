import React from 'react';
import avatarPlaceholder from '../assets/r1.png';

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
        isFree: true
      });
    });
  });

  return avatarCombinations;
};

const avatarCombinations = generateAvatarCombinations();

const ProfileScreen = ({ onEditProfile, profileData }) => {
  // Get the current avatar combination based on stored avatar ID
  const getCurrentAvatar = () => {
    if (profileData.avatar) {
      // Try to find matching combination by ID
      const existingAvatar = avatarCombinations.find(combo => 
        combo.id === parseInt(profileData.avatar) || 
        combo.displayName === profileData.avatar
      );
      return existingAvatar;
    }
    return null;
  };

  const currentAvatar = getCurrentAvatar();

  return (
    <div className="space-y-4 text-xs sm:text-sm">
      {/* User Info Header */}
      <div className="exam-card exam-card--alt p-4 flex flex-col items-center space-y-2">
        <div className="relative">
          {currentAvatar ? (
            // Display avatar combination with background
            <>
              {/* Gradient ring effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full opacity-20 blur-sm"></div>
              <div 
                className="relative w-24 h-24 rounded-full overflow-hidden shadow-xl border-4 border-white"
                style={{ backgroundColor: currentAvatar.backgroundColor }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={currentAvatar.avatarUrl}
                    alt="User Avatar"
                    className="w-18 h-18 object-cover rounded-full z-10 relative"
                    style={{ 
                      filter: 'contrast(1.2) brightness(1.1)',
                      transform: 'scale(1.1)'
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            // Fallback to placeholder
            <div className="w-24 h-24 rounded-full overflow-hidden">
              <img
                src={avatarPlaceholder}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
        <span className="exam-heading-mini label-text">
          {profileData.full_name || 'Anonymous User'}
        </span>
        <span className="text-gray-500 label-text">
          @{profileData.username || 'anonymous'}
        </span>
        <button 
          onClick={onEditProfile}
          className="exam-button-mini py-1 px-3 text-xs sm:text-sm"
          data-hover="Edit profile"
        >
          Edit profile
        </button>
      </div>

      {/* Bio Section */}
      <div className="exam-card p-4">
        <h3 className="font-semibold mb-2">Bio</h3>
        <p className="text-sm text-gray-700">
          {profileData.bio || "No bio available. Update your bio!"}
        </p>
      </div>

    </div>
  );
};

export default ProfileScreen;