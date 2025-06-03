import { ChevronDown } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import CreateFlashcards from './CreateFlashcards'
import CreateMaterialModal from './CreateMaterialModal'
import CreateNotes from './CreateNotes'
import CreateQuiz from './CreateQuiz'
import MaterialCard, { defaultFiles } from './MaterialCard'
import MaterialContent from './MaterialContent'

const MaterialsScreen = () => {
  const [files, setFiles] = useState(defaultFiles)
  const [pinnedFiles, setPinnedFiles] = useState(() => {
    // Initialize from localStorage if available
    const savedPins = localStorage.getItem('pinnedMaterials')
    return savedPins ? JSON.parse(savedPins) : []
  })
  const [showUpdatedDropdown, setShowUpdatedDropdown] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all')
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all')
  const [showMenuFor, setShowMenuFor] = useState(null)
  const [isPublic, setIsPublic] = useState(() => {
    // Initialize from localStorage if available
    const savedVisibility = localStorage.getItem('materialsVisibility')
    return savedVisibility ? JSON.parse(savedVisibility) : {}
  })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showFlashcards, setShowFlashcards] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [showMaterialContent, setShowMaterialContent] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState(null)

  const typeDropdownRef = useRef(null)
  const updatedDropdownRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setShowTypeDropdown(false)
      }
      if (updatedDropdownRef.current && !updatedDropdownRef.current.contains(event.target)) {
        setShowUpdatedDropdown(false)
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenuFor(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Save to localStorage whenever pinnedFiles changes
  useEffect(() => {
    localStorage.setItem('pinnedMaterials', JSON.stringify(pinnedFiles))
  }, [pinnedFiles])

  // Save to localStorage whenever isPublic changes
  useEffect(() => {
    localStorage.setItem('materialsVisibility', JSON.stringify(isPublic))
  }, [isPublic])

  const getTagColor = (tag) => {
    if (tag.toLowerCase().includes('flashcards')) {
      return 'bg-[#FFB3BA] text-[#7D1F1F]' // Soft red
    } else if (tag.toLowerCase().includes('note')) {
      return 'bg-[#BAFFC9] text-[#1F7D2F]' // Soft green
    } else if (tag.toLowerCase().includes('quiz')) {
      return 'bg-[#BAE1FF] text-[#1F4B7D]' // Soft blue
    }
    return 'bg-[#F0F0F0] text-[#4A4A4A]' // Soft gray
  }

  const togglePin = (fileTitle) => {
    setPinnedFiles(prev => {
      if (prev.includes(fileTitle)) {
        return prev.filter(title => title !== fileTitle)
      } else {
        return [...prev, fileTitle]
      }
    })
  }

  const filterByTime = (file) => {
    const updated = file.updated.toLowerCase()
    switch (selectedTimeFilter) {
      case 'today':
        return updated.includes('h ago') || updated.includes('today')
      case 'week':
        return updated.includes('d ago') && parseInt(updated) <= 7
      case 'month':
        return updated.includes('d ago') && parseInt(updated) <= 30
      default:
        return true
    }
  }

  const filterByType = (file) => {
    const tag = file.tag.toLowerCase()
    switch (selectedTypeFilter) {
      case 'flashcards':
        return tag.includes('flashcards')
      case 'notes':
        return tag.includes('note')
      case 'quizzes':
        return tag.includes('quiz')
      default:
        return true
    }
  }

  // Separate pinned and unpinned files with both filters
  const pinnedMaterials = files.filter(f => 
    pinnedFiles.includes(f.title) && 
    filterByTime(f) && 
    filterByType(f)
  )
  const otherMaterials = files.filter(f => 
    !pinnedFiles.includes(f.title) && 
    filterByTime(f) && 
    filterByType(f)
  )

  const getUpdatedLabel = (updated) => {
    const updatedLower = updated.toLowerCase()
    if (updatedLower.includes('h ago') || updatedLower.includes('today')) {
      return 'Updated today'
    } else if (updatedLower.includes('d ago')) {
      const days = parseInt(updatedLower)
      if (days <= 7) {
        return 'Updated this week'
      } else if (days <= 30) {
        return 'Updated this month'
      }
    }
    return `Updated ${updated}`
  }

  const toggleVisibility = (fileTitle) => {
    setIsPublic(prev => {
      const newState = {
        ...prev,
        [fileTitle]: !prev[fileTitle]
      }
      return newState
    })
  }

  const handleExport = (fileTitle) => {
    // TODO: Implement export functionality
    console.log('Exporting:', fileTitle)
  }

  const handleCreateMaterial = (newMaterial) => {
    const material = {
      ...newMaterial,
      id: Date.now().toString(), // Temporary ID for new materials
      isPublic: false
    }
    setFiles(prevFiles => [material, ...prevFiles])
  }

  const handleCreateFlashcards = (material) => {
    setSelectedMaterial(material)
    setShowFlashcards(true)
  }

  const handleCreateNotes = (material) => {
    setSelectedMaterial(material)
    setShowNotes(true)
  }

  const handleCreateQuiz = (material) => {
    setSelectedMaterial(material)
    setShowQuiz(true)
  }

  const handleViewMaterial = (material) => {
    setSelectedMaterial(material)
    setShowMaterialContent(true)
  }

  return (
    <div>
      {showFlashcards ? (
        <CreateFlashcards 
          material={selectedMaterial} 
          onClose={() => setShowFlashcards(false)}
        />
      ) : showNotes ? (
        <CreateNotes 
          material={selectedMaterial} 
          onClose={() => setShowNotes(false)}
        />
      ) : showQuiz ? (
        <CreateQuiz 
          material={selectedMaterial} 
          onClose={() => setShowQuiz(false)}
        />
      ) : showMaterialContent ? (
        <MaterialContent
          material={selectedMaterial}
          isPublic={isPublic[selectedMaterial.title]}
          onVisibilityToggle={toggleVisibility}
          onExport={handleExport}
          onCreateFlashcards={handleCreateFlashcards}
          onCreateNotes={handleCreateNotes}
          onCreateQuiz={handleCreateQuiz}
          onBack={() => setShowMaterialContent(false)}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4 text-xs sm:text-sm">
            <h1 className="exam-heading exam-heading-mini text-base">Your Materials</h1>
            <div className="flex flex-wrap gap-2">
              <button 
                data-hover="Create Material"
                className="exam-button-mini py-1 px-2 flex items-center gap-1"
                onClick={() => setShowCreateModal(true)}
              >
                Create Material
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

          {/* Pinned Materials Section */}
          {pinnedMaterials.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-medium text-gray-700 mb-3">Pinned</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pinnedMaterials.map((file) => (
                  <MaterialCard
                    key={file.id || file.title}
                    file={file}
                    isPinned={true}
                    onPinToggle={() => togglePin(file.title)}
                    onVisibilityToggle={() => toggleVisibility(file.title)}
                    onExport={() => handleExport(file.title)}
                    isPublic={isPublic[file.title]}
                    getTagColor={getTagColor}
                    getUpdatedLabel={getUpdatedLabel}
                    onCreateFlashcards={handleCreateFlashcards}
                    onCreateNotes={handleCreateNotes}
                    onCreateQuiz={handleCreateQuiz}
                    onViewMaterial={() => handleViewMaterial(file)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other Materials Section */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-3">All Materials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherMaterials.map((file) => (
                <MaterialCard
                  key={file.id || file.title}
                  file={file}
                  isPinned={false}
                  onPinToggle={() => togglePin(file.title)}
                  onVisibilityToggle={() => toggleVisibility(file.title)}
                  onExport={() => handleExport(file.title)}
                  isPublic={isPublic[file.title]}
                  getTagColor={getTagColor}
                  getUpdatedLabel={getUpdatedLabel}
                  onCreateFlashcards={handleCreateFlashcards}
                  onCreateNotes={handleCreateNotes}
                  onCreateQuiz={handleCreateQuiz}
                  onViewMaterial={() => handleViewMaterial(file)}
                />
              ))}
            </div>
          </div>

          <CreateMaterialModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateMaterial}
          />
        </>
      )}
    </div>
  )
}

export default MaterialsScreen 