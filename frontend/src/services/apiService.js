import api from './api';

// Materials
export const getMaterials = () => api.get('/materials/');
export const getMaterial = (id) => api.get(`/materials/${id}/`);
export const createMaterial = (data) => api.post('/materials/', data);
export const updateMaterial = (id, data) => api.patch(`/materials/${id}/`, data);
export const softDeleteMaterial = (id) => api.delete(`/materials/${id}/`);
export const permanentDeleteMaterial = (id) => api.post(`/materials/${id}/permanent_delete/`);
export const restoreMaterial = (id) => api.patch(`/materials/${id}/`, { status: 'active' });

export const getPublicMaterials = () => {
  return api.get('/materials/public/')
}

// Material specific endpoints
export const getPinnedMaterials = () => api.get('/materials/pinned/');
export const getTrashedMaterials = () => api.get('/materials/trash/');
export const toggleMaterialPin = (id) => api.post(`/materials/${id}/toggle_pin/`);
export const toggleMaterialVisibility = (id) => api.post(`/materials/${id}/toggle_visibility/`);

// Attachments
export const uploadAttachment = (materialId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/materials/${materialId}/upload/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteAttachment = (id) => api.delete(`/attachments/${id}/`);

// Notes
export const getNotes = (params = {}) => api.get('/notes/', { params });
export const getNote = (id) => api.get(`/notes/${id}/`);
export const createNote = (data) => api.post('/notes/', data);
export const updateNote = (id, data) => api.patch(`/notes/${id}/`, data);
export const deleteNote = (id) => api.delete(`/notes/${id}/`);
// Helper: Get notes for a specific material
export const getMaterialNotes = (materialId) => api.get('/notes/', { params: { material: materialId } });

// Flashcard Sets
export const getFlashcardSets = (params = {}) => api.get('/flashcard-sets/', { params });
export const getFlashcardSet = (id) => api.get(`/flashcard-sets/${id}/`);
export const createFlashcardSet = (data) => api.post('/flashcard-sets/', data);
export const updateFlashcardSet = (id, data) => api.patch(`/flashcard-sets/${id}/`, data);
export const deleteFlashcardSet = (id) => api.delete(`/flashcard-sets/${id}/`);
// Helper: Get flashcard sets for a specific material
export const getMaterialFlashcardSets = (materialId) => api.get('/flashcard-sets/', { params: { material: materialId } });

// Flashcards
export const getFlashcards = (params = {}) => api.get('/flashcards/', { params });
export const getFlashcard = (id) => api.get(`/flashcards/${id}/`);
export const createFlashcard = (data) => api.post('/flashcards/', data);
export const updateFlashcard = (id, data) => api.patch(`/flashcards/${id}/`, data);
export const deleteFlashcard = (id) => api.delete(`/flashcards/${id}/`);
// Helper: Get flashcards for a specific set
export const getFlashcardSetCards = (flashcardSetId) => api.get('/flashcards/', { params: { flashcard_set: flashcardSetId } });

// Quizzes
export const getQuizzes = (params = {}) => api.get('/quizzes/', { params });
export const getQuiz = (id) => api.get(`/quizzes/${id}/`);
export const createQuiz = (data) => api.post('/quizzes/', data);
export const updateQuiz = (id, data) => api.patch(`/quizzes/${id}/`, data);
export const deleteQuiz = (id) => api.delete(`/quizzes/${id}/`);
// Helper: Get quizzes for a specific material
export const getMaterialQuizzes = (materialId) => api.get('/quizzes/', { params: { material: materialId } });

// Quiz Questions
export const getQuizQuestions = (params = {}) => api.get('/quiz-questions/', { params });
export const getQuizQuestion = (id) => api.get(`/quiz-questions/${id}/`);
export const createQuizQuestion = (data) => api.post('/quiz-questions/', data);
export const updateQuizQuestion = (id, data) => api.patch(`/quiz-questions/${id}/`, data);
export const deleteQuizQuestion = (id) => api.delete(`/quiz-questions/${id}/`);
// Helper: Get questions for a specific quiz
export const getQuizQuestionsForQuiz = (quizId) => api.get('/quiz-questions/', { params: { quiz: quizId } });

// Copy Material
export const copyMaterial = (materialId) => api.post(`/materials/${materialId}/copy/`);

export const generateFlashcardsFromSpecificFiles = (materialId, attachmentIds, numCards = 5) =>
  api.post(`/materials/${materialId}/generate-flashcards/`, { 
    num_cards: numCards,
    specific_attachments: attachmentIds 
  });

export const generateQuizFromSpecificFiles = (materialId, attachmentIds, numQuestions = 5) =>
  api.post(`/materials/${materialId}/generate-quiz/`, { 
    num_questions: numQuestions,
    specific_attachments: attachmentIds 
  });

export const generateNotesFromSpecificFiles = (materialId, attachmentIds) =>
  api.post(`/materials/${materialId}/generate-notes/`, { 
    specific_attachments: attachmentIds 
  });

// ===== SMART CONVERSATION MANAGEMENT =====

// ✅ NEW: Get all conversations for the user
export const getConversations = () => api.get('/conversations/');

// ✅ Enhanced getMaterialConversation with debugging
export const getMaterialConversation = (materialId) => {
  console.log('🔍 API Debug - getMaterialConversation called with materialId:', materialId, typeof materialId);
  const url = `/materials/${materialId}/conversation/`;
  console.log('🔍 API Debug - Constructed URL:', url);
  
  return api.get(url);
};

// ✅ LEGACY: Create conversation manually (kept for backward compatibility)
export const createConversation = (data) => api.post('/conversations/create/', data);

// ✅ ENHANCED: Chat with AI (now uses smart context management)
export const chatConversation = (conversationId, prompt) =>
  api.post(`/conversations/${conversationId}/chat/`, { prompt });

// ✅ Get specific conversation details
export const getConversation = (conversationId) => api.get(`/conversations/${conversationId}/`);

// ✅ NEW: Delete a conversation
export const deleteConversation = (conversationId) => api.delete(`/conversations/${conversationId}/delete/`);

// ✅ NEW: Manually regenerate conversation summary
export const regenerateConversationSummary = (conversationId) =>
  api.post(`/conversations/${conversationId}/regenerate-summary/`);

// ===== CONVERSATION HELPER FUNCTIONS =====

/**
 * Get or create a conversation for a material and return it ready for chatting
 * This is the recommended way to start a conversation with a material
 */
// ✅ Enhanced startMaterialConversation with debugging  
export const startMaterialConversation = async (materialId) => {
  try {
    console.log('🔍 API Debug - startMaterialConversation called with materialId:', materialId, typeof materialId);
    const response = await getMaterialConversation(materialId);
    console.log('✅ API Debug - Conversation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API Debug - Failed to get/create conversation for material:', materialId);
    console.error('❌ API Debug - Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
      message: error.message
    });
    
    // ✅ Enhanced error logging for 500 errors
    if (error.response?.status === 500) {
      console.error('🚨 500 Error - This is likely a backend database/constraint issue');
      console.error('💡 Check Django logs and run the debug script provided');
      console.error('🔧 Possible fixes:');
      console.error('   1. Update GetOrCreateConversationView');
      console.error('   2. Run migrations: python manage.py makemigrations && python manage.py migrate');
      console.error('   3. Check for duplicate conversations in database');
    }
    
    throw error;
  }
};

