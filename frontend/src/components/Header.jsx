// src/components/Header.jsx
import { Flame, LogOut, Plus, User } from "lucide-react";
import React, { useState, useEffect } from "react";
import StreakModal from "./StreakModal";
import { getCurrentAvatarOrNull } from '../utils/avatarUtils';

const Header = ({
  onLogout,
  onProfile,
  onStreak,
  profileData
}) => {
  const [open, setOpen] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);

  const currentAvatar = getCurrentAvatarOrNull(profileData);

  return (
    <>
      <header className="relative flex items-center justify-between bg-white px-4 py-4 shadow text-xs sm:text-sm">
        {/* Welcome Message */}
        <div className="flex items-center">
         <h1 className="label-text text-xl">Welcome, {profileData?.username || "User"}!</h1>
        </div>

        {/* Actions & Stats + Profile */}
        <div className="flex items-center space-x-3">
          {/* Streak */}
          <button
            onClick={() => setShowStreakModal(true)}
            className="flex items-center space-x-1 hover:opacity-75 transition-opacity"
          >
            <span className="text-lg">🔥</span>
            <span className="font-medium label-text">{profileData.streak.count} Days</span>
          </button>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setOpen((o) => !o)}
              className="relative group transition-transform hover:scale-105"
            >
              {currentAvatar ? (
                // Display avatar combination with background
                <div className="relative">
                  {/* Gradient ring effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full opacity-30 blur-sm group-hover:opacity-50 transition-opacity"></div>
                  <div 
                    className="relative w-8 h-8 rounded-full overflow-hidden shadow-lg border-2 border-white"
                    style={{ backgroundColor: currentAvatar.backgroundColor }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img
                        src={currentAvatar.avatarUrl}
                        alt="User Avatar"
                        className="w-6 h-6 object-cover rounded-full z-10 relative"
                        style={{ 
                          filter: 'contrast(1.2) brightness(1.1)',
                          transform: 'scale(1.1)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // Fallback to generic user icon
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 transition">
                  <User size={16} className="text-gray-600" />
                </div>
              )}
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <button
                  onClick={() => {
                    onProfile();
                    setOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-2 hover:bg-gray-50 transition space-x-2 text-sm"
                >
                  <User size={16} className="text-gray-600" />
                  <span className="label-text">Profile</span>
                </button>
                <button
                  onClick={() => {
                    onStreak();
                    setOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-2 hover:bg-gray-50 transition space-x-2 text-sm"
                >
                  <Flame size={16} className="text-orange-500" />
                  <span className="label-text">View Streak</span>
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-2 hover:bg-gray-50 transition space-x-2 text-sm text-red-500"
                >
                  <LogOut size={16} />
                  <span className="label-text">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Streak Screen Modal */}
      {showStreakModal && (
        <StreakModal
          onClose={() => setShowStreakModal(false)}
          profileData={profileData}
        />
      )}
    </>
  );
};

export default Header;