// contexts/materialsContext.jsx - Complete improved version

import React, { createContext, useCallback, useContext, useReducer, useEffect } from 'react';
import { 
  getMaterials, 
  getTrashedMaterials, 
  softDeleteMaterial, 
  toggleMaterialPin, 
  toggleMaterialVisibility,
  updateMaterial,
  restoreMaterial as restoreMaterialAPI,
  permanentDeleteMaterial
} from '../services/apiService';

// ✅ Action types
const MATERIALS_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_MATERIALS: 'SET_MATERIALS',
  SET_TRASHED_MATERIALS: 'SET_TRASHED_MATERIALS',
  ADD_MATERIAL: 'ADD_MATERIAL',
  UPDATE_MATERIAL: 'UPDATE_MATERIAL',
  REMOVE_MATERIAL: 'REMOVE_MATERIAL',
  MOVE_TO_TRASH: 'MOVE_TO_TRASH',
  RESTORE_MATERIAL: 'RESTORE_MATERIAL',
  REMOVE_FROM_TRASH: 'REMOVE_FROM_TRASH',
  BULK_REMOVE_FROM_TRASH: 'BULK_REMOVE_FROM_TRASH',
  SET_ERROR: 'SET_ERROR',
  SET_INITIALIZED: 'SET_INITIALIZED',
  SET_FETCHING: 'SET_FETCHING'
};

// ✅ Initial state
const initialState = {
  materials: [],
  trashedMaterials: [],
  loading: false,
  error: null,
  isInitialized: false,
  isFetching: false
};

// ✅ Reducer function
const materialsReducer = (state, action) => {
  switch (action.type) {
    case MATERIALS_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case MATERIALS_ACTIONS.SET_MATERIALS:
      return { 
        ...state, 
        materials: action.payload, 
        loading: false,
        isInitialized: true,
        isFetching: false
      };
    
    case MATERIALS_ACTIONS.SET_TRASHED_MATERIALS:
      return { ...state, trashedMaterials: action.payload };
    
    case MATERIALS_ACTIONS.SET_INITIALIZED:
      return { ...state, isInitialized: action.payload };
    
    case MATERIALS_ACTIONS.SET_FETCHING:
      return { ...state, isFetching: action.payload };
    
    case MATERIALS_ACTIONS.ADD_MATERIAL:
      return { 
        ...state, 
        materials: [action.payload, ...state.materials] 
      };
    
    case MATERIALS_ACTIONS.UPDATE_MATERIAL:
      return {
        ...state,
        materials: state.materials.map(material =>
          material.id === action.payload.id ? action.payload : material
        ),
        // Also update in trashed materials if it exists there
        trashedMaterials: state.trashedMaterials.map(material =>
          material.id === action.payload.id ? action.payload : material
        )
      };
    
    case MATERIALS_ACTIONS.REMOVE_MATERIAL:
      return {
        ...state,
        materials: state.materials.filter(material => material.id !== action.payload)
      };
    
    case MATERIALS_ACTIONS.MOVE_TO_TRASH:
      return {
        ...state,
        materials: state.materials.filter(material => material.id !== action.payload.id),
        trashedMaterials: [action.payload, ...state.trashedMaterials]
      };
    
    case MATERIALS_ACTIONS.RESTORE_MATERIAL:
      return {
        ...state,
        trashedMaterials: state.trashedMaterials.filter(material => material.id !== action.payload.id),
        materials: [action.payload, ...state.materials]
      };
    
    case MATERIALS_ACTIONS.REMOVE_FROM_TRASH:
      return {
        ...state,
        trashedMaterials: state.trashedMaterials.filter(material => material.id !== action.payload)
      };
    
    case MATERIALS_ACTIONS.BULK_REMOVE_FROM_TRASH:
      return {
        ...state,
        trashedMaterials: state.trashedMaterials.filter(
          material => !action.payload.includes(material.id)
        )
      };
    
    case MATERIALS_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false, isFetching: false };
    
    default:
      return state;
  }
};

// ✅ Create context
const materialsContext = createContext();

// ✅ Custom hook
export const useMaterials = () => {
  const context = useContext(materialsContext);
  if (!context) {
    throw new Error('useMaterials must be used within a MaterialsProvider');
  }
  return context;
};

