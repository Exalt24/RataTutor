// MaterialsScreen.jsx - Optimized for improved materialsContext

import { ChevronDown, FileQuestion, Folder, Pin, Search, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { useLoading } from '../components/Loading/LoadingContext';
import { useToast } from '../components/Toast/ToastContext';
import { useMaterials } from '../utils/materialsContext';
import { useFileUpload } from '../utils/useFileUpload';
import CreateFlashcards from './CreateFlashcards';
import CreateMaterialModal from './CreateMaterialModal';
import CreateNotes from './CreateNotes';
import CreateQuiz from './CreateQuiz';
import DeleteModal from './DeleteModal';
import MaterialCard from './MaterialCard';
import MaterialContent from './MaterialContent';
import ViewFlashcards from './ViewFlashcards';
import ViewNotes from './ViewNotes';
import ViewQuiz from './ViewQuiz';

// ✅ Filter configuration
const FILTER_CONFIG = {
  time: {
    all: () => true,
    today: (material) => {
      const updatedAgo = formatTimeAgo(material.updated_at);
      return updatedAgo.includes('h ago') || updatedAgo.includes('m ago');
    },
    week: (material) => {
      const updatedAgo = formatTimeAgo(material.updated_at);
      const dayMatch = updatedAgo.match(/(\d+)d ago/);
      return dayMatch ? parseInt(dayMatch[1]) <= 7 : updatedAgo.includes('h ago') || updatedAgo.includes('m ago');
    },
    month: (material) => {
      const updatedAgo = formatTimeAgo(material.updated_at);
      const dayMatch = updatedAgo.match(/(\d+)d ago/);
      return dayMatch ? parseInt(dayMatch[1]) <= 30 : updatedAgo.includes('h ago') || updatedAgo.includes('m ago');
    }
  },
  type: {
    all: () => true,
    flashcards: (material) => material.flashcard_sets?.length > 0,
    notes: (material) => material.notes?.length > 0,
    quizzes: (material) => material.quizzes?.length > 0
  }
};

// ✅ Utility functions
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  } else {
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }
};

const getTagColor = (tag) => {
  if (tag.toLowerCase().includes('flashcard set')) {
    return 'bg-[#FFB3BA] text-[#7D1F1F]';
  } else if (tag.toLowerCase().includes('note')) {
    return 'bg-[#BAFFC9] text-[#1F7D2F]';
  } else if (tag.toLowerCase().includes('quiz')) {
    return 'bg-[#BAE1FF] text-[#1F4B7D]';
  } else if (tag.toLowerCase().includes('files') || tag.toLowerCase().includes('attachment')) {
    return 'bg-[#FFE4B3] text-[#7D4F1F]';
  }
  return 'bg-[#F0F0F0] text-[#4A4A4A]';
};

const getUpdatedLabel = (dateString) => {
  const timeAgo = formatTimeAgo(dateString);
  
  if (timeAgo.includes('m ago') || timeAgo.includes('h ago')) {
    return 'Updated today';
  } else if (timeAgo.includes('d ago')) {
    const days = parseInt(timeAgo);
    if (days <= 7) {
      return 'Updated this week';
    } else if (days <= 30) {
      return 'Updated this month';
    }
  }
  return `Updated ${timeAgo}`;
};

// ✅ Custom hook for search and filters
const useFilters = (materials) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');

  const filteredMaterials = useMemo(() => {
    return materials.filter(material => {
      const matchesSearch = 
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTime = FILTER_CONFIG.time[selectedTimeFilter](material);
      const matchesType = FILTER_CONFIG.type[selectedTypeFilter](material);
      
      return material.status === 'active' && matchesSearch && matchesTime && matchesType;
    });
  }, [materials, searchQuery, selectedTimeFilter, selectedTypeFilter]);

  const pinnedMaterials = useMemo(() => 
    filteredMaterials.filter(m => m.pinned), [filteredMaterials]
  );
  
  const otherMaterials = useMemo(() => 
    filteredMaterials.filter(m => !m.pinned), [filteredMaterials]
  );

  return {
    searchQuery,
    setSearchQuery,
    selectedTimeFilter,
    setSelectedTimeFilter,
    selectedTypeFilter,
    setSelectedTypeFilter,
    filteredMaterials,
    pinnedMaterials,
    otherMaterials
  };
};

// ✅ Empty state component
const EmptyState = React.memo(() => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-12">
    <FileQuestion size={64} className="text-[#1b81d4] mb-6" />
    <h3 className="label-text text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
      No Materials Yet
    </h3>
    <p className="text-gray-600 text-center max-w-md leading-relaxed mb-6">
      Create your first material to start organizing your study content. You can add flashcards, notes, and quizzes to help you learn effectively.
    </p>
  </div>
));

EmptyState.displayName = 'EmptyState';

// ✅ Dropdown component
const FilterDropdown = React.memo(({ 
  title, 
  isOpen, 
  onToggle, 
  options, 
  selectedValue, 
  onSelect,
  dropdownRef 
}) => (
  <div className="relative" ref={dropdownRef}>
    <button 
      className="exam-button-mini py-1 px-2"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-haspopup="true"
    >
      <span className="flex items-center">
        {title}
        <ChevronDown size={12} className={`ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </span>
    </button>
    {isOpen && (
      <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
        {options.map(({ value, label }) => (
          <button
            key={value}
            className={`label-text w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
              selectedValue === value ? 'text-blue-600' : 'text-gray-700'
            }`}
            onClick={() => onSelect(value)}
          >
            {label}
          </button>
        ))}
      </div>
    )}
  </div>
));

FilterDropdown.displayName = 'FilterDropdown';

// ✅ Search component
const SearchInput = React.memo(({ searchQuery, onSearchChange, onClear }) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <div className="relative w-full sm:w-auto sm:max-w-md">
      <div className={`
        relative flex items-center transition-all duration-200
        ${isSearchFocused ? 'ring-1 ring-[#1b81d4]' : ''}
        rounded-full border border-gray-200 bg-white
      `}>
        <Search 
          className={`
            absolute left-4 transition-colors duration-200
            ${isSearchFocused ? 'text-[#1b81d4]' : 'text-gray-400'}
          `} 
          size={20} 
        />
        <input
          type="text"
          placeholder="Search your materials..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className="label-text w-full pl-12 pr-12 py-2 border border-[#7BA7CC] rounded-full focus:outline-none text-sm"
        />
        {searchQuery && (
          <button
            onClick={onClear}
            className="absolute right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Clear search"
          >
            <X size={16} className="text-gray-400" />
          </button>
        )}
      </div>
      {searchQuery && (
        <p className="mt-1 text-xs text-gray-500">
          Found {searchQuery ? 'results based on your search' : 'no results'}
        </p>
      )}
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

// ✅ OPTIMIZED: MaterialsList component
const MaterialsList = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { showLoading, hideLoading } = useLoading();
  const { 
    materials, 
    fetchMaterials, 
    addMaterial, 
    updateMaterial: updateMaterialInState,
    togglePin, 
    toggleVisibility, 
    moveToTrash,
    isInitialized,
    isFetching
  } = useMaterials();
  
  const {
    searchQuery,
    setSearchQuery,
    selectedTimeFilter,
    setSelectedTimeFilter,
    selectedTypeFilter,
    setSelectedTypeFilter,
    filteredMaterials,
    pinnedMaterials,
    otherMaterials
  } = useFilters(materials);

  // File upload hook
  const { FileInput, triggerFileSelect, createFileSelectHandler } = useFileUpload();
  
  // UI state
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showUpdatedDropdown, setShowUpdatedDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // Refs for dropdowns
  const typeDropdownRef = useRef(null);
  const updatedDropdownRef = useRef(null);

  // ✅ Dropdown options
  const timeFilterOptions = [
    { value: 'all', label: 'All time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Last week' },
    { value: 'month', label: 'Last month' }
  ];

  const typeFilterOptions = [
    { value: 'all', label: 'All types' },
    { value: 'flashcards', label: 'Flashcards' },
    { value: 'notes', label: 'Notes' },
    { value: 'quizzes', label: 'Quizzes' }
  ];

  // ✅ Effect for clicking outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setShowTypeDropdown(false);
      }
      if (updatedDropdownRef.current && !updatedDropdownRef.current.contains(event.target)) {
        setShowUpdatedDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Navigation handlers
  const handleCreateFlashcards = useCallback((material, existingFlashcardSet = null) => {
    const url = existingFlashcardSet 
      ? `/dashboard/materials/${material.id}/flashcards/${existingFlashcardSet.id}/edit`
      : `/dashboard/materials/${material.id}/flashcards/create`;
    navigate(url);
  }, [navigate]);

  const handleCreateNotes = useCallback((material, existingNote = null) => {
    const url = existingNote 
      ? `/dashboard/materials/${material.id}/notes/${existingNote.id}/edit`
      : `/dashboard/materials/${material.id}/notes/create`;
    navigate(url);
  }, [navigate]);

  const handleCreateQuiz = useCallback((material, existingQuiz = null) => {
    const url = existingQuiz 
      ? `/dashboard/materials/${material.id}/quiz/${existingQuiz.id}/edit`
      : `/dashboard/materials/${material.id}/quiz/create`;
    navigate(url);
  }, [navigate]);

  const handleViewMaterial = useCallback((material) => {
    navigate(`/dashboard/materials/${material.id}`);
  }, [navigate]);

  // ✅ Action handlers using context
  const handlePinToggle = useCallback((material) => {
    togglePin(material, showToast, showLoading, hideLoading);
  }, [togglePin, showToast, showLoading, hideLoading]);

  const handleVisibilityToggle = useCallback((material) => {
    toggleVisibility(material, showToast, showLoading, hideLoading);
  }, [toggleVisibility, showToast, showLoading, hideLoading]);

  const handleDelete = useCallback((material) => {
    setMaterialToDelete(material);
    setDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (materialToDelete) {
      await moveToTrash(materialToDelete, showToast);
      setDeleteModalOpen(false);
      setMaterialToDelete(null);
    }
  }, [materialToDelete, moveToTrash, showToast]);

  const handleCreateMaterial = useCallback((newMaterial) => {
    addMaterial(newMaterial);
  }, [addMaterial]);

  // ✅ OPTIMIZED: Show loading state if not initialized yet
  if (!isInitialized && isFetching) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading materials...</p>
        </div>
      </div>
    );
  }

  // ✅ Render
  return (
    <>
      {/* File input for upload */}
      <FileInput 
        onFileSelect={createFileSelectHandler(
          selectedMaterial?.id, 
          selectedMaterial?.title, 
          fetchMaterials
        )}
      />

      {/* Search and Filter UI */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 text-xs sm:text-sm p-4">
        <SearchInput
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />
        
        <div className="flex flex-wrap gap-2">
          <button 
            className="exam-button-mini py-1 px-2"
            onClick={() => setShowCreateModal(true)}
          >
            Create Material
          </button>
          
          <button 
            className="exam-button-mini py-1 px-2"
            onClick={fetchMaterials}
            disabled={isFetching}
          >
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </button>
          
          <FilterDropdown
            title="Type"
            isOpen={showTypeDropdown}
            onToggle={() => setShowTypeDropdown(!showTypeDropdown)}
            options={typeFilterOptions}
            selectedValue={selectedTypeFilter}
            onSelect={(value) => {
              setSelectedTypeFilter(value);
              setShowTypeDropdown(false);
            }}
            dropdownRef={typeDropdownRef}
          />
          
          <FilterDropdown
            title="Updated"
            isOpen={showUpdatedDropdown}
            onToggle={() => setShowUpdatedDropdown(!showUpdatedDropdown)}
            options={timeFilterOptions}
            selectedValue={selectedTimeFilter}
            onSelect={(value) => {
              setSelectedTimeFilter(value);
              setShowUpdatedDropdown(false);
            }}
            dropdownRef={updatedDropdownRef}
          />
        </div>
      </div>

      {/* Materials Display */}
      {filteredMaterials.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Pinned Materials */}
          {pinnedMaterials.length > 0 && (
            <div className="mb-6 px-4">
              <h2 className="exam-subheading sm:text-sm flex items-center gap-2">
                <Pin size={18} className="text-[#FF6B6B]" />
                Pinned
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pinnedMaterials.map((material) => (
                  <MaterialCard
                    key={material.id}
                    file={material}
                    isPinned={true}
                    onPinToggle={() => handlePinToggle(material)}
                    onVisibilityToggle={() => handleVisibilityToggle(material)}
                    onDelete={() => handleDelete(material)}
                    isPublic={material.public}
                    getTagColor={getTagColor}
                    getUpdatedLabel={getUpdatedLabel}
                    onCreateFlashcards={handleCreateFlashcards}
                    onCreateNotes={handleCreateNotes}
                    onCreateQuiz={handleCreateQuiz}
                    onViewMaterial={handleViewMaterial}
                    timeAgo={formatTimeAgo(material.updated_at)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other Materials */}
          {otherMaterials.length > 0 && (
            <div className='px-4'>
              <h2 className="exam-subheading sm:text-sm flex items-center gap-2">
                <Folder size={18} className="text-[#4ECDC4]" />
                All Materials
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherMaterials.map((material) => (
                  <MaterialCard
                    key={material.id}
                    file={material}
                    isPinned={false}
                    onPinToggle={() => handlePinToggle(material)}
                    onVisibilityToggle={() => handleVisibilityToggle(material)}
                    onDelete={() => handleDelete(material)}
                    isPublic={material.public}
                    getTagColor={getTagColor}
                    getUpdatedLabel={getUpdatedLabel}
                    onCreateFlashcards={handleCreateFlashcards}
                    onCreateNotes={handleCreateNotes}
                    onCreateQuiz={handleCreateQuiz}
                    onViewMaterial={handleViewMaterial}
                    timeAgo={formatTimeAgo(material.updated_at)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <CreateMaterialModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleCreateMaterial}
        onRefreshMaterials={fetchMaterials} 
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setMaterialToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Material"
        message={`Are you sure you want to delete "${materialToDelete?.title}"? This action cannot be undone.`}
      />
    </>
  );
};

// ✅ UPDATED: MaterialContentWrapper - accept and pass onRefreshProfile
const MaterialContentWrapper = ({ onRefreshProfile }) => {
  const { materialId } = useParams();
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const { showToast } = useToast();
  const { 
    getMaterialById, 
    updateMaterial: updateMaterialInState,
    fetchMaterials,
    toggleVisibility,
    updateMaterialInfo,
    isInitialized
  } = useMaterials();
  
  const material = getMaterialById(materialId);

  // ✅ Better loading state
  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading material...</p>
        </div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="p-4">
        <button 
          onClick={() => navigate('/dashboard/materials')}
          className="exam-button-mini mb-4"
        >
          ← Back to Materials
        </button>
        <p>Material not found</p>
      </div>
    );
  }

  const handleTitleChange = async (newTitle, newDescription) => {
    try {
      await updateMaterialInfo(
        material.id, 
        { title: newTitle, description: newDescription },
        showToast,
        showLoading,
        hideLoading
      );
    } catch (err) {
      throw err;
    }
  };

  const handleVisibilityToggle = () => {
    toggleVisibility(material, showToast, showLoading, hideLoading);
  };

  const handleCreateFlashcards = (material, existingFlashcardSet = null) => {
    const url = existingFlashcardSet 
      ? `/dashboard/materials/${material.id}/flashcards/${existingFlashcardSet.id}/edit`
      : `/dashboard/materials/${material.id}/flashcards/create`;
    navigate(url);
  };

  const handleCreateNotes = (material, existingNote = null) => {
    const url = existingNote 
      ? `/dashboard/materials/${material.id}/notes/${existingNote.id}/edit`
      : `/dashboard/materials/${material.id}/notes/create`;
    navigate(url);
  };

  const handleCreateQuiz = (material, existingQuiz = null) => {
    const url = existingQuiz 
      ? `/dashboard/materials/${material.id}/quiz/${existingQuiz.id}/edit`
      : `/dashboard/materials/${material.id}/quiz/create`;
    navigate(url);
  };

  const handleViewFlashcards = (material, flashcardSet) => {
    navigate(`/dashboard/materials/${material.id}/flashcards/${flashcardSet.id}/view`);
  };

  const handleViewNotes = (material, note) => {
    navigate(`/dashboard/materials/${material.id}/notes/${note.id}/view`);
  };

  const handleViewQuiz = (material, quiz) => {
    navigate(`/dashboard/materials/${material.id}/quiz/${quiz.id}/view`);
  };

  return (
    <MaterialContent
      material={material}
      isPublic={material.public}
      onBack={() => navigate('/dashboard/materials')}
      onTitleChange={handleTitleChange}
      onMaterialUpdate={updateMaterialInState}
      onVisibilityToggle={handleVisibilityToggle}
      onRefreshMaterials={fetchMaterials}
      onCreateFlashcards={handleCreateFlashcards}
      onCreateNotes={handleCreateNotes}
      onCreateQuiz={handleCreateQuiz}
      onViewFlashcards={handleViewFlashcards}
      onViewNotes={handleViewNotes}
      onViewQuiz={handleViewQuiz}
      readOnly={false}
    />
  );
};

// ✅ OPTIMIZED: View wrapper components
const ViewFlashcardsWrapper = () => {
  const { materialId, flashcardSetId } = useParams();
  const navigate = useNavigate();
  const { getMaterialById, fetchMaterials, isInitialized } = useMaterials();
  
  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  const material = getMaterialById(materialId);
  const flashcardSet = flashcardSetId ? 
    material?.flashcard_sets?.find(fs => fs.id === parseInt(flashcardSetId)) : null;

  if (!material || !flashcardSet) {
    return <Navigate to="/dashboard/materials" replace />;
  }

  return (
    <ViewFlashcards
      mainMaterial={material}
      material={flashcardSet}
      onClose={() => navigate(`/dashboard/materials/${material.id}`)}
      readOnly={false}
      onSuccess={fetchMaterials}
      onEdit={(flashcardSet) => {
        navigate(`/dashboard/materials/${material.id}/flashcards/${flashcardSet.id}/edit`);
      }}
    />
  );
};

const ViewNotesWrapper = () => {
  const { materialId, noteId } = useParams();
  const navigate = useNavigate();
  const { getMaterialById, fetchMaterials, isInitialized } = useMaterials();
  
  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  const material = getMaterialById(materialId);
  const note = noteId ? 
    material?.notes?.find(note => note.id === parseInt(noteId)) : null;

  if (!material || !note) {
    return <Navigate to="/dashboard/materials" replace />;
  }

  return (
    <ViewNotes
      mainMaterial={material}
      material={note}
      onClose={() => navigate(`/dashboard/materials/${material.id}`)}
      readOnly={false}
      onSuccess={fetchMaterials}
      onEdit={(note) => {
        navigate(`/dashboard/materials/${material.id}/notes/${note.id}/edit`);
      }}
    />
  );
};

const ViewQuizWrapper = () => {
  const { materialId, quizId } = useParams();
  const navigate = useNavigate();
  const { getMaterialById, fetchMaterials, isInitialized } = useMaterials();
  
  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  const material = getMaterialById(materialId);
  const quiz = quizId ? 
    material?.quizzes?.find(quiz => quiz.id === parseInt(quizId)) : null;

  if (!material || !quiz) {
    return <Navigate to="/dashboard/materials" replace />;
  }

  return (
    <ViewQuiz
      mainMaterial={material}
      material={quiz}
      onClose={() => navigate(`/dashboard/materials/${material.id}`)}
      readOnly={false}
      onSuccess={fetchMaterials}
      onEdit={(quiz) => {
        navigate(`/dashboard/materials/${material.id}/quiz/${quiz.id}/edit`);
      }}
    />
  );
};

const CreateFlashcardsWrapper = ({ onRefreshProfile }) => {
  const { materialId, flashcardSetId } = useParams();
  const navigate = useNavigate();
  const { getMaterialById, fetchMaterials, isInitialized } = useMaterials();
  
  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  const material = getMaterialById(materialId);
  const existingFlashcardSet = flashcardSetId ? 
    material?.flashcard_sets?.find(fs => fs.id === parseInt(flashcardSetId)) : null;

  if (!material) {
    return <Navigate to="/dashboard/materials" replace />;
  }

  // ✅ UPDATED: Include profile refresh in success handler
  const handleSuccess = async (createdOrUpdatedFlashcardSet) => {
    try {
      // Refresh both materials and profile data
      await fetchMaterials();
      if (onRefreshProfile) {
        await onRefreshProfile();
      }
      
      if (createdOrUpdatedFlashcardSet?.id) {
        navigate(`/dashboard/materials/${material.id}/flashcards/${createdOrUpdatedFlashcardSet.id}/view`);
      } else if (existingFlashcardSet?.id) {
        navigate(`/dashboard/materials/${material.id}/flashcards/${existingFlashcardSet.id}/view`);
      } else {
        // Fallback strategy
        setTimeout(async () => {
          await fetchMaterials();
          if (onRefreshProfile) {
            await onRefreshProfile();
          }
          const updatedMaterial = getMaterialById(materialId);
          const latestFlashcardSet = updatedMaterial?.flashcard_sets?.sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
          )[0];
          
          if (latestFlashcardSet) {
            navigate(`/dashboard/materials/${material.id}/flashcards/${latestFlashcardSet.id}/view`);
          } else {
            navigate(`/dashboard/materials/${material.id}`);
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error in flashcard success handler:', error);
      navigate(`/dashboard/materials/${material.id}`);
    }
  };

  return (
    <CreateFlashcards
      mainMaterial={material}
      material={material}
      flashcardSet={existingFlashcardSet}
      options={{
        editMode: !!existingFlashcardSet,
        editContent: existingFlashcardSet,
        onSuccess: handleSuccess
      }}
      onClose={() => navigate(`/dashboard/materials/${material.id}`)}
      onSuccess={handleSuccess}
    />
  );
};

// ✅ UPDATED: CreateNotesWrapper - accept and use onRefreshProfile
const CreateNotesWrapper = ({ onRefreshProfile }) => {
  const { materialId, noteId } = useParams();
  const navigate = useNavigate();
  const { getMaterialById, fetchMaterials, isInitialized } = useMaterials();
  
  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  const material = getMaterialById(materialId);
  const existingNote = noteId ? 
    material?.notes?.find(note => note.id === parseInt(noteId)) : null;

  if (!material) {
    return <Navigate to="/dashboard/materials" replace />;
  }

  // ✅ UPDATED: Include profile refresh in success handler
  const handleSuccess = async (createdOrUpdatedNote) => {
    try {
      // Refresh both materials and profile data
      await fetchMaterials();
      if (onRefreshProfile) {
        await onRefreshProfile();
      }
      
      if (createdOrUpdatedNote?.id) {
        navigate(`/dashboard/materials/${material.id}/notes/${createdOrUpdatedNote.id}/view`);
      } else if (existingNote?.id) {
        navigate(`/dashboard/materials/${material.id}/notes/${existingNote.id}/view`);
      } else {
        setTimeout(async () => {
          await fetchMaterials();
          if (onRefreshProfile) {
            await onRefreshProfile();
          }
          const updatedMaterial = getMaterialById(materialId);
          const latestNote = updatedMaterial?.notes?.sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
          )[0];
          
          if (latestNote) {
            navigate(`/dashboard/materials/${material.id}/notes/${latestNote.id}/view`);
          } else {
            navigate(`/dashboard/materials/${material.id}`);
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error in note success handler:', error);
      navigate(`/dashboard/materials/${material.id}`);
    }
  };

  return (
    <CreateNotes
      material={material}
      options={{
        editMode: !!existingNote,
        editContent: existingNote,
        onSuccess: handleSuccess
      }}
      onClose={() => navigate(`/dashboard/materials/${material.id}`)}
      onSuccess={handleSuccess}
    />
  );
};

// ✅ UPDATED: CreateQuizWrapper - accept and use onRefreshProfile
const CreateQuizWrapper = ({ onRefreshProfile }) => {
  const { materialId, quizId } = useParams();
  const navigate = useNavigate();
  const { getMaterialById, fetchMaterials, isInitialized } = useMaterials();
  
  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  const material = getMaterialById(materialId);
  const existingQuiz = quizId ? 
    material?.quizzes?.find(quiz => quiz.id === parseInt(quizId)) : null;

  if (!material) {
    return <Navigate to="/dashboard/materials" replace />;
  }

  // ✅ UPDATED: Include profile refresh in success handler
  const handleSuccess = async (createdOrUpdatedQuiz) => {
    try {
      // Refresh both materials and profile data
      await fetchMaterials();
      if (onRefreshProfile) {
        await onRefreshProfile();
      }
      
      if (createdOrUpdatedQuiz?.id) {
        navigate(`/dashboard/materials/${material.id}/quiz/${createdOrUpdatedQuiz.id}/view`);
      } else if (existingQuiz?.id) {
        navigate(`/dashboard/materials/${material.id}/quiz/${existingQuiz.id}/view`);
      } else {
        setTimeout(async () => {
          await fetchMaterials();
          if (onRefreshProfile) {
            await onRefreshProfile();
          }
          const updatedMaterial = getMaterialById(materialId);
          const latestQuiz = updatedMaterial?.quizzes?.sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
          )[0];
          
          if (latestQuiz) {
            navigate(`/dashboard/materials/${material.id}/quiz/${latestQuiz.id}/view`);
          } else {
            navigate(`/dashboard/materials/${material.id}`);
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error in quiz success handler:', error);
      navigate(`/dashboard/materials/${material.id}`);
    }
  };

  return (
    <CreateQuiz
      material={material}
      options={{
        editMode: !!existingQuiz,
        editContent: existingQuiz,
        onSuccess: handleSuccess
      }}
      onClose={() => navigate(`/dashboard/materials/${material.id}`)}
      onSuccess={handleSuccess}
    />
  );
};

const MaterialsScreen = ({ onRefreshProfile }) => {
  return (
    <Routes>
      <Route path="/" element={<MaterialsList />} />
      <Route path="/:materialId" element={<MaterialContentWrapper onRefreshProfile={onRefreshProfile} />} />
      
      {/* View Routes */}
      <Route path="/:materialId/flashcards/:flashcardSetId/view" element={<ViewFlashcardsWrapper />} />
      <Route path="/:materialId/notes/:noteId/view" element={<ViewNotesWrapper />} />
      <Route path="/:materialId/quiz/:quizId/view" element={<ViewQuizWrapper />} />
      
      {/* Create Routes - ✅ UPDATED: Pass onRefreshProfile */}
      <Route path="/:materialId/flashcards/create" element={<CreateFlashcardsWrapper onRefreshProfile={onRefreshProfile} />} />
      <Route path="/:materialId/notes/create" element={<CreateNotesWrapper onRefreshProfile={onRefreshProfile} />} />
      <Route path="/:materialId/quiz/create" element={<CreateQuizWrapper onRefreshProfile={onRefreshProfile} />} />
      
      {/* Edit Routes - ✅ UPDATED: Pass onRefreshProfile */}
      <Route path="/:materialId/flashcards/:flashcardSetId/edit" element={<CreateFlashcardsWrapper onRefreshProfile={onRefreshProfile} />} />
      <Route path="/:materialId/notes/:noteId/edit" element={<CreateNotesWrapper onRefreshProfile={onRefreshProfile} />} />
      <Route path="/:materialId/quiz/:quizId/edit" element={<CreateQuizWrapper onRefreshProfile={onRefreshProfile} />} />
      
      <Route path="*" element={<Navigate to="/dashboard/materials" replace />} />
    </Routes>
  );
};

export default MaterialsScreen;