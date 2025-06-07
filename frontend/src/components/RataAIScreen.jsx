import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Edit2,
  FileText,
  HelpCircle,
  MoreHorizontal,
  Search,
  Send,
  Upload,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../components/Loading/LoadingContext';
import { useToast } from '../components/Toast/ToastContext';
import UploadFile from '../components/UploadFile';
import { useMaterials } from '../utils/materialsContext';
import { createCombinedSuccessMessage, trackActivityAndNotify } from '../utils/streakNotifications';

import {
  generateFlashcardsFromSpecificFiles,
  generateNotesFromSpecificFiles,
  generateQuizFromSpecificFiles,
  sendMessage,
  startMaterialConversation,
  uploadAttachment
} from "../services/apiService";

const RataAIScreen = () => {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const { showToast } = useToast();
  const { 
    materials, 
    fetchMaterials, 
    addMaterial,
    isInitialized, 
    isFetching 
  } = useMaterials();

  // UI State
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [expandedFolders, setExpandedFolders] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Conversation State
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ NEW: Upload flow state following HomeScreen pattern
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isChooseModalOpen, setIsChooseModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Refs
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // ✅ Initialize materials data on mount
  useEffect(() => {
    if (!isInitialized && !isFetching) {
      console.log('🔄 RataAI: Fetching materials...');
      fetchMaterials();
    }
  }, [isInitialized, isFetching, fetchMaterials]);

  // ✅ Debug: Log materials when they change
  useEffect(() => {
    if (isInitialized) {
      console.log('📚 RataAI: Materials updated:', materials.length, 'materials available');
      console.log('📚 Active materials:', materials.filter(m => m.status === 'active').length);
    }
  }, [materials, isInitialized]);

  // ✅ Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  // ✅ Filter materials based on search query
  const filteredMaterials = materials
    .filter(material => material.status === 'active') // Only show active materials
    .map((material) => {
      const filteredFlashcardSets = material.flashcard_sets
        ?.filter((set) =>
          set.title.toLowerCase().includes(searchQuery.toLowerCase())
        ) || [];

      const filteredNotes = material.notes
        ?.filter((note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase())
        ) || [];

      const filteredQuizzes = material.quizzes
        ?.filter((quiz) =>
          quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
        ) || [];

      const filteredAttachments = material.attachments
        ?.filter((att) =>
          att.file.toLowerCase().includes(searchQuery.toLowerCase())
        ) || [];

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

  // ✅ Start conversation with material (with retry logic for new materials)
  const startConversationWithMaterial = useCallback(async (material, retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🤖 Starting conversation with material:', material.title, `(attempt ${retryCount + 1})`);
      
      // Get or create conversation for this material
      const conversationData = await startMaterialConversation(material.id);
      
      setConversation(conversationData);
      setMessages(conversationData.messages || []);
      
      // If it's a new conversation, add welcome message
      if (!conversationData.messages || conversationData.messages.length === 0) {
        const welcomeMessage = {
          role: "assistant",
          content: `Hello! I'm here to help you with "${material.title}". Feel free to ask me any questions about this material, or I can help you create flashcards, quizzes, and notes based on your content.`,
          timestamp: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
      }
      
      // ✅ FIXED: Only show toast for new conversations
      if (conversationData.is_new) {
        showToast({
          variant: "success",
          title: "Conversation Started!",
          subtitle: `Now chatting about: ${material.title}`,
        });
      } else {
        console.log('📝 Resumed existing conversation with', material.title);
      }
    } catch (error) {
      console.error('❌ Error starting conversation:', error);
      
      // Retry logic for newly created materials (backend might need time to process)
      if (retryCount < 2 && (error.response?.status === 500 || error.response?.status === 404)) {
        console.log('🔄 Retrying conversation creation after delay...');
        setTimeout(() => {
          startConversationWithMaterial(material, retryCount + 1);
        }, 1000 * (retryCount + 1)); // Exponential backoff: 1s, 2s
        return;
      }
      
      // Fallback: Allow manual conversation without backend
      console.log('💬 Falling back to local conversation mode');
      setConversation({ id: `local-${material.id}`, material: material.id });
      const fallbackMessage = {
        role: "assistant",
        content: `Hello! I'm here to help you with "${material.title}". (Note: I'm running in offline mode - your conversation won't be saved, but I can still help you with questions about this material.)`,
        timestamp: new Date().toISOString()
      };
      setMessages([fallbackMessage]);
      setError('Running in offline mode - conversations won\'t be saved');
      showToast({
        variant: "error",
        title: "Connection Failed",
        subtitle: "Running in offline mode - conversations won't be saved",
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // ✅ Send message handler (with fallback for local mode)
  const handleSend = useCallback(async () => {
    if (!input.trim() || !conversation?.id) return;
    
    const userMessage = input.trim();
    setInput("");
    setLoading(true);
    setError(null);

    // Add user message immediately to UI
    const newUserMessage = {
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newUserMessage]);

    try {
      // Check if this is a local conversation (fallback mode)
      if (conversation.id.toString().startsWith('local-')) {
        // Local mode - provide helpful response without backend
        const localResponse = {
          role: "assistant",
          content: `I understand you're asking about "${userMessage}". Since I'm running in offline mode, I can't access the full AI capabilities right now, but I can help you with general questions about your material "${selectedMaterial?.title}". Try refreshing the page or check your internet connection to enable full AI features.`,
          timestamp: new Date().toISOString()
        };
        
        setTimeout(() => {
          setMessages(prev => [...prev, localResponse]);
          setLoading(false);
        }, 1000); // Simulate thinking time
        
        return;
      }
      
      // Normal mode - send to backend
      const response = await sendMessage(conversation.id, userMessage);
      
      // Add AI response to messages
      const aiMessage = {
        role: "assistant",
        content: response.aiResponse,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Update conversation with all messages if provided
      if (response.allMessages) {
        setMessages(response.allMessages);
      }
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      setError('Failed to send message');
      showToast({
        variant: "error",
        title: "Message Failed",
        subtitle: "Could not send your message. Please try again.",
      });
      
      // Remove the user message that failed to send
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }, [input, conversation, selectedMaterial, showToast]);

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

  // ✅ NEW: Upload flow following HomeScreen pattern
  const openUploadModal = () => setIsUploadModalOpen(true);
  const closeUploadModal = () => setIsUploadModalOpen(false);

  const handleFileUpload = (files) => {
    // Files are already validated in the UploadFile component
    const newFiles = files.map(file => {
      const extension = file.name.split('.').pop().toLowerCase();
      
      let type = extension;
      if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
        type = 'image';
      } else if (['mp4', 'mov', 'avi'].includes(extension)) {
        type = 'video';
      } else if (['mp3', 'wav'].includes(extension)) {
        type = 'audio';
      } else if (['doc', 'docx'].includes(extension)) {
        type = 'doc';
      } else if (['ppt', 'pptx'].includes(extension)) {
        type = 'ppt';
      } else if (extension === 'pdf') {
        type = 'pdf';
      } else if (extension === 'txt') {
        type = 'txt';
      }

      return {
        name: file.name,
        type: type,
        size: formatFileSize(file.size),
        date: new Date().toISOString().split('T')[0],
        file: file
      };
    });
    
    setUploadedFiles(newFiles);
    closeUploadModal();
    // Skip material selection since selectedMaterial is already chosen
    // Go directly to content type selection
    setIsChooseModalOpen(true);
  };

  const handleMaterialAndTypeChoice = async (type) => {
    try {
      // Use the already selected material from the materials panel
      if (!selectedMaterial) {
        throw new Error('No material selected. Please select a material first.');
      }

      // Upload files and generate content for the selected material
      await handleUploadAndGenerate(type);
    } catch (error) {
      console.error('Error handling content type selection:', error);
      showToast({ 
        variant: "error", 
        title: "Error", 
        subtitle: error.message || "Failed to process selection. Please try again." 
      });
    }
  };

  const handleUploadAndGenerate = async (type) => {
  if (uploadedFiles.length === 0 || !selectedMaterial) return;

  try {
    showLoading();
    
    // Step 1: Upload all files
    console.log('📤 Uploading files...');
    const uploadPromises = uploadedFiles.map(fileData => {
      return uploadAttachment(selectedMaterial.id, fileData.file);
    });

    const uploadResults = await Promise.all(uploadPromises);
    console.log('✅ All files uploaded:', uploadResults.length);
    
    // Step 1.5: Extract attachment IDs from upload results
    const attachmentIds = uploadResults.map(result => result.data.id);
    console.log('📎 Attachment IDs:', attachmentIds);
    
    // Step 1.6: Wait a moment for database to be consistent
    console.log('⏳ Waiting for database consistency...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    
    // Step 1.7: Refresh materials to ensure we have the latest data
    console.log('🔄 Refreshing materials data...');
    await fetchMaterials();
    
    // Step 2: Generate content based on type using specific attachments
    console.log(`🤖 Generating ${type} from ${attachmentIds.length} specific attachments...`);
    let generateResponse;
    let contentType;
    
    switch (type) {
      case 'flashcards':
        contentType = 'flashcards';
        generateResponse = await generateFlashcardsFromSpecificFiles(
          selectedMaterial.id, 
          attachmentIds, 
          10
        );
        break;
      case 'quiz':
        contentType = 'quiz questions';
        generateResponse = await generateQuizFromSpecificFiles(
          selectedMaterial.id, 
          attachmentIds, 
          10
        );
        break;
      case 'notes':
      default:
        contentType = 'notes';
        generateResponse = await generateNotesFromSpecificFiles(
          selectedMaterial.id, 
          attachmentIds
        );
        break;
    }
    
    // Track activity but suppress immediate notification
    const streakResult = await trackActivityAndNotify(showToast, true);

    // Step 3: Refresh materials to show new content
    await fetchMaterials();
    
    // Step 4: Create combined success message
    const baseTitle = "Content Generated Successfully!";
    const baseSubtitle = `Uploaded ${uploadedFiles.length} file(s) and generated ${contentType} for "${selectedMaterial.title}" using the specific uploaded content.`;
    
    const combinedMessage = createCombinedSuccessMessage(baseTitle, baseSubtitle, streakResult);
    
    // Show single combined toast
    showToast({
      variant: "success",
      title: combinedMessage.title,
      subtitle: combinedMessage.subtitle,
    });

    // Step 5: Add context message about the upload
    setTimeout(() => {
      const contextMessage = {
        role: "assistant",
        content: `I've successfully uploaded ${uploadedFiles.length} file(s) and generated ${contentType} based on the specific content you uploaded. The generated content is focused on the material from these files: ${uploadedFiles.map(f => f.name).join(', ')}. Feel free to ask me questions about this content!`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, contextMessage]);
    }, 1000);
    
    // Close modal and reset state
    setIsChooseModalOpen(false);
    setUploadedFiles([]);

  } catch (error) {
    console.error('Error uploading files or generating content:', error);
    showToast({
      variant: "error",
      title: "Upload failed",
      subtitle: error.response?.data?.error || error.message || "Failed to upload files. Please try again.",
    });
  } finally {
    hideLoading();
  }
};

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // ✅ Handle material selection
  const handleMaterialSelect = useCallback(async (material) => {
    setSelectedFile(null);
    setSelectedMaterial(material);
    await startConversationWithMaterial(material);
  }, [startConversationWithMaterial]);

  // ✅ Handle specific file/content selection within a material
  const handleFileSelect = useCallback(async (file, material) => {
    setSelectedFile(file);
    setSelectedMaterial(material);
    
    // Start conversation with the material if not already started
    if (!conversation || conversation.material !== material.id) {
      await startConversationWithMaterial(material);
    }
    
    // Add context message about the specific file
    const contextMessage = {
      role: "assistant",
      content: `I'm now focusing on "${file.title}" from "${material.title}". How can I help you with this specific content?`,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, contextMessage]);
  }, [conversation, startConversationWithMaterial]);

  // ✅ Navigate to materials if none available
  const handleGoToMaterials = () => {
    navigate('/dashboard/materials');
  };

  // ✅ Loading state when materials aren't initialized
  if (!isInitialized && isFetching) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Chat Area */}
      <div
        className={`flex-1 flex flex-col shadow-lg overflow-hidden ${
          isPanelVisible ? "md:rounded-l-xl" : "rounded-xl"
        }`}
      >
        {/* Header */}
        <div className="h-16 px-4 border-b border-gray-200 bg-white flex items-center justify-between">
          <div className="flex flex-col flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-800 label-text truncate">
              {selectedMaterial
                ? `Chatting about: ${selectedMaterial.title}`
                : "Select a material to start chatting"}
            </h2>
            {error && (
              <p className="text-xs text-amber-600 mt-1 truncate">
                {error}
              </p>
            )}
          </div>
          <button
            onClick={() => setIsPanelVisible(!isPanelVisible)}
            className="ml-2 bg-gray-50 rounded-full p-2 shadow-sm hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <MoreHorizontal size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50">
          {!selectedMaterial ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500 max-w-md">
                <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-700">
                  No material selected
                </p>
                <p className="text-sm text-gray-500 mt-2 mb-4">
                  Select a material from the panel to start chatting with Rata AI
                </p>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-center justify-between">
                  <span>{error}</span>
                  {error.includes('offline mode') && selectedMaterial && (
                    <button
                      onClick={() => startConversationWithMaterial(selectedMaterial)}
                      className="ml-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-xs transition-colors"
                      disabled={loading}
                    >
                      {loading ? 'Retrying...' : 'Retry'}
                    </button>
                  )}
                </div>
              )}
              
              {messages.map((message, index) => {
                const isUser = message.role === "user";
                const localTime = message.timestamp 
                  ? new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : '';

                return (
                  <div
                    key={index}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex flex-col max-w-[80%] space-y-1 ${
                        isUser ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`rounded-xl p-4 break-words shadow-sm label-text ${
                          isUser ? "text-white" : "text-gray-800 bg-white"
                        }`}
                        style={{
                          backgroundColor: isUser
                            ? "var(--pastel-blue)"
                            : "white",
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {!isUser ? (
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        ) : (
                          message.content
                        )}
                      </div>
                      {localTime && (
                        <span className="text-xs text-gray-400 px-2">
                          {localTime}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="flex flex-col max-w-[80%] space-y-1 items-start">
                    <div className="rounded-xl p-4 bg-white text-gray-800 shadow-sm">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-3 md:p-4 bg-white">
          <div className="flex items-center gap-2 md:gap-3 max-w-4xl mx-auto">
            <button
              className={`p-2 rounded-full transition-colors flex-shrink-0 ${
                selectedMaterial 
                  ? 'hover:bg-gray-100' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
              title={selectedMaterial ? `Upload files to generate content for "${selectedMaterial.title}"` : "Select a material first"}
              onClick={selectedMaterial ? openUploadModal : undefined}
              disabled={!selectedMaterial}
              style={{ backgroundColor: "var(--pastel-green)" }}
            >
              <Upload size={18} className="text-white" />
            </button>
            <div className="flex-1 relative label-text min-w-0">
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
                disabled={!selectedMaterial || loading}
                className="w-full p-2 md:p-3 pr-10 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none min-h-[40px] max-h-[120px] bg-gray-50 overflow-hidden disabled:opacity-50"
                rows={1}
                style={{
                  transition: "height 0.1s ease-out",
                }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || !selectedMaterial || loading}
              className="p-2 text-white rounded-full hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              title="Send message"
              style={{ backgroundColor: "var(--pastel-blue)" }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Materials Panel */}
      {isPanelVisible && (
        <div className="w-full md:w-80 bg-white border-t md:border-l border-gray-200 flex flex-col h-[50vh] md:h-full shadow-lg md:rounded-r-xl overflow-hidden">
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
                        placeholder="Search materials..."
                        className="label-text w-36 md:w-48 px-3 py-1.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all duration-300 ease-in-out bg-gray-50"
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
          
          <div className="flex-1 overflow-y-auto p-3 md:p-4 bg-gray-50">
            <div className="space-y-4">
              {filteredMaterials.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500 max-w-md">
                    <FileText
                      size={48}
                      className="mx-auto mb-4 text-gray-400"
                    />
                    <p className="text-lg font-medium text-gray-700">
                      {materials.length === 0 ? 'No materials yet' : 'No materials found'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2 mb-4">
                      {materials.length === 0 
                        ? 'Create your first material to start chatting with Rata AI'
                        : 'Try adjusting your search query'
                      }
                    </p>
                    {materials.length === 0 && (
                      <button
                        onClick={handleGoToMaterials}
                        className="exam-button-mini"
                      >
                        Go to Materials
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                filteredMaterials.map((material, fileIndex) => (
                  <div
                    key={material.id}
                    className={`exam-card exam-card--alt p-4 transition-all duration-300 ease-in-out cursor-pointer hover:bg-white rounded-xl border border-gray-200 shadow-sm ${
                      selectedMaterial?.id === material.id
                        ? "bg-white ring-2 ring-blue-200"
                        : "bg-white/50 hover:shadow-md"
                    }`}
                    onClick={() => handleMaterialSelect(material)}
                  >
                    {/* Flex container for header elements */}
                    <div className="flex items-center justify-between mb-2">
                      {/* Material Icon and Title (Left side) */}
                      <div className="flex items-center gap-2">
                        <BookOpen size={20} className="text-gray-600" />
                        <h3 className="font-medium text-gray-800">
                          {material.title}
                        </h3>
                      </div>

                      {/* Add creation time with icon (Right side) */}
                      {material.created_at && (
                        <div className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <FileText size={12} className="text-gray-400" />
                          <span>{new Date(material.created_at).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Empty State */}
                    {(!material.flashcard_sets || material.flashcard_sets.length === 0) &&
                     (!material.notes || material.notes.length === 0) &&
                     (!material.quizzes || material.quizzes.length === 0) &&
                     (!material.attachments || material.attachments.length === 0) && (
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        No content yet
                      </div>
                    )}

                    {/* Flashcards Folder */}
                    {material.flashcard_sets && material.flashcard_sets.length > 0 && (
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
                          <span>Flashcards ({material.flashcard_sets.length})</span>
                        </button>
                        {expandedFolders[`${fileIndex}-flashcards`] && (
                          <div className="ml-6 mt-2 space-y-2">
                            {material.flashcard_sets.map((flashcard_set, flashIndex) => (
                              <div
                                key={flashcard_set.id}
                                className="text-xs p-2 hover:bg-gray-100 rounded-xl cursor-pointer bg-white/50"
                                onClick={() => handleFileSelect(flashcard_set, material)}
                              >
                                <div className="font-medium text-gray-800">
                                  {flashcard_set.title}
                                </div>
                                <div className="text-gray-500 text-[10px]">
                                  {flashcard_set.flashcards?.length || 0} cards
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notes Folder */}
                    {material.notes && material.notes.length > 0 && (
                      <div className="mb-3" onClick={(e) => e.stopPropagation()}>
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
                          <span>Notes ({material.notes.length})</span>
                        </button>
                        {expandedFolders[`${fileIndex}-notes`] && (
                          <div className="ml-6 mt-2 space-y-2">
                            {material.notes.map((note) => (
                              <div
                                key={note.id}
                                className="text-xs p-2 hover:bg-gray-100 rounded-xl cursor-pointer bg-white/50"
                                onClick={() => handleFileSelect(note, material)}
                              >
                                <div className="font-medium text-gray-800">
                                  {note.title}
                                </div>
                                <div className="text-gray-500 text-[10px]">
                                  Note
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quizzes Folder */}
                    {material.quizzes && material.quizzes.length > 0 && (
                      <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleFolder(fileIndex, "quizzes")}
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                        >
                          {expandedFolders[`${fileIndex}-quizzes`] ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                          <BookOpen size={16} />
                          <span>Quizzes ({material.quizzes.length})</span>
                        </button>
                        {expandedFolders[`${fileIndex}-quizzes`] && (
                          <div className="ml-6 mt-2 space-y-2">
                            {material.quizzes.map((quiz) => (
                              <div
                                key={quiz.id}
                                className="text-xs p-2 hover:bg-gray-100 rounded-xl cursor-pointer bg-white/50"
                                onClick={() => handleFileSelect(quiz, material)}
                              >
                                <div className="font-medium text-gray-800">
                                  {quiz.title}
                                </div>
                                <div className="text-gray-500 text-[10px]">
                                  {quiz.questions?.length || 0} questions
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Attachments Folder */}
                    {material.attachments && material.attachments.length > 0 && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleFolder(fileIndex, "attachments")}
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                        >
                          {expandedFolders[`${fileIndex}-attachments`] ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                          <FileText size={16} />
                          <span>Files ({material.attachments.length})</span>
                        </button>
                        {expandedFolders[`${fileIndex}-attachments`] && (
                          <div className="ml-6 mt-2 space-y-2">
                            {material.attachments.map((att) => (
                              <a
                                key={att.id}
                                href={att.file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-xs p-2 hover:bg-gray-100 rounded-xl cursor-pointer bg-white/50 text-blue-600 underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {att.file.split("/").pop()}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ Upload File Modal */}
      <UploadFile 
        isOpen={isUploadModalOpen} 
        onClose={closeUploadModal} 
        onUpload={handleFileUpload}
      />

      {/* ✅ Content Type Selection Modal */}
      {isChooseModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
          <div className="letter-no-lines w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 pt-3 px-3 label-text truncate">
                Generate Content for "{selectedMaterial?.title}"
              </h2>
              <button
                onClick={() => {
                  setIsChooseModalOpen(false);
                  setUploadedFiles([]);
                }}
                className="text-gray-500 hover:text-gray-700 p-4 transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            
            <div className="px-3 md:px-4 pb-4">
              {/* Show uploaded files summary */}
              <div className="mb-4 md:mb-6 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 mb-2 label-text">Files to Upload:</h3>
                <div className="space-y-1">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="text-sm text-blue-700 flex items-center gap-2 label-text truncate">
                      <FileText size={16} className="flex-shrink-0" />
                      <span className="truncate">{file.name}</span>
                      <span className="text-blue-500 flex-shrink-0">({file.size})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content type selection */}
              <div className="grid grid-cols-1 gap-3 md:gap-4 mb-6 md:mb-8">
                <div
                  className="p-4 rounded-lg shadow-sm transition-all duration-200 cursor-pointer bg-blue-50 hover:bg-blue-100 border-2 border-transparent hover:border-blue-300"
                  onClick={() => handleMaterialAndTypeChoice('flashcards')}
                  role="button"
                  tabIndex="0"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-white shadow-sm">
                      <FileText size={24} className="text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 label-text">Generate Flashcards</h3>
                      <p className="text-gray-600 text-sm">Create flashcards from your uploaded content</p>
                    </div>
                  </div>
                </div>

                <div
                  className="p-4 rounded-lg shadow-sm transition-all duration-200 cursor-pointer bg-green-50 hover:bg-green-100 border-2 border-transparent hover:border-green-300"
                  onClick={() => handleMaterialAndTypeChoice('quiz')}
                  role="button"
                  tabIndex="0"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-white shadow-sm">
                      <HelpCircle size={24} className="text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 label-text">Generate Quiz</h3>
                      <p className="text-gray-600 text-sm">Create quiz questions from your uploaded content</p>
                    </div>
                  </div>
                </div>

                <div
                  className="p-4 rounded-lg shadow-sm transition-all duration-200 cursor-pointer bg-purple-50 hover:bg-purple-100 border-2 border-transparent hover:border-purple-300"
                  onClick={() => handleMaterialAndTypeChoice('notes')}
                  role="button"
                  tabIndex="0"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-white shadow-sm">
                      <Edit2 size={24} className="text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 label-text">Generate Notes</h3>
                      <p className="text-gray-600 text-sm">Create study notes from your uploaded content</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cancel button */}
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setIsChooseModalOpen(false);
                    setUploadedFiles([]);
                  }}
                  className="exam-button-mini"
                  aria-label="Cancel upload"
                  data-hover="Cancel"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RataAIScreen;