// ✅ Provider component
export const MaterialsProvider = ({ children, onMaterialsChange }) => { // ✅ CHANGED: Accept onMaterialsChange prop
  const [state, dispatch] = useReducer(materialsReducer, initialState);

  // ✅ NEW: Helper function to notify when materials change
  const notifyMaterialsChange = useCallback(() => {
    if (onMaterialsChange) {
      onMaterialsChange();
    }
  }, [onMaterialsChange]);

  // ✅ Define fetchMaterials first (before useEffect)
  const fetchMaterials = useCallback(async () => {
    // Prevent duplicate fetches
    if (state.isFetching) return;
    
    try {
      dispatch({ type: MATERIALS_ACTIONS.SET_FETCHING, payload: true });
      dispatch({ type: MATERIALS_ACTIONS.SET_LOADING, payload: true });
      
      const [materialsResponse, trashedResponse] = await Promise.all([
        getMaterials(),
        getTrashedMaterials()
      ]);
      
      dispatch({ 
        type: MATERIALS_ACTIONS.SET_MATERIALS, 
        payload: materialsResponse?.data || [] 
      });
      dispatch({ 
        type: MATERIALS_ACTIONS.SET_TRASHED_MATERIALS, 
        payload: trashedResponse?.data || [] 
      });
      // Don't call notifyMaterialsChange here - this is just fetching, not changing
    } catch (error) {
      console.error('Error fetching materials:', error);
      dispatch({ type: MATERIALS_ACTIONS.SET_ERROR, payload: error.message });
    }
  }, [state.isFetching]);

  // ✅ Auto-initialization effect
  useEffect(() => {
    if (!state.isInitialized && !state.isFetching) {
      fetchMaterials();
    }
  }, [state.isInitialized, state.isFetching, fetchMaterials]);

  // ✅ All actions
  const actions = {
    fetchMaterials,

    addMaterial: useCallback((material) => {
      dispatch({ type: MATERIALS_ACTIONS.ADD_MATERIAL, payload: material });
      notifyMaterialsChange(); // ✅ ADDED: Notify after adding material
    }, [notifyMaterialsChange]),

    updateMaterial: useCallback((material) => {
      dispatch({ type: MATERIALS_ACTIONS.UPDATE_MATERIAL, payload: material });
      notifyMaterialsChange(); // ✅ ADDED: Notify after updating material
    }, [notifyMaterialsChange]),

    removeMaterial: useCallback((materialId) => {
      dispatch({ type: MATERIALS_ACTIONS.REMOVE_MATERIAL, payload: materialId });
      notifyMaterialsChange(); // ✅ ADDED: Notify after removing material
    }, [notifyMaterialsChange]),

    moveToTrash: useCallback(async (material, showToast) => {
      try {
        await softDeleteMaterial(material.id);
        const trashedMaterial = { ...material, status: 'trash' };
        dispatch({ type: MATERIALS_ACTIONS.MOVE_TO_TRASH, payload: trashedMaterial });
        notifyMaterialsChange(); // ✅ ADDED: Notify after moving to trash
        
        if (showToast) {
          showToast({
            variant: "success",
            title: "Material moved to trash",
            subtitle: `"${material.title}" has been moved to trash.`,
          });
        }
      } catch (error) {
        console.error('Error moving to trash:', error);
        if (showToast) {
          showToast({
            variant: "error",
            title: "Error moving to trash",
            subtitle: "Failed to move material to trash. Please try again.",
          });
        }
      }
    }, [notifyMaterialsChange]),

    // ✅ FIXED: restoreMaterial should call API
    restoreMaterial: useCallback(async (material, showToast) => {
      try {
        const response = await restoreMaterialAPI(material.id);
        dispatch({ type: MATERIALS_ACTIONS.RESTORE_MATERIAL, payload: response.data });
        notifyMaterialsChange(); // ✅ ADDED: Notify after restoring material
        
        if (showToast) {
          showToast({
            variant: "success",
            title: "Material restored",
            subtitle: `"${material.title}" has been restored.`,
          });
        }
      } catch (error) {
        console.error('Error restoring material:', error);
        if (showToast) {
          showToast({
            variant: "error",
            title: "Error restoring material",
            subtitle: "Failed to restore material. Please try again.",
          });
        }
      }
    }, [notifyMaterialsChange]),

    // ✅ FIXED: removeFromTrash should call API
    removeFromTrash: useCallback(async (material, showToast) => {
      try {
        await permanentDeleteMaterial(material.id);
        dispatch({ type: MATERIALS_ACTIONS.REMOVE_FROM_TRASH, payload: material.id });
        notifyMaterialsChange(); // ✅ ADDED: Notify after removing from trash
        
        if (showToast) {
          showToast({
            variant: "success",
            title: "Material permanently deleted",
            subtitle: `"${material.title}" has been permanently deleted.`,
          });
        }
      } catch (error) {
        console.error('Error permanently deleting material:', error);
        if (showToast) {
          showToast({
            variant: "error",
            title: "Error deleting material",
            subtitle: "Failed to permanently delete material. Please try again.",
          });
        }
      }
    }, [notifyMaterialsChange]),

    // ✅ FIXED: bulkRemoveFromTrash should call API
    bulkRemoveFromTrash: useCallback(async (materialIds, showToast) => {
      try {
        const promises = materialIds.map(id => permanentDeleteMaterial(id));
        await Promise.all(promises);
        
        dispatch({ type: MATERIALS_ACTIONS.BULK_REMOVE_FROM_TRASH, payload: materialIds });
        notifyMaterialsChange(); // ✅ ADDED: Notify after bulk removing from trash
        
        if (showToast) {
          showToast({
            variant: "success",
            title: "Materials permanently deleted",
            subtitle: `${materialIds.length} materials have been permanently deleted.`,
          });
        }
      } catch (error) {
        console.error('Error bulk deleting materials:', error);
        if (showToast) {
          showToast({
            variant: "error",
            title: "Error deleting materials",
            subtitle: "Failed to delete some materials. Please try again.",
          });
        }
      }
    }, [notifyMaterialsChange]),

    togglePin: useCallback(async (material, showToast, showLoading, hideLoading) => {
      try {
        if (showLoading) showLoading();
        
        const response = await toggleMaterialPin(material.id);
        dispatch({ type: MATERIALS_ACTIONS.UPDATE_MATERIAL, payload: response.data });
        notifyMaterialsChange(); // ✅ ADDED: Notify after toggling pin
        
        if (showToast) {
          showToast({
            variant: "success",
            title: response.data.pinned ? "Material pinned" : "Material unpinned",
            subtitle: `"${material.title}" has been ${response.data.pinned ? 'pinned' : 'unpinned'}.`,
          });
        }
      } catch (error) {
        console.error('Error toggling pin:', error);
        if (showToast) {
          showToast({
            variant: "error",
            title: "Error updating material",
            subtitle: "Failed to update pin status. Please try again.",
          });
        }
      } finally {
        if (hideLoading) hideLoading();
      }
    }, [notifyMaterialsChange]),

    toggleVisibility: useCallback(async (material, showToast, showLoading, hideLoading) => {
      try {
        if (showLoading) showLoading();
        
        const response = await toggleMaterialVisibility(material.id);
        dispatch({ type: MATERIALS_ACTIONS.UPDATE_MATERIAL, payload: response.data });
        notifyMaterialsChange(); // ✅ ADDED: Notify after toggling visibility
        
        if (showToast) {
          showToast({
            variant: "success",
            title: response.data.public ? "Material made public" : "Material made private",
            subtitle: `"${material.title}" is now ${response.data.public ? 'public' : 'private'}.`,
          });
        }
      } catch (error) {
        console.error('Error toggling visibility:', error);
        if (showToast) {
          showToast({
            variant: "error",
            title: "Error updating material",
            subtitle: "Failed to update visibility. Please try again.",
          });
        }
      } finally {
        if (hideLoading) hideLoading();
      }
    }, [notifyMaterialsChange]),

    updateMaterialInfo: useCallback(async (materialId, data, showToast, showLoading, hideLoading) => {
      try {
        if (showLoading) showLoading();
        
        const response = await updateMaterial(materialId, data);
        dispatch({ type: MATERIALS_ACTIONS.UPDATE_MATERIAL, payload: response.data });
        notifyMaterialsChange(); // ✅ ADDED: Notify after updating material info
        
        if (showToast) {
          showToast({
            variant: "success",
            title: "Material updated",
            subtitle: "Title and description have been updated successfully.",
          });
        }
        
        return response.data;
      } catch (error) {
        console.error('Error updating material:', error);
        if (showToast) {
          showToast({
            variant: "error",
            title: "Error updating material",
            subtitle: "Failed to update material. Please try again.",
          });
        }
        throw error;
      } finally {
        if (hideLoading) hideLoading();
      }
    }, [notifyMaterialsChange])
  };

  // ✅ Selectors
  const selectors = {
    getMaterialById: useCallback((id) => {
      return state.materials.find(material => material.id === parseInt(id));
    }, [state.materials]),

    getActiveMaterials: useCallback(() => {
      return state.materials.filter(material => material.status === 'active');
    }, [state.materials]),

    getPinnedMaterials: useCallback(() => {
      return state.materials.filter(material => material.pinned && material.status === 'active');
    }, [state.materials]),

    getUnpinnedMaterials: useCallback(() => {
      return state.materials.filter(material => !material.pinned && material.status === 'active');
    }, [state.materials])
  };

  const value = {
    // State
    materials: state.materials,
    trashedMaterials: state.trashedMaterials,
    loading: state.loading,
    error: state.error,
    isInitialized: state.isInitialized,
    isFetching: state.isFetching,
    
    // Actions
    ...actions,
    
    // Selectors
    ...selectors
  };

  return (
    <materialsContext.Provider value={value}>
      {children}
    </materialsContext.Provider>
  );
};

export default materialsContext;