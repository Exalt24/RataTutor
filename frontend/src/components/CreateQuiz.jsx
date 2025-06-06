import { AlertCircle, ArrowLeft, GripVertical, HelpCircle, Plus, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ValidatedInput from '../components/ValidatedInput';
import { useLoading } from '../components/Loading/LoadingContext';
import { useToast } from '../components/Toast/ToastContext';
import { defaultValidators } from '../utils/validation';
import { createQuiz, updateQuiz } from '../services/apiService';
import { trackActivityAndNotify, createCombinedSuccessMessage } from '../utils/streakNotifications';

const CreateQuiz = ({ 
  material, 
  quiz = null, 
  onClose, 
  onSuccess, 
  options = {} 
}) => {
  const { showLoading, hideLoading } = useLoading();
  const { showToast } = useToast();

  // Extract success callback from either direct prop or options
  const successCallback = options.onSuccess || onSuccess;

  // ✅ Enhanced: Detect edit mode and extract edit content
  const isEditMode = useMemo(() => {
    return !!(quiz || options.editMode || options.editContent);
  }, [quiz, options.editMode, options.editContent]);

  const editContent = useMemo(() => {
    return quiz || options.editContent || null;
  }, [quiz, options.editContent]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const [items, setItems] = useState([{ 
    question: '', 
    choices: ['', ''], 
    correctAnswer: 0 
  }]);

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [bannerErrors, setBannerErrors] = useState([]);
  const [validities, setValidities] = useState({
    title: false,
    description: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // ✅ Enhanced: Initialize form data - legitimate useEffect for form initialization
  useEffect(() => {
    if (isEditMode && editContent) {
      // Edit mode: populate with existing data
      setFormData({
        title: editContent.title || '',
        description: editContent.description || '',
      });

      // Convert existing questions to the expected format
      const existingQuestions = editContent.questions || [];
      if (existingQuestions.length > 0) {
        setItems(existingQuestions.map(question => ({
          question: question.question_text || question.question || '',
          choices: question.choices || ['', ''],
          correctAnswer: question.choices?.indexOf(question.correct_answer) || 0,
          id: question.id
        })));
      } else {
        setItems([{ question: '', choices: ['', ''], correctAnswer: 0 }]);
      }

      // Set initial validity for pre-filled title
      setValidities(prev => ({
        ...prev,
        title: !!(editContent.title && editContent.title.trim()),
      }));
    } else if (material?.title) {
      // Create mode: auto-suggest title based on material
      setFormData(prev => ({
        ...prev,
        title: `${material.title} - Quiz`,
      }));
      setValidities(prev => ({
        ...prev,
        title: true,
      }));
    }
  }, [editContent, material?.title, isEditMode]);

  // ✅ Enhanced: Memoized question validation to avoid recalculating on every render
  const questionValidationStatus = useMemo(() => {
    let validQuestionCount = 0;
    let invalidQuestionCount = 0;
    let emptyQuestionCount = 0;
    let partialQuestionCount = 0;

    items.forEach((item) => {
      const questionTrimmed = item.question.trim();
      const validChoices = item.choices.filter(choice => choice.trim().length > 0);
      
      const isEmpty = !questionTrimmed && validChoices.length === 0;
      const isPartial = !questionTrimmed || validChoices.length < 2 || !item.choices[item.correctAnswer]?.trim();
      
      if (isEmpty) {
        emptyQuestionCount++;
      } else if (isPartial) {
        partialQuestionCount++;
      } else {
        const questionError = defaultValidators.quizQuestion(item.question);
        const hasValidChoices = validChoices.length >= 2;
        const hasValidCorrectAnswer = item.choices[item.correctAnswer]?.trim();
        
        if (!questionError && hasValidChoices && hasValidCorrectAnswer) {
          validQuestionCount++;
        } else {
          invalidQuestionCount++;
        }
      }
    });

    return {
      validQuestionCount,
      invalidQuestionCount,
      emptyQuestionCount,
      partialQuestionCount,
      hasValidQuestions: validQuestionCount > 0,
      hasProblems: invalidQuestionCount > 0 || partialQuestionCount > 0
    };
  }, [items]);

  // ✅ Enhanced: Form handlers with useCallback
  const handleTitleChange = useCallback((e) => {
    setFormData(prev => ({
      ...prev,
      title: e.target.value
    }));
  }, []);

  const handleDescriptionChange = useCallback((e) => {
    setFormData(prev => ({
      ...prev,
      description: e.target.value
    }));
  }, []);

  const handleTitleValidityChange = useCallback((field, isValid) => {
    setValidities(prev => ({
      ...prev,
      title: isValid
    }));
  }, []);

  const handleDescriptionValidityChange = useCallback((field, isValid) => {
    setValidities(prev => ({
      ...prev,
      description: isValid
    }));
  }, []);

  // ✅ Enhanced: Question management with useCallback
  const addNewItem = useCallback(() => {
    setItems(prev => [...prev, { question: '', choices: ['', ''], correctAnswer: 0 }]);
  }, []);

  const updateItem = useCallback((index, field, value) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[index][field] = value;
      return newItems;
    });
  }, []);

  const updateChoice = useCallback((itemIndex, choiceIndex, value) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[itemIndex].choices[choiceIndex] = value;
      return newItems;
    });
  }, []);

  const addChoice = useCallback((itemIndex) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[itemIndex].choices.push('');
      return newItems;
    });
  }, []);

  const removeChoice = useCallback((itemIndex, choiceIndex) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[itemIndex].choices = newItems[itemIndex].choices.filter((_, i) => i !== choiceIndex);
      // Adjust correctAnswer if needed
      if (newItems[itemIndex].correctAnswer >= choiceIndex) {
        newItems[itemIndex].correctAnswer = Math.max(0, newItems[itemIndex].correctAnswer - 1);
      }
      return newItems;
    });
  }, []);

  const removeItem = useCallback((index) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  }, [items.length]);

  // ✅ Enhanced: Drag and drop handlers
  const handleDragStart = useCallback((index) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((dropIndex) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    setItems(prev => {
      const newItems = [...prev];
      const draggedItem = newItems[draggedIndex];
      newItems.splice(draggedIndex, 1);
      newItems.splice(dropIndex, 0, draggedItem);
      return newItems;
    });
    setDraggedIndex(null);
  }, [draggedIndex]);

  // ✅ Enhanced: Question validation
  const validateQuestions = useCallback(() => {
    const errors = [];
    
    if (items.length === 0) {
      errors.push('At least one question is required.');
      return errors;
    }

    let validQuestionCount = 0;
    let emptyQuestionCount = 0;

    items.forEach((item, index) => {
      const questionTrimmed = item.question.trim();
      const validChoices = item.choices.filter(choice => choice.trim().length > 0);
      
      const isEmpty = !questionTrimmed && validChoices.length === 0;
      
      if (isEmpty) {
        emptyQuestionCount++;
        return;
      }

      const questionError = defaultValidators.quizQuestion(item.question);
      
      if (questionError) {
        errors.push(`Question ${index + 1}: ${questionError}`);
      }

      if (validChoices.length < 2) {
        errors.push(`Question ${index + 1}: Must have at least 2 valid choices.`);
      }

      if (!item.choices[item.correctAnswer]?.trim()) {
        errors.push(`Question ${index + 1}: Must have a valid correct answer selected.`);
      }

      if (!questionError && validChoices.length >= 2 && item.choices[item.correctAnswer]?.trim()) {
        validQuestionCount++;
      }
    });

    if (validQuestionCount === 0) {
      errors.push('At least one complete question is required.');
    }

    if (emptyQuestionCount > 0 && validQuestionCount > 0) {
      errors.push(`Note: ${emptyQuestionCount} empty question(s) will be ignored.`);
    }

    return errors;
  }, [items]);

  // ✅ Enhanced: Save handler following CreateFlashcards pattern exactly
  const handleSave = useCallback(async () => {
  setBannerErrors([]);
  
  const questionErrors = validateQuestions();
  if (questionErrors.length > 0) {
    setBannerErrors(questionErrors);
    return;
  }

  setSubmitting(true);
  showLoading();

  try {
    const validQuestions = items
      .filter(item => {
        const questionTrimmed = item.question.trim();
        const validChoices = item.choices.filter(choice => choice.trim().length > 0);
        
        if (!questionTrimmed && validChoices.length === 0) {
          return false;
        }
        
        const questionError = defaultValidators.quizQuestion(item.question);
        const hasValidChoices = validChoices.length >= 2;
        const hasValidCorrectAnswer = item.choices[item.correctAnswer]?.trim();
        
        return !questionError && hasValidChoices && hasValidCorrectAnswer;
      })
      .map(item => ({
        question_text: item.question.trim(),
        choices: item.choices.filter(choice => choice.trim().length > 0),
        correct_answer: item.choices[item.correctAnswer].trim(),
        ...(item.id && { id: item.id })
      }));

    if (validQuestions.length === 0) {
      setBannerErrors(['No valid questions to save. Please complete at least one question.']);
      return;
    }

    const quizData = {
      material: material?.id,
      title: formData.title.trim(),
      description: formData.description.trim(),
      questions: validQuestions,
      public: false // Default to private
    };

    let response;
    if (isEditMode) {
      response = await updateQuiz(editContent.id, quizData);
    } else {
      response = await createQuiz(quizData);
    }

    // 🔥 Track activity but suppress immediate notification (same as CreateFlashcards)
    const streakResult = await trackActivityAndNotify(showToast, true);
    
    // 🔥 Create combined message using helper function (same as CreateFlashcards)
    const baseTitle = `Quiz ${isEditMode ? 'updated' : 'created'} successfully!`;
    const baseSubtitle = `${isEditMode ? 'Updated' : 'Created'} ${validQuestions.length} questions in "${formData.title}" quiz.`;
    
    const combinedMessage = createCombinedSuccessMessage(baseTitle, baseSubtitle, streakResult);
    
    // 🔥 Show single combined toast (same as CreateFlashcards)
    showToast({
      variant: "success",
      title: combinedMessage.title,
      subtitle: combinedMessage.subtitle,
    });

    // ✅ Close component immediately after API success
    onClose();

    // ✅ Call success callback separately
    if (successCallback) {
      try {
        await successCallback(response.data);
      } catch (callbackError) {
        console.error('Error in success callback:', callbackError);
      }
    }

  } catch (err) {
    // ✅ Only handle actual API failures
    console.error('API Error creating/updating quiz:', err);
    
    const data = err.response?.data || {};
    const msgs = [];

    if (data.questions && Array.isArray(data.questions)) {
      data.questions.forEach((questionErrors, index) => {
        if (typeof questionErrors === 'object' && questionErrors !== null) {
          Object.entries(questionErrors).forEach(([field, errors]) => {
            if (Array.isArray(errors)) {
              errors.forEach(error => {
                msgs.push(`Question ${index + 1} - ${field}: ${error}`);
              });
            } else if (typeof errors === 'string') {
              msgs.push(`Question ${index + 1} - ${field}: ${errors}`);
            }
          });
        }
      });
    }

    Object.entries(data).forEach(([key, val]) => {
      if (key !== 'questions') {
        if (Array.isArray(val)) {
          val.forEach((m) => msgs.push(typeof m === 'string' ? m : JSON.stringify(m)));
        } else if (typeof val === "string") {
          msgs.push(val);
        }
      }
    });

    if (msgs.length === 0) {
      msgs.push(`Failed to ${isEditMode ? 'update' : 'create'} quiz. Please try again.`);
    }

    setBannerErrors(msgs);

  } finally {
    setSubmitting(false);
    hideLoading();
  }
}, [items, formData, isEditMode, editContent?.id, material?.id, onClose, validateQuestions, showLoading, hideLoading, showToast, successCallback]);

  // ✅ Enhanced: Memoized button state
  const isDisabled = useMemo(() => {
    return !validities.title || !questionValidationStatus.hasValidQuestions || questionValidationStatus.hasProblems || submitting;
  }, [validities.title, questionValidationStatus.hasValidQuestions, questionValidationStatus.hasProblems, submitting]);

  return (
    <div className="letter-no-lines">
      <div className="max-w-[90rem] mx-auto px-10 py-3">
        {/* ✅ Enhanced: Header following CreateFlashcards structure */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full mr-4"
              disabled={submitting}
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="text-3xl font-semibold label-text">
                {isEditMode ? 'Edit Quiz' : 'Create Quiz'}
              </h2>
              {material && (
                <p className="text-sm text-gray-600 mt-1">
                  for "{material.title}"
                  {isEditMode && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      Editing: {editContent?.title}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ✅ Enhanced: Error Banner following CreateFlashcards structure */}
        {bannerErrors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                {bannerErrors.map((error, idx) => (
                  <p key={idx}>{error}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ✅ Enhanced: Details Section following CreateFlashcards structure */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-all mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-medium label-text">Details</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ValidatedInput
              label="Title"
              name="quizTitle"
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              required={true}
              onValidityChange={handleTitleValidityChange}
              disabled={submitting}
              variant='profile'
              placeholder="Enter a descriptive title for your quiz"
            />

            <ValidatedInput
              label="Description (Optional)"
              name="quizDescription"
              type="textarea"
              value={formData.description}
              onChange={handleDescriptionChange}
              required={false}
              onValidityChange={handleDescriptionValidityChange}
              rows={3}
              disabled={submitting}
              variant='profile'
              placeholder="Add a brief description for your quiz (optional)"
            />
          </div>
        </div>

        {/* ✅ Enhanced: Questions Section */}
        <div className="space-y-6">
          {items.map((item, index) => {
            const questionTrimmed = item.question.trim();
            const validChoices = item.choices.filter(choice => choice.trim().length > 0);
            const isEmpty = !questionTrimmed && validChoices.length === 0;
            const isPartial = !questionTrimmed || validChoices.length < 2 || !item.choices[item.correctAnswer]?.trim();
            const questionError = defaultValidators.quizQuestion(item.question);
            const isValid = !isEmpty && !isPartial && !questionError;
            
            let questionStatusColor = 'bg-gray-100 text-gray-600';
            let questionStatusText = 'Empty';
            
            if (isPartial && !isEmpty) {
              questionStatusColor = 'bg-yellow-100 text-yellow-700';
              questionStatusText = 'Incomplete';
            } else if (!isEmpty && questionError) {
              questionStatusColor = 'bg-red-100 text-red-700';
              questionStatusText = 'Invalid';
            } else if (isValid) {
              questionStatusColor = 'bg-green-100 text-green-700';
              questionStatusText = 'Valid';
            }

            return (
              <div
                key={item.id || index}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(index)}
                className={`bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-all cursor-move ${
                  draggedIndex === index ? 'shadow-lg' : ''
                } ${
                  isPartial || (!isEmpty && questionError) ? 'border-l-4 border-l-yellow-400' : ''
                } ${
                  isValid ? 'border-l-4 border-l-green-400' : ''
                }`}
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-medium label-text">
                      Question {index + 1}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${questionStatusColor}`}>
                      {questionStatusText}
                    </span>
                    {item.id && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                        Existing
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <GripVertical size={24} className="text-gray-400 rotate-90" />
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                        title="Remove Question"
                        disabled={submitting}
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <ValidatedInput
                    label="Question"
                    name="quizQuestion"
                    type="textarea"
                    value={item.question}
                    onChange={(e) => updateItem(index, 'question', e.target.value)}
                    required={true}
                    onValidityChange={() => {}}
                    rows={3}
                    disabled={submitting}
                    variant="card"
                    placeholder="Enter your quiz question"
                  />

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="label-text block text-sm font-medium text-gray-700">
                        Answer Choices
                      </label>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        ✓ Mark the correct answer
                      </span>
                    </div>
                    <div className="space-y-3">
                      {item.choices.map((choice, choiceIndex) => {
                        const isCorrect = item.correctAnswer === choiceIndex;
                        return (
                          <div 
                            key={choiceIndex} 
                            className={`relative border rounded-lg transition-all ${
                              isCorrect 
                                ? 'border-green-500 bg-green-50' 
                                : 'border-gray-200 hover:border-green-300'
                            }`}
                          >
                            {/* Correct answer indicator */}
                            {isCorrect && (
                              <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium z-10">
                                ✓ CORRECT
                              </div>
                            )}
                            
                            <div className="flex items-center gap-3 p-3">
                              {/* Large, visible radio button */}
                              <label className="flex items-center cursor-pointer">
                                <div className="relative">
                                  <input
                                    type="radio"
                                    name={`correct-answer-${index}`}
                                    checked={isCorrect}
                                    onChange={() => updateItem(index, 'correctAnswer', choiceIndex)}
                                    disabled={submitting}
                                    className="sr-only"
                                  />
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                    isCorrect 
                                      ? 'border-green-500 bg-green-500' 
                                      : 'border-gray-300 bg-white hover:border-green-400'
                                  }`}>
                                    {isCorrect && (
                                      <div className="w-3 h-3 bg-white rounded-full"></div>
                                    )}
                                  </div>
                                </div>
                                <span className="ml-2 text-sm text-gray-600 font-medium">
                                  {isCorrect ? 'Correct Answer' : 'Mark as Correct'}
                                </span>
                              </label>
                              
                              {/* Choice input */}
                              <input
                                type="text"
                                value={choice}
                                onChange={(e) => updateChoice(index, choiceIndex, e.target.value)}
                                disabled={submitting}
                                className={`flex-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 label-text ${
                                  isCorrect ? 'bg-green-50 border-green-300 font-medium' : 'bg-white'
                                }`}
                                placeholder={`Enter choice ${choiceIndex + 1}...`}
                              />
                              
                              {/* Remove choice button */}
                              {item.choices.length > 2 && (
                                <button
                                  onClick={() => removeChoice(index, choiceIndex)}
                                  className="flex-shrink-0 p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors"
                                  title="Remove this choice"
                                  disabled={submitting}
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Add choice button */}
                      <button
                        onClick={() => addChoice(index)}
                        className="flex items-center gap-2 text-green-600 hover:text-green-700 disabled:opacity-50 p-3 border border-dashed border-green-300 rounded-lg hover:bg-green-50 transition-colors w-full justify-center"
                        disabled={submitting}
                      >
                        <Plus size={18} />
                        <span className="label-text">Add Another Choice</span>
                      </button>
                    </div>
                    
                    {/* Warning if no correct answer selected */}
                    {!item.choices[item.correctAnswer]?.trim() && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                        <AlertCircle size={16} className="text-yellow-600" />
                        <span className="text-sm text-yellow-700">
                          Please select which choice is the correct answer
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ✅ Enhanced: Summary Section following CreateFlashcards structure */}
        {items.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mt-8">
            <h3 className="text-lg font-medium label-text mb-3">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{questionValidationStatus.validQuestionCount}</div>
                <div className="text-gray-600">Valid Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{questionValidationStatus.partialQuestionCount}</div>
                <div className="text-gray-600">Incomplete Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{questionValidationStatus.invalidQuestionCount}</div>
                <div className="text-gray-600">Invalid Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-500">{questionValidationStatus.emptyQuestionCount}</div>
                <div className="text-gray-600">Empty Questions</div>
              </div>
            </div>
            {questionValidationStatus.validQuestionCount > 0 && (
              <p className="text-sm text-green-700 mt-4">
                ✅ {questionValidationStatus.validQuestionCount} question(s) will be saved.
                {questionValidationStatus.emptyQuestionCount > 0 && ` ${questionValidationStatus.emptyQuestionCount} empty question(s) will be ignored.`}
              </p>
            )}
            {questionValidationStatus.hasProblems && (
              <p className="text-sm text-amber-700 mt-2">
                ⚠️ Complete all incomplete or invalid questions before saving.
              </p>
            )}
          </div>
        )}

        {/* ✅ Enhanced: Actions following CreateFlashcards structure */}
        <div className="flex justify-between mt-8">
          <button
            onClick={addNewItem}
            className="exam-button-mini"
            data-hover="Add New Question"
            disabled={submitting}
          >
            <div className="flex items-center gap-2">
              <HelpCircle size={16} />
              Add New Question
            </div>
          </button>
          <div className="space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={`exam-button-mini ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              data-hover={
                submitting 
                  ? (isEditMode ? "Updating..." : "Creating...") 
                  : questionValidationStatus.hasProblems
                    ? "Complete all questions to save"
                    : !questionValidationStatus.hasValidQuestions
                      ? "Add at least one valid question"
                      : (isEditMode ? `Update ${questionValidationStatus.validQuestionCount} Question(s)` : `Create ${questionValidationStatus.validQuestionCount} Question(s)`)
              }
              disabled={isDisabled}
            >
              {submitting 
                ? (isEditMode ? "Updating..." : "Creating...") 
                : (isEditMode ? "Update Quiz" : "Create Quiz")
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;