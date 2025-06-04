import avatarPlaceholder from '../assets/r1.png';

const ProfileScreen = ({ onEditProfile, profileData }) => {
  return (
    <div className="space-y-4 text-xs sm:text-sm">
      {/* User Info Header */}
      <div className="exam-card exam-card--alt p-4 flex flex-col items-center space-y-2">
        <div className="w-24 h-24 rounded-full overflow-hidden">
          <img
            src={profileData.avatar || avatarPlaceholder}
            alt="User Avatar"
            className="w-full h-full object-cover"
          />
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

      {/* Badges Section */}
      {/* The badges section is commented out for now. You can uncomment and adjust when ready */}
      {/* <div className="exam-card exam-card--alt p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Badges</h3>
          <button data-hover="View more" className="exam-button-mini py-1 px-3 text-xs sm:text-sm">
            View more
          </button>
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
      </div> */}
    </div>
  );
};

export default ProfileScreen;
