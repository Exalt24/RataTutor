import {
  CalendarDaysIcon,
  FireIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const StreakScreen =  ({ profileData }) =>{
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center p-6 relative">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="exam-heading text-3xl" data-subtitle="Keep Learning!">
          Your Streak
        </h1>
        <p className="mt-2 text-gray-600">
          Keep track of your daily progress and milestones.
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 w-full max-w-3xl">
        <div className="bg-white bg-opacity-50 rounded-xl p-6 text-center">
          <FireIcon className="w-10 h-10 mx-auto text-red-500 mb-3" />
          <p className="text-sm text-gray-600">Current Streak</p>
          <p className="text-4xl font-bold text-gray-800">{profileData.streak.count}</p>
          <p className="text-xs text-gray-500">days</p>
        </div>

        <div className="bg-white bg-opacity-50 rounded-xl p-6 text-center">
          <TrophyIcon className="w-10 h-10 mx-auto text-yellow-500 mb-3" />
          <p className="text-sm text-gray-600">Longest Streak</p>
          <p className="text-4xl font-bold text-gray-800">{profileData.streak.longest_streak}</p>
          <p className="text-xs text-gray-500">days</p>
        </div>

        <div className="bg-white bg-opacity-50 rounded-xl p-6 text-center">
          <CalendarDaysIcon className="w-10 h-10 mx-auto text-blue-500 mb-3" />
          <p className="text-sm text-gray-600">Total Days</p>
          <p className="text-4xl font-bold text-gray-800">{profileData.streak.total_days}</p>
          <p className="text-xs text-gray-500">learned</p>
        </div>
      </div>

      {/* Motivational Section */}
      <div className="text-center">
        <p className="exam-msg text-lg mb-6">
          {streakData.current > 0
            ? "You're on fire! Keep the momentum going!"
            : "Start your streak today!"}
        </p>
        <button
          onClick={() => navigate('/learn', { replace: true })}
          className="exam-button-mini mx-auto"
          data-hover="Let's go!"
        >
          Continue Learning
        </button>
      </div>
    </div>
  );
};

export default StreakScreen;
