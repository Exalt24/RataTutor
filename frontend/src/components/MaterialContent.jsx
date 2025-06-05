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
  Paperclip,
  Pencil
} from "lucide-react";
import React, { useState } from "react";
import { useToast } from '../components/Toast/ToastContext';
import MaterialFile from "./MaterialFile";
import ViewFlashcards from "./ViewFlashcards";
import ViewNotes from "./ViewNotes";
import ViewQuiz from "./ViewQuiz";
import { deleteFlashcardSet, deleteNote, deleteQuiz } from '../services/apiService';

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
  onRefreshMaterials,
  readOnly = false
}) => {
  const { showToast } = useToast();
  
  // Only keep view-related state
  const [showViewFlashcards, setShowViewFlashcards] = useState(false);
  const [showViewQuiz, setShowViewQuiz] = useState(false);
  const [showViewNotes, setShowViewNotes] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  
  // Edit state - only for form inputs
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  
  const [expandedSections, setExpandedSections] = useState({
    Flashcards: true,
    Notes: true,
    Quizzes: true,
    Attachments: true
  });

  // Extract content directly from props
  const flashcardSets = material?.flashcard_sets || [];
  const notes = material?.notes || [];
  const quizzes = material?.quizzes || [];
  const attachments = material?.attachments || [];

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

  const handleTitleEdit = () => {
    if (!readOnly) {
      setEditedTitle(material?.title || "");
      setIsEditingTitle(true);
    }
  };

  const handleTitleSave = async () => {
    if (editedTitle.trim() && (editedTitle !== material?.title || editedDescription !== material?.description)) {
      try {
        await onTitleChange(editedTitle, editedDescription);
      } catch (error) {
        // Reset form on error
        setEditedTitle(material?.title || "");
        setEditedDescription(material?.description || "");
      }
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setEditedTitle(material?.title || "");
    }
  };

  const handleDescriptionEdit = () => {
    if (!readOnly) {
      setEditedDescription(material?.description || "");
      setIsEditingDescription(true);
    }
  };

  const handleDescriptionSave = async () => {
    try {
      await onTitleChange(material?.title || "", editedDescription);
    } catch (error) {
      // Reset form on error
      setEditedDescription(material?.description || "");
    }
    setIsEditingDescription(false);
  };

  const handleDescriptionKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleDescriptionSave();
    } else if (e.key === 'Escape') {
      setIsEditingDescription(false);
      setEditedDescription(material?.description || "");
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
      onCreateFlashcards(material, content, {
        onSuccess: (updatedFlashcardSet) => {
          // Navigate directly to ViewFlashcards with the updated flashcard set
          setSelectedContent(updatedFlashcardSet);
          setShowViewFlashcards(true);
          return false; // Tell MaterialsScreen to delay closing
        }
      });
    } else if (type === "quiz") {
      const quiz = quizzes.find(q => q.id === content.id) || content;
      setSelectedContent(quiz);
      setShowViewQuiz(true);
    } else if (type === "note") {
      const note = notes.find(n => n.id === content.id) || content;
      setSelectedContent(note);
      setShowViewNotes(true);
    }
  };

  const handleDeleteContent = async (contentId, type) => {
    if (readOnly) return;
    
    // Determine the content name for confirmation
    let contentName = '';
    let content = null;
    
    switch (type) {
      case "flashcard":
        content = flashcardSets.find(set => set.id === contentId);
        contentName = content?.title || 'flashcard set';
        break;
      case "note":
        content = notes.find(note => note.id === contentId);
        contentName = content?.title || 'note';
        break;
      case "quiz":
        content = quizzes.find(quiz => quiz.id === contentId);
        contentName = content?.title || 'quiz';
        break;
      case "attachment":
        content = attachments.find(att => att.id === contentId);
        contentName = content?.file?.split('/').pop() || 'attachment';
        break;
      default:
        console.error('Unknown content type:', type);
        return;
    }

    if (!confirm(`Are you sure you want to delete "${contentName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // Call appropriate API based on type
      switch (type) {
        case "flashcard":
          await deleteFlashcardSet(contentId);
          break;
        case "note":
          await deleteNote(contentId);
          break;
        case "quiz":
          await deleteQuiz(contentId);
          break;
        case "attachment":
          console.warn('Delete attachment API not implemented yet');
          return;
        default:
          throw new Error(`Unknown content type: ${type}`);
      }

      // ✅ OPTION 1: Use refetch pattern (like EditProfileScreen)
      if (onRefreshMaterials) {
        try {
          await onRefreshMaterials();
        } catch (error) {
          console.error('Error refreshing materials after delete:', error);
        }
      } else {
        // ✅ OPTION 2: Fallback to optimistic update (current approach)
        const updatedMaterial = { ...material };
        
        switch (type) {
          case "flashcard":
            updatedMaterial.flashcard_sets = flashcardSets.filter(set => set.id !== contentId);
            break;
          case "note":
            updatedMaterial.notes = notes.filter(note => note.id !== contentId);
            break;
          case "quiz":
            updatedMaterial.quizzes = quizzes.filter(quiz => quiz.id !== contentId);
            break;
          case "attachment":
            updatedMaterial.attachments = attachments.filter(att => att.id !== contentId);
            break;
        }

        if (onMaterialUpdate) {
          onMaterialUpdate(updatedMaterial);
        }
      }

      showToast({
        variant: "success",
        title: "Content deleted",
        subtitle: `"${contentName}" has been deleted successfully.`,
      });

    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      
      showToast({
        variant: "error",
        title: "Delete failed",
        subtitle: `Failed to delete "${contentName}". Please try again.`,
      });
    }
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
        mainMaterial={material}
        material={selectedContent} 
        onClose={handleCloseView} 
        readOnly={readOnly}
        onSuccess={async (updatedFlashcardSet) => {
          // ✅ OPTION 1: Use refetch pattern
          if (onRefreshMaterials) {
            try {
              await onRefreshMaterials();
              // Update selected content for immediate UI feedback
              setSelectedContent(updatedFlashcardSet);
            } catch (error) {
              console.error('Error refreshing materials:', error);
            }
          } else {
            // ✅ OPTION 2: Fallback to optimistic update
            const updatedMaterial = {
              ...material,
              flashcard_sets: material.flashcard_sets.map(set =>
                set.id === updatedFlashcardSet.id ? updatedFlashcardSet : set
              )
            };
            
            setSelectedContent(updatedFlashcardSet);
            
            if (onMaterialUpdate) {
              onMaterialUpdate(updatedMaterial);
            }
          }
        }}
        onEdit={(flashcardSet) => {
          // Close ViewFlashcards and navigate to CreateFlashcards
          setShowViewFlashcards(false);
          setSelectedContent(null);
          
          // Call onCreateFlashcards with success handler
          onCreateFlashcards(material, flashcardSet, {
            onSuccess: (updatedFlashcardSet) => {
              // Navigate directly to ViewFlashcards with the updated flashcard set
              setSelectedContent(updatedFlashcardSet);
              setShowViewFlashcards(true);
              return false; // Tell MaterialsScreen to delay closing
            }
          });
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
                        {material?.title || "Material"}
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
                      onClick={onVisibilityToggle}
                      className={`flex items-center gap-2 px-3 py-1 rounded-lg border transition-all duration-200 hover:scale-105 ${
                        isPublic 
                          ? 'bg-white border-gray-300 hover:bg-gray-50' 
                          : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                      } ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={readOnly ? "Read-only mode" : (isPublic ? "Make Private" : "Make Public")}
                      disabled={readOnly}
                    >
                      {isPublic ? (
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
                        {material?.description || "View and manage your content"}
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
                  onClick={() => onExport(material)}
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
                      onClick={() => onCreateFlashcards(material, null, {
                        onSuccess: (newFlashcardSet) => {
                          // Navigate directly to ViewFlashcards with the new flashcard set
                          setSelectedContent(newFlashcardSet);
                          setShowViewFlashcards(true);
                          return false; // Tell MaterialsScreen to delay closing
                        }
                      })}
                      data-hover="Create Flashcards"
                    >
                      <BookOpen size={16} />
                      Create Flashcards
                    </button>
                    <button
                      className="exam-button-mini py-2 px-4 flex items-center gap-2 bg-gradient-to-r from-[#1b81d4] to-[#1670b3] text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
                      onClick={() => onCreateNotes(material)}
                      data-hover="Create Notes"
                    >
                      <FileText size={16} />
                      Create Notes
                    </button>
                    <button
                      className="exam-button-mini py-2 px-4 flex items-center gap-2 bg-gradient-to-r from-[#1b81d4] to-[#1670b3] text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
                      onClick={() => onCreateQuiz(material)}
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
                      {material?.title || "Material"}
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
                    onClick={onVisibilityToggle}
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg border transition-all duration-200 hover:scale-105 ${
                      isPublic 
                        ? 'bg-white border-gray-300 hover:bg-gray-50' 
                        : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                    } ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={readOnly ? "Read-only mode" : (isPublic ? "Make Private" : "Make Public")}
                    disabled={readOnly}
                  >
                    {isPublic ? (
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
                      {material?.description || "View and manage your content"}
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
                onClick={() => onExport(material)}
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
                    onClick={() => onCreateFlashcards(material, null, {
                      onSuccess: (newFlashcardSet) => {
                        // Navigate directly to ViewFlashcards with the new flashcard set
                        setSelectedContent(newFlashcardSet);
                        setShowViewFlashcards(true);
                        return false; // Tell MaterialsScreen to delay closing
                      }
                    })}
                    data-hover="Create Flashcards"
                  >
                    <BookOpen size={16} />
                    Create Flashcards
                  </button>
                  <button
                    className="exam-button-mini py-2 px-4 flex items-center gap-2 bg-gradient-to-r from-[#1b81d4] to-[#1670b3] text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
                    onClick={() => onCreateNotes(material)}
                    data-hover="Create Notes"
                  >
                    <FileText size={16} />
                    Create Notes
                  </button>
                  <button
                    className="exam-button-mini py-2 px-4 flex items-center gap-2 bg-gradient-to-r from-[#1b81d4] to-[#1670b3] text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
                    onClick={() => onCreateQuiz(material)}
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
                        onClick={() => handleViewContent(flashcardSet, "flashcard")}
                        className="cursor-pointer"
                      >
                        <MaterialFile
                          content={flashcardSet}
                          onDelete={(e, id) => handleDeleteContent(id, "flashcard")}
                          onEdit={() => handleEditContent(flashcardSet, "flashcard")}
                          readOnly={readOnly}
                        />
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
                        onClick={() => handleViewContent(note, "note")}
                        className="cursor-pointer"
                      >
                        <MaterialFile
                          content={note}
                          onDelete={(e, id) => handleDeleteContent(id, "note")}
                          onEdit={() => handleEditContent(note, "note")}
                          readOnly={readOnly}
                        />
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
                        onClick={() => handleViewContent(quiz, "quiz")}
                        className="cursor-pointer"
                      >
                        <MaterialFile
                          content={quiz}
                          onDelete={(e, id) => handleDeleteContent(id, "quiz")}
                          onEdit={() => handleEditContent(quiz, "quiz")}
                          readOnly={readOnly}
                        />
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
                      <div key={attachment.id}>
                        <MaterialFile
                          content={{
                            id: attachment.id,
                            title: attachment.file?.split('/').pop() || 'File',
                            description: attachment.description,
                            createdAt: attachment.uploaded_at || attachment.created_at,
                            tags: ["Attachment"],
                            content: "Download",
                            author: attachment.author || 'Unknown',
                            file: attachment.file
                          }}
                          onDelete={(e, id) => handleDeleteContent(id, "attachment")}
                          readOnly={readOnly}
                        />
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