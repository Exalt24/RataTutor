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
  Pencil
} from "lucide-react";
import React, { useEffect, useState } from "react";
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
        "bg-green-50"
      }`}>
        <Icon size={22} className={
          title === "Flashcards" ? "text-blue-500" :
          title === "Notes" ? "text-purple-500" :
          "text-green-500"
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
}) => {
  const hasContent = material?.content?.length > 0;
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
    Quizzes: true
  });

  // Sample content with flashcards
  const [items, setItems] = useState([
    // Flashcards
    {
      id: "1",
      title: "Introduction to Calculus",
      author: "John Doe",
      description:
        "A comprehensive guide covering limits, derivatives, and integrals with practical examples and exercises.",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ["Flashcard"],
      flashcards: [
        {
          front: "What is a derivative?",
          back: "The rate of change of a function with respect to its variable",
        },
        {
          front: "What is an integral?",
          back: "The area under a curve or the accumulation of a quantity",
        },
        {
          front: "What is a limit?",
          back: "The value that a function approaches as the input approaches some value",
        },
      ],
    },
    // Notes
    {
      id: "5",
      title: "Linear Algebra Fundamentals",
      author: "Jane Smith",
      description:
        "An introduction to vectors, matrices, and linear transformations.",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ["Notes", "Math"],
      content: `# Linear Algebra Fundamentals

## Vectors and Matrices
- Vectors: Ordered lists of numbers representing magnitude and direction
- Matrices: Rectangular arrays of numbers
- Operations: Addition, multiplication, and transformations

## Linear Transformations
- Matrix multiplication as transformation
- Determinants and their geometric meaning
- Eigenvalues and eigenvectors

