import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  MoreHorizontal,
  Search,
  Send,
  Upload,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

const RataAIScreen = ({ materialsData }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [expandedFolders, setExpandedFolders] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const files = [
    {
      name: "Exam ni eli jang",
      flashcards: [
        { title: "Algebra Formulas", created: "2h ago" },
        { title: "Geometry Theorems", created: "1d ago" },
      ],
      notes: [
        { title: "Calculus Summary", created: "3h ago" },
        { title: "Statistics Notes", created: "5h ago" },
      ],
    },
    {
      name: "Intro to Programming",
      flashcards: [
        { title: "World War II Dates", created: "1d ago" },
        { title: "Ancient Civilizations", created: "2d ago" },
      ],
      notes: [
        { title: "Renaissance Period", created: "4h ago" },
        { title: "Industrial Revolution", created: "6h ago" },
      ],
    },
  ];

  const filteredMaterials = materialsData
    .map((material) => {
      const filteredFlashcardSets = material.flashcard_sets
        .map((set) => ({
          ...set,
          flashcards: set.flashcards.filter((card) =>
            card.question.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter(
          (set) =>
            set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            set.flashcards.length > 0
        );

      const filteredNotes = material.notes.filter((note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase())
      );

      const filteredQuizzes = material.quizzes.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          quiz.questions.some((q) =>
            q.question_text.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );

      const filteredAttachments = material.attachments.filter((att) =>
        att.file.toLowerCase().includes(searchQuery.toLowerCase())
      );

      return {
        ...material,
        flashcard_sets: filteredFlashcardSets,
        notes: filteredNotes,
        quizzes: filteredQuizzes,
        attachments: filteredAttachments,
      };
    })
    .filter(
      (material) =>
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.flashcard_sets.length > 0 ||
        material.notes.length > 0 ||
        material.quizzes.length > 0 ||
        material.attachments.length > 0
    );

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
    // TODO: Add API call to get AI response
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleFolder = (fileIndex, folderType) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [`${fileIndex}-${folderType}`]: !prev[`${fileIndex}-${folderType}`],
    }));
  };

  const handleFileUpload = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      console.log("Selected file:", files[0].name);
      // Here you would typically handle the file upload, e.g., send to a backend
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };

  const handleMaterialSelect = (material) => {
    setSelectedFile(null);
    setSelectedMaterial(material);
    setMessages([
      {
        role: "assistant",
        content: `Hello! I'm here to help you with "${material.title}". Feel free to ask me any questions about this material.`,
      },
    ]);
  };

  const handleFileSelect = (file, material) => {
    setSelectedFile(file);
    setSelectedMaterial(material);
    setMessages([
      {
        role: "assistant",
        content: `Hello! I'm here to help you with "${file.title}" from "${material.title}". Feel free to ask me any questions about this content.`,
      },
    ]);
  };

  return (
    <div className="flex h-full">
      {/* Chat Area */}
      <div
        className={`flex-1 flex flex-col shadow-lg overflow-hidden ${
          isPanelVisible ? "rounded-l-xl" : "rounded-xl"
        }`}
      >
        {/* Header */}
        <div className="h-16 px-4 border-b border-gray-200 bg-white flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 label-text">
            {selectedMaterial
              ? `Chatting about: ${selectedMaterial.title}`
              : "Select a material to start chatting"}
          </h2>
          <button
            onClick={() => setIsPanelVisible(!isPanelVisible)}
            className="bg-gray-50 rounded-full p-2 shadow-sm hover:bg-gray-100 transition-colors"
          >
            <MoreHorizontal size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.length === 0 && !selectedMaterial ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500 max-w-md">
                <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-700">
                  No material selected
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Select a material from the panel to start chatting with Rata
                  AI
                </p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-xl p-4 break-words shadow-sm label-text ${
                    message.role === "user"
                      ? "text-white"
                      : "text-gray-800 bg-white"
                  }`}
                  style={{
                    backgroundColor:
                      message.role === "user" ? "var(--pastel-blue)" : "white",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  {message.content}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex items-center gap-3 max-w-4xl mx-auto">
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Upload file"
              onClick={triggerFileUpload}
              style={{ backgroundColor: "var(--pastel-green)" }}
            >
              <Upload size={20} className="text-white" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
            <div className="flex-1 relative label-text">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  selectedMaterial
                    ? "Type your message..."
                    : "Select a material to start chatting"
                }
                className="w-full p-3 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none min-h-[40px] max-h-[120px] bg-gray-50 overflow-hidden"
                rows={1}
                disabled={!selectedMaterial}
                style={{
                  transition: "height 0.1s ease-out",
                }}
              />
            </div>
            <button
              onClick={handleSend}
              className="p-2 text-white rounded-full hover:bg-blue-600 transition-colors shadow-sm"
              title="Send message"
              style={{ backgroundColor: "var(--pastel-blue)" }}
              disabled={!selectedMaterial}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Files Panel */}
      {isPanelVisible && (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full shadow-lg rounded-r-xl overflow-hidden">
          <div className="h-16 px-4 border-b border-gray-200 bg-white">
            <div className="flex items-center h-full relative">
              <h2 className="label-text text-lg font-semibold text-gray-800">
                Materials
              </h2>
              <div className="absolute right-0">
                {!isSearchExpanded ? (
                  <button
                    onClick={() => setIsSearchExpanded(true)}
                    className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors shadow-sm"
                  >
                    <Search size={16} className="text-gray-600" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search files..."
                        className="label-text w-48 px-3 py-1.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all duration-300 ease-in-out bg-gray-50"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          setIsSearchExpanded(false);
                          setSearchQuery("");
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <div className="space-y-4">
              {filteredMaterials.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500 max-w-md">
                    <FileText
                      size={48}
                      className="mx-auto mb-4 text-gray-400"
                    />
                    <p className="text-lg font-medium text-gray-700">
                      No materials yet
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Go to Materials to add your study materials
                    </p>
                  </div>
                </div>
              ) : (
                filteredMaterials.map((material, fileIndex) => (
                  <div
                    key={fileIndex}
                    className={`exam-card exam-card--alt p-4 transition-all duration-300 ease-in-out cursor-pointer hover:bg-white rounded-xl border border-gray-200 ${
                      selectedMaterial?.title === material.title
                        ? "bg-white shadow-sm"
                        : "bg-white/50"
                    }`}
                    onClick={() => handleMaterialSelect(material)}
                  >
                    <h3 className="font-medium mb-3 text-gray-800">
                      {material.title}
                    </h3>

                    {/* Flashcards Folder */}
                    <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleFolder(fileIndex, "flashcards")}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                      >
                        {expandedFolders[`${fileIndex}-flashcards`] ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                        <BookOpen size={16} />
                        <span>Flashcards</span>
                      </button>
                      {expandedFolders[`${fileIndex}-flashcards`] && (
                        <div className="ml-6 mt-2 space-y-2">
                         {material.flashcard_sets.map((flashcard_set, flashIndex) => (
                            <div
                              key={flashIndex}
                              className="text-xs p-2 hover:bg-gray-100 rounded-xl cursor-pointer bg-white/50"
                              onClick={() => handleFileSelect(flashcard_set, material)}
                            >
                              <div className="font-medium text-gray-800">
                                {flashcard_set.title}
                              </div>
                              <div className="text-gray-500 text-[10px]">
                                Created{" "}
                                {new Date(flashcard_set.created_at).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Notes Folder */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleFolder(fileIndex, "notes")}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                      >
                        {expandedFolders[`${fileIndex}-notes`] ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                        <FileText size={16} />
                        <span>Notes</span>
                      </button>
                      {expandedFolders[`${fileIndex}-notes`] && (
                        <div className="ml-6 mt-2 space-y-2">
                          {material.notes.map((note, noteIndex) => (
                            <div
                              key={noteIndex}
                              className="text-xs p-2 hover:bg-gray-100 rounded-xl cursor-pointer bg-white/50"
                              onClick={() => handleFileSelect(note, material)}
                            >
                              <div className="font-medium text-gray-800">
                                {note.title}
                              </div>
                              <div className="text-gray-500 text-[10px]">
                                Created{" "}
                                {new Date(note.created_at).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Attachments Folder */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleFolder(fileIndex, "attachments")}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mt-3"
                      >
                        {expandedFolders[`${fileIndex}-attachments`] ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                        <FileText size={16} />
                        <span>Attachments</span>
                      </button>
                      {expandedFolders[`${fileIndex}-attachments`] && (
                        <div className="ml-6 mt-2 space-y-2">
                          {material.attachments.map((att, attIndex) => (
                            <a
                              key={attIndex}
                              href={att.file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-xs p-2 hover:bg-gray-100 rounded-xl cursor-pointer bg-white/50 text-blue-600 underline"
                            >
                              {att.file.split("/").pop()}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quizzes Folder */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleFolder(fileIndex, "quizzes")}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mt-3"
                      >
                        {expandedFolders[`${fileIndex}-quizzes`] ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                        <BookOpen size={16} />
                        <span>Quizzes</span>
                      </button>
                      {expandedFolders[`${fileIndex}-quizzes`] && (
                        <div className="ml-6 mt-2 space-y-2">
                          {material.quizzes.map((quiz, quizIndex) => (
                            <div
                              key={quizIndex}
                              className="text-xs p-2 hover:bg-gray-100 rounded-xl cursor-pointer bg-white/50"
                              onClick={() => handleFileSelect(quiz, material)}
                            >
                              <div className="font-medium text-gray-800">
                                {quiz.title}
                              </div>
                              <div className="text-gray-500 text-[10px]">
                                Created{" "}
                                {new Date(quiz.created_at).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RataAIScreen;
