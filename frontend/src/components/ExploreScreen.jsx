import { Compass, Search, X } from 'lucide-react'
import React, { useState } from 'react'
import MaterialCard from './MaterialCard'

const ExploreScreen = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'notes', name: 'Notes' },
    { id: 'flashcards', name: 'Flashcards' },
    { id: 'quizzes', name: 'Quizzes' }
  ]

  const defaultFiles = [
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

  // Filter materials based on search query and selected filter
  const filteredContent = defaultFiles.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || 
      (item.content?.some(content => content.tags?.includes(selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1))))
    return matchesSearch && matchesFilter
  })

  const clearSearch = () => {
    setSearchQuery('')
  }

  return (
    <div className="space-y-6 p-4">
      {/* Search and Filter Section */}
      <div className="flex flex-col justify-between sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative w-full max-w-md mx-auto sm:mx-0">
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
              placeholder="Search notes, flashcards, and quizzes..."
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
            <p className="mt-1 text-xs text-gray-500 text-center sm:text-left">
              Found {filteredContent.length} results
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedFilter(category.id)}
              data-hover={category.name}
              className={`exam-button-mini ${
                selectedFilter === category.id
                  ? 'text-white'
                  : 'text-gray-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContent.map(item => (
          <MaterialCard
            key={item.id}
            file={item}
            variant="explore"
            isPublic={true}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredContent.length === 0 && (
        <div className="text-center space-y-2 p-8">
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center bg-gray-100">
            <Compass size={40} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold">No results found</h2>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}

export default ExploreScreen 