## Applications
- Computer graphics
- Machine learning
- Quantum mechanics`,
    },
    // Quiz
    {
      id: "9",
      title: "Calculus Quiz",
      author: "John Doe",
      description: "Test your knowledge of calculus fundamentals.",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ["Quiz"],
      questions: [
        {
          question: "What is the derivative of f(x) = x²?",
          options: ["2x", "x²", "2", "x"],
          correctAnswer: 0,
        },
        {
          question: "What is the integral of 2x?",
          options: ["x²", "x² + C", "2x²", "2x² + C"],
          correctAnswer: 1,
        },
      ],
    },
  ]);

  const onDelete = (e, id) => {
    e.stopPropagation(); // Prevent click from bubbling up to the parent
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleViewContent = (item) => {
    setSelectedContent(item);
    if (item.tags.includes("Flashcard")) {
      setShowViewFlashcards(true);
    } else if (item.tags.includes("Quiz")) {
      setShowViewQuiz(true);
    } else if (item.tags.includes("Notes")) {
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
    onVisibilityToggle(material.title);
  };

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
  };

  const handleTitleSave = () => {
    if (editedTitle.trim() && editedTitle !== material?.title) {
      onTitleChange(editedTitle);
    } else {
      setEditedTitle(material?.title || "");
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
    setIsEditingDescription(true);
  };

  const handleDescriptionSave = () => {
    if (editedDescription.trim() && editedDescription !== material?.description) {
      onTitleChange(editedTitle, editedDescription);
    } else {
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

  const handleEditContent = (content) => {
    if (content.tags.includes("Flashcard")) {
      setSelectedContent(content);
      setShowViewFlashcards(true);
    } else if (content.tags.includes("Quiz")) {
      setSelectedContent(content);
      setShowViewQuiz(true);
    } else if (content.tags.includes("Notes")) {
      setSelectedContent(content);
      setShowViewNotes(true);
    }
  };

  // Update local state when prop changes
  useEffect(() => {
    setIsMaterialPublic(isPublic);
  }, [isPublic]);

  if (showViewFlashcards) {
    return (
      <ViewFlashcards material={selectedContent} onClose={handleCloseView} />
    );
  }

  if (showViewQuiz) {
    return <ViewQuiz material={selectedContent} onClose={handleCloseView} />;
  }

  if (showViewNotes) {
    return <ViewNotes material={selectedContent} onClose={handleCloseView} />;
  }

  const flashcards = items.filter((item) => item.tags.includes("Flashcard"));
  const notes = items.filter((item) => item.tags.includes("Notes"));
  const quizzes = items.filter((item) => item.tags.includes("Quiz"));

  const totalItems = flashcards.length + notes.length + quizzes.length;

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
                    {isEditingTitle ? (
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
                    <button
                      onClick={handleTitleEdit}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105"
                      title="Edit Title"
                    >
                      <Pencil size={16} className="text-gray-600" />
                    </button>
                    <button
                      onClick={handleVisibilityToggle}
                      className={`flex items-center gap-2 px-3 py-1 rounded-lg border transition-all duration-200 hover:scale-105 ${
                        isMaterialPublic 
                          ? 'bg-white border-gray-300 hover:bg-gray-50' 
                          : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                      }`}
                      title={isMaterialPublic ? "Make Private" : "Make Public"}
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
                    {isEditingDescription ? (
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
                    <button
                      onClick={handleDescriptionEdit}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105"
                      title="Edit Description"
                    >
                      <Pencil size={14} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onExport(material.title)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105"
                  title="Export Material"
                  aria-label="Export Material"
                >
                  <Download size={20} className="text-gray-600" />
                </button>
                <div className="h-6 w-px bg-gray-200"></div>
                <button
                  className="exam-button-mini py-2 px-4 flex items-center gap-2 bg-gradient-to-r from-[#1b81d4] to-[#1670b3] text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
                  onClick={() => onCreateFlashcards(material)}
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
                  {isEditingTitle ? (
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
                  <button
                    onClick={handleTitleEdit}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105"
                    title="Edit Title"
                  >
                    <Pencil size={16} className="text-gray-600" />
                  </button>
                  <button
                    onClick={handleVisibilityToggle}
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg border transition-all duration-200 hover:scale-105 ${
                      isMaterialPublic 
                        ? 'bg-white border-gray-300 hover:bg-gray-50' 
                        : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                    }`}
                    title={isMaterialPublic ? "Make Private" : "Make Public"}
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
                  {isEditingDescription ? (
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
                  <button
                    onClick={handleDescriptionEdit}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105"
                    title="Edit Description"
                  >
                    <Pencil size={14} className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onExport(material.title)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105"
                title="Export Material"
                aria-label="Export Material"
              >
                <Download size={20} className="text-gray-600" />
              </button>
              <div className="h-6 w-px bg-gray-200"></div>
              <button
                className="exam-button-mini py-2 px-4 flex items-center gap-2 bg-gradient-to-r from-[#1b81d4] to-[#1670b3] text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
                onClick={() => onCreateFlashcards(material)}
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
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 rounded-b-xl">
        <div className="max-w-[90rem] mx-auto h-[calc(100vh-12rem)]">
          <div className="overflow-y-auto py-8 h-[calc(100%-4rem)] px-6 space-y-12 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400/50">
            {/* Flashcards Section */}
            <div>
              <SectionHeader
                icon={BookOpen}
                title="Flashcards"
                count={flashcards.length}
                isExpanded={expandedSections.Flashcards}
                onToggle={() => toggleSection("Flashcards")}
              />
              {expandedSections.Flashcards && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {flashcards.length > 0 ? (
                    flashcards.map((item) => (
                      <div
                        key={item.id}
                        className="relative transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl rounded-xl"
                      >
                        <div
                          onClick={() => handleViewContent(item)}
                          className="cursor-pointer"
                        >
                          <MaterialFile
                            content={item}
                            onDelete={(e) => onDelete(e, item.id)}
                            onEdit={handleEditContent}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full">
                      <SectionEmptyState title="Flashcards" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notes Section */}
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
                  {notes.length > 0 ? (
                    notes.map((item) => (
                      <div
                        key={item.id}
                        className="relative transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl rounded-xl"
                      >
                        <div
                          onClick={() => handleViewContent(item)}
                          className="cursor-pointer"
                        >
                          <MaterialFile
                            content={item}
                            onDelete={(e) => onDelete(e, item.id)}
                            onEdit={handleEditContent}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full">
                      <SectionEmptyState title="Notes" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quiz Section */}
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
                  {quizzes.length > 0 ? (
                    quizzes.map((item) => (
                      <div
                        key={item.id}
                        className="relative transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl rounded-xl"
                      >
                        <div
                          onClick={() => handleViewContent(item)}
                          className="cursor-pointer"
                        >
                          <MaterialFile
                            content={item}
                            onDelete={(e) => onDelete(e, item.id)}
                            onEdit={handleEditContent}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full">
                      <SectionEmptyState title="Quizzes" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialContent;
