import { ArrowLeft, Edit, FileText, Search } from 'lucide-react';
import React, { useState } from 'react';
import CreateNotes from './CreateNotes';

const ViewNotes = ({ mainMaterial, material, onClose, readOnly = false, onSuccess, onEdit }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateNotes, setShowCreateNotes] = useState(false);

  // ✅ Enhanced: Handle edit functionality following ViewFlashcards pattern
  const handleEdit = () => {
    if (!readOnly) {
      if (onEdit) {
        // Use the parent's onEdit handler (like ViewFlashcards)
        onEdit(material);
      } else {
        // Fallback to local edit mode
        setShowCreateNotes(true);
      }
    }
  };

  // ✅ Enhanced: Handle edit success following ViewFlashcards pattern
  const handleEditSuccess = (updatedNote) => {
    if (onSuccess) {
      onSuccess(updatedNote);
    }
    
    // Reset viewing state to provide clean UX after editing
    setSearchQuery('');
    setShowCreateNotes(false);
  };

  // ✅ Enhanced: Use actual material data instead of hardcoded data
  const noteContent = material?.content || '';
  const noteTitle = material?.title || 'Untitled Note';
  const noteDescription = material?.description || 'View and review your notes';

  // Function to highlight text in HTML content
  const highlightText = (html, query) => {
    if (!query) return html;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return html.replace(regex, '<span class="bg-yellow-200">$1</span>');
  };

  // ✅ Enhanced: Follow ViewFlashcards pattern for CreateNotes integration
  if (showCreateNotes) {
    return (
      <CreateNotes
        material={material}
        options={{
          editMode: true,
          editContent: material,
        }}
        onClose={() => setShowCreateNotes(false)}
        onSuccess={handleEditSuccess}
      />
    );
  }

  return (
    <div className="flex flex-col bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50 rounded-xl h-[calc(100vh-6rem)]">
      {/* ✅ Enhanced: Header following ViewFlashcards structure */}
      <div className="flex-none border-b rounded-t-xl border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-[90rem] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent label-text">
                  {noteTitle}
                </h1>
                <p className="text-sm text-gray-500 label-text">
                  {noteDescription}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* ✅ Enhanced: Search functionality */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search in note..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/30 focus:border-purple-500 transition-all duration-200 hover:border-gray-300 label-text"
                />
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {/* ✅ Enhanced: Edit button following ViewFlashcards pattern */}
              {!readOnly && (
                <>
                  <div className="h-6 w-px bg-gray-200"></div>
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-all duration-200 hover:scale-105"
                  >
                    <Edit size={16} />
                    <span className="label-text">Edit</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Enhanced: Content section following ViewFlashcards structure */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 py-4 h-full">
          {noteContent ? (
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
              {/* ✅ Enhanced: Note info header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <FileText size={20} className="text-purple-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 label-text">
                    {searchQuery ? `Searching for "${searchQuery}"` : 'Note Content'}
                  </span>
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-sm text-purple-600 hover:text-purple-800 transition-colors label-text"
                  >
                    Clear search
                  </button>
                )}
              </div>

              {/* ✅ Enhanced: Note content with proper scrolling */}
              <div className="overflow-y-auto h-[calc(100%-6rem)] pr-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-purple-300/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-purple-400/50">
                <div 
                  className="prose max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-em:text-gray-600"
                  dangerouslySetInnerHTML={{ 
                    __html: highlightText(noteContent, searchQuery)
                  }}
                />
              </div>
            </div>
          ) : (
            // ✅ Enhanced: Empty state following ViewFlashcards pattern
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <FileText size={48} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2 label-text">No content available</h3>
              <p className="text-gray-600 label-text">This note is empty.</p>
              {!readOnly && (
                <button
                  onClick={handleEdit}
                  className="mt-4 exam-button-mini"
                  data-hover="Add Content"
                >
                  Add Content
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewNotes;