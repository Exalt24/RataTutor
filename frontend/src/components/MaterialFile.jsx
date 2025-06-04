import { BookOpen, Clock, FileText, HelpCircle, Trash2 } from 'lucide-react';
import PropTypes from 'prop-types';
import React from 'react';

const MaterialFile = ({ content, onDelete }) => {
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
      return <BookOpen size={20} className="text-[#1b81d4]" />;
    } else if (content.tags?.includes('Notes')) {
      return <FileText size={20} className="text-[#1b81d4]" />;
    } else if (content.tags?.includes('Quiz')) {
      return <HelpCircle size={20} className="text-[#1b81d4]" />;
    }
    return <FileText size={20} className="text-[#1b81d4]" />; // Default icon
  };

  // Delete handler
  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Stop event from bubbling up
    onDelete && onDelete(e, content.id);
  };

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {getContentIcon()}
              <h3 className="text-lg font-semibold text-gray-900 truncate" title={content.title || 'Untitled'}>{content.title || 'Untitled'}</h3>
            </div>
            <button
              onClick={handleDeleteClick}
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-2">By {content.author || 'Unknown'}</p>
          <p className="text-sm text-gray-700 line-clamp-3 mb-4">{content.description || 'No description available.'}</p>
        </div>
        <div className="flex items-center justify-end text-gray-500 text-xs">
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
};

MaterialFile.defaultProps = {
  onDelete: null,
};

export default MaterialFile;
