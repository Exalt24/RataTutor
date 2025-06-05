import api from './api'; 

// Materials
export const getMaterials = () => api.get('/materials/');
export const getMaterial = (id) => api.get(`/materials/${id}/`);
export const createMaterial = (data) => api.post('/materials/', data);
export const updateMaterial = (id, data) => api.patch(`/materials/${id}/`, data);
export const deleteMaterial = (id) => api.delete(`/materials/${id}/`);

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

// AI-powered generation endpoints
export const generateNotes = (materialId) => api.post(`/materials/${materialId}/generate-notes/`);
export const generateFlashcards = (materialId, numCards = 5) =>
  api.post(`/materials/${materialId}/generate-flashcards/`, { num_cards: numCards });
export const generateQuiz = (materialId, numQuestions = 5) =>
  api.post(`/materials/${materialId}/generate-quiz/`, { num_questions: numQuestions });

// Conversations
export const createConversation = (data) => api.post('/conversations/create/', data);
export const chatConversation = (conversationId, prompt) =>
  api.post(`/conversations/${conversationId}/chat/`, { prompt });
export const getConversation = (conversationId) => api.get(`/conversations/${conversationId}/`);