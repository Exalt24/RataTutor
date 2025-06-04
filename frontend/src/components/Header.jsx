// src/components/Header.jsx
import { Flame, LogOut, Plus, User } from "lucide-react";
import React, { useState, useEffect } from "react";
import StreakModal from "./StreakModal";

const Header = ({
  streak = 5,
  level,
  points,
  onLogout,
  onProfile,
  onStreak,
  profileData
}) => {
  const [open, setOpen] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    username: "",
  });
  
  const streakData = {
    current: 10, // This should come from props or API
    longest: 10, // This should come from props or API
    total: 10, // This should come from props or API
  };

  const handleStreakClick = () => {
    setShowStreakModal(true);
    setOpen(false);
  };

  return (
    <>
      <header className="relative flex items-center justify-between bg-white px-4 py-4 shadow text-xs sm:text-sm">
        {/* Welcome Message */}
        <div className="flex items-center">
         <h1 className="label-text text-xl">Welcome, {profileData.username || "User"}!</h1>
        </div>

        {/* Actions & Stats + Profile */}
        <div className="flex items-center space-x-3">
          {/* Streak */}
          <button
            onClick={() => setShowStreakModal(true)}
            className="flex items-center space-x-1 hover:opacity-75 transition-opacity"
          >
            <span className="text-lg">🔥</span>
            <span className="font-medium">{streakData.current}</span>
          </button>

          {/* Level */}
          <div className="flex items-center space-x-1">
            <span className="px-1 py-0.5 bg-purple-600 text-white text-[10px] rounded">
              LV {level}
            </span>
          </div>

          {/* Coins */}
          <div className="flex items-center space-x-1">
            <span className="text-lg">🪙</span>
            <span className="font-medium">{points}</span>
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 transition"
            >
              <User size={16} className="text-gray-600" />
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
          streakData={streakData}
        />
      )}
    </>
  );
};

export default Header;
