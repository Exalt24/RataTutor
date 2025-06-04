import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  Download,
  FileQuestion,
  FileText,
  Globe,
  HelpCircle,
  Lock,
  Pencil,
  Paperclip
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useToast } from '../components/Toast/ToastContext';
import MaterialFile from "./MaterialFile";
import ViewFlashcards from "./ViewFlashcards";
import ViewNotes from "./ViewNotes";
import ViewQuiz from "./ViewQuiz";

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-12 rounded-xl">
    <FileQuestion size={64} className="text-[#1b81d4] mb-6" />
    <h3 className="label-text text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
      No Content Available
    </h3>
    <p className="text-gray-600 text-center max-w-md leading-relaxed">
      This material doesn't have any content yet. Use the buttons above to
      create flashcards, notes, or a quiz.
    </p>
  </div>
);

const SectionHeader = ({ icon: Icon, title, count, isExpanded, onToggle }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      <div className={`p-2.5 rounded-xl ${
        title === "Flashcards" ? "bg-blue-50" :
        title === "Notes" ? "bg-purple-50" :
        title === "Quizzes" ? "bg-green-50" :
        "bg-orange-50"
      }`}>
        <Icon size={22} className={
          title === "Flashcards" ? "text-blue-500" :
          title === "Notes" ? "text-purple-500" :
          title === "Quizzes" ? "text-green-500" :
          "text-orange-500"
        } />
      </div>
      <div className="flex items-center gap-2.5">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent label-text">
          {title}
        </h2>
        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium label-text">
          {count}
        </span>
      </div>
    </div>
    <div className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-4 py-2 transition-all duration-200 text-sm font-medium rounded-xl border label-text ${
          isExpanded 
            ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50' 
            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
        }`}
      >
        <span>{isExpanded ? "Hide" : "Show"}</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${
            isExpanded ? "transform rotate-180" : ""
          }`}
        />
      </button>
    </div>
  </div>
);

