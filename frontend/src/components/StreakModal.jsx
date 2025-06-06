import { CalendarDaysIcon, FireIcon, TrophyIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React from 'react';

const StreakModal = ({ onClose, profileData }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose} // Close when clicking backdrop
    >
      <div 
        className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 relative bg-color-2"
        onClick={(e) => e.stopPropagation()} // Prevent close when clicking modal content
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors duration-200 text-gray-500 hover:text-gray-700 cursor-pointer"
          aria-label="Close modal"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2 className="exam-heading text-2xl mb-6 text-center" data-subtitle="Keep Learning!">
          Your Streak
        </h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white bg-opacity-50 rounded-xl p-4 text-center">
            <div className="flex justify-center mb-2">
              <FireIcon className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-sm text-gray-600">Current Streak</p>
            <p className="text-2xl font-bold text-gray-800">{profileData.streak.count}</p>
            <p className="text-xs text-gray-500">days</p>
          </div>

          <div className="bg-white bg-opacity-50 rounded-xl p-4 text-center">
            <div className="flex justify-center mb-2">
              <TrophyIcon className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="text-sm text-gray-600">Longest Streak</p>
            <p className="text-2xl font-bold text-gray-800">{profileData.streak.longest_streak}</p>
            <p className="text-xs text-gray-500">days</p>
          </div>

          <div className="bg-white bg-opacity-50 rounded-xl p-4 text-center">
            <div className="flex justify-center mb-2">
              <CalendarDaysIcon className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-sm text-gray-600">Total Learning</p>
            <p className="text-2xl font-bold text-gray-800">{profileData.streak.total_days}</p>
            <p className="text-xs text-gray-500">days</p>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="text-center">
          <p className="exam-msg text-lg mb-4">
            {profileData.streak.count > 0
              ? "You're on fire! Keep the momentum going!"
              : "Start your streak today!"}
          </p>
          <button 
            className="exam-button-mini"
            data-hover="Let's go!"
            onClick={onClose}
          >
            Continue Learning
          </button>
        </div>
      </div>
    </div>
  );
};

export default StreakModal;