import { BookOpen, FileText, HelpCircle, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';

const MaterialFile = ({ content, onDelete, onEdit, readOnly = false }) => {
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

  // Get icon and content type based on content object
  const getContentInfo = () => {
    if (content.flashcards || content.cards) {
      return {
        icon: <BookOpen size={18} className="text-blue-500" />,
        type: "Flashcard",
        content: `${content.flashcards?.length || content.cards?.length || 0} cards`
      };
    } else if (content.content) {
      return {
        icon: <FileText size={18} className="text-purple-500" />,
        type: "Notes",
        content: content.content
      };
    } else if (content.questions) {
      return {
        icon: <HelpCircle size={18} className="text-green-500" />,
        type: "Quiz",
        content: `${content.questions?.length || 0} questions`
      };
    }
    return {
      icon: <FileText size={18} className="text-blue-500" />,
      type: "Notes",
      content: ""
    };
  };

  const contentInfo = getContentInfo();

  // Delete handler
  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Stop event from bubbling up
    onDelete && onDelete(e, content.id);
    setShowMenu(false);
  };

  // Edit handler
  const handleEditClick = (e) => {
    e.stopPropagation(); // Stop event from bubbling up
    if (onEdit) {
      onEdit(content);
    }
    setShowMenu(false);
  };

  return (
    <div className="relative transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl rounded-xl">
      <div className="exam-card p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {contentInfo.icon}
            <h3 className="font-semibold md:truncate md:max-w-[150px] text-sm">{content.title || 'Untitled'}</h3>
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
          )}
        </div>
        
        {content.description && (
          <p className="text-sm text-gray-600 mb-3 truncate">
            {content.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{contentInfo.content?.length > 100 ? `${contentInfo.content.substring(0, 100)}...` : contentInfo.content}</span>
          <span>{formatRelativeTime(content.updated_at || content.created_at || new Date())}</span>
        </div>
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
    flashcards: PropTypes.array,
    cards: PropTypes.array,
    questions: PropTypes.array,
    updated_at: PropTypes.string,
    created_at: PropTypes.string,
  }).isRequired,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  readOnly: PropTypes.bool,
};

MaterialFile.defaultProps = {
  onDelete: null,
  onEdit: null,
  readOnly: false,
};

export default MaterialFile;
