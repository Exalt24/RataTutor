import { Clock, Copy, Download, Globe, Lock, MoreVertical, Pin } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

const MaterialCard = ({ 
  file, 
  isPinned, 
  onPinToggle, 
  onVisibilityToggle, 
  onExport,
  onCopy,
  variant = 'materials', // 'materials' or 'explore'
  isPublic = false // Add isPublic prop with default value
}) => {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

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
      <div className="exam-card p-4 hover:shadow-lg transition-shadow">
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
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreVertical size={16} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  className="label-text w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 flex items-center gap-2"
                  onClick={() => {
                    onExport(file.title)
                    setShowMenu(false)
                  }}
                >
                  <Download size={14} />
                  Export Material
                </button>
                <button
                  className="label-text w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 flex items-center gap-2"
                  onClick={() => {
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
        
        <p className="text-sm text-gray-600 mb-3">{file.updated}</p>
        
        <div className="flex items-center justify-between">
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getTagColor(file.tag)}`}>
            {file.tag}
          </span>
          <div className="flex space-x-2">
            <button 
              className="p-1 hover:bg-gray-100 rounded-full transition-colors text-[#7BA7CC]"
              title={isPinned ? 'Unpin' : 'Pin'}
              onClick={() => onPinToggle(file.title)}
            >
              <Pin size={16} className={isPinned ? 'fill-current' : ''} />
            </button>
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