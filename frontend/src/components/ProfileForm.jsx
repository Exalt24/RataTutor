import React, { useState } from 'react';
import './ProfileForm.css';

// Import your avatar images (adjust paths as needed)
import avatar1 from '../assets/avatar1.png';
import avatar2 from '../assets/avatar2.png';
import avatar3 from '../assets/avatar3.png';

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
      });
    });
  });

  return avatarCombinations;
};

const avatarCombinations = generateAvatarCombinations();

const ProfileForm = () => {
  const [selectedAvatar, setSelectedAvatar] = useState(avatarCombinations[0]); // Default to first combination

  const handleAvatarSelect = (avatarCombo) => {
    setSelectedAvatar(avatarCombo);
  };

  return (
    <div className="profile-form-container">
      {/* Main Selected Avatar Display */}
      <div className="selected-avatar-display" style={{ backgroundColor: selectedAvatar.backgroundColor }}>
        {selectedAvatar && (
          <img 
            src={selectedAvatar.avatarUrl} 
            alt="Selected Avatar" 
            className="selected-avatar-img" 
          />
        )}
      </div>

      <h2>Choose the customized avatar</h2>

      {/* Avatar Selection Grid */}
      <div className="avatar-selection-grid">
        {avatarCombinations.map(avatarCombo => (
          <div
            key={avatarCombo.id}
            className={`avatar-option ${selectedAvatar.id === avatarCombo.id ? 'selected' : ''}`}
            onClick={() => handleAvatarSelect(avatarCombo)}
            style={{ backgroundColor: avatarCombo.backgroundColor }}
          >
            <img 
              src={avatarCombo.avatarUrl} 
              alt={avatarCombo.displayName} 
              className="avatar-option-img" 
            />
          </div>
        ))}
      </div>

      {/* Save button */}
      <button className="save-profile-button">Save Profile</button>
    </div>
  );
};

export default ProfileForm;