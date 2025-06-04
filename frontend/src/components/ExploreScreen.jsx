import { FileQuestion, Search, X } from 'lucide-react'
import React, { useState } from 'react'
import MaterialCard from './MaterialCard'
import MaterialContent from './MaterialContent'

const ExploreScreen = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [showMaterialContent, setShowMaterialContent] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState(null)

  const handleViewMaterial = (material) => {
    setSelectedMaterial(material)
    setShowMaterialContent(true)
  }

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
      author: 'John Doe',
      createdAt: new Date(Date.now() - 270 * 24 * 60 * 60 * 1000).toISOString(),
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
      author: 'Jane Smith',
      createdAt: new Date(Date.now() - 270 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Quick notes and ideas',
      content: []
    },
    { 
      id: '3',
      title: '(Draft) 5 Testing', 
      updated: '367d ago',
      author: 'Mike Johnson',
      createdAt: new Date(Date.now() - 367 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Testing concepts and methodologies',
      content: []
    }
  ]

  // Format time ago string
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

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
      {!showMaterialContent && (
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
      )}

      {/* Featured Content Grid */}
      {showMaterialContent ? (
        <MaterialContent
          material={selectedMaterial}
          isPublic={true}
          onVisibilityToggle={() => {}}
          onExport={() => {}}
          onCreateFlashcards={() => {}}
          onCreateNotes={() => {}}
          onCreateQuiz={() => {}}
          onBack={() => setShowMaterialContent(false)}
          onTitleChange={() => {}}
          readOnly={true}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContent.map(item => (
            <MaterialCard
              key={item.id}
              file={item}
              variant="explore"
              isPublic={true}
              onViewMaterial={handleViewMaterial}
              timeAgo={formatTimeAgo(item.createdAt)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredContent.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-12">
          <FileQuestion size={64} className="text-[#1b81d4] mb-6" />
          <h3 className="label-text text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
            No Materials Found
          </h3>
          <p className="text-gray-600 text-center max-w-md leading-relaxed mb-6">
            {searchQuery ? (
              <>
                We couldn't find any materials matching "{searchQuery}". Try adjusting your search terms or filters.
              </>
            ) : (
              <>
                There are no materials available in this category. Try selecting a different category or check back later.
              </>
            )}
          </p>
        </div>
      )}
    </div>
  )
}

export default ExploreScreen 