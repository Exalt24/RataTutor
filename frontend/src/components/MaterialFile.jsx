import { BookOpen, Download, Edit3, Eye, FileText, HelpCircle, MoreVertical, Paperclip, Trash2 } from 'lucide-react';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';

const MaterialFile = ({ content, onDelete, onEdit, onDownload, onPreview, readOnly = false }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Format the date to a relative time string (e.g., "2 days ago")
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

  // Get file type and icon for attachments
  const getFileIcon = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return <Paperclip size={18} className="text-orange-500" />;
      case 'docx':
        return <Paperclip size={18} className="text-orange-500" />;
      case 'pptx':
        return <Paperclip size={18} className="text-orange-500" />;
      case 'txt':
        return <Paperclip size={18} className="text-orange-500" />;
      default:
        return <Paperclip size={18} className="text-orange-500" />;
    }
  };

  const getFileType = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return <span className="label-text text-xs">PDF Document</span>;
      case 'docx':
        return <span className="label-text text-xs">Word Document</span>;
      case 'pptx':
        return <span className="label-text text-xs">PowerPoint</span>;
      case 'txt':
        return <span className="label-text text-xs">Text File</span>;
      default:
        return <span className="label-text text-xs">File</span>;
    }
  };

  // ✅ ENHANCED: Check if file type supports preview
  const supportsPreview = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    return ['pdf', 'docx', 'pptx', 'txt'].includes(ext);
  };

  // Updated content info function to handle attachments
  const getContentInfo = () => {
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
        canPreview: supportsPreview(fileName) // ✅ NEW: Preview capability
      };
    }
    // Existing logic for other content types
    else if (content.flashcards || content.cards) {
      return {
        icon: <BookOpen size={18} className="text-blue-500" />,
        type: "Flashcard",
        content: `${content.flashcards?.length || content.cards?.length || 0} cards`,
        colorClass: "text-blue-500",
        isAttachment: false,
        canPreview: false
      };
    } else if (content.content) {
      return {
        icon: <FileText size={18} className="text-purple-500" />,
        type: "Notes",
        content: `${content.content.length} characters`,
        colorClass: "text-purple-500",
        isAttachment: false,
        canPreview: false
      };
    } else if (content.questions) {
      return {
        icon: <HelpCircle size={18} className="text-green-500" />,
        type: "Quiz",
        content: `${content.questions?.length || 0} questions`,
        colorClass: "text-green-500",
        isAttachment: false,
        canPreview: false
      };
    }
    return {
      icon: <FileText size={18} className="text-blue-500" />,
      type: "Notes",
      content: "",
      colorClass: "text-blue-500",
      isAttachment: false,
      canPreview: false
    };
  };

  const contentInfo = getContentInfo();

  // ✅ NEW: Preview handler for attachments
  const handlePreviewClick = (e) => {
    e.stopPropagation();
    onPreview && onPreview(content);
    setShowMenu(false);
  };

  // Download handler for attachments
  const handleDownloadClick = (e) => {
    e.stopPropagation();
    onDownload && onDownload(content);
    setShowMenu(false);
  };

  // Edit handler
  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit && onEdit();
    setShowMenu(false);
  };

  // Delete handler
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete && onDelete(e, content.id);
    setShowMenu(false);
  };

  // ✅ ENHANCED: Handle main card click - preview for supported files, download for others
  const handleCardClick = () => {
    if (contentInfo.isAttachment) {
      if (contentInfo.canPreview && onPreview) {
        onPreview(content);
      } else if (onDownload) {
        onDownload(content);
      }
    }
    // For other content types, the parent component handles the click
  };

  return (
    <div className="relative transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl rounded-xl">
      <div 
        className="exam-card p-4 hover:shadow-lg transition-shadow cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Show file emoji for attachments, regular icon for others */}
            {contentInfo.isAttachment ? (
              getFileIcon(content.file)
            ) : (
              contentInfo.icon
            )}
            <h4 className="font-semibold md:truncate md:max-w-[150px] text-lg label-text">
              {contentInfo.isAttachment 
                ? (content.file?.split('/').pop() || content.title || 'Unknown File')
                : (content.title || 'Untitled')
              }
            </h4>
          </div>
          {!readOnly && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <MoreVertical size={16} />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  {/* ✅ NEW: Preview option for supported attachments */}
                  {contentInfo.isAttachment && contentInfo.canPreview && onPreview && (
                    <button
                      className="label-text w-full px-4 py-2 text-sm hover:bg-gray-50 text-green-600 flex items-center gap-2"
                      onClick={handlePreviewClick}
                    >
                      <Eye size={14} />
                      Preview
                    </button>
                  )}
                  
                  {/* Download option for attachments */}
                  {contentInfo.isAttachment && onDownload && (
                    <button
                      className="label-text w-full px-4 py-2 text-sm hover:bg-gray-50 text-blue-600 flex items-center gap-2"
                      onClick={handleDownloadClick}
                    >
                      <Download size={14} />
                      Download
                    </button>
                  )}
                  
                  {/* Edit option (only for non-attachments) */}
                  {!contentInfo.isAttachment && onEdit && (
                    <button
                      className={`label-text w-full px-4 py-2 text-sm hover:bg-gray-50 ${contentInfo.colorClass} flex items-center gap-2`}
                      onClick={handleEditClick}
                    >
                      <Edit3 size={14} />
                      Edit {contentInfo.type}
                    </button>
                  )}
                  
                  {/* Delete option */}
                  {onDelete && (
                    <button
                      className="label-text w-full px-4 py-2 text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                      onClick={handleDeleteClick}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Show appropriate description for attachments */}
        {contentInfo.isAttachment ? (
          <p className="text-sm text-gray-600 mb-3">
             Uploaded {formatRelativeTime(content.uploaded_at || content.created_at || new Date())}
          </p>
        ) : (
          content.description && (
            <p className="text-sm text-gray-600 mb-3 truncate">
              {content.description}
            </p>
          )
        )}
        
        {/* ✅ ENHANCED: Different bottom section for attachments vs other content */}
        {contentInfo.isAttachment ? (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{contentInfo.content}</span>
            <div className="flex items-center gap-2">
              {/* ✅ NEW: Preview button for supported files */}
              {contentInfo.canPreview && onPreview && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview(content);
                  }}
                  className="text-green-500 hover:text-green-600 font-medium flex items-center gap-1 text-xs"
                >
                  <Eye size={14} />
                </button>
              )}
              {/* Download button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload && onDownload(content);
                }}
                className="text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1 text-xs"
              >
                <Download size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{contentInfo.content?.length > 100 ? `${contentInfo.content.substring(0, 100)}...` : contentInfo.content}</span>
            <span>{formatRelativeTime(content.updated_at || content.created_at || new Date())}</span>
          </div>
        )}
      </div>
    </div>
  );
};

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
  onPreview: PropTypes.func, // ✅ NEW: For file preview
  readOnly: PropTypes.bool,
};

MaterialFile.defaultProps = {
  onDelete: null,
  onEdit: null,
  onDownload: null,
  onPreview: null, // ✅ NEW: Default prop
  readOnly: false,
};

export default MaterialFile;