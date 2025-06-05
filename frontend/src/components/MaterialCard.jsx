import { Copy, Globe, Lock, MoreVertical, Pencil, Pin, RefreshCw, Trash, User } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

const MaterialCard = ({ 
  file, // This is actually a material object from API
  isPinned, 
  onPinToggle, 
  onVisibilityToggle, 
  onDelete,
  onCopy,
  variant = 'materials',
  isPublic = false,
  showOwner = false, // New prop for showing owner name
  onCreateFlashcards,
  onCreateNotes,
  onCreateQuiz,
  onViewMaterial,
  getTagColor, // Function passed from parent
  getUpdatedLabel, // Function passed from parent  
  timeAgo, // Formatted time string passed from parent
  isSelected, // New prop for trash variant
  onSelect, // New prop for trash variant
  onRestore // New prop for restore functionality
}) => {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)
  const cardRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleCardClick = (e) => {
    if (variant === 'trash') {
      // Don't trigger selection if clicking on the checkbox or restore button
      if (e.target.tagName === 'INPUT' || e.target.closest('button')) {
        return
      }
      onSelect && onSelect(file.id)
    } else {
      onViewMaterial(file)
    }
  }

  // Calculate tags based on API data structure
  const getContentTags = () => {
    const tags = [];
    
    // Check for flashcard sets
    if (file.flashcard_sets && file.flashcard_sets.length > 0) {
      tags.push(`Flashcard Sets (${file.flashcard_sets.length})`);
    }
    
    // Check for notes
    if (file.notes && file.notes.length > 0) {
      tags.push(`Notes (${file.notes.length})`);
    }
    
    // Check for quizzes
    if (file.quizzes && file.quizzes.length > 0) {
      tags.push(`Quizzes (${file.quizzes.length})`);
    }
    
    // Check for attachments
    if (file.attachments && file.attachments.length > 0) {
      tags.push(`Files (${file.attachments.length})`);
    }
    
    return tags;
  };

  // ✅ ENHANCED: Create content handlers following the enhanced pattern
  const handleCreateFlashcards = (e) => {
    e.stopPropagation()
    onCreateFlashcards(file, null, {
      onSuccess: (newFlashcardSet) => {
        // Auto-navigate to view the newly created flashcard set
        // This will be handled by the parent component
        console.log('MaterialCard - flashcard created:', newFlashcardSet);
        return false; // Tell parent to delay modal closing for navigation
      }
    })
    setShowMenu(false)
  };

  const handleCreateNotes = (e) => {
    e.stopPropagation()
    onCreateNotes(file, {
      onSuccess: (newNote) => {
        // Auto-navigate to view the newly created note
        console.log('MaterialCard - note created:', newNote);
        return false; // Tell parent to delay modal closing for navigation
      }
    })
    setShowMenu(false)
  };

  const handleCreateQuiz = (e) => {
    e.stopPropagation()
    onCreateQuiz(file, {
      onSuccess: (newQuiz) => {
        // Auto-navigate to view the newly created quiz
        console.log('MaterialCard - quiz created:', newQuiz);
        return false; // Tell parent to delay modal closing for navigation
      }
    })
    setShowMenu(false)
  };

  if (variant === 'trash') {
    return (
      <div className="relative" ref={cardRef}>
        <div 
          className={`exam-card p-4 hover:shadow-lg transition-shadow cursor-pointer ${
            isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
          onClick={handleCardClick}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation()
                  onSelect && onSelect(file.id)
                }}
                className="mt-1"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate max-w-[200px]">{file.title}</h3>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRestore && onRestore(file)
              }}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors text-[#7BA7CC]"
              title="Restore"
            >
              <RefreshCw size={16} />
            </button>
          </div>
          
          {file.description && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-1 truncate">{file.description}</p>
          )}
          
          {/* Updated time display */}
          <p className="text-sm text-gray-600 mb-3">{timeAgo}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {getContentTags().map((tag, index) => (
                <span key={index} className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getTagColor ? getTagColor(tag) : 'bg-[#F0F0F0] text-[#4A4A4A]'}`}>
                  {tag}
                </span>
              ))}
              {getContentTags().length === 0 && (
                <span className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500">
                  No content yet
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'materials') {
    return (
      <div className="relative" ref={cardRef}>
        <div 
          className="exam-card p-4 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={handleCardClick}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{file.title}</h3>
                <div className="flex items-center bottom-1">
                  {isPublic ? (
                    <Globe size={16} className="text-[#7BA7CC]" />
                  ) : (
                    <Lock size={16} className="text-[#7BA7CC]" />
                  )}
                </div>
              </div>
            </div>
            <div className="relative" ref={menuRef}>
              <button 
                className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(!showMenu)
                }}
              >
                <MoreVertical size={16} />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    className="label-text w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      onVisibilityToggle() // Pass the material object, not title
                      setShowMenu(false)
                    }}
                  >
                    {isPublic ? (
                      <>
                        <Lock size={14} />
                        Make Private
                      </>
                    ) : (
                      <>
                        <Globe size={14} />
                        Make Public
                      </>
                    )}
                  </button>
                  
                  {/* ✅ ENHANCED: Updated create content buttons with enhanced options */}
                  <div className="h-px bg-gray-200 my-1"></div>
                  <button
                    className="label-text w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 flex items-center gap-2"
                    onClick={handleCreateFlashcards}
                  >
                    <span className="w-3 h-3 bg-[#FFB3BA] rounded-full"></span>
                    Create Flashcards
                  </button>
                  <button
                    className="label-text w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 flex items-center gap-2"
                    onClick={handleCreateNotes}
                  >
                    <span className="w-3 h-3 bg-[#BAFFC9] rounded-full"></span>
                    Create Notes
                  </button>
                  <button
                    className="label-text w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 flex items-center gap-2"
                    onClick={handleCreateQuiz}
                  >
                    <span className="w-3 h-3 bg-[#BAE1FF] rounded-full"></span>
                    Create Quiz
                  </button>
                  
                  <div className="h-px bg-gray-200 my-1"></div>
                  <button
                    className="label-text w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      onViewMaterial(file)
                      setShowMenu(false)
                    }}
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    className="label-text w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(file)
                      setShowMenu(false)
                    }}
                  >
                    <Trash size={14} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {file.description && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-1 truncate">{file.description}</p>
          )}
          
          {/* Updated time display */}
          <p className="text-sm text-gray-600 mb-3">{timeAgo}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {getContentTags().map((tag, index) => (
                <span key={index} className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getTagColor ? getTagColor(tag) : 'bg-[#F0F0F0] text-[#4A4A4A]'}`}>
                  {tag}
                </span>
              ))}
              {getContentTags().length === 0 && (
                <span className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500">
                  No content yet
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              <button 
                className="p-1 hover:bg-gray-100 rounded-full transition-colors text-[#7BA7CC]"
                title={isPinned ? 'Unpin' : 'Pin'}
                onClick={(e) => {
                  e.stopPropagation()
                  onPinToggle() // Pass the material object, not title
                }}
              >
                <Pin size={16} className={isPinned ? 'fill-current' : ''} />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Explore/Public materials variant
  return (
    <div className="relative" ref={cardRef}>
      <div 
        className="exam-card p-4 hover:shadow-lg transition-shadow cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{file.title}</h3>
              <div className="flex items-center bottom-1">
                <Globe size={16} className="text-[#7BA7CC]" />
              </div>
            </div>
          </div>
          <button 
            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-[#7BA7CC]"
            onClick={(e) => {
              e.stopPropagation()
              onCopy && onCopy(file.id)
            }}
            title="Make a copy"
          >
            <Copy size={16} />
          </button>
        </div>
        
        {file.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-1 truncate">{file.description}</p>
        )}
        
        {/* Owner information - only show in explore variant when showOwner is true */}
        {showOwner && file.owner && (
          <div className="flex items-center gap-1 mt-2 mb-1">
            <User size={12} className="text-gray-400" />
            <p className="text-xs text-gray-500">by {file.owner}</p>
          </div>
        )}
        
        {/* Updated time display */}
        <p className="text-sm text-gray-600 mb-3">{timeAgo}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {getContentTags().map((tag, index) => (
              <span key={index} className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getTagColor ? getTagColor(tag) : 'bg-[#F0F0F0] text-[#4A4A4A]'}`}>
                {tag}
              </span>
            ))}
            {getContentTags().length === 0 && (
              <span className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500">
                No content yet
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MaterialCard