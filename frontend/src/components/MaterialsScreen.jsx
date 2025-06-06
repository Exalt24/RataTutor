import { ChevronDown, FileQuestion, Folder, Pin, RefreshCw, Search, X } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { useLoading } from '../components/Loading/LoadingContext'
import { useToast } from '../components/Toast/ToastContext'
import { softDeleteMaterial, toggleMaterialPin, toggleMaterialVisibility, updateMaterial, uploadAttachment } from '../services/apiService'
import CreateFlashcards from './CreateFlashcards'
import CreateMaterialModal from './CreateMaterialModal'
import CreateNotes from './CreateNotes'
import CreateQuiz from './CreateQuiz'
import DeleteModal from './DeleteModal'
import MaterialCard from './MaterialCard'
import MaterialContent from './MaterialContent'
import { trackActivityAndNotify, createCombinedSuccessMessage } from '../utils/streakNotifications';

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-12">
    <FileQuestion size={64} className="text-[#1b81d4] mb-6" />
    <h3 className="label-text text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
      No Materials Yet
    </h3>
    <p className="text-gray-600 text-center max-w-md leading-relaxed mb-6">
      Create your first material to start organizing your study content. You can add flashcards, notes, and quizzes to help you learn effectively.
    </p>
  </div>
);

const MaterialsScreen = ({ 
  materialsData,
  onRefreshMaterials,
  onUpdateMaterial,
  onAddMaterial,
  onRemoveMaterial,
  onMoveMaterialToTrash 
}) => {
  // Existing state
  const [showUpdatedDropdown, setShowUpdatedDropdown] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all')
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showFlashcards, setShowFlashcards] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [showMaterialContent, setShowMaterialContent] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [selectedFlashcardSet, setSelectedFlashcardSet] = useState(null)
  const [flashcardOptions, setFlashcardOptions] = useState({})
  const [notesOptions, setNotesOptions] = useState({})
  const [quizOptions, setQuizOptions] = useState({})
  const [isFromExplore, setIsFromExplore] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);

  const typeDropdownRef = useRef(null)
  const updatedDropdownRef = useRef(null)
  // ✅ NEW: Add file input ref for upload functionality
  const fileInputRef = useRef(null)
  const { showLoading, hideLoading } = useLoading()
  const { showToast } = useToast()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setShowTypeDropdown(false)
      }
      if (updatedDropdownRef.current && !updatedDropdownRef.current.contains(event.target)) {
        setShowUpdatedDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (selectedMaterial && materialsData) {
      // Find the updated version of the currently selected material
      const updatedMaterial = materialsData.find(m => m.id === selectedMaterial.id);
      if (updatedMaterial) {
        // Update selectedMaterial with fresh data
        setSelectedMaterial(updatedMaterial);
        console.log('Updated selectedMaterial with fresh data:', updatedMaterial);
      }
    }
  }, [materialsData, selectedMaterial?.id]);

  const getTagColor = (tag) => {
  if (tag.toLowerCase().includes('flashcard set')) {
    return 'bg-[#FFB3BA] text-[#7D1F1F]' // Soft red
  } else if (tag.toLowerCase().includes('note')) {
    return 'bg-[#BAFFC9] text-[#1F7D2F]' // Soft green
  } else if (tag.toLowerCase().includes('quiz')) {
    return 'bg-[#BAE1FF] text-[#1F4B7D]' // Soft blue
  } else if (tag.toLowerCase().includes('files') || tag.toLowerCase().includes('attachment')) {
    return 'bg-[#FFE4B3] text-[#7D4F1F]' // ✅ NEW: Soft orange for attachments
  }
  return 'bg-[#F0F0F0] text-[#4A4A4A]' // Soft gray
}

  const togglePin = async (material) => {
    try {
      showLoading()
      const response = await toggleMaterialPin(material.id)
      
      // Update through Dashboard's state management
      onUpdateMaterial(response.data)

      showToast({
        variant: "success",
        title: response.data.pinned ? "Material pinned" : "Material unpinned",
        subtitle: `"${material.title}" has been ${response.data.pinned ? 'pinned' : 'unpinned'}.`,
      })
    } catch (err) {
      showToast({
        variant: "error",
        title: "Error updating material",
        subtitle: "Failed to update pin status. Please try again.",
      })
    } finally {
      hideLoading()
    }
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) { // 24 hours
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  const filterByTime = (material) => {
    const updatedAgo = formatTimeAgo(material.updated_at)
    
    switch (selectedTimeFilter) {
      case 'today':
        return updatedAgo.includes('h ago') || updatedAgo.includes('m ago')
      case 'week':
        const dayMatch = updatedAgo.match(/(\d+)d ago/)
        return dayMatch ? parseInt(dayMatch[1]) <= 7 : updatedAgo.includes('h ago') || updatedAgo.includes('m ago')
      case 'month':
        const dayMatch2 = updatedAgo.match(/(\d+)d ago/)
        return dayMatch2 ? parseInt(dayMatch2[1]) <= 30 : updatedAgo.includes('h ago') || updatedAgo.includes('m ago')
      default:
        return true
    }
  }

  const filterByType = (material) => {
    switch (selectedTypeFilter) {
      case 'flashcards':
        return material.flashcard_sets && material.flashcard_sets.length > 0
      case 'notes':
        return material.notes && material.notes.length > 0
      case 'quizzes':
        return material.quizzes && material.quizzes.length > 0
      default:
        return true
    }
  }

  // Use materialsData from props instead of local state
  const filteredMaterials = materialsData.filter(m => 
    m.status === 'active' && 
    filterByTime(m) && 
    filterByType(m) &&
    (m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     m.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const pinnedMaterials = filteredMaterials.filter(m => m.pinned)
  const otherMaterials = filteredMaterials.filter(m => !m.pinned)

  const getUpdatedLabel = (dateString) => {
    const timeAgo = formatTimeAgo(dateString)
    
    if (timeAgo.includes('m ago') || timeAgo.includes('h ago')) {
      return 'Updated today'
    } else if (timeAgo.includes('d ago')) {
      const days = parseInt(timeAgo)
      if (days <= 7) {
        return 'Updated this week'
      } else if (days <= 30) {
        return 'Updated this month'
      }
    }
    return `Updated ${timeAgo}`
  }

  const toggleVisibility = async (material) => {
    try {
      showLoading()
      const response = await toggleMaterialVisibility(material.id)
      
      // Update through Dashboard's state management
      onUpdateMaterial(response.data)

      showToast({
        variant: "success",
        title: response.data.public ? "Material made public" : "Material made private",
        subtitle: `"${material.title}" is now ${response.data.public ? 'public' : 'private'}.`,
      })
    } catch (err) {
      showToast({
        variant: "error",
        title: "Error updating material",
        subtitle: "Failed to update visibility. Please try again.",
      })
    } finally {
      hideLoading()
    }
  }

  // ✅ NEW: Replace handleExport with handleUploadAttachment
  const handleUploadAttachment = (material) => {
    // Store the material for upload
    setSelectedMaterial(material)
    // Trigger file input
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file || !selectedMaterial) return

  // Validate file type (same as backend validation)
  const validExtensions = ['.docx', '.pptx', '.txt', '.pdf']
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
  
  if (!validExtensions.includes(fileExtension)) {
    showToast({
      variant: "error",
      title: "Invalid file type",
      subtitle: "Please select a DOCX, PPTX, TXT, or PDF file.",
    })
    return
  }

  // Validate file size (optional - add your own limit)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    showToast({
      variant: "error",
      title: "File too large",
      subtitle: "Please select a file smaller than 10MB.",
    })
    return
  }

  try {
    showLoading()
    
    const response = await uploadAttachment(selectedMaterial.id, file)
    
    // 🔥 Track activity but suppress immediate notification (same as other components)
    const streakResult = await trackActivityAndNotify(showToast, true)
    
    // Refresh materials data to get updated attachments
    await onRefreshMaterials()

    // 🔥 Create combined message using helper function (same as other components)
    const baseTitle = "File uploaded successfully!";
    const baseSubtitle = `"${file.name}" has been attached to "${selectedMaterial.title}".`;
    
    const combinedMessage = createCombinedSuccessMessage(baseTitle, baseSubtitle, streakResult);
    
    // 🔥 Show single combined toast (same as other components)
    showToast({
      variant: "success",
      title: combinedMessage.title,
      subtitle: combinedMessage.subtitle,
    })
  } catch (err) {
    console.error('Error uploading file:', err)
    showToast({
      variant: "error",
      title: "Upload failed",
      subtitle: err.response?.data?.error || "Failed to upload file. Please try again.",
    })
  } finally {
    hideLoading()
    // Clear the file input
    event.target.value = ''
  }
}

  const handleDelete = async (material) => {
    setMaterialToDelete(material);
    setDeleteModalOpen(true);
  }

  const confirmDelete = async () => {
  try {
    showLoading()
    await softDeleteMaterial(materialToDelete.id)
    
    // ✅ FIXED: Move to trash instead of just removing
    onMoveMaterialToTrash(materialToDelete)
    
    showToast({
      variant: "success",
      title: "Material moved to trash",
      subtitle: `"${materialToDelete.title}" has been moved to trash.`,
    })
  } catch (err) {
    showToast({
      variant: "error",
      title: "Error moving to trash",
      subtitle: "Failed to move material to trash. Please try again.",
    })
  } finally {
    hideLoading()
    setDeleteModalOpen(false);
    setMaterialToDelete(null);
  }
}

  const handleCreateMaterial = (newMaterial) => {
    // Add through Dashboard's state management
    onAddMaterial(newMaterial)
  }

  const handleCreateFlashcards = (material, flashcardSet = null, options = {}) => {
    setSelectedMaterial(material);
    setSelectedFlashcardSet(flashcardSet);
    
    const enhancedOptions = {
      ...options,
      onSuccess: async (newFlashcardSet) => {
        console.log('MaterialsScreen - flashcard created:', newFlashcardSet);
        
        try {
          await onRefreshMaterials();
        } catch (error) {
          console.error('Error refreshing materials:', error);
          
          const updatedMaterial = {
            ...material,
            flashcard_sets: [...(material.flashcard_sets || []), newFlashcardSet]
          };
          setSelectedMaterial(updatedMaterial);
        }
        
        if (options.onSuccess) {
          const result = options.onSuccess(newFlashcardSet);
          if (result === false) {
            setTimeout(() => {
              setShowFlashcards(false);
              setSelectedFlashcardSet(null);
              setFlashcardOptions({});
            }, 100);
            return;
          }
        }
        
        setShowFlashcards(false);
        setSelectedFlashcardSet(null);
        setFlashcardOptions({});
      }
    };
    
    setFlashcardOptions(enhancedOptions);
    setShowFlashcards(true);
  };

  const handleCreateNotes = (material, options = {}) => {
    setSelectedMaterial(material);
    
    const enhancedOptions = {
      ...options,
      onSuccess: async (newNote) => {
        console.log('MaterialsScreen - note created:', newNote);
        
        try {
          await onRefreshMaterials();
        } catch (error) {
          console.error('Error refreshing materials:', error);
          
          const updatedMaterial = {
            ...material,
            notes: [...(material.notes || []), newNote]
          };
          setSelectedMaterial(updatedMaterial);
        }
        
        if (options.onSuccess) {
          const result = options.onSuccess(newNote);
          if (result === false) {
            setTimeout(() => {
              setShowNotes(false);
              setNotesOptions({});
            }, 100);
            return;
          }
        }
        
        setShowNotes(false);
        setNotesOptions({});
      }
    };
    
    setNotesOptions(enhancedOptions);
    setShowNotes(true);
  };

  const handleCreateQuiz = (material, options = {}) => {
    setSelectedMaterial(material);
    
    const enhancedOptions = {
      ...options,
      onSuccess: async (newQuiz) => {
        console.log('MaterialsScreen - quiz created:', newQuiz);
        
        try {
          await onRefreshMaterials();
        } catch (error) {
          console.error('Error refreshing materials:', error);
          
          const updatedMaterial = {
            ...material,
            quizzes: [...(material.quizzes || []), newQuiz]
          };
          setSelectedMaterial(updatedMaterial);
        }
        
        if (options.onSuccess) {
          const result = options.onSuccess(newQuiz);
          if (result === false) {
            setTimeout(() => {
              setShowQuiz(false);
              setQuizOptions({});
            }, 100);
            return;
          }
        }
        
        setShowQuiz(false);
        setQuizOptions({});
      }
    };
    
    setQuizOptions(enhancedOptions);
    setShowQuiz(true);
  };

  const handleViewMaterial = (material, isFromExplore = false) => {
    setSelectedMaterial(material)
    setShowMaterialContent(true)
    setIsFromExplore(isFromExplore)
  }

  const handleTitleChange = async (newTitle, newDescription) => {
    try {
      showLoading()
      const response = await updateMaterial(selectedMaterial.id, {
        title: newTitle,
        description: newDescription
      })
      
      // Update through Dashboard's state management
      onUpdateMaterial(response.data)
      
      // Update selectedMaterial to reflect changes immediately in MaterialContent
      setSelectedMaterial(response.data)

      showToast({
        variant: "success",
        title: "Material updated",
        subtitle: "Title and description have been updated successfully.",
      })
    } catch (err) {
      showToast({
        variant: "error",
        title: "Error updating material",
        subtitle: "Failed to update material. Please try again.",
      })
      throw err // Re-throw so MaterialContent can handle it
    } finally {
      hideLoading()
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  // Use onRefreshMaterials from props
  const handleRefresh = () => {
    onRefreshMaterials()
  }

  return (
    <div>
      {/* ✅ NEW: Hidden file input for upload functionality */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".docx,.pptx,.txt,.pdf"
        style={{ display: 'none' }}
      />

      {showFlashcards ? (
        <CreateFlashcards
          mainMaterial={selectedMaterial}
          material={selectedMaterial}
          flashcardSet={selectedFlashcardSet}
          options={flashcardOptions}
          onClose={() => {
            setShowFlashcards(false)
            setSelectedFlashcardSet(null)
            setFlashcardOptions({})
          }}
          onSuccess={(newFlashcardSet) => {
            const result = flashcardOptions.onSuccess?.(newFlashcardSet);
            if (result !== false) {
              setShowFlashcards(false);
              setSelectedFlashcardSet(null);
              setFlashcardOptions({});
            }
          }}
        />
      ) : showNotes ? (
        <CreateNotes 
          material={selectedMaterial} 
          options={notesOptions}
          onClose={() => {
            setShowNotes(false)
            setNotesOptions({})
          }}
          onSuccess={(newNote) => {
            const result = notesOptions.onSuccess?.(newNote);
            if (result !== false) {
              setShowNotes(false);
              setNotesOptions({});
            }
          }}
        />
      ) : showQuiz ? (
        <CreateQuiz 
          material={selectedMaterial} 
          options={quizOptions}
          onClose={() => {
            setShowQuiz(false)
            setQuizOptions({})
          }}
          onSuccess={(newQuiz) => {
            const result = quizOptions.onSuccess?.(newQuiz);
            if (result !== false) {
              setShowQuiz(false);
              setQuizOptions({});
            }
          }}
        />
      ) : showMaterialContent ? (
        <MaterialContent
          material={selectedMaterial}
          isPublic={selectedMaterial?.public}
          onVisibilityToggle={() => toggleVisibility(selectedMaterial)}
          onUploadAttachment={() => handleUploadAttachment(selectedMaterial)} // ✅ Changed from onExport
          onCreateFlashcards={handleCreateFlashcards}
          onCreateNotes={handleCreateNotes}
          onCreateQuiz={handleCreateQuiz}
          onBack={() => setShowMaterialContent(false)}
          onTitleChange={handleTitleChange}
          onMaterialUpdate={onUpdateMaterial}
          readOnly={isFromExplore}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4 text-xs sm:text-sm p-4">
            <div className="relative w-full max-w-md">
              <div className={`
                relative flex items-center
                transition-all duration-200
                ${isSearchFocused ? 'ring-2 ring-blue-400' : ''}
                rounded-full border border-gray-200
                bg-white
              `}>
                <Search 
                  className={`
                    absolute left-4
                    transition-colors duration-200
                    ${isSearchFocused ? 'text-blue-500' : 'text-gray-400'}
                  `} 
                  size={20} 
                />
                <input
                  type="text"
                  placeholder="Search your materials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="label-text w-full pl-12 pr-12 py-3 rounded-full focus:outline-none text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={16} className="text-gray-400" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="mt-1 text-xs text-gray-500">
                  Found {filteredMaterials.length} results
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button 
                data-hover="Create Material"
                className="exam-button-mini py-1 px-2 flex items-center gap-1"
                onClick={() => setShowCreateModal(true)}
              >
                Create Material
              </button>
              <button 
                data-hover="Refresh"
                className="exam-button-mini py-1 px-2 flex items-center gap-1"
                onClick={handleRefresh}
              >
                <RefreshCw size={14} />
                Refresh
              </button>
              <div className="relative" ref={typeDropdownRef}>
                <button 
                  data-hover="Type" 
                  className="exam-button-mini py-1 px-2"
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                >
                  <span className="flex items-center">
                    Type
                    <ChevronDown size={12} className={`ml-1 transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} />
                  </span>
                </button>
                {showTypeDropdown && (
                  <div className="absolute left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    <button
                      className={`label-text w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedTypeFilter === 'all' ? 'text-blue-600' : 'text-gray-700'}`}
                      onClick={() => {
                        setSelectedTypeFilter('all')
                        setShowTypeDropdown(false)
                      }}
                    >
                      All types
                    </button>
                    <button
                      className={`label-text w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedTypeFilter === 'flashcards' ? 'text-blue-600' : 'text-gray-700'}`}
                      onClick={() => {
                        setSelectedTypeFilter('flashcards')
                        setShowTypeDropdown(false)
                      }}
                    >
                      Flashcards
                    </button>
                    <button
                      className={`label-text w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedTypeFilter === 'notes' ? 'text-blue-600' : 'text-gray-700'}`}
                      onClick={() => {
                        setSelectedTypeFilter('notes')
                        setShowTypeDropdown(false)
                      }}
                    >
                      Notes
                    </button>
                    <button
                      className={`label-text w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedTypeFilter === 'quizzes' ? 'text-blue-600' : 'text-gray-700'}`}
                      onClick={() => {
                        setSelectedTypeFilter('quizzes')
                        setShowTypeDropdown(false)
                      }}
                    >
                      Quizzes
                    </button>
                  </div>
                )}
              </div>
              <div className="relative" ref={updatedDropdownRef}>
                <button 
                  data-hover="Updated" 
                  className="exam-button-mini py-1 px-2"
                  onClick={() => setShowUpdatedDropdown(!showUpdatedDropdown)}
                >
                  <span className="flex items-center">
                    Updated
                    <ChevronDown size={12} className={`ml-1 transition-transform ${showUpdatedDropdown ? 'rotate-180' : ''}`} />
                  </span>
                </button>
                {showUpdatedDropdown && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    <button
                      className={`label-text w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedTimeFilter === 'all' ? 'text-blue-600' : 'text-gray-700'}`}
                      onClick={() => {
                        setSelectedTimeFilter('all')
                        setShowUpdatedDropdown(false)
                      }}
                    >
                      All time
                    </button>
                    <button
                      className={`label-text w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedTimeFilter === 'today' ? 'text-blue-600' : 'text-gray-700'}`}
                      onClick={() => {
                        setSelectedTimeFilter('today')
                        setShowUpdatedDropdown(false)
                      }}
                    >
                      Today
                    </button>
                    <button
                      className={`label-text w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedTimeFilter === 'week' ? 'text-blue-600' : 'text-gray-700'}`}
                      onClick={() => {
                        setSelectedTimeFilter('week')
                        setShowUpdatedDropdown(false)
                      }}
                    >
                      Last week
                    </button>
                    <button
                      className={`label-text w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedTimeFilter === 'month' ? 'text-blue-600' : 'text-gray-700'}`}
                      onClick={() => {
                        setSelectedTimeFilter('month')
                        setShowUpdatedDropdown(false)
                      }}
                    >
                      Last month
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {filteredMaterials.length === 0 ? (
            <EmptyState onCreateMaterial={() => setShowCreateModal(true)} />
          ) : (
            <>
              {/* Pinned Materials Section */}
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
                        onPinToggle={() => togglePin(material)}
                        onVisibilityToggle={() => toggleVisibility(material)}
                        onDelete={() => handleDelete(material)}
                        isPublic={material.public}
                        getTagColor={getTagColor}
                        getUpdatedLabel={(dateString) => getUpdatedLabel(dateString)}
                        onCreateFlashcards={handleCreateFlashcards}
                        onCreateNotes={handleCreateNotes}
                        onCreateQuiz={handleCreateQuiz}
                        onViewMaterial={() => handleViewMaterial(material)}
                        timeAgo={formatTimeAgo(material.updated_at)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Other Materials Section */}
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
                        onPinToggle={() => togglePin(material)}
                        onVisibilityToggle={() => toggleVisibility(material)}
                        onDelete={() => handleDelete(material)}
                        isPublic={material.public}
                        getTagColor={getTagColor}
                        getUpdatedLabel={(dateString) => getUpdatedLabel(dateString)}
                        onCreateFlashcards={handleCreateFlashcards}
                        onCreateNotes={handleCreateNotes}
                        onCreateQuiz={handleCreateQuiz}
                        onViewMaterial={() => handleViewMaterial(material)}
                        timeAgo={formatTimeAgo(material.updated_at)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <CreateMaterialModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCreated={handleCreateMaterial}
            onRefreshMaterials={onRefreshMaterials} 
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
      )}
    </div>
  )
}

export default MaterialsScreen