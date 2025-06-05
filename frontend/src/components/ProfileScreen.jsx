import React from 'react';
import avatarPlaceholder from '../assets/r1.png';
import { getCurrentAvatarOrDefault } from '../utils/avatarUtils';

const ProfileScreen = ({ onEditProfile, profileData }) => {
  const currentAvatar = getCurrentAvatarOrDefault(profileData);

  // Barcode SVG component
  const Barcode = ({ className }) => (
    <svg className={className} viewBox="0 0 100 20" xmlns="http://www.w3.org/2000/svg">
      {[...Array(30)].map((_, i) => (
        <rect
          key={i}
          x={i * 3.3}
          y="0"
          width={Math.random() * 2 + 1}
          height="20"
          fill="black"
        />
      ))}
    </svg>
  );

  // QR Code placeholder
  const QRCode = () => (
    <div className="w-36 h-36 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
      <div className="grid grid-cols-4 gap-2">
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className={`w-7 h-7 rounded-sm ${
              Math.random() > 0.5 ? 'bg-gray-800' : 'bg-transparent'
            }`}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-6xl mx-auto font-sans overflow-hidden">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#ffc1cc]  to-[#aad9ff] opacity-90"></div>
        <div className="relative p-3 text-white">
          <div className="flex justify-between items-center">
            <h2 className="label-text text-xl font-bold">GRADUATION PASS</h2>
            <div className="text-sm">RATA TUTOR</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[400px]">
        {/* Left Section */}
        <div className="w-2/3 p-4 relative">
          <div className="flex h-full">
            {/* Avatar and Basic Info */}
            <div className="w-1/3 flex flex-col items-center space-y-4 pr-4">
              <div className="relative">
                <div 
                  className="w-28 h-28 rounded-xl overflow-hidden border-2 border-blue-100 bg-white relative"
                  style={{ backgroundColor: currentAvatar?.backgroundColor }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img
                      src={currentAvatar?.avatarUrl || avatarPlaceholder}
                      alt="User Avatar"
                      className="w-20 h-20 object-cover rounded-full z-10 relative"
                      style={{ 
                        filter: 'contrast(1.2) brightness(1.1)',
                        transform: 'scale(1.1)'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h3 className="label-text text-lg font-semibold text-gray-800">
                  {profileData.full_name || 'Anonymous User'}
                </h3>
                <p className="label-text text-sm text-gray-500">
                  @{profileData.username || 'anonymous'}
                </p>
              </div>

              {/* Email */}
              <div className="w-full bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="label-text text-xs text-gray-500 mb-1">EMAIL</div>
                <div className="label-text text-sm text-gray-800 font-medium truncate">
                  {profileData.email || 'testuser@gmail.com'}
                </div>
              </div>

              {/* Bio moved here */}
              <div className="w-full bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="label-text text-xs text-gray-500 mb-1">BIO</div>
                <div className="label-text text-sm text-gray-800 line-clamp-3">
                  {profileData.bio || "No bio available. Update your bio!"}
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="w-2/3 pl-4 border-l border-gray-200">
              <div className="grid grid-cols-3 gap-3 h-full">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <div className="label-text text-xs text-blue-600 mb-1">STREAK</div>
                  <div className="label-text text-xl font-bold text-blue-700">
                    {profileData.streak?.count || 0}
                  </div>
                  <div className="label-text text-xs text-blue-600">Days</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                  <div className="label-text text-xs text-purple-600 mb-1">LONGEST</div>
                  <div className="label-text text-xl font-bold text-purple-700">
                    {profileData.streak?.longest_streak || 0}
                  </div>
                  <div className="label-text text-xs text-purple-600">Days</div>
                </div>
                <div className="bg-pink-50 p-3 rounded-lg border border-pink-100">
                  <div className="label-text text-xs text-pink-600 mb-1">TOTAL</div>
                  <div className="label-text text-xl font-bold text-pink-700">
                    {profileData.streak?.total_days || 0}
                  </div>
                  <div className="label-text text-xs text-pink-600">Days</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Perforated Divider */}
        <div className="relative">
          <div className="absolute top-0 bottom-0 left-0 right-0 flex flex-col justify-center items-center">
            <div className="h-full w-0.5 border-l-2 border-dashed border-gray-300"></div>
          </div>
        </div>

        {/* Right Section */}
        <div className="w-1/3 p-4">
          <div className="flex flex-col h-full space-y-6">
            {/* Top section: Class/Terminal and QR Code */}
            <div className="flex flex-1">
              {/* Column 1: Class and Terminal */}
              <div className="w-1/2 flex flex-col space-y-6 pr-3">
                {/* Class */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="label-text text-xs text-gray-500">CLASS</div>
                  <div className="label-text text-sm text-gray-800 font-medium">BLOCK B ECONOMY</div>
                </div>
                {/* Terminal */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="label-text text-xs text-gray-500">TERMINAL</div>
                  <div className="label-text text-sm text-gray-800 font-medium">UNIVERSITY OF THE PHILIPPINES CEBU</div>
                </div>
              </div>

              {/* Column 2: QR Code */}
              <div className="w-1/2 flex items-start justify-center pl-3">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-full flex flex-col">
                  <div className="label-text text-xs text-gray-500 mb-3 text-center">QR CODE</div>
                  <div className="flex-1 flex items-center justify-center">
                    <QRCode />
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <div>
              <button 
                onClick={onEditProfile}
                className="exam-button-mini w-full"
                data-hover="Edit Profile"
              >
                Edit Profile
              </button>
            </div>

            {/* Horizontal Barcode */}
            <div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="label-text text-xs text-gray-500 mb-2">BARCODE</div>
                <Barcode className="w-full h-10" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Perforated Edge */}
      <div className="flex justify-between px-4 py-2 bg-gray-50 border-t border-gray-200">
        <div className="flex space-x-2">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="w-1 h-4 bg-gray-300 rounded-full"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;