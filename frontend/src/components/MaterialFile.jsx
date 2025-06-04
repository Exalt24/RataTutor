import { BookOpen, Clock, FileText, HelpCircle, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';

const MaterialFile = ({ content, onDelete, onEdit }) => {
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
        return `${diffInMinutes} minutes ago`;
      } else {
        return `${diffInHours} hours ago`;
      }
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInWeeks < 4) {
      return `${diffInWeeks} weeks ago`;
    } else {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
  };

  // Get icon based on content type
  const getContentIcon = () => {
    if (content.tags?.includes('Flashcard')) {
      return <BookOpen size={20} className="text-blue-500" />;
    } else if (content.tags?.includes('Notes')) {
      return <FileText size={20} className="text-purple-500" />;
    } else if (content.tags?.includes('Quiz')) {
      return <HelpCircle size={20} className="text-green-500" />;
    }
    return <FileText size={20} className="text-blue-500" />; // Default icon
  };

  // Delete handler
  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Stop event from bubbling up
    onDelete && onDelete(e, content.id);
    setShowMenu(false);
  };

  // Edit handler
  const handleEditClick = (e) => {
    e.stopPropagation(); // Stop event from bubbling up
    onEdit && onEdit(content);
    setShowMenu(false);
  };

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-xl shadow p-4 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {getContentIcon()}
              <h3 className="text-lg font-semibold text-gray-900 truncate label-text" title={content.title || 'Untitled'}>{content.title || 'Untitled'}</h3>
            </div>
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
                  <button
                    className="label-text w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                    onClick={handleEditClick}
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    className="label-text w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                    onClick={handleDeleteClick}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2 label-text">By {content.author || 'Unknown'}</p>
        </div>
        <div className="flex items-center justify-end text-gray-500 text-xs label-text">
          <Clock size={12} className="mr-1" />
          {formatRelativeTime(content.createdAt || new Date())}
        </div>
      </div>
    </div>
  );
};

MaterialFile.propTypes = {
  content: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    tags: PropTypes.arrayOf(PropTypes.string),
    author: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
};

MaterialFile.defaultProps = {
  onDelete: null,
  onEdit: null,
};

export default MaterialFile;
