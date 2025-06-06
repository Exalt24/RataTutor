import { Copy, Globe, Lock, MoreVertical, Pencil, Pin, RefreshCw, Trash, User } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Content tags configuration
const CONTENT_TAG_CONFIG = {
  flashcard_sets: {
    label: 'Flashcard Sets',
    color: 'bg-[#FFB3BA] text-[#7D1F1F]'
  },
  notes: {
    label: 'Notes', 
    color: 'bg-[#BAFFC9] text-[#1F7D2F]'
  },
  quizzes: {
    label: 'Quizzes',
    color: 'bg-[#BAE1FF] text-[#1F4B7D]'
  },
  attachments: {
    label: 'Files',
    color: 'bg-[#FFE4B3] text-[#7D4F1F]'
  }
};

const DEFAULT_TAG_COLOR = 'bg-[#F0F0F0] text-[#4A4A4A]';

// ✅ Custom hook for menu management
const useDropdownMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  return { isOpen, toggleMenu, closeMenu, menuRef };
};

// ✅ Memoized content tags calculation
const useContentTags = (material) => {
  return useMemo(() => {
    const tags = [];
    
    Object.entries(CONTENT_TAG_CONFIG).forEach(([key, config]) => {
      const count = material[key]?.length || 0;
      if (count > 0) {
        tags.push({
          key,
          label: `${config.label} (${count})`,
          color: config.color
        });
      }
    });
    
    return tags;
  }, [material]);
};

// ✅ Dropdown menu component
const DropdownMenu = React.memo(({ 
  isOpen, 
  onClose, 
  isPublic, 
  onVisibilityToggle, 
  onCreateFlashcards,
  onCreateNotes, 
  onCreateQuiz,
  onViewMaterial,
  onDelete,
  material
}) => {
  if (!isOpen) return null;

  const handleAction = (action) => (e) => {
    e.stopPropagation();
    action();
    onClose();
  };

  return (
    <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
      <button
        className="label-text w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 flex items-center gap-2"
        onClick={handleAction(onVisibilityToggle)}
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
        className="label-text w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 flex items-center gap-2"
        onClick={handleAction(onCreateFlashcards)}
      >
        <span className="w-3 h-3 bg-[#FFB3BA] rounded-full"></span>
        Create Flashcards
      </button>
      
      <button
        className="label-text w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 flex items-center gap-2"
        onClick={handleAction(onCreateNotes)}
      >
        <span className="w-3 h-3 bg-[#BAFFC9] rounded-full"></span>
        Create Notes
      </button>
      
      <button
        className="label-text w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 flex items-center gap-2"
        onClick={handleAction(onCreateQuiz)}
      >
        <span className="w-3 h-3 bg-[#BAE1FF] rounded-full"></span>
        Create Quiz
      </button>
      
      <div className="h-px bg-gray-200 my-1"></div>
      
      <button
        className="label-text w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 flex items-center gap-2"
        onClick={handleAction(onViewMaterial)}
      >
        <Pencil size={14} />
        Edit
      </button>
      
      <button
        className="label-text w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
        onClick={handleAction(onDelete)}
      >
        <Trash size={14} />
        Delete
      </button>
    </div>
  );
});

DropdownMenu.displayName = 'DropdownMenu';

// ✅ Main MaterialCard component with performance optimizations
const MaterialCard = React.memo(({ 
  file: material, // Renamed for clarity
  isPinned, 
  onPinToggle, 
  onVisibilityToggle, 
  onDelete,
  onCopy,
  variant = 'materials',
  isPublic = false,
  showOwner = false,
  onCreateFlashcards,
  onCreateNotes,
  onCreateQuiz,
  onViewMaterial,
  timeAgo,
  isSelected,
  onSelect,
  onRestore
}) => {
  const { isOpen: showMenu, toggleMenu, closeMenu, menuRef } = useDropdownMenu();
  const contentTags = useContentTags(material);
  const cardRef = useRef(null);

  // ✅ Memoized handlers to prevent unnecessary re-renders
  const handleCardClick = useCallback((e) => {
    if (variant === 'trash') {
      if (e.target.tagName === 'INPUT' || e.target.closest('button')) {
        return;
      }
      onSelect?.(material.id);
    } else {
      onViewMaterial(material);
    }
  }, [variant, material, onSelect, onViewMaterial]);

  const handleMenuToggle = useCallback((e) => {
    e.stopPropagation();
    toggleMenu();
  }, [toggleMenu]);

  const handlePinToggle = useCallback((e) => {
    e.stopPropagation();
    onPinToggle();
  }, [onPinToggle]);

  const handleSelect = useCallback((e) => {
    e.stopPropagation();
    onSelect?.(material.id);
  }, [onSelect, material.id]);

  const handleRestore = useCallback((e) => {
    e.stopPropagation();
    onRestore?.(material);
  }, [onRestore, material]);

  const handleCopy = useCallback((e) => {
    e.stopPropagation();
    onCopy?.(material.id);
  }, [onCopy, material.id]);

  // ✅ Enhanced create handlers with better naming
  const createHandlers = useMemo(() => ({
    flashcards: () => onCreateFlashcards(material),
    notes: () => onCreateNotes(material), 
    quiz: () => onCreateQuiz(material),
    view: () => onViewMaterial(material),
    delete: () => onDelete(material)
  }), [material, onCreateFlashcards, onCreateNotes, onCreateQuiz, onViewMaterial, onDelete]);

  // ✅ Render trash variant
  if (variant === 'trash') {
    return (
      <div className="relative" ref={cardRef}>
        <div 
          className={`exam-card p-4 hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-[1.02] ${
            isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
          onClick={handleCardClick}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={handleSelect}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
                aria-label={`Select ${material.title}`}
              />
              <div>
                <h3 className="font-semibold text-gray-900 truncate max-w-[200px]">
                  {material.title}
                </h3>
                {material.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {material.description}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleRestore}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-[#7BA7CC] hover:text-[#1b81d4]"
              title="Restore material"
              aria-label={`Restore ${material.title}`}
            >
              <RefreshCw size={16} />
            </button>
          </div>
          
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">{timeAgo}</p>
            <div className="flex flex-wrap gap-2">
              {contentTags.length > 0 ? (
                contentTags.map((tag) => (
                  <span 
                    key={tag.key} 
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${tag.color}`}
                  >
                    {tag.label}
                  </span>
                ))
              ) : (
                <span className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500">
                  No content yet
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Render materials variant
  if (variant === 'materials') {
    return (
      <div className="relative" ref={cardRef}>
        <div 
          className="exam-card p-4 hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-[1.02]"
          onClick={handleCardClick}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {material.title}
                  </h3>
                  {isPublic ? (
                    <Globe size={16} className="text-[#7BA7CC] flex-shrink-0" />
                  ) : (
                    <Lock size={16} className="text-[#7BA7CC] flex-shrink-0" />
                  )}
                </div>
                {material.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {material.description}
                  </p>
                )}
              </div>
            </div>
            
            <div className="relative flex-shrink-0" ref={menuRef}>
              <button 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                onClick={handleMenuToggle}
                aria-label="More options"
                aria-expanded={showMenu}
              >
                <MoreVertical size={16} />
              </button>
              
              <DropdownMenu
                isOpen={showMenu}
                onClose={closeMenu}
                isPublic={isPublic}
                onVisibilityToggle={onVisibilityToggle}
                onCreateFlashcards={createHandlers.flashcards}
                onCreateNotes={createHandlers.notes}
                onCreateQuiz={createHandlers.quiz}
                onViewMaterial={createHandlers.view}
                onDelete={createHandlers.delete}
                material={material}
              />
            </div>
          </div>
          
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-3">{timeAgo}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2 flex-1">
                {contentTags.length > 0 ? (
                  contentTags.map((tag) => (
                    <span 
                      key={tag.key} 
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${tag.color}`}
                    >
                      {tag.label}
                    </span>
                  ))
                ) : (
                  <span className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500">
                    No content yet
                  </span>
                )}
              </div>
              
              <button 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-[#7BA7CC] hover:text-[#1b81d4] flex-shrink-0"
                title={isPinned ? 'Unpin material' : 'Pin material'}
                onClick={handlePinToggle}
                aria-label={isPinned ? `Unpin ${material.title}` : `Pin ${material.title}`}
              >
                <Pin size={16} className={isPinned ? 'fill-current' : ''} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Render explore/public variant
  return (
    <div className="relative" ref={cardRef}>
      <div 
        className="exam-card p-4 hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-[1.02]"
        onClick={handleCardClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {material.title}
                </h3>
                <Globe size={16} className="text-[#7BA7CC] flex-shrink-0" />
              </div>
              {material.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {material.description}
                </p>
              )}
              {showOwner && material.owner && (
                <div className="flex items-center gap-1 mt-2">
                  <User size={12} className="text-gray-400" />
                  <p className="text-xs text-gray-500">by {material.owner}</p>
                </div>
              )}
            </div>
          </div>
          
          <button 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-[#7BA7CC] hover:text-[#1b81d4] flex-shrink-0"
            onClick={handleCopy}
            title="Make a copy"
            aria-label={`Make a copy of ${material.title}`}
          >
            <Copy size={16} />
          </button>
        </div>
        
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-3">{timeAgo}</p>
          
          <div className="flex flex-wrap gap-2">
            {contentTags.length > 0 ? (
              contentTags.map((tag) => (
                <span 
                  key={tag.key} 
                  className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${tag.color}`}
                >
                  {tag.label}
                </span>
              ))
            ) : (
              <span className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500">
                No content yet
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

MaterialCard.displayName = 'MaterialCard';

export default MaterialCard;