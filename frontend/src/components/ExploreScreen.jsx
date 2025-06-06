import { FileQuestion, RefreshCw, Search, X } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLoading } from '../components/Loading/LoadingContext'
import { useToast } from '../components/Toast/ToastContext'
import { useMaterials } from '../utils/materialsContext'
import { copyMaterial, getPublicMaterials } from '../services/apiService'
import { trackActivityAndNotify, createCombinedSuccessMessage } from '../utils/streakNotifications'
import MaterialCard from './MaterialCard'

// ✅ ADDED: Accept onRefreshProfile prop from Dashboard
const ExploreScreen = ({ onRefreshProfile }) => {
  const navigate = useNavigate()
  const { showLoading, hideLoading } = useLoading()
  const { showToast } = useToast()
  const { addMaterial, fetchMaterials } = useMaterials()

  // State management
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [materialsData, setMaterialsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch public materials from backend
  const fetchPublicMaterials = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
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

  useEffect(() => {
    fetchPublicMaterials()
  }, [fetchPublicMaterials])

  const handleRefresh = useCallback(() => {
    fetchPublicMaterials()
  }, [fetchPublicMaterials])

  const handleCopyMaterial = useCallback(async (materialId) => {
  try {
    showLoading()
    
    console.log('🔄 Starting copy material...') // Debug log
    
    const response = await copyMaterial(materialId)
    const copiedMaterial = response.data
    
    console.log('✅ Material copied successfully:', copiedMaterial) // Debug log
    
    // ✅ NEW: Track streak activity
    const streakResult = await trackActivityAndNotify(showToast, true);
    
    // Step 1: Add to materials context
    addMaterial(copiedMaterial)
    
    // Step 2: Explicit profile refresh
    if (onRefreshProfile) {
      console.log('🔄 Triggering explicit profile refresh...') // Debug log
      await onRefreshProfile()
    }
    
    // Step 3: Refresh materials for consistency
    setTimeout(async () => {
      await fetchMaterials()
      console.log('✅ Materials refreshed') // Debug log
    }, 200)
    
    // ✅ UPDATED: Use combined message that includes streak info
    const baseTitle = "Material copied successfully!";
    const baseSubtitle = `"${copiedMaterial.title}" has been added to your materials.`;
    
    const combinedMessage = createCombinedSuccessMessage(baseTitle, baseSubtitle, streakResult);
    
    showToast({
      variant: "success",
      title: combinedMessage.title,
      subtitle: combinedMessage.subtitle,
    })
    
    // Step 4: Navigate to the copied material
    setTimeout(() => {
      navigate(`/dashboard/materials/${copiedMaterial.id}`)
    }, 100)
    
  } catch (err) {
    console.error('❌ Error copying material:', err)
    
    const errorMessage = err.response?.data?.message || 'Failed to copy material. Please try again.'
    
    showToast({
      variant: "error",
      title: "Failed to copy material",
      subtitle: errorMessage,
    })
  } finally {
    hideLoading()
  }
}, [showLoading, hideLoading, showToast, addMaterial, fetchMaterials, navigate, onRefreshProfile])

  const handleViewMaterial = useCallback((material) => {
    navigate(`/dashboard/materials/${material.id}`)
  }, [navigate])

  const filteredMaterials = useMemo(() => {
    if (!materialsData || materialsData.length === 0) return []

    return materialsData.filter(material => {
      const matchesSearch = searchQuery === '' || 
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.owner?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesFilter = selectedFilter === 'all' || 
        (selectedFilter === 'notes' && material.notes && material.notes.length > 0) ||
        (selectedFilter === 'flashcards' && material.flashcard_sets && material.flashcard_sets.length > 0) ||
        (selectedFilter === 'quizzes' && material.quizzes && material.quizzes.length > 0)

      return matchesSearch && matchesFilter
    })
  }, [materialsData, searchQuery, selectedFilter])

  const getTagColor = useCallback((tag) => {
    if (tag.toLowerCase().includes('flashcard')) return 'bg-[#FFB3BA] text-[#7D1F1F]'
    if (tag.toLowerCase().includes('note')) return 'bg-[#BAFFC9] text-[#1F7D2F]'
    if (tag.toLowerCase().includes('quiz')) return 'bg-[#BAE1FF] text-[#1F4B7D]'
    if (tag.toLowerCase().includes('file')) return 'bg-[#F0F0F0] text-[#4A4A4A]'
    return 'bg-[#F0F0F0] text-[#4A4A4A]'
  }, [])

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
      <div className="flex flex-col justify-between sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative w-full max-w-md mx-auto sm:mx-0">
          <div className={`
            relative flex items-center
            transition-all duration-200
            ${isSearchFocused ? 'ring-1 ring-[#1b81d4]' : ''}
            rounded-full border border-gray-200
            bg-white
          `}>
            <Search 
              className={`
                absolute left-4
                transition-colors duration-200
                ${isSearchFocused ? 'text-[#1b81d4]' : 'text-gray-400'}
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
              className="label-text w-full pl-12 pr-12 py-2 border border-[#7BA7CC] rounded-full focus:outline-none text-sm"
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
          <button
            onClick={handleRefresh}
            className="exam-button-mini py-2 px-3 flex items-center gap-2"
            data-hover="Refresh"
          >
            Refresh
          </button>
          
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

      {!loading && filteredMaterials.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-12">
          <FileQuestion size={64} className="text-[#1b81d4] mb-6" />
          <h3 className="label-text text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
            {materialsData.length === 0 ? 'No Public Materials Available' : 'No Materials Found'}
          </h3>
          <p className="text-gray-600 text-center max-w-md leading-relaxed mb-6">
            {materialsData.length === 0 ? (
              <>
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
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ExploreScreen