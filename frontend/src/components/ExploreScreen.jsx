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
              className="w-full pl-12 pr-12 py-3 rounded-full focus:outline-none text-sm"
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