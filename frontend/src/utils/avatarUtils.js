// Import your local avatar images
import avatar1 from '../assets/avatar1.png'
import avatar2 from '../assets/avatar2.png'
import avatar3 from '../assets/avatar3.png'

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
        isFree: true
      });
    });
  });

  return avatarCombinations;
};

// Export the avatar combinations
export const avatarCombinations = generateAvatarCombinations();

// Utility function to get current avatar from profile data
export const getCurrentAvatar = (profileData) => {
  if (profileData?.avatar) {
    // Try to find matching combination by ID
    const existingAvatar = avatarCombinations.find(combo => 
      combo.id === parseInt(profileData.avatar) || 
      combo.displayName === profileData.avatar
    );
    return existingAvatar || avatarCombinations[0]; // Return first as fallback
  }
  return avatarCombinations[0]; // Default to first combination
};

// Utility function to get current avatar with null fallback (for optional display)
export const getCurrentAvatarOrNull = (profileData) => {
  if (profileData?.avatar) {
    const existingAvatar = avatarCombinations.find(combo => 
      combo.id === parseInt(profileData.avatar) || 
      combo.displayName === profileData.avatar
    );
    return existingAvatar;
  }
  return null;
};