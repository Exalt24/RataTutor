import { Clock, Copy, Globe, Lock, MoreVertical, Pencil, Pin, Trash } from 'lucide-react'
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
  onCreateFlashcards,
  onCreateNotes,
  onCreateQuiz,
  onViewMaterial,
  getTagColor, // Function passed from parent
  getUpdatedLabel, // Function passed from parent  
  timeAgo // Formatted time string passed from parent
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

  const handleCardClick = () => {
    onViewMaterial(file)
  }

  // Calculate tags based on API data structure
  const getContentTags = () => {
    const tags = [];
    
    // Check for flashcard sets
    if (file.flashcard_sets && file.flashcard_sets.length > 0) {
      tags.push(`Flashcards (${file.flashcard_sets.length})`);
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
                  
                  {/* Add action buttons for creating content */}
                  <div className="h-px bg-gray-200 my-1"></div>
                  <button
                    className="label-text w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      onCreateFlashcards(file)
                      setShowMenu(false)
                    }}
                  >
                    <span className="w-3 h-3 bg-[#FFB3BA] rounded-full"></span>
                    Create Flashcards
                  </button>
                  <button
                    className="label-text w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      onCreateNotes(file)
                      setShowMenu(false)
                    }}
                  >
                    <span className="w-3 h-3 bg-[#BAFFC9] rounded-full"></span>
                    Create Notes
                  </button>
                  <button
                    className="label-text w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      onCreateQuiz(file)
                      setShowMenu(false)
                    }}
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
                      if (confirm(`Are you sure you want to delete "${file.title}"? This action cannot be undone.`)) {
                        onDelete(file)
                      }
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

  // Explore/Public materials variant (keeping existing logic)
  return (
    <div 
      className="exam-card p-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {file.typeIcon}
          <h3 className="font-semibold">{file.title}</h3>
        </div>
        <button 
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          onClick={() => onCopy(file.id)}
          title="Make a copy"
        >
          <Copy size={18} className="text-gray-400" />
        </button>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">By {file.author || file.owner}</p>
      
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {file.description}
      </p>
      
      <div className="flex items-center justify-end text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Clock size={16} />
          {timeAgo || file.timeAgo}
        </span>
      </div>
    </div>
  )
}

export default MaterialCard