/**
 * Send a message and get AI response with smart context management
 * Enhanced to handle the new response format with conversation metadata
 */
export const sendMessage = async (conversationId, message) => {
  try {
    const response = await chatConversation(conversationId, message);
    
    // The response now includes additional context info
    const {
      user_message,
      ai_response,
      messages,
      conversation_topic,
      messages_since_summary,
      summary_preview
    } = response.data;
    
    return {
      userMessage: user_message,
      aiResponse: ai_response,
      allMessages: messages,
      topic: conversation_topic,
      messagesSinceSummary: messages_since_summary,
      summaryPreview: summary_preview,
      // For backward compatibility
      messages: messages
    };
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
};

/**
 * Get all conversations organized by material
 * The response groups conversations by their associated materials
 */
export const getOrganizedConversations = async () => {
  try {
    const response = await getConversations();
    return response.data; // Already organized by the backend
  } catch (error) {
    console.error('Failed to get organized conversations:', error);
    throw error;
  }
};

/**
 * Enhanced material conversation workflow
 * Opens a material's conversation and provides context about the conversation state
 */
export const openMaterialChat = async (materialId) => {
  try {
    const conversationResponse = await getMaterialConversation(materialId);
    const conversation = conversationResponse.data;
    
    return {
      conversation,
      isNew: conversation.is_new,
      hasMessages: conversation.messages && conversation.messages.length > 0,
      topic: conversation.messages?.length > 0 ? 'continuing' : 'new',
      summaryExists: !!conversation.summary_context
    };
  } catch (error) {
    console.error('Failed to open material chat:', error);
    throw error;
  }
};




