import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EditProfileScreen from '../components/EditProfileScreen';
import ExamsScreen from '../components/ExamsScreen';
import ExploreScreen from '../components/ExploreScreen';
import Header from '../components/Header';
import HomeScreen from '../components/HomeScreen';
import { useLoading } from '../components/Loading/LoadingContext'; // Import LoadingContext
import MaterialsScreen from '../components/MaterialsScreen';
import ProfileScreen from '../components/ProfileScreen';
import RataAIScreen from '../components/RataAIScreen';
import Sidebar from '../components/Sidebar';
import StreakScreen from '../components/StreakScreen';
import TrashScreen from '../components/TrashScreen';
import { getProfile, logout } from '../services/authService';
import '../styles/pages/dashboard.css';

const Dashboard = () => {
  const [screen, setScreen] = useState('home');
  const [profileData, setProfileData] = useState(null);  // Start with null to show loading
  const [selectedFile, setSelectedFile] = useState(null);
  const nav = useNavigate();

  const { showLoading, hideLoading } = useLoading();  // Trigger loading state

  // Fetch profile data once when the Dashboard component mounts
  const fetchProfileData = async () => {
    try {
      const profile = await getProfile();
      setProfileData(profile);  // Set profile data here
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      hideLoading();  // Hide loading spinner after the data is fetched
    }
  };

  useEffect(() => {
    // Show the loading spinner when the component mounts
    showLoading();

    const savedScreen = localStorage.getItem('currentScreen');
    if (savedScreen) {
      setScreen(savedScreen); // Set the screen to the stored screen name
    }
    // Fetch profile data on component mount
    fetchProfileData();

    // Retrieve stored screen name from localStorage if available
    
  }, []);  // Empty dependency array means this runs only once on component mount

  useEffect(() => {
    // Store the current screen in localStorage whenever it changes
    localStorage.setItem('currentScreen', screen);
  }, [screen]);  // Only trigger when `screen` changes

  // Handle Logout
  const doLogout = () => {
    logout();
    nav('/login', { replace: true });
  };

  // Change screen and show loading spinner
  const showProfile = () => {
    setScreen('profile');
  };
  const showStreak = () => {
    setScreen('streak');
  };

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

  return (
    // Show loading until profileData is available
    profileData === null ? (
      <div className="flex justify-center items-center h-screen"></div>
    ) : (
      // Once profileData is available, render the entire dashboard layout
      <div className="flex h-screen text-xs sm:text-sm">
        <Sidebar screen={screen} setScreen={setScreen} />
        <div className="flex-1 flex flex-col">
          <Header
            onLogout={doLogout}
            onProfile={showProfile}
            onStreak={showStreak}
            profileData={profileData}
          />
          <main className={`flex-1 overflow-auto p-2 sm:p-4 ${getBgColor()}`}>
            {/* Render each screen based on the selected screen */}
            {screen === 'home' && <HomeScreen selectedFile={selectedFile} handleFileChange={handleFileChange} uploadAndGenerate={uploadAndGenerate} generated={profileData} />}
            {screen === 'materials' && <MaterialsScreen />}
            {screen === 'trash' && <TrashScreen />}
            {screen === 'exams' && <ExamsScreen />}
            {screen === 'explore' && <ExploreScreen />}
            {screen === 'rata' && <RataAIScreen />}
            {screen === 'profile' && <ProfileScreen onEditProfile={() => setScreen('edit-profile')} profileData={profileData} />}
            {screen === 'edit-profile' && <EditProfileScreen onBack={() => setScreen('profile')} profileData={profileData} fetchProfileData={fetchProfileData} />}
            {screen === 'streak' && <StreakScreen profileData={profileData} />}
          </main>
        </div>
      </div>
    )
  );
};

export default Dashboard;