const SectionEmptyState = ({ title }) => {
  const getIcon = () => {
    switch (title) {
      case "Flashcards":
        return <BookOpen size={24} className="text-blue-500 mb-3" />;
      case "Notes":
        return <FileText size={24} className="text-purple-500 mb-3" />;
      case "Quizzes":
        return <HelpCircle size={24} className="text-green-500 mb-3" />;
      case "Attachments":
        return <Paperclip size={24} className="text-orange-500 mb-3" />;
      default:
        return <FileQuestion size={24} className="text-[#1b81d4] mb-3" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 bg-white/50 rounded-xl border border-dashed border-gray-200">
      {getIcon()}
      <h3 className="text-base font-medium text-gray-900 mb-1 label-text">No {title} Yet</h3>
      <p className="text-sm text-gray-500 text-center label-text">
        Use the buttons above to create your first {title.toLowerCase()}
      </p>
    </div>
  );
};

const MaterialContent = ({
  material,
  isPublic,
  onVisibilityToggle,
  onExport,
  onCreateFlashcards,
  onCreateNotes,
  onCreateQuiz,
  onBack,
  onTitleChange,
  onMaterialUpdate,
  readOnly = false
}) => {
  const { showToast } = useToast();
  
  // Local material state for optimistic updates
  const [localMaterial, setLocalMaterial] = useState(material);
  const [showViewFlashcards, setShowViewFlashcards] = useState(false);
  const [showViewQuiz, setShowViewQuiz] = useState(false);
  const [showViewNotes, setShowViewNotes] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [isMaterialPublic, setIsMaterialPublic] = useState(isPublic);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(material?.title || "");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(material?.description || "");
  const [expandedSections, setExpandedSections] = useState({
    Flashcards: true,
    Notes: true,
    Quizzes: true,
    Attachments: true
  });

  // Update local state when prop changes (from parent updates)
  useEffect(() => {
    setLocalMaterial(material);
    setIsMaterialPublic(isPublic);
    setEditedTitle(material?.title || "");
    setEditedDescription(material?.description || "");
  }, [isPublic, material]);

  // Extract content from local material state
  const flashcardSets = localMaterial?.flashcard_sets || [];
  const notes = localMaterial?.notes || [];
  const quizzes = localMaterial?.quizzes || [];
  const attachments = localMaterial?.attachments || [];

  const handleViewContent = (item, type) => {
    setSelectedContent(item);
    if (type === "flashcard") {
      setShowViewFlashcards(true);
    } else if (type === "quiz") {
      setShowViewQuiz(true);
    } else if (type === "note") {
      setShowViewNotes(true);
    }
  };

  const handleCloseView = () => {
    setShowViewFlashcards(false);
    setShowViewQuiz(false);
    setShowViewNotes(false);
    setSelectedContent(null);
  };

  const handleVisibilityToggle = () => {
    setIsMaterialPublic(!isMaterialPublic);
    onVisibilityToggle();
  };

  const handleTitleEdit = () => {
    if (!readOnly) {
      setIsEditingTitle(true);
    }
  };

  const handleTitleSave = async () => {
    if (editedTitle.trim() && (editedTitle !== localMaterial?.title || editedDescription !== localMaterial?.description)) {
      try {
        // Optimistically update local state immediately
        const updatedMaterial = {
          ...localMaterial,
          title: editedTitle,
          description: editedDescription
        };
        setLocalMaterial(updatedMaterial);
        
        // Call parent's update function (this updates MaterialsScreen and Dashboard state)
        await onTitleChange(editedTitle, editedDescription);
        
      } catch (error) {
        // If API call fails, revert to original values
        setEditedTitle(material?.title || "");
        setEditedDescription(material?.description || "");
        setLocalMaterial(material);
        
        showToast({
          variant: "error",
          title: "Update failed",
          subtitle: "Failed to update material. Please try again.",
        });
      }
    } else {
      setEditedTitle(localMaterial?.title || "");
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setEditedTitle(localMaterial?.title || "");
    }
  };

  const handleDescriptionEdit = () => {
    if (!readOnly) {
      setIsEditingDescription(true);
    }
  };

  const handleDescriptionSave = async () => {
    if (editedDescription !== localMaterial?.description || editedTitle !== localMaterial?.title) {
      try {
        // Optimistically update local state immediately
        const updatedMaterial = {
          ...localMaterial,
          title: editedTitle,
          description: editedDescription
        };
        setLocalMaterial(updatedMaterial);
        
        // Call parent's update function
        await onTitleChange(editedTitle, editedDescription);
        
      } catch (error) {
        // If API call fails, revert to original values
        setEditedTitle(localMaterial?.title || "");
        setEditedDescription(localMaterial?.description || "");
        setLocalMaterial(material);
        
        showToast({
          variant: "error",
          title: "Update failed",
          subtitle: "Failed to update material. Please try again.",
        });
      }
    } else {
      setEditedDescription(localMaterial?.description || "");
    }
    setIsEditingDescription(false);
  };

  const handleDescriptionKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleDescriptionSave();
    } else if (e.key === 'Escape') {
      setIsEditingDescription(false);
      setEditedDescription(localMaterial?.description || "");
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleEditContent = (content, type) => {
    if (readOnly) return;
    
    if (type === "flashcard") {
      setSelectedContent(content);
      setShowViewFlashcards(true);
    } else if (type === "quiz") {
      setSelectedContent(content);
      setShowViewQuiz(true);
    } else if (type === "note") {
      setSelectedContent(content);
      setShowViewNotes(true);
    }
  };

  const handleDeleteContent = (contentId, type) => {
    if (readOnly) return;
    
    // TODO: Implement API calls to delete content
    console.log(`Delete ${type} with ID: ${contentId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  if (showViewFlashcards) {
    return (
    <ViewFlashcards
      mainMaterial={localMaterial}
      material={selectedContent} 
      onClose={handleCloseView} 
      readOnly={readOnly}
      onSuccess={(updatedFlashcardSet) => {
        // Update the local material state with the updated flashcard set
        const updatedMaterial = {
            ...localMaterial,
            flashcard_sets: localMaterial.flashcard_sets.map(set =>
              set.id === updatedFlashcardSet.id ? updatedFlashcardSet : set
            )
          };
          setLocalMaterial(updatedMaterial);
          
          // Also update the selected content to reflect changes
          setSelectedContent(updatedFlashcardSet);
          
          // Call parent's update function to sync with Dashboard
          if (onMaterialUpdate) {
            onMaterialUpdate(updatedMaterial);
          }
      }}
    />
  );
  }

  if (showViewQuiz) {
    return <ViewQuiz material={selectedContent} onClose={handleCloseView} readOnly={readOnly} />;
  }

  if (showViewNotes) {
    return <ViewNotes material={selectedContent} onClose={handleCloseView} readOnly={readOnly} />;
  }

  const totalItems = flashcardSets.length + notes.length + quizzes.length + attachments.length;

  if (totalItems === 0) {
    return (
      <div className="flex flex-col bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex-none border-b border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm">
          <div className="max-w-[90rem] mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105"
                >
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div>
                  <div className="flex items-center gap-3">
                    {isEditingTitle && !readOnly ? (
                      <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        onBlur={handleTitleSave}
                        onKeyDown={handleTitleKeyDown}
                        className="text-2xl font-semibold bg-transparent border-b-2 border-blue-500 focus:outline-none focus:border-blue-600 label-text"
                        autoFocus
                      />
                    ) : (
                      <h1 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent label-text">
                        {localMaterial?.title || "Material"}
                      </h1>
                    )}
                    {!readOnly && (
                      <button
                        onClick={handleTitleEdit}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105"
                        title="Edit Title"
                      >
                        <Pencil size={16} className="text-gray-600" />
                      </button>
                    )}
                    <button
                      onClick={handleVisibilityToggle}
                      className={`flex items-center gap-2 px-3 py-1 rounded-lg border transition-all duration-200 hover:scale-105 ${
                        isMaterialPublic 
                          ? 'bg-white border-gray-300 hover:bg-gray-50' 
                          : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                      } ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={readOnly ? "Read-only mode" : (isMaterialPublic ? "Make Private" : "Make Public")}
                      disabled={readOnly}
                    >
                      {isMaterialPublic ? (
                        <>
                          <Globe size={16} className="text-[#1b81d4]" />
                          <span className="text-[#1b81d4] text-sm font-medium">Public</span>
                        </>
                      ) : (
                        <>
                          <Lock size={16} className="text-gray-600" />
                          <span className="text-gray-600 text-sm font-medium">Private</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {isEditingDescription && !readOnly ? (
                      <input
                        type="text"
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        onBlur={handleDescriptionSave}
                        onKeyDown={handleDescriptionKeyDown}
                        className="text-sm text-gray-500 bg-transparent border-b border-blue-500 focus:outline-none focus:border-blue-600 w-full label-text"
                        placeholder="Add a description..."
                        autoFocus
                      />
                    ) : (
                      <p className="text-sm text-gray-500 label-text">
                        {localMaterial?.description || "View and manage your content"}
                      </p>
                    )}
                    {!readOnly && (
                      <button
                        onClick={handleDescriptionEdit}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105"
                        title="Edit Description"
                      >
                        <Pencil size={14} className="text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onExport(localMaterial)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105"
                  title="Export Material"
                  aria-label="Export Material"
                >
                  <Download size={20} className="text-gray-600" />
                </button>
                {!readOnly && (
                  <>
                    <div className="h-6 w-px bg-gray-200"></div>
                    <button
                      className="exam-button-mini py-2 px-4 flex items-center gap-2 bg-gradient-to-r from-[#1b81d4] to-[#1670b3] text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
                      onClick={() => onCreateFlashcards(localMaterial)}
                      data-hover="Create Flashcards"
                    >
                      <BookOpen size={16} />
                      Create Flashcards
                    </button>
                    <button
                      className="exam-button-mini py-2 px-4 flex items-center gap-2 bg-gradient-to-r from-[#1b81d4] to-[#1670b3] text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
                      onClick={() => onCreateNotes(localMaterial)}
                      data-hover="Create Notes"
                    >
                      <FileText size={16} />
                      Create Notes
                    </button>
                    <button
                      className="exam-button-mini py-2 px-4 flex items-center gap-2 bg-gradient-to-r from-[#1b81d4] to-[#1670b3] text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
                      onClick={() => onCreateQuiz(localMaterial)}
                      data-hover="Create Quiz"
                    >
                      <HelpCircle size={16} />
                      Create Quiz
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center">
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 rounded-xl">
      <div className="flex-none border-b rounded-t-xl border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-[90rem] mx-auto px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  {isEditingTitle && !readOnly ? (
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      onBlur={handleTitleSave}
                      onKeyDown={handleTitleKeyDown}
                      className="text-2xl font-semibold bg-transparent border-b-2 border-blue-500 focus:outline-none focus:border-blue-600 label-text"
                      autoFocus
                    />
                  ) : (
                    <h1 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent label-text">
                      {localMaterial?.title || "Material"}
                    </h1>
                  )}
                  {!readOnly && (
                    <button
                      onClick={handleTitleEdit}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105"
                      title="Edit Title"
                    >
                      <Pencil size={16} className="text-gray-600" />
                    </button>
                  )}
                  <button
                    onClick={handleVisibilityToggle}
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg border transition-all duration-200 hover:scale-105 ${
                      isMaterialPublic 
                        ? 'bg-white border-gray-300 hover:bg-gray-50' 
                        : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                    } ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={readOnly ? "Read-only mode" : (isMaterialPublic ? "Make Private" : "Make Public")}
                    disabled={readOnly}
                  >
                    {isMaterialPublic ? (
                      <>
                        <Globe size={16} className="text-[#1b81d4]" />
                        <span className="text-[#1b81d4] text-sm font-medium">Public</span>
                      </>
                    ) : (
                      <>
                        <Lock size={16} className="text-gray-600" />
                        <span className="text-gray-600 text-sm font-medium">Private</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {isEditingDescription && !readOnly ? (
                    <input
                      type="text"
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      onBlur={handleDescriptionSave}
                      onKeyDown={handleDescriptionKeyDown}
                      className="text-sm text-gray-500 bg-transparent border-b border-blue-500 focus:outline-none focus:border-blue-600 w-full label-text"
                      placeholder="Add a description..."
                      autoFocus
                    />
                  ) : (
                    <p className="text-sm text-gray-500 label-text">
                      {localMaterial?.description || "View and manage your content"}
                    </p>
                  )}
                  {!readOnly && (
                    <button
                      onClick={handleDescriptionEdit}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105"
                      title="Edit Description"
                    >
                      <Pencil size={14} className="text-gray-600" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onExport(localMaterial)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105"
                title="Export Material"
                aria-label="Export Material"
              >
                <Download size={20} className="text-gray-600" />
              </button>
              {!readOnly && (
                <>
                  <div className="h-6 w-px bg-gray-200"></div>
                  <button
                    className="exam-button-mini py-2 px-4 flex items-center gap-2 bg-gradient-to-r from-[#1b81d4] to-[#1670b3] text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
                    onClick={() => onCreateFlashcards(localMaterial)}
                    data-hover="Create Flashcards"
                  >
                    <BookOpen size={16} />
                    Create Flashcards
                  </button>
                  <button
                    className="exam-button-mini py-2 px-4 flex items-center gap-2 bg-gradient-to-r from-[#1b81d4] to-[#1670b3] text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
                    onClick={() => onCreateNotes(localMaterial)}
                    data-hover="Create Notes"
                  >
                    <FileText size={16} />
                    Create Notes
                  </button>
                  <button
                    className="exam-button-mini py-2 px-4 flex items-center gap-2 bg-gradient-to-r from-[#1b81d4] to-[#1670b3] text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
                    onClick={() => onCreateQuiz(localMaterial)}
                    data-hover="Create Quiz"
                  >
                    <HelpCircle size={16} />
                    Create Quiz
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 rounded-b-xl">
        <div className="max-w-[90rem] mx-auto h-[calc(100vh-12rem)]">
          <div className="overflow-y-auto py-8 h-[calc(100%-4rem)] px-6 space-y-12 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400/50">
            
            {/* Flashcards Section */}
            {flashcardSets.length > 0 && (
              <div>
                <SectionHeader
                  icon={BookOpen}
                  title="Flashcards"
                  count={flashcardSets.length}
                  isExpanded={expandedSections.Flashcards}
                  onToggle={() => toggleSection("Flashcards")}
                />
                {expandedSections.Flashcards && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {flashcardSets.map((flashcardSet) => (
                      <div
                        key={flashcardSet.id}
                        className="relative transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl rounded-xl"
                      >
                        <div
                          onClick={() => handleViewContent(flashcardSet, "flashcard")}
                          className="cursor-pointer"
                        >
                          <div className="exam-card p-4 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <BookOpen size={18} className="text-blue-500" />
                                <h3 className="font-semibold">{flashcardSet.title}</h3>
                              </div>
                              {!readOnly && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteContent(flashcardSet.id, "flashcard");
                                  }}
                                  className="p-1 hover:bg-red-100 rounded-full transition-colors text-red-500"
                                  title="Delete"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                            
                            {flashcardSet.description && (
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {flashcardSet.description}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span>{flashcardSet.flashcards?.length || 0} cards</span>
                              <span>{formatDate(flashcardSet.updated_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notes Section */}
            {notes.length > 0 && (
              <div>
                <SectionHeader
                  icon={FileText}
                  title="Notes"
                  count={notes.length}
                  isExpanded={expandedSections.Notes}
                  onToggle={() => toggleSection("Notes")}
                />
                {expandedSections.Notes && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="relative transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl rounded-xl"
                      >
                        <div
                          onClick={() => handleViewContent(note, "note")}
                          className="cursor-pointer"
                        >
                          <div className="exam-card p-4 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <FileText size={18} className="text-purple-500" />
                                <h3 className="font-semibold">{note.title}</h3>
                              </div>
                              {!readOnly && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteContent(note.id, "note");
                                  }}
                                  className="p-1 hover:bg-red-100 rounded-full transition-colors text-red-500"
                                  title="Delete"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                            
                            {note.description && (
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {note.description}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span>{note.content?.length > 100 ? `${note.content.substring(0, 100)}...` : note.content}</span>
                              <span>{formatDate(note.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quiz Section */}
            {quizzes.length > 0 && (
              <div>
                <SectionHeader
                  icon={HelpCircle}
                  title="Quizzes"
                  count={quizzes.length}
                  isExpanded={expandedSections.Quizzes}
                  onToggle={() => toggleSection("Quizzes")}
                />
                {expandedSections.Quizzes && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {quizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        className="relative transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl rounded-xl"
                      >
                        <div
                          onClick={() => handleViewContent(quiz, "quiz")}
                          className="cursor-pointer"
                        >
                          <div className="exam-card p-4 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <HelpCircle size={18} className="text-green-500" />
                                <h3 className="font-semibold">{quiz.title}</h3>
                              </div>
                              {!readOnly && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteContent(quiz.id, "quiz");
                                  }}
                                  className="p-1 hover:bg-red-100 rounded-full transition-colors text-red-500"
                                  title="Delete"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                            
                            {quiz.description && (
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {quiz.description}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span>{quiz.questions?.length || 0} questions</span>
                              <span>{formatDate(quiz.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Attachments Section */}
            {attachments.length > 0 && (
              <div>
                <SectionHeader
                  icon={Paperclip}
                  title="Attachments"
                  count={attachments.length}
                  isExpanded={expandedSections.Attachments}
                  onToggle={() => toggleSection("Attachments")}
                />
                {expandedSections.Attachments && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="relative transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl rounded-xl"
                      >
                        <div className="exam-card p-4 hover:shadow-lg transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Paperclip size={18} className="text-orange-500" />
                              <h3 className="font-semibold text-sm truncate">
                                {attachment.file?.split('/').pop() || 'File'}
                              </h3>
                            </div>
                            {!readOnly && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteContent(attachment.id, "attachment");
                                }}
                                className="p-1 hover:bg-red-100 rounded-full transition-colors text-red-500"
                                title="Delete"
                              >
                                ×
                              </button>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <a 
                              href={attachment.file} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Download
                            </a>
                            <span>{formatDate(attachment.uploaded_at)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Show empty states for sections with no content */}
            {flashcardSets.length === 0 && (
              <div>
                <SectionHeader
                  icon={BookOpen}
                  title="Flashcards"
                  count={0}
                  isExpanded={expandedSections.Flashcards}
                  onToggle={() => toggleSection("Flashcards")}
                />
                {expandedSections.Flashcards && (
                  <SectionEmptyState title="Flashcards" />
                )}
              </div>
            )}

            {notes.length === 0 && (
              <div>
                <SectionHeader
                  icon={FileText}
                  title="Notes"
                  count={0}
                  isExpanded={expandedSections.Notes}
                  onToggle={() => toggleSection("Notes")}
                />
                {expandedSections.Notes && (
                  <SectionEmptyState title="Notes" />
                )}
              </div>
            )}

            {quizzes.length === 0 && (
              <div>
                <SectionHeader
                  icon={HelpCircle}
                  title="Quizzes"
                  count={0}
                  isExpanded={expandedSections.Quizzes}
                  onToggle={() => toggleSection("Quizzes")}
                />
                {expandedSections.Quizzes && (
                  <SectionEmptyState title="Quizzes" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialContent;