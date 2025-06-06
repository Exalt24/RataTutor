// Dashboard.jsx - Pass profile refresh function to ExploreScreen

import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import EditProfileScreen from '../components/EditProfileScreen';
import ExploreScreen from '../components/ExploreScreen';
import Header from '../components/Header';
import HomeScreen from '../components/HomeScreen';
import { useLoading } from '../components/Loading/LoadingContext';
import MaterialsScreen from '../components/MaterialsScreen';
import ProfileScreen from '../components/ProfileScreen';
import RataAIScreen from '../components/RataAIScreen';
import Sidebar from '../components/Sidebar';
import TrashScreen from '../components/TrashScreen';
import { MaterialsProvider, useMaterials } from '../utils/materialsContext';
import { getProfile, logout } from '../services/authService';
import '../styles/pages/dashboard.css';

const Dashboard = () => {
  const [profileData, setProfileData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { showLoading, hideLoading } = useLoading();

  // Get current screen from URL path
  const getCurrentScreen = () => {
    const path = location.pathname.replace('/dashboard', '') || '/';
    const segments = path.split('/').filter(Boolean);
    return segments[0] || 'home';
  };

  const currentScreen = getCurrentScreen();

  const fetchProfileData = async () => {
    try {
      const profile = await getProfile();
      setProfileData(profile || {});
    } catch (error) {
      console.error('❌ Error fetching profile data:', error);
      setProfileData({});
    }
  };

  const fetchAllData = async () => {
    try {
      await fetchProfileData();
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
    }
  };

  // ✅ Function to refresh profile after material actions
  const refreshProfileAfterAction = async () => {
    setTimeout(async () => {
      try {
        console.log('🔄 Dashboard: Refreshing profile data...') // Debug log
        await fetchProfileData();
        console.log('✅ Dashboard: Profile data refreshed') // Debug log
      } catch (error) {
        console.error('❌ Error refreshing profile after action:', error);
      }
    }, 500); // ✅ INCREASED: Even longer delay for copy actions
  };

  const fetchInitialData = async () => {
    try {
      await fetchProfileData();
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    showLoading();
    fetchInitialData();
  }, []);

  // Navigation functions
  const setScreen = (screenName) => {
    navigate(`/dashboard/${screenName}`);
  };

  const doLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const showProfile = () => {
    navigate('/dashboard/profile');
  };
  
  const showStreak = () => {
    navigate('/dashboard/streak');
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const uploadAndGenerate = async (type) => {
    if (!selectedFile) return alert('Please select a file first');
    // Your generate logic
  };

  // Navigation handler for HomeScreen
  const handleNavigateToMaterial = (material) => {
    navigate(`/dashboard/materials/${material.id}`);
  };
  
  const getBgColor = () => {
    switch (currentScreen) {
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

  const isLoading = profileData === null;

  return isLoading ? (
    <div className="flex justify-center items-center h-screen"></div>
  ) : (
    <MaterialsProvider onMaterialsChange={refreshProfileAfterAction}>
      <div className="flex h-screen text-xs sm:text-sm">
        <Sidebar screen={currentScreen} setScreen={setScreen} />
        <div className="flex-1 flex flex-col">
          <Header
            onLogout={doLogout}
            onProfile={showProfile}
            onStreak={showStreak}
            profileData={profileData}
          />
          <main className={`flex-1 overflow-auto p-2 sm:p-4 ${getBgColor()}`}>
            <Routes>
              {/* Default route redirects to home */}
              <Route path="/" element={<Navigate to="/dashboard/home" replace />} />
              
              {/* Home Screen */}
              <Route 
                path="/home" 
                element={
                  <HomeScreenWrapper 
                    selectedFile={selectedFile} 
                    handleFileChange={handleFileChange} 
                    uploadAndGenerate={uploadAndGenerate} 
                    generated={profileData}
                    onRefreshMaterials={fetchAllData} 
                    onNavigateToMaterial={handleNavigateToMaterial}
                  />
                } 
              />
              
              {/* Materials Screen with nested routes */}
              <Route 
                path="/materials/*" 
                element={<MaterialsScreen onRefreshProfile={refreshProfileAfterAction} />} 
              />
              
              {/* Trash Screen */}
              <Route 
                path="/trash" 
                element={<TrashScreenWrapper onRefreshMaterials={fetchAllData} />} 
              />
              
              {/* Explore Screen - ✅ CHANGED: Pass profile refresh function */}
              <Route 
                path="/explore" 
                element={<ExploreScreen onRefreshProfile={refreshProfileAfterAction} />} 
              />
              
              {/* Rata AI Screen */}
              <Route 
                path="/rata" 
                element={<RataAIScreenWrapper />} 
              />
              
              {/* Profile Screen */}
              <Route 
                path="/profile" 
                element={
                  <ProfileScreen 
                    onEditProfile={() => navigate('/dashboard/edit-profile')} 
                    profileData={profileData} 
                  />
                } 
              />
              
              {/* Edit Profile Screen */}
              <Route 
                path="/edit-profile" 
                element={
                  <EditProfileScreen 
                    onBack={() => navigate('/dashboard/profile')} 
                    profileData={profileData} 
                    fetchProfileData={fetchProfileData} 
                  />
                } 
              />
              
              {/* Streak Screen */}
              <Route 
                path="/streak" 
                element={
                  <div className="p-4">
                    <h1>Streak Screen</h1>
                    <p>Your streak information will go here.</p>
                  </div>
                } 
              />
              
              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </MaterialsProvider>
  );
};

// Keep all wrapper components exactly the same...
const HomeScreenWrapper = ({ 
  selectedFile, 
  handleFileChange, 
  uploadAndGenerate, 
  generated, 
  onRefreshMaterials, 
  onNavigateToMaterial 
}) => {
  const { 
    materials, 
    fetchMaterials, 
    addMaterial, 
    updateMaterial, 
    isInitialized, 
    isFetching 
  } = useMaterials();

  return (
    <HomeScreen 
      selectedFile={selectedFile} 
      handleFileChange={handleFileChange} 
      uploadAndGenerate={uploadAndGenerate} 
      generated={generated}
      materialsData={materials}
      onRefreshMaterials={() => {
        fetchMaterials();
        onRefreshMaterials();
      }}
      onAddMaterial={addMaterial}
      onUpdateMaterial={updateMaterial}
      onNavigateToMaterial={onNavigateToMaterial}
    />
  );
};

const TrashScreenWrapper = ({ onRefreshMaterials }) => {
  const { 
    trashedMaterials, 
    fetchMaterials,
    restoreMaterial, 
    removeFromTrash, 
    bulkRemoveFromTrash,
    isInitialized,
    isFetching
  } = useMaterials();

  return (
    <TrashScreen 
      trashedMaterialsData={trashedMaterials}
      onRefreshMaterials={() => {
        fetchMaterials();
        onRefreshMaterials();
      }}
      onRestoreMaterial={restoreMaterial}
      onRemoveMaterial={removeFromTrash}
      onRemoveMaterials={bulkRemoveFromTrash}
    />
  );
};

const RataAIScreenWrapper = () => {
  const { 
    materials, 
    fetchMaterials, 
    isInitialized, 
    isFetching 
  } = useMaterials();

  return <RataAIScreen materialsData={materials} />;
};

export default Dashboard;