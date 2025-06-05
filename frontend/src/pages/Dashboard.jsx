import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EditProfileScreen from '../components/EditProfileScreen';
import ExamsScreen from '../components/ExamsScreen';
import ExploreScreen from '../components/ExploreScreen';
import Header from '../components/Header';
import HomeScreen from '../components/HomeScreen';
import { useLoading } from '../components/Loading/LoadingContext';
import MaterialsScreen from '../components/MaterialsScreen';
import ProfileScreen from '../components/ProfileScreen';
import RataAIScreen from '../components/RataAIScreen';
import Sidebar from '../components/Sidebar';
import TrashScreen from '../components/TrashScreen';
import { getProfile, logout } from '../services/authService';
import { getMaterials, getTrashedMaterials } from '../services/apiService'; // Add these imports
import '../styles/pages/dashboard.css';

const Dashboard = () => {
  const [screen, setScreen] = useState('home');
  const [profileData, setProfileData] = useState(null);
  const [materialsData, setMaterialsData] = useState(null); // Add materials state
  const [trashedMaterialsData, setTrashedMaterialsData] = useState(null); // Add trashed materials
  const [selectedFile, setSelectedFile] = useState(null);
  const nav = useNavigate();

  const { showLoading, hideLoading } = useLoading();

 const fetchProfileData = async () => {
    try {
      const profile = await getProfile();
      setProfileData(profile);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  const fetchMaterialsData = async () => {
    try {
      const [materials, trashedMaterials] = await Promise.all([
        getMaterials(),
        getTrashedMaterials()
      ]);
      setMaterialsData(materials.data);
      setTrashedMaterialsData(trashedMaterials.data);
    } catch (error) {
      console.error('Error fetching materials data:', error);
      setMaterialsData([]);
      setTrashedMaterialsData([]);
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
      hideLoading();
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

  const updateMaterialWithNewContent = async (materialId, newContent, contentType) => {
  try {
    setMaterialsData(prevMaterials => 
      prevMaterials.map(material => {
        if (material.id === materialId) {
          const updatedMaterial = { ...material };
          
          switch (contentType) {
            case 'flashcard_set':
              updatedMaterial.flashcard_sets = [
                ...(material.flashcard_sets || []), 
                newContent
              ];
              break;
            // ... other cases
          }
          
          return updatedMaterial;
        }
        return material;
      })
    );
    
    console.log(`Added new ${contentType} to material ${materialId}:`, newContent);
  } catch (error) {
    console.error(`Error updating material with new ${contentType}:`, error);
  }
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

  // Show loading until all essential data is available
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
            />
          )}
          {screen === 'materials' && (
            <MaterialsScreen 
              materialsData={materialsData}
              onRefreshMaterials={fetchMaterialsData}
              onUpdateMaterial={updateMaterialInState}
              onAddMaterial={addMaterialToState}
              onRemoveMaterial={removeMaterialFromState}
              onMoveMaterialToTrash={moveMaterialToTrash}
            />
          )}
          {screen === 'trash' && (
            <TrashScreen 
              trashedMaterialsData={trashedMaterialsData}
              onRefreshTrashedMaterials={fetchMaterialsData}
              onRestoreMaterial={restoreMaterialFromTrash}
            />
          )}
          {screen === 'exams' && <ExamsScreen />}
          {screen === 'explore' && <ExploreScreen />}
          {screen === 'rata' && <RataAIScreen
              materialsData={materialsData}
           />}
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