import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EditProfileScreen from '../components/EditProfileScreen';
import ExamsScreen from '../components/ExamsScreen';
import ExploreScreen from '../components/ExploreScreen';
import Header from '../components/Header';
import HomeScreen from '../components/HomeScreen';
import MaterialsScreen from '../components/MaterialsScreen';
import ProfileScreen from '../components/ProfileScreen';
import RataAIScreen from '../components/RataAIScreen';
import Sidebar from '../components/Sidebar';
import StreakScreen from '../components/StreakScreen';
import TrashScreenEmptyState from '../components/TrashScreenEmptyState';
import { logout } from '../services/authService';
import { getProfile } from '../services/authService'; // Import getProfile function
import '../styles/pages/dashboard.css';

const Dashboard = () => {
  const [screen, setScreen] = useState('home');
  const [profileData, setProfileData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const nav = useNavigate();

  // Fetch profile data once when the Dashboard component mounts
  const fetchProfileData = async () => {
    try {
      const profile = await getProfile();
      setProfileData(profile); // Set profile data here
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  useEffect(() => {
    fetchProfileData(); // Fetch profile data on component mount
  }, []); // Empty dependency array means this runs only once on component mount

  // Handle Logout
  const doLogout = () => {
    logout();
    nav('/login', { replace: true });
  };

  // Change screen
  const showProfile = () => setScreen('profile');
  const showStreak = () => setScreen('streak');

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const uploadAndGenerate = async (type) => {
    if (!selectedFile) return alert('Please select a file first');
    // Your generate logic (api.post) can stay commented if needed
  };

  const getBgColor = () => {
    switch (screen) {
      case 'home':
        return 'bg-color-1';
      case 'materials':
        return 'bg-color-2';
      case 'trash':
        return 'bg-color-4';
      case 'explore':
        return 'bg-color-1';
      case 'rata':
        return 'bg-color-3';
      case 'profile':
        return 'bg-color-2';
      case 'edit-profile':
        return 'bg-color-2';
      case 'streak':
        return 'bg-color-3';
      case 'saved':
        return 'bg-color-3';
      default:
        return 'bg-color-1';
    }
  };

  // Pass profileData to child screens
  return (
    <div className="flex h-screen text-xs sm:text-sm">
      <Sidebar screen={screen} setScreen={setScreen} />
      <div className="flex-1 flex flex-col">
        <Header
          streak={0}  // Placeholder until streak data is fetched
          level={0}  // Placeholder until level data is fetched
          points={0}  // Placeholder until points data is fetched
          onLogout={doLogout}
          onProfile={showProfile}
          onStreak={showStreak}
          profileData={profileData}
        />
        <main className={`flex-1 overflow-auto p-2 sm:p-4 ${getBgColor()}`}>
          {screen === 'home' && <HomeScreen selectedFile={selectedFile} handleFileChange={handleFileChange} uploadAndGenerate={uploadAndGenerate} generated={profileData} />}
          {screen === 'materials' && <MaterialsScreen />}
          {screen === 'trash' && <TrashScreenEmptyState />}
          {screen === 'exams' && <ExamsScreen />}
          {screen === 'explore' && <ExploreScreen />}
          {screen === 'rata' && <RataAIScreen />}
          {screen === 'profile' && <ProfileScreen onEditProfile={() => setScreen('edit-profile')} profileData={profileData} />}
          {screen === 'edit-profile' && <EditProfileScreen onBack={() => setScreen('profile')} profileData={profileData} fetchProfileData={fetchProfileData} />}
          {screen === 'streak' && <StreakScreen />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
