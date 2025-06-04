import { Clock, Copy, Globe, Lock, MoreVertical, Pin, Trash } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

export const defaultFiles = [
  { 
    id: '1',
    title: 'Scripts sa IOT', 
    updated: '270d ago', 
    description: 'Collection of scripts and notes for Internet of Things course',
    content: [
      {
        id: '1-1',
        title: 'Introduction to Calculus',
        author: 'John Doe',
        description: 'A comprehensive guide covering limits, derivatives, and integrals with practical examples and exercises.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['Flashcard'],
        flashcards: [
          { front: 'What is a derivative?', back: 'The rate of change of a function with respect to its variable' },
          { front: 'What is an integral?', back: 'The area under a curve or the accumulation of a quantity' },
          { front: 'What is a limit?', back: 'The value that a function approaches as the input approaches some value' }
        ]
      },
      {
        id: '1-2',
        title: 'Linear Algebra Fundamentals',
        author: 'Jane Smith',
        description: 'An introduction to vectors, matrices, and linear transformations.',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['Notes'],
        content: `# Linear Algebra Fundamentals

## Vectors and Matrices
- Vectors: Ordered lists of numbers representing magnitude and direction
- Matrices: Rectangular arrays of numbers
- Operations: Addition, multiplication, and transformations

## Linear Transformations
- Matrix multiplication as transformation
- Determinants and their geometric meaning
- Eigenvalues and eigenvectors

## Applications
- Computer graphics
- Machine learning
- Quantum mechanics`
      },
      {
        id: '1-3',
        title: 'Calculus Quiz',
        author: 'John Doe',
        description: 'Test your knowledge of calculus fundamentals.',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['Quiz'],
        questions: [
          {
            question: 'What is the derivative of f(x) = x²?',
            options: ['2x', 'x²', '2', 'x'],
            correctAnswer: 0
          },
          {
            question: 'What is the integral of 2x?',
            options: ['x²', 'x² + C', '2x²', '2x² + C'],
            correctAnswer: 1
          }
        ]
      }
    ]
  },
  { 
    id: '2',
    title: 'Untitled', 
    updated: '270d ago', 
    description: 'Quick notes and ideas',
    content: []
  },
  { 
    id: '3',
    title: '(Draft) 5 Testing', 
    updated: '367d ago', 
    description: 'Testing concepts and methodologies',
    content: []
  }
]

const MaterialCard = ({ 
  file = defaultFiles[0],
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
      return 'bg-[#BAE1FF] text-[#1F4B7D]' // Soft blue
    } else if (tag.toLowerCase().includes('note')) {
      return 'bg-[#E1BAFF] text-[#4B1F7D]' // Soft purple
    } else if (tag.toLowerCase().includes('quiz')) {
      return 'bg-[#BAFFC9] text-[#1F7D2F]' // Soft green
    }
    return 'bg-[#F0F0F0] text-[#4A4A4A]' // Soft gray
  }

  // Calculate tags based on content
  const getContentTags = () => {
    const tags = [];
    if (file.content) {
      const flashcards = file.content.filter(item => item.tags?.includes('Flashcard'));
      const notes = file.content.filter(item => item.tags?.includes('Notes'));
      const quizzes = file.content.filter(item => item.tags?.includes('Quiz'));

      if (flashcards.length > 0) {
        tags.push(`Flashcards (${flashcards.length})`);
      }
      if (notes.length > 0) {
        tags.push(`Notes (${notes.length})`);
      }
      if (quizzes.length > 0) {
        tags.push(`Quizzes (${quizzes.length})`);
      }
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
                  <div className="h-px bg-gray-200 my-1"></div>
                  <button
                    className="label-text w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(file.title)
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
          
          <p className="text-sm text-gray-600 mb-3">{file.updated}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {getContentTags().map((tag, index) => (
                <span key={index} className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getTagColor(tag)}`}>
                  {tag}
                </span>
              ))}
            </div>
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