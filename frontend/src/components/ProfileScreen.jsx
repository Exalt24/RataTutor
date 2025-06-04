import React from 'react';
import avatarPlaceholder from '../assets/r1.png';
import { getCurrentAvatarOrDefault } from '../utils/avatarUtils';

const ProfileScreen = ({ onEditProfile, profileData }) => {
  const currentAvatar = getCurrentAvatarOrDefault(profileData);

  return (
    <div className="bg-[#f5f2e8] rounded-2xl p-6 shadow-lg max-w-4xl mx-auto font-sans">
      <div className="flex gap-6">
        {/* Left side - Avatar and Name */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-pink-200 bg-white relative">
            {currentAvatar ? (
              // Display avatar combination with background and gradient ring
              <>
                {/* Gradient ring effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-2xl opacity-20 blur-sm"></div>
                <div 
                  className="relative w-full h-full rounded-xl overflow-hidden shadow-xl"
                  style={{ backgroundColor: currentAvatar.backgroundColor }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img
                      src={currentAvatar.avatarUrl}
                      alt="User Avatar"
                      className="w-24 h-24 object-cover rounded-full z-10 relative"
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
              <img
                src={avatarPlaceholder}
                alt="User Avatar"
                className="w-full h-full object-cover"
                style={{
                  background: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
                }}
              />
            )}
          </div>
          <div className="relative">
            <div className="bg-white text-gray-600 font-semibold rounded-full px-3 py-1 text-sm shadow-sm absolute -top-2 left-3 z-10">
              Name
            </div>
            <div className="bg-[#f4a6cd] text-white font-bold rounded-2xl px-8 py-4 text-xl shadow-md pt-6">
              {profileData.full_name || 'Anonymous User'}
            </div>
          </div>
        </div>

        {/* Right side - Info tags in landscape grid */}
        <div className="flex-1 grid grid-cols-2 gap-4">
          {/* Username */}
          <div className="relative">
            <div className="bg-white text-gray-600 font-semibold rounded-full px-3 py-1 text-sm shadow-sm absolute -top-2 left-3 z-10">
              Username
            </div>
            <div className="bg-[#f4a6cd] text-white font-medium rounded-2xl px-6 py-3 shadow-md pt-5">
              @{profileData.username || 'anonymous'}
            </div>
          </div>

          {/* Email */}
          <div className="relative">
            <div className="bg-white text-gray-600 font-semibold rounded-full px-3 py-1 text-sm shadow-sm absolute -top-2 left-3 z-10">
              Email
            </div>
            <div className="bg-[#f4a6cd] text-white font-medium rounded-2xl px-6 py-3 shadow-md pt-5">
              {profileData.email || 'testuser@gmail.com'}
            </div>
          </div>

          {/* Bio Section - spans two columns */}
          <div className="relative col-span-2 -mt-16">
            <div className="bg-white text-gray-600 font-semibold rounded-full px-3 py-1 text-sm shadow-sm absolute -top-2 left-3 z-10">
              Bio
            </div>
            <div className="bg-[#f4a6cd] text-white rounded-2xl px-6 py-4 shadow-md pt-5">
              {profileData.bio || "No bio available. Update your bio!"}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Button */}
      <div className="mt-8 flex justify-center">
        <button 
          onClick={onEditProfile}
          className="exam-button-mini py-1 px-3 text-xs sm:text-sm"
          data-hover="Edit profile"
        >
          Edit profile
        </button>
      </div>
    </div>
  );
};

export default ProfileScreen;