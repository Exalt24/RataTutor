import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { getMaterials, getTrashedMaterials } from '../services/apiService';
import { getProfile, logout } from '../services/authService';
import '../styles/pages/dashboard.css';

const Dashboard = () => {
  const [screen, setScreen] = useState('home');
  const [profileData, setProfileData] = useState(null);
  const [materialsData, setMaterialsData] = useState(null);
  const [trashedMaterialsData, setTrashedMaterialsData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // ✅ NEW: Material view navigation state
  const [materialToView, setMaterialToView] = useState(null);
  
  const nav = useNavigate();

  const { showLoading, hideLoading } = useLoading();

  const fetchProfileData = async () => {
    try {
      const profile = await getProfile();
      setProfileData(profile || {});
    } catch (error) {
      console.error('❌ Error fetching profile data:', error);
      setProfileData({}); // Fallback to empty object
    }
  };

  const fetchMaterialsData = async () => {
    try {
      const [materials, trashedMaterials] = await Promise.all([
        getMaterials(),
        getTrashedMaterials()
      ]);
      
      // Ensure we always have arrays
      setMaterialsData(materials?.data || []);
      setTrashedMaterialsData(trashedMaterials?.data || []);
    } catch (error) {
      console.error('Error fetching materials data:', error);
      setMaterialsData([]);
      setTrashedMaterialsData([]);
    }
  };

  const fetchAllData = async () => {
    try {
      console.trace('🔍 Call stack for fetchAllData:');
      
      await Promise.all([
        fetchMaterialsData(), // Refresh materials 
        fetchProfileData()    // Refresh profile
      ]);
      
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
    }
  };

  const fetchInitialData = async () => {
    try {
      await Promise.all([
        fetchProfileData(),
        fetchMaterialsData()
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      hideLoading(); // Use your existing loading context
    }
  };

  useEffect(() => {
    showLoading();
    
    const savedScreen = localStorage.getItem('currentScreen');
    if (savedScreen) {
      setScreen(savedScreen);
    }
    
    fetchInitialData();
  }, []);

  useEffect(() => {
    localStorage.setItem('currentScreen', screen);
  }, [screen]);

  // Handle Logout
  const doLogout = () => {
    logout();
    nav('/login', { replace: true });
  };

  // Screen navigation
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
    // Your generate logic
  };

  // Helper function to update a specific material in the state
  const updateMaterialInState = (updatedMaterial) => {
    setMaterialsData(prevMaterials => 
      prevMaterials.map(material => 
        material.id === updatedMaterial.id ? updatedMaterial : material
      )
    );
  };

  // Helper function to add a new material to state
  const addMaterialToState = (newMaterial) => {
    setMaterialsData(prevMaterials => [newMaterial, ...prevMaterials]);
  };

  // Helper function to remove material from state (when deleted or trashed)
  const removeMaterialFromState = (materialId) => {
    setMaterialsData(prevMaterials => 
      prevMaterials.filter(material => material.id !== materialId)
    );
  };

  // Helper function to move material to trash
  const moveMaterialToTrash = (material) => {
    removeMaterialFromState(material.id);
    setTrashedMaterialsData(prevTrashed => [material, ...prevTrashed]);
  };

  // Helper function to restore material from trash
  const restoreMaterialFromTrash = (material) => {
    setTrashedMaterialsData(prevTrashed => 
      prevTrashed.filter(m => m.id !== material.id)
    );
    setMaterialsData(prevMaterials => [material, ...prevMaterials]);
  };

  const removeMaterialFromTrash = (materialId) => {
    setTrashedMaterialsData(prevTrashed => 
      prevTrashed.filter(material => material.id !== materialId)
    );
  };

  // Helper function to remove multiple materials from trash
  const removeMaterialsFromTrash = (materialIds) => {
    setTrashedMaterialsData(prevTrashed => 
      prevTrashed.filter(material => !materialIds.includes(material.id))
    );
  };

  // ✅ NEW: Navigation handler for HomeScreen
  const handleNavigateToMaterial = (material) => {
    // Store material for MaterialsScreen to pick up
    setMaterialToView(material);
    // Navigate to materials screen
    setScreen('materials');
  };

  // ✅ NEW: Clear material view state
  const handleMaterialViewed = () => {
    setMaterialToView(null);
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

  // Fixed loading logic - use OR instead of AND
  const isLoading = profileData === null || materialsData === null;

  return isLoading ? (
    <div className="flex justify-center items-center h-screen"></div>
  ) : (
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
          {screen === 'home' && (
            <HomeScreen 
              selectedFile={selectedFile} 
              handleFileChange={handleFileChange} 
              uploadAndGenerate={uploadAndGenerate} 
              generated={profileData}
              materialsData={materialsData}
              onRefreshMaterials={fetchAllData} 
              onAddMaterial={addMaterialToState}
              onUpdateMaterial={updateMaterialInState}
              onNavigateToMaterial={handleNavigateToMaterial}
            />
          )}
          {screen === 'materials' && (
            <MaterialsScreen 
              materialsData={materialsData}
              onRefreshMaterials={fetchAllData}
              onUpdateMaterial={updateMaterialInState}
              onAddMaterial={addMaterialToState}
              onRemoveMaterial={removeMaterialFromState}
              onMoveMaterialToTrash={moveMaterialToTrash}
              materialToView={materialToView}
              onMaterialViewed={handleMaterialViewed}
            />
          )}
          {screen === 'trash' && (
            <TrashScreen 
              trashedMaterialsData={trashedMaterialsData}
              onRefreshMaterials={fetchAllData}
              onRestoreMaterial={restoreMaterialFromTrash}
              onRemoveMaterial={removeMaterialFromTrash}
              onRemoveMaterials={removeMaterialsFromTrash}
            />
          )}
          {screen === 'explore' && (
            <ExploreScreen onRefreshMaterials={fetchMaterialsData} />
          )}
          {screen === 'rata' && (
            <RataAIScreen materialsData={materialsData} />
          )}
          {screen === 'profile' && (
            <ProfileScreen 
              onEditProfile={() => setScreen('edit-profile')} 
              profileData={profileData} 
            />
          )}
          {screen === 'edit-profile' && (
            <EditProfileScreen 
              onBack={() => setScreen('profile')} 
              profileData={profileData} 
              fetchProfileData={fetchProfileData} 
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;