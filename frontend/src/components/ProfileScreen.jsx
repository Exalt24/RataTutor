// src/screens/ProfileScreen.jsx
import React from 'react'
import avatar from '../assets/r1.png'

const ProfileScreen = ({ points, badges, onEditProfile }) => (
  <div className="space-y-4 text-xs sm:text-sm">
    {/* User Info Header */}
    <div className="exam-card exam-card--alt p-4 flex flex-col items-center space-y-2">
        <div className="w-24 h-24 rounded-full overflow-hidden">
            <img
            src={avatar}
            alt="User Avatar"
            className="w-full h-full object-cover"
            />
        </div>
      <span className="exam-heading-mini label-text">Nikka Joie Mendoza</span>
      <span className="text-gray-500 label-text">@bananachips</span>
      <button 
        onClick={onEditProfile}
        className="exam-button-mini py-1 px-3 text-xs sm:text-sm"
      >
        Edit profile
      </button>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      <div className="exam-card p-3 text-center">
        <h3 className="font-semibold">Level 1</h3>
        <p className="mt-1 text-sm">35/60XP <span className="pixel-accent">2</span></p>
      </div>
      <div className="exam-card p-3 text-center">
        <h3 className="font-semibold">Streak</h3>
        <p className="mt-1 text-2xl">🔥 0</p>
      </div>
      <div className="exam-card p-3 text-center">
        <h3 className="font-semibold">Coins</h3>
        <p className="mt-1 text-2xl">🪙 35</p>
      </div>
    </div>

    {/* Badges Section */}
    <div className="exam-card exam-card--alt p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">Badges</h3>
        <button className="exam-button-mini py-1 px-3 text-xs sm:text-sm">View more</button>
      </div>
      <div className="space-y-4">
        {badges.length > 0 ? badges.map((badge, i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-300 rounded-full" />
            <div className="flex-1">
              <p className="font-medium">{badge.name}</p>
              <div className="h-1 bg-gray-700 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-white"
                  style={{ width: `${(badge.current / badge.goal) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {badge.current}/{badge.goal} {badge.label}
              </p>
            </div>
          </div>
        )) : (
          <p>No badges yet</p>
        )}
      </div>
    </div>
  </div>
)

export default ProfileScreen
