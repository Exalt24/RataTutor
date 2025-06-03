import { Clock, Copy, Delete, Download, Globe, Lock, MoreVertical, Pin, Trash } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

export const defaultFiles = [
  { 
    title: 'Scripts sa IOT', 
    updated: '270d ago', 
    tag: 'Flashcards (33)',
    description: 'Collection of scripts and notes for Internet of Things course',
    content: {
      flashcards: [
        { title: 'IoT Basics', count: 15 },
        { title: 'Network Protocols', count: 8 },
        { title: 'Security Concepts', count: 10 }
      ],
      notes: [
        { title: 'Course Overview', updated: '2d ago' },
        { title: 'Lab Notes', updated: '5d ago' }
      ],
      quizzes: [
        { title: 'Midterm Review', questions: 20 },
        { title: 'Final Practice', questions: 30 }
      ]
    }
  },
  { 
    title: 'Untitled', 
    updated: '270d ago', 
    tag: 'Note',
    description: 'Quick notes and ideas',
    content: {
      notes: [
        { title: 'Quick Notes', updated: '1d ago' }
      ]
    }
  },
  { 
    title: '(Draft) 5 Testing', 
    updated: '367d ago', 
    tag: 'Flashcards (14)',
    description: 'Testing concepts and methodologies',
    content: {
      flashcards: [
        { title: 'Testing Methods', count: 14 }
      ]
    }
  }
]

const MaterialCard = ({ 
  file = defaultFiles[0],
  isPinned, 
  onPinToggle, 
  onVisibilityToggle, 
  onExport,
  onCopy,
  variant = 'materials',
  isPublic = false,
  onCreateFlashcards,
  onCreateNotes,
  onCreateQuiz,
  onViewMaterial
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
                      onExport(file.title)
                      setShowMenu(false)
                    }}
                  >
                    <Trash size={14} />
                    Delete
                  </button>
                  <button
                    className="label-text w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      onVisibilityToggle(file.title)
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
                </div>
              )}
            </div>
          </div>
          
          {file.description && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{file.description}</p>
          )}
          
          <p className="text-sm text-gray-600 mb-3">{file.updated}</p>
          
          <div className="flex items-center justify-between">
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getTagColor(file.tag)}`}>
              {file.tag}
            </span>
            <div className="flex space-x-2">
              <button 
                className="p-1 hover:bg-gray-100 rounded-full transition-colors text-[#7BA7CC]"
                title={isPinned ? 'Unpin' : 'Pin'}
                onClick={(e) => {
                  e.stopPropagation()
                  onPinToggle(file.title)
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

  return (
    <div className="exam-card p-4 hover:shadow-lg transition-shadow">
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
      
      <p className="text-sm text-gray-600 mb-3">By {file.author}</p>
      
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {file.description}
      </p>
      
      <div className="flex items-center justify-end text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Clock size={16} />
          {file.timeAgo}
        </span>
      </div>
    </div>
  )
}

export default MaterialCard 