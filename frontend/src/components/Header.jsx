import { ChevronDown, Flame, LogOut, User } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { getCurrentAvatarOrDefault } from '../utils/avatarUtils';
import StreakModal from "./StreakModal";
import { getStreakMotivationalMessage } from "../utils/streakNotifications";

const Header = ({
  onLogout,
  onProfile,
  onStreak,
  profileData
}) => {
  const [open, setOpen] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const currentAvatar = getCurrentAvatarOrDefault(profileData);
  
  const streakCount = profileData?.streak?.count || 0;

  const motivationalMessage = getStreakMotivationalMessage(profileData?.streak?.count || 0);

  return (
    <>
      <header className="relative flex items-center justify-between bg-gradient-to-r from-pink-50 to-purple-50 px-6 py-4 shadow-sm border-b border-pink-100 text-xs sm:text-sm">
        {/* Welcome Message */}
        <div className="flex items-center">
         <h1 className="label-text text-xl font-semibold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
           Welcome, {profileData?.username || "User"}! ✨
         </h1>
        </div>

        {/* Actions & Stats + Profile */}
        <div className="flex items-center space-x-4">
          {/* Streak display */}
          <button
            onClick={() => setShowStreakModal(true)}
            className="flex items-center space-x-2 px-3 py-2 rounded-full bg-gradient-to-r from-pink-100 to-rose-100 hover:from-pink-200 hover:to-rose-200 transition-all duration-200 cursor-pointer group border border-pink-200 shadow-sm h-10"
          >
            <Flame size={18} className="text-pink-500 group-hover:scale-110 transition-transform" />
            <span className="font-medium label-text text-pink-600">
              {profileData ? `${streakCount} Days` : 'Loading...'}
            </span>
          </button>

          {/* Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setOpen((o) => !o)}
              className="relative group transition-all duration-200 flex items-center space-x-2 cursor-pointer bg-white hover:bg-pink-50 px-3 py-2 rounded-full border border-pink-100 shadow-sm h-10"
            >
              {currentAvatar ? (
                // Display avatar combination with background
                <div className="relative">
                  <div 
                    className="relative w-8 h-8 rounded-full overflow-hidden shadow-md border-2 border-white"
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
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-50 hover:bg-pink-100 transition">
                  <User size={16} className="text-pink-500" />
                </div>
              )}
              <span className="label-text text-sm font-medium hidden sm:block text-pink-600">
                {profileData?.username || "User"}
              </span>
              <ChevronDown 
                size={16} 
                className={`text-pink-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              />
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-pink-100 rounded-2xl shadow-lg z-50 overflow-hidden">
                <button
                  onClick={() => {
                    onProfile();
                    setOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-2.5 hover:bg-pink-50 transition space-x-2 text-sm border-b border-pink-100"
                >
                  <User size={16} className="text-pink-500" />
                  <span className="label-text text-pink-600">Profile</span>
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-2.5 hover:bg-rose-50 transition space-x-2 text-sm text-rose-500"
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
          motivationalMessage={motivationalMessage}
        />
      )}
    </>
  );
};

export default Header;