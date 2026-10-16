# API

There are 42 REST routes under `/api/` and `/auth/`, built from DRF viewsets and a few function-style views.

- **`/auth/`** (10 routes): register, logout, token, token refresh, password reset and confirm, profile read and update, record activity, streak status.
- **Materials:** list and create, pinned, trash and public lists, detail (get, patch, put, delete), toggle pin, toggle visibility, permanent delete, copy, upload an attachment, get or create the material's conversation.
- **Generation:** `POST /api/materials/{id}/generate-flashcards/`, `generate-quiz/`, `generate-notes/`.
- **Conversations:** list, create, retrieve, chat, regenerate summary, delete.
- **Content:** viewsets for notes, flashcard sets, flashcards, quizzes, quiz questions and attachments.

The full list is in `backend/api/urls.py` and `backend/accounts/urls.py`.
