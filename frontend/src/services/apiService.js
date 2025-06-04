import api from './api'; 

// Materials
export const getMaterials = () => api.get('/materials/');
export const getMaterial = (id) => api.get(`/materials/${id}/`);
export const createMaterial = (data) => api.post('/materials/', data);
export const updateMaterial = (id, data) => api.patch(`/materials/${id}/`, data);
export const deleteMaterial = (id) => api.delete(`/materials/${id}/`);

// Attachments
export const uploadAttachment = (materialId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/materials/${materialId}/upload/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Notes
export const getNotes = () => api.get('/notes/');
export const createNote = (data) => api.post('/notes/', data);
export const updateNote = (id, data) => api.patch(`/notes/${id}/`, data);
export const deleteNote = (id) => api.delete(`/notes/${id}/`);

// Flashcard Sets
export const getFlashcardSets = () => api.get('/flashcard-sets/');
export const createFlashcardSet = (data) => api.post('/flashcard-sets/', data);
export const updateFlashcardSet = (id, data) => api.patch(`/flashcard-sets/${id}/`, data);
export const deleteFlashcardSet = (id) => api.delete(`/flashcard-sets/${id}/`);

// Flashcards
export const getFlashcards = () => api.get('/flashcards/');
export const createFlashcard = (data) => api.post('/flashcards/', data);
export const updateFlashcard = (id, data) => api.patch(`/flashcards/${id}/`, data);
export const deleteFlashcard = (id) => api.delete(`/flashcards/${id}/`);

// Quizzes
export const getQuizzes = () => api.get('/quizzes/');
export const createQuiz = (data) => api.post('/quizzes/', data);
export const updateQuiz = (id, data) => api.patch(`/quizzes/${id}/`, data);
export const deleteQuiz = (id) => api.delete(`/quizzes/${id}/`);

// Quiz Questions
export const getQuizQuestions = () => api.get('/quiz-questions/');
export const createQuizQuestion = (data) => api.post('/quiz-questions/', data);
export const updateQuizQuestion = (id, data) => api.patch(`/quiz-questions/${id}/`, data);
export const deleteQuizQuestion = (id) => api.delete(`/quiz-questions/${id}/`);

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
