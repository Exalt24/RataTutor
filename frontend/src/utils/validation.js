export const USERNAME_REGEX = /^[\w.@+-]{3,}$/
export const EMAIL_REGEX    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&_]).{8,}$/
export const FULL_NAME_REGEX = /^[a-zA-Z\s\-'\.]+$/

export const defaultValidators = {
  // Auth validators
  username: v =>
    USERNAME_REGEX.test(v)
      ? ''
      : 'Username must be at least 3 characters and may include letters, numbers, and @ . + - _',
  email: v =>
    EMAIL_REGEX.test(v)
      ? ''
      : 'Enter a valid email address.',
  password: v =>
    PASSWORD_REGEX.test(v)
      ? ''
      : 'Password must be at least 8 chars, include a letter, number & special char',
  confirmPassword: (v, password) =>
    v === password
      ? ''
      : 'Passwords do not match.',

  // Material validators
  materialTitle: v => {
    if (!v || v.trim().length === 0) {
      return 'Title is required';
    }
    if (v.trim().length < 2) {
      return 'Title must be at least 2 characters long';
    }
    if (v.length > 255) {
      return 'Title must be less than 255 characters';
    }
    return '';
  },

  materialDescription: v => {
    if (v && v.length > 500) {
      return 'Description must be less than 500 characters';
    }
    return '';
  },

  // Note validators
  noteTitle: v => {
    if (!v || v.trim().length === 0) {
      return 'Note title is required';
    }
    if (v.trim().length < 2) {
      return 'Note title must be at least 2 characters long';
    }
    if (v.length > 255) {
      return 'Note title must be less than 255 characters';
    }
    return '';
  },

  noteContent: v => {
    if (!v || v.trim().length === 0) {
      return 'Note content is required';
    }
    if (v.trim().length < 10) {
      return 'Note content must be at least 10 characters long';
    }
    return '';
  },

  // Flashcard validators
  flashcardSetTitle: v => {
    if (!v || v.trim().length === 0) {
      return 'Flashcard set title is required';
    }
    if (v.trim().length < 2) {
      return 'Title must be at least 2 characters long';
    }
    if (v.length > 255) {
      return 'Title must be less than 255 characters';
    }
    return '';
  },

  flashcardSetDescription: v => {
    if (v && v.length > 500) {
      return 'Description must be less than 500 characters';
    }
    return '';
  },

  flashcardQuestion: v => {
    if (!v || v.trim().length === 0) {
      return 'Question is required';
    }
    if (v.trim().length < 5) {
      return 'Question must be at least 5 characters long';
    }
    return '';
  },

  flashcardAnswer: v => {
    if (!v || v.trim().length === 0) {
      return 'Answer is required';
    }
    if (v.trim().length < 2) {
      return 'Answer must be at least 2 characters long';
    }
    return '';
  },

  // Quiz validators
  quizTitle: v => {
    if (!v || v.trim().length === 0) {
      return 'Quiz title is required';
    }
    if (v.trim().length < 2) {
      return 'Title must be at least 2 characters long';
    }
    if (v.length > 255) {
      return 'Title must be less than 255 characters';
    }
    return '';
  },

  quizQuestion: v => {
    if (!v || v.trim().length === 0) {
      return 'Question is required';
    }
    if (v.trim().length < 5) {
      return 'Question must be at least 5 characters long';
    }
    return '';
  },

  // General validators for numbers
  numCards: v => {
    const num = parseInt(v);
    if (isNaN(num) || num < 1) {
      return 'Number of cards must be at least 1';
    }
    if (num > 50) {
      return 'Number of cards cannot exceed 50';
    }
    return '';
  },

  numQuestions: v => {
    const num = parseInt(v);
    if (isNaN(num) || num < 1) {
      return 'Number of questions must be at least 1';
    }
    if (num > 50) {
      return 'Number of questions cannot exceed 50';
    }
    return '';
  },

  full_name: (value) => {
    if (!value?.trim()) return "Full name is required.";
    if (value.trim().length < 2) return "Full name must be at least 2 characters.";
    if (value.trim().length > 255) return "Full name cannot exceed 255 characters.";
    if (!FULL_NAME_REGEX.test(value.trim())) return "Full name can only contain letters, spaces, hyphens, apostrophes, and periods.";
    return "";
  },

  bio: (value) => {
    // Bio is optional, so empty is fine
    if (!value) return "";
    if (value.length > 500) return "Bio cannot exceed 500 characters.";
    return "";
  }
}