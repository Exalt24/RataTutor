import { BookOpen, Download, Edit3, Eye, FileText, HelpCircle, MoreVertical, Paperclip, Trash2 } from 'lucide-react';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// ✅ NEW: Memoized utility functions
const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMilliseconds = now - date;
  const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);

  if (diffInDays < 1) {
    if (diffInHours < 1) {
      return `${diffInMinutes}m ago`;
    } else {
      return `${diffInHours}h ago`;
    }
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  } else {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
};

// ✅ NEW: Constants for better performance
const FILE_ICONS = {
  pdf: <Paperclip size={18} className="text-orange-500" />,
  docx: <Paperclip size={18} className="text-orange-500" />,
  pptx: <Paperclip size={18} className="text-orange-500" />,
  txt: <Paperclip size={18} className="text-orange-500" />,
  default: <Paperclip size={18} className="text-orange-500" />
};

const FILE_TYPES = {
  pdf: <span className="label-text text-xs">PDF Document</span>,
  docx: <span className="label-text text-xs">Word Document</span>,
  pptx: <span className="label-text text-xs">PowerPoint</span>,
  txt: <span className="label-text text-xs">Text File</span>,
  default: <span className="label-text text-xs">File</span>
};

const PREVIEW_SUPPORTED_EXTENSIONS = new Set(['pdf', 'docx', 'pptx', 'txt']);

const CONTENT_TYPE_ICONS = {
  flashcard: <BookOpen size={18} className="text-blue-500" />,
  note: <FileText size={18} className="text-purple-500" />,
  quiz: <HelpCircle size={18} className="text-green-500" />
};

// ✅ NEW: Memoized utility functions
const getFileExtension = (filename) => {
  return filename?.split('.').pop()?.toLowerCase() || '';
};

const getFileIcon = (filename) => {
  const ext = getFileExtension(filename);
  return FILE_ICONS[ext] || FILE_ICONS.default;
};

const getFileType = (filename) => {
  const ext = getFileExtension(filename);
  return FILE_TYPES[ext] || FILE_TYPES.default;
};

const supportsPreview = (filename) => {
  const ext = getFileExtension(filename);
  return PREVIEW_SUPPORTED_EXTENSIONS.has(ext);
};

// ✅ NEW: Custom hook for dropdown menu
const useDropdownMenu = () => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const toggleMenu = useCallback(() => {
    setShowMenu(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setShowMenu(false);
  }, []);

  return { showMenu, toggleMenu, closeMenu, menuRef };
};

// ✅ NEW: Memoized DropdownMenu component
const DropdownMenu = React.memo(({ 
  contentInfo, 
  onPreview, 
  onDownload, 
  onEdit, 
  onDelete,
  onClose 
}) => {
  const handleAction = (action) => (e) => {
    e.stopPropagation();
    action();
    onClose();
  };

  return (
    <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
      {/* Preview option for supported attachments */}
      {contentInfo.isAttachment && contentInfo.canPreview && onPreview && (
        <button
          className="label-text w-full px-4 py-2 text-sm hover:bg-gray-50 text-green-600 flex items-center gap-2"
          onClick={handleAction(onPreview)}
        >
          <Eye size={14} />
          Preview
        </button>
      )}
      
      {/* Download option for attachments */}
      {contentInfo.isAttachment && onDownload && (
        <button
          className="label-text w-full px-4 py-2 text-sm hover:bg-gray-50 text-blue-600 flex items-center gap-2"
          onClick={handleAction(onDownload)}
        >
          <Download size={14} />
          Download
        </button>
      )}
      
      {/* Edit option (only for non-attachments) */}
      {!contentInfo.isAttachment && onEdit && (
        <button
          className={`label-text w-full px-4 py-2 text-sm hover:bg-gray-50 ${contentInfo.colorClass} flex items-center gap-2`}
          onClick={handleAction(onEdit)}
        >
          <Edit3 size={14} />
          Edit {contentInfo.type}
        </button>
      )}
      
      {/* Delete option */}
      {onDelete && (
        <button
          className="label-text w-full px-4 py-2 text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
          onClick={handleAction(onDelete)}
        >
          <Trash2 size={14} />
          Delete
        </button>
      )}
    </div>
  );
});

DropdownMenu.displayName = 'DropdownMenu';

// ✅ MAIN: Optimized MaterialFile component
const MaterialFile = React.memo(({ 
  content, 
  onDelete, 
  onEdit, 
  onDownload, 
  onPreview, 
  readOnly = false 
}) => {
  const { showMenu, toggleMenu, closeMenu, menuRef } = useDropdownMenu();

  // ✅ NEW: Memoized content info calculation
  const contentInfo = useMemo(() => {
    // Check if this is an attachment (has file field)
    if (content.file) {
      const fileName = content.file.split('/').pop() || content.title || 'Unknown File';
      return {
        icon: <Paperclip size={18} className="text-orange-500" />,
        type: "Attachment",
        content: getFileType(fileName),
        colorClass: "text-orange-500",
        isAttachment: true,
        fileIcon: getFileIcon(fileName),
        canPreview: supportsPreview(fileName),
        fileName
      };
    }
    // Existing logic for other content types
    else if (content.flashcards || content.cards) {
      return {
        icon: CONTENT_TYPE_ICONS.flashcard,
        type: "Flashcard",
        content: `${content.flashcards?.length || content.cards?.length || 0} cards`,
        colorClass: "text-blue-500",
        isAttachment: false,
        canPreview: false
      };
    } else if (content.content) {
      return {
        icon: CONTENT_TYPE_ICONS.note,
        type: "Notes",
        content: `${content.content.length} characters`,
        colorClass: "text-purple-500",
        isAttachment: false,
        canPreview: false
      };
    } else if (content.questions) {
      return {
        icon: CONTENT_TYPE_ICONS.quiz,
        type: "Quiz",
        content: `${content.questions?.length || 0} questions`,
        colorClass: "text-green-500",
        isAttachment: false,
        canPreview: false
      };
    }
    return {
      icon: CONTENT_TYPE_ICONS.note,
      type: "Notes",
      content: "",
      colorClass: "text-blue-500",
      isAttachment: false,
      canPreview: false
    };
  }, [content]);

  // ✅ NEW: Memoized formatted time
  const formattedTime = useMemo(() => {
    const dateString = content.uploaded_at || content.updated_at || content.created_at || new Date();
    return formatRelativeTime(dateString);
  }, [content.uploaded_at, content.updated_at, content.created_at]);

  // ✅ NEW: Memoized display title
  const displayTitle = useMemo(() => {
    return contentInfo.isAttachment 
      ? contentInfo.fileName
      : (content.title || 'Untitled');
  }, [contentInfo.isAttachment, contentInfo.fileName, content.title]);

  // ✅ NEW: Optimized event handlers
  const handlePreviewClick = useCallback((e) => {
    e?.stopPropagation();
    onPreview?.(content);
  }, [onPreview, content]);

  const handleDownloadClick = useCallback((e) => {
    e?.stopPropagation();
    onDownload?.(content);
  }, [onDownload, content]);

  const handleEditClick = useCallback(() => {
    onEdit?.();
  }, [onEdit]);

  const handleDeleteClick = useCallback((e) => {
    onDelete?.(e, content.id);
  }, [onDelete, content.id]);

  const handleMenuToggle = useCallback((e) => {
    e.stopPropagation();
    toggleMenu();
  }, [toggleMenu]);

  // ✅ NEW: Enhanced main card click handler
  const handleCardClick = useCallback(() => {
    if (contentInfo.isAttachment) {
      if (contentInfo.canPreview && onPreview) {
        onPreview(content);
      } else if (onDownload) {
        onDownload(content);
      }
    }
    // For other content types, the parent component handles the click
  }, [contentInfo.isAttachment, contentInfo.canPreview, onPreview, onDownload, content]);

  return (
    <div className="relative transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl rounded-xl">
      <div 
        className="exam-card p-4 hover:shadow-lg transition-shadow cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Show file icon for attachments, regular icon for others */}
            {contentInfo.isAttachment ? contentInfo.fileIcon : contentInfo.icon}
            <h4 className="font-semibold truncate text-lg label-text flex-1">
              {displayTitle}
            </h4>
          </div>
          {!readOnly && (
            <div className="relative flex-shrink-0" ref={menuRef}>
              <button
                onClick={handleMenuToggle}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                aria-label="More options"
                aria-expanded={showMenu}
              >
                <MoreVertical size={16} />
              </button>
              {showMenu && (
                <DropdownMenu
                  contentInfo={contentInfo}
                  onPreview={handlePreviewClick}
                  onDownload={handleDownloadClick}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onClose={closeMenu}
                />
              )}
            </div>
          )}
        </div>
        
        {/* Show appropriate description */}
        <div className="mb-3">
          {contentInfo.isAttachment ? (
            <p className="text-sm text-gray-600">
              Uploaded {formattedTime}
            </p>
          ) : (
            content.description && (
              <p className="text-sm text-gray-600 truncate">
                {content.description}
              </p>
            )
          )}
        </div>
        
        {/* Enhanced bottom section */}
        {contentInfo.isAttachment ? (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{contentInfo.content}</span>
            <div className="flex items-center gap-2">
              {/* Preview button for supported files */}
              {contentInfo.canPreview && onPreview && (
                <button 
                  onClick={handlePreviewClick}
                  className="text-green-500 hover:text-green-600 font-medium flex items-center gap-1 text-xs transition-colors"
                  title="Preview file"
                  aria-label="Preview file"
                >
                  <Eye size={14} />
                </button>
              )}
              {/* Download button */}
              <button 
                onClick={handleDownloadClick}
                className="text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1 text-xs transition-colors"
                title="Download file"
                aria-label="Download file"
              >
                <Download size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span className="truncate flex-1 mr-2">
              {typeof contentInfo.content === 'string' && contentInfo.content.length > 100 
                ? `${contentInfo.content.substring(0, 100)}...` 
                : contentInfo.content}
            </span>
            <span className="flex-shrink-0">{formattedTime}</span>
          </div>
        )}
      </div>
    </div>
  );
});

MaterialFile.displayName = 'MaterialFile';

MaterialFile.propTypes = {
  content: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
    content: PropTypes.string,
    file: PropTypes.string, // For attachment files
    flashcards: PropTypes.array,
    cards: PropTypes.array,
    questions: PropTypes.array,
    updated_at: PropTypes.string,
    created_at: PropTypes.string,
    uploaded_at: PropTypes.string, // For attachment upload time
  }).isRequired,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  onDownload: PropTypes.func, // For attachment downloads
  onPreview: PropTypes.func, // For file preview
  readOnly: PropTypes.bool,
};

MaterialFile.defaultProps = {
  onDelete: null,
  onEdit: null,
  onDownload: null,
  onPreview: null,
  readOnly: false,
};

export default MaterialFile;