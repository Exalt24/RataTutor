import { FileQuestion, RefreshCw, Search, X } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useLoading } from '../components/Loading/LoadingContext'
import { useToast } from '../components/Toast/ToastContext'
import { copyMaterial, getPublicMaterials } from '../services/apiService'
import MaterialCard from './MaterialCard'
import MaterialContent from './MaterialContent'

const ExploreScreen = ({ onRefreshMaterials }) => {
  const { showLoading, hideLoading } = useLoading()
  const { showToast } = useToast()

  // State management
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [showMaterialContent, setShowMaterialContent] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [materialsData, setMaterialsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch public materials from backend
  const fetchPublicMaterials = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Backend handles filtering for public materials from other users
      const response = await getPublicMaterials()
      setMaterialsData(response.data)
      
    } catch (err) {
      console.error('Error fetching public materials:', err)
      setError('Failed to load public materials. Please try again.')
      
      showToast({
        variant: "error",
        title: "Error loading materials",
        subtitle: "Failed to fetch public materials. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }, [showToast])

  // Load materials on component mount
  useEffect(() => {
    fetchPublicMaterials()
  }, [fetchPublicMaterials])

  // Refresh functionality
  const handleRefresh = useCallback(() => {
    fetchPublicMaterials()
  }, [fetchPublicMaterials])

  // Copy material functionality
  const handleCopyMaterial = useCallback(async (materialId) => {
    try {
      showLoading()
      
      const response = await copyMaterial(materialId)
      
      showToast({
        variant: "success",
        title: "Material copied successfully!",
        subtitle: `"${response.data.title}" has been added to your materials.`,
      })
      
      console.log('Material copied:', response.data)
      
      // Refresh materials data in Dashboard after successful copy
      if (onRefreshMaterials) {
        await onRefreshMaterials()
      }
      
    } catch (err) {
      console.error('Error copying material:', err)
      
      const errorMessage = err.response?.data?.message || 'Failed to copy material. Please try again.'
      
      showToast({
        variant: "error",
        title: "Failed to copy material",
        subtitle: errorMessage,
      })
    } finally {
      hideLoading()
    }
  }, [showLoading, hideLoading, showToast, onRefreshMaterials])

  // View material handler
  const handleViewMaterial = useCallback((material) => {
    setSelectedMaterial(material)
    setShowMaterialContent(true)
  }, [])

  // Memoized filtered content
  const filteredMaterials = useMemo(() => {
    if (!materialsData || materialsData.length === 0) return []

    return materialsData.filter(material => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.owner?.toLowerCase().includes(searchQuery.toLowerCase())

      // Content type filter
      const matchesFilter = selectedFilter === 'all' || 
        (selectedFilter === 'notes' && material.notes && material.notes.length > 0) ||
        (selectedFilter === 'flashcards' && material.flashcard_sets && material.flashcard_sets.length > 0) ||
        (selectedFilter === 'quizzes' && material.quizzes && material.quizzes.length > 0)

      return matchesSearch && matchesFilter
    })
  }, [materialsData, searchQuery, selectedFilter])

  // Tag color function
  const getTagColor = useCallback((tag) => {
    if (tag.toLowerCase().includes('flashcard')) return 'bg-[#FFB3BA] text-[#7D1F1F]'
    if (tag.toLowerCase().includes('note')) return 'bg-[#BAFFC9] text-[#1F7D2F]'
    if (tag.toLowerCase().includes('quiz')) return 'bg-[#BAE1FF] text-[#1F4B7D]'
    if (tag.toLowerCase().includes('file')) return 'bg-[#F0F0F0] text-[#4A4A4A]'
    return 'bg-[#F0F0F0] text-[#4A4A4A]'
  }, [])

  // Format time ago
  const formatTimeAgo = useCallback((dateString) => {
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
  }, [])

  // Get updated label
  const getUpdatedLabel = useCallback((dateString) => {
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
  }, [formatTimeAgo])

  const clearSearch = () => {
    setSearchQuery('')
  }

  const categories = [
    { id: 'all', name: 'All Materials' },
    { id: 'notes', name: 'Notes' },
    { id: 'flashcards', name: 'Flashcards' },
    { id: 'quizzes', name: 'Quizzes' }
  ]

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-12">
        <RefreshCw size={48} className="text-[#1b81d4] mb-4 animate-spin" />
        <h3 className="label-text text-xl font-semibold text-gray-900 mb-2">
          Loading Public Materials
        </h3>
        <p className="text-gray-600 text-center">
          Discovering amazing content shared by the community...
        </p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-12">
        <FileQuestion size={64} className="text-red-500 mb-6" />
        <h3 className="label-text text-2xl font-semibold text-red-900 mb-3">
          Failed to Load Materials
        </h3>
        <p className="text-red-600 text-center max-w-md leading-relaxed mb-6">
          {error}
        </p>
        <button
          onClick={handleRefresh}
          className="exam-button-mini"
          data-hover="Try Again"
        >
          <RefreshCw size={16} className="mr-2" />
          Try Again
        </button>
      </div>
    )
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
                placeholder="Search public materials..."
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
                Found {filteredMaterials.length} results
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              className="exam-button-mini py-2 px-3 flex items-center gap-2"
              data-hover="Refresh"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
            
            {/* Filter categories */}
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
        </div>
      )}

      {/* Material Content or Grid */}
      {showMaterialContent ? (
        <MaterialContent
          material={selectedMaterial}
          isPublic={true}
          onVisibilityToggle={() => {}} // Disabled for public materials
          onExport={() => handleCopyMaterial(selectedMaterial?.id)} // Copy functionality
          onCreateFlashcards={() => {}} // Disabled for public materials
          onCreateNotes={() => {}} // Disabled for public materials
          onCreateQuiz={() => {}} // Disabled for public materials
          onBack={() => setShowMaterialContent(false)}
          onTitleChange={() => {}} // Disabled for public materials
          readOnly={true}
        />
      ) : (
        <>
          {/* Statistics header */}
          {materialsData.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 label-text">
                    Community Materials
                  </h2>
                  <p className="text-sm text-gray-600 label-text">
                    Discover {materialsData.length} public materials shared by the community
                    {searchQuery && ` • ${filteredMaterials.length} match your search`}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredMaterials.length}
                  </div>
                  <div className="text-xs text-gray-500">
                    {searchQuery ? 'Results' : 'Available'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Materials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.map(material => (
              <MaterialCard
                key={material.id}
                file={material}
                variant="explore"
                isPublic={true}
                showOwner={true}
                onViewMaterial={handleViewMaterial}
                onCopy={handleCopyMaterial}
                timeAgo={formatTimeAgo(material.updated_at)}
                getTagColor={getTagColor}
                getUpdatedLabel={getUpdatedLabel}
              />
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && filteredMaterials.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-12">
          <FileQuestion size={64} className="text-[#1b81d4] mb-6" />
          <h3 className="label-text text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
            {materialsData.length === 0 ? 'No Public Materials Available' : 'No Materials Found'}
          </h3>
          <p className="text-gray-600 text-center max-w-md leading-relaxed mb-6">
            {materialsData.length === 0 ? (
              <>
                No public materials from other users are available yet. To see materials here, other users need to create materials and mark them as public.
                <br /><br />
                <strong>Tip:</strong> You can make your own materials public from the Materials tab to share them with the community!
              </>
            ) : searchQuery ? (
              <>
                We couldn't find any materials matching "{searchQuery}". Try adjusting your search terms or filters.
              </>
            ) : (
              <>
                There are no materials available in this category. Try selecting a different category or check back later.
              </>
            )}
          </p>
          {(searchQuery || selectedFilter !== 'all') && (
            <div className="flex gap-3">
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="exam-button-mini"
                  data-hover="Clear Search"
                >
                  Clear Search
                </button>
              )}
              {selectedFilter !== 'all' && (
                <button
                  onClick={() => setSelectedFilter('all')}
                  className="exam-button-mini"
                  data-hover="Show All"
                >
                  Show All Categories
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ExploreScreen