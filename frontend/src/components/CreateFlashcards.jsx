import { ArrowLeft, ArrowUpDown, Globe, GripVertical, Lock, Trash2, AlertCircle } from 'lucide-react';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ValidatedInput from '../components/ValidatedInput';
import { useLoading } from '../components/Loading/LoadingContext';
import { useToast } from '../components/Toast/ToastContext';
import { defaultValidators } from '../utils/validation';
import { createFlashcardSet, updateFlashcardSet } from '../services/apiService';

const CreateFlashcards = ({ 
  mainMaterial, 
  material, 
  flashcardSet = null, 
  onClose, 
  onSuccess, 
  options = {} 
}) => {
  const { showLoading, hideLoading } = useLoading();
  const { showToast } = useToast();

  // Extract success callback from either direct prop or options
  const successCallback = options.onSuccess || onSuccess;

  // Derived state using useMemo
  const isEditMode = useMemo(() => !!flashcardSet, [flashcardSet]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const [items, setItems] = useState([{ front: '', back: '' }]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [bannerErrors, setBannerErrors] = useState([]);
  const [validities, setValidities] = useState({
    title: false,
    description: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // ✅ Initialize form data - legitimate useEffect for form initialization
  useEffect(() => {
    if (isEditMode && flashcardSet) {
      // Edit mode: populate with existing data
      setFormData({
        title: flashcardSet.title || '',
        description: flashcardSet.description || '',
      });

      // Convert existing flashcards to the expected format
      const existingCards = flashcardSet.flashcards || flashcardSet.cards || [];
      if (existingCards.length > 0) {
        setItems(existingCards.map(card => ({
          front: card.question || card.front || '',
          back: card.answer || card.back || '',
          id: card.id
        })));
      } else {
        setItems([{ front: '', back: '' }]);
      }

      // Set initial validity for pre-filled title
      setValidities(prev => ({
        ...prev,
        title: !!(flashcardSet.title && flashcardSet.title.trim()),
      }));
    } else if (material?.title) {
      // Create mode: auto-suggest title based on material
      setFormData(prev => ({
        ...prev,
        title: `${material.title} - Flashcards`,
      }));
      setValidities(prev => ({
        ...prev,
        title: true,
      }));
    }
  }, [flashcardSet, material?.title, isEditMode]);

  // Memoized card validation to avoid recalculating on every render
  const cardValidationStatus = useMemo(() => {
    let validCardCount = 0;
    let invalidCardCount = 0;
    let emptyCardCount = 0;
    let partialCardCount = 0;

    items.forEach((item) => {
      const frontTrimmed = item.front.trim();
      const backTrimmed = item.back.trim();
      
      const isEmpty = !frontTrimmed && !backTrimmed;
      const isPartial = (frontTrimmed && !backTrimmed) || (!frontTrimmed && backTrimmed);
      
      if (isEmpty) {
        emptyCardCount++;
      } else if (isPartial) {
        partialCardCount++;
      } else {
        const frontError = defaultValidators.flashcardQuestion(item.front);
        const backError = defaultValidators.flashcardAnswer(item.back);
        
        if (!frontError && !backError) {
          validCardCount++;
        } else {
          invalidCardCount++;
        }
      }
    });

    return {
      validCardCount,
      invalidCardCount,
      emptyCardCount,
      partialCardCount,
      hasValidCards: validCardCount > 0,
      hasProblems: invalidCardCount > 0 || partialCardCount > 0
    };
  }, [items]);

  const addNewItem = useCallback(() => {
    setItems(prev => [...prev, { front: '', back: '' }]);
  }, []);

  const updateItem = useCallback((index, field, value) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[index][field] = value;
      return newItems;
    });
  }, []);

  const removeItem = useCallback((index) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  }, [items.length]);

  const swapFields = useCallback((index) => {
    setItems(prev => {
      const newItems = [...prev];
      const temp = newItems[index].front;
      newItems[index].front = newItems[index].back;
      newItems[index].back = temp;
      return newItems;
    });
  }, []);

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

  const validateFlashcards = useCallback(() => {
    const errors = [];
    
    if (items.length === 0) {
      errors.push('At least one flashcard is required.');
      return errors;
    }

    let validCardCount = 0;
    let emptyCardCount = 0;

    items.forEach((item, index) => {
      const frontTrimmed = item.front.trim();
      const backTrimmed = item.back.trim();
      
      const isEmpty = !frontTrimmed && !backTrimmed;
      
      if (isEmpty) {
        emptyCardCount++;
        return;
      }

      const frontError = defaultValidators.flashcardQuestion(item.front);
      const backError = defaultValidators.flashcardAnswer(item.back);
      
      if (frontError) {
        errors.push(`Card ${index + 1} - Term: ${frontError}`);
      }
      if (backError) {
        errors.push(`Card ${index + 1} - Definition: ${backError}`);
      }

      if (!frontError && !backError) {
        validCardCount++;
      }
    });

    if (validCardCount === 0) {
      errors.push('At least one complete flashcard is required.');
    }

    if (emptyCardCount > 0 && validCardCount > 0) {
      errors.push(`Note: ${emptyCardCount} empty card(s) will be ignored.`);
    }

    return errors;
  }, [items]);

  // ✅ Updated handleSave - follows EditProfileScreen pattern exactly
  const handleSave = useCallback(async () => {
    setBannerErrors([]);
    
    const flashcardErrors = validateFlashcards();
    if (flashcardErrors.length > 0) {
      setBannerErrors(flashcardErrors);
      return;
    }

    setSubmitting(true);
    showLoading(); // ✅ Same as EditProfileScreen

    try {
      const validFlashcards = items
        .filter(item => {
          const frontTrimmed = item.front.trim();
          const backTrimmed = item.back.trim();
          
          if (!frontTrimmed && !backTrimmed) {
            return false;
          }
          
          const frontError = defaultValidators.flashcardQuestion(item.front);
          const backError = defaultValidators.flashcardAnswer(item.back);
          return !frontError && !backError;
        })
        .map(item => ({
          question: item.front.trim(),
          answer: item.back.trim(),
          ...(item.id && { id: item.id })
        }));

      if (validFlashcards.length === 0) {
        setBannerErrors(['No valid flashcards to save. Please complete at least one flashcard.']);
        return;
      }

      const flashcardSetData = {
        material: mainMaterial?.id,
        title: formData.title,
        description: formData.description,
        flashcards: validFlashcards
      };

      let response;
      if (isEditMode) {
        response = await updateFlashcardSet(flashcardSet.id, flashcardSetData);
      } else {
        response = await createFlashcardSet(flashcardSetData);
      }

      // ✅ Show success toast (same as EditProfileScreen)
      showToast({
        variant: "success",
        title: `Flashcards ${isEditMode ? 'updated' : 'created'} successfully!`,
        subtitle: `${isEditMode ? 'Updated' : 'Created'} ${validFlashcards.length} flashcards in "${formData.title}" set.`,
      });

      // ✅ Close component immediately after API success (same as EditProfileScreen)
      onClose();

      // ✅ Call success callback separately (like fetchProfileData in EditProfileScreen)
      if (successCallback) {
        try {
          console.log('CreateFlashcards - calling success callback with:', response.data);
          await successCallback(response.data); // This will call onRefreshMaterials()
        } catch (callbackError) {
          console.error('Error in success callback:', callbackError);
          // Don't show this error to user since main operation succeeded
        }
      }

    } catch (err) {
      // ✅ Only handle actual API failures (same as EditProfileScreen error handling)
      console.error('API Error creating/updating flashcards:', err);
      
      const data = err.response?.data || {};
      const msgs = [];

      if (data.cards && Array.isArray(data.cards)) {
        data.cards.forEach((cardErrors, index) => {
          if (typeof cardErrors === 'object' && cardErrors !== null) {
            Object.entries(cardErrors).forEach(([field, errors]) => {
              if (Array.isArray(errors)) {
                errors.forEach(error => {
                  msgs.push(`Card ${index + 1} - ${field}: ${error}`);
                });
              } else if (typeof errors === 'string') {
                msgs.push(`Card ${index + 1} - ${field}: ${errors}`);
              }
            });
          }
        });
      }

      Object.entries(data).forEach(([key, val]) => {
        if (key !== 'cards') {
          if (Array.isArray(val)) {
            val.forEach((m) => msgs.push(typeof m === 'string' ? m : JSON.stringify(m)));
          } else if (typeof val === "string") {
            msgs.push(val);
          }
        }
      });

      if (msgs.length === 0) {
        msgs.push(`Failed to ${isEditMode ? 'update' : 'create'} flashcards. Please try again.`);
      }

      setBannerErrors(msgs);

    } finally {
      setSubmitting(false);
      hideLoading(); // ✅ Same as EditProfileScreen
    }
  }, [items, formData, isEditMode, flashcardSet?.id, mainMaterial?.id, onClose, validateFlashcards, showLoading, hideLoading, showToast, successCallback]);

  // Memoized button state
  const isDisabled = useMemo(() => {
    return !validities.title || !cardValidationStatus.hasValidCards || cardValidationStatus.hasProblems || submitting;
  }, [validities.title, cardValidationStatus.hasValidCards, cardValidationStatus.hasProblems, submitting]);

  return (
    <div className="letter-no-lines">
      <div className="max-w-[90rem] mx-auto px-10 py-3">
        {/* Header */}
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
                {isEditMode ? 'Edit Flashcards' : 'Create Flashcards'}
              </h2>
              {material && (
                <p className="text-sm text-gray-600 mt-1">
                  for "{mainMaterial.title}"
                  {isEditMode && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      Editing: {flashcardSet.title}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Error Banner */}
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

        {/* Details Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-all mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-medium label-text">Details</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ValidatedInput
              label="Title"
              name="flashcardSetTitle"
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              required={true}
              onValidityChange={handleTitleValidityChange}
              disabled={submitting}
              variant='profile'
              placeholder="Enter a descriptive title for your flashcard set"
            />

            <ValidatedInput
              label="Description (Optional)"
              name="flashcardSetDescription"
              type="textarea"
              value={formData.description}
              onChange={handleDescriptionChange}
              required={false}
              onValidityChange={handleDescriptionValidityChange}
              rows={3}
              disabled={submitting}
              variant='profile'
              placeholder="Add a brief description for your flashcard set (optional)"
            />
          </div>
        </div>

        {/* Flashcards Section */}
        <div className="space-y-6">
          {items.map((item, index) => {
            const frontTrimmed = item.front.trim();
            const backTrimmed = item.back.trim();
            const isEmpty = !frontTrimmed && !backTrimmed;
            const isPartial = (frontTrimmed && !backTrimmed) || (!frontTrimmed && backTrimmed);
            const frontError = defaultValidators.flashcardQuestion(item.front);
            const backError = defaultValidators.flashcardAnswer(item.back);
            const isValid = !isEmpty && !frontError && !backError;
            
            let cardStatusColor = 'bg-gray-100 text-gray-600';
            let cardStatusText = 'Empty';
            
            if (isPartial) {
              cardStatusColor = 'bg-yellow-100 text-yellow-700';
              cardStatusText = 'Incomplete';
            } else if (!isEmpty && (frontError || backError)) {
              cardStatusColor = 'bg-red-100 text-red-700';
              cardStatusText = 'Invalid';
            } else if (isValid) {
              cardStatusColor = 'bg-green-100 text-green-700';
              cardStatusText = 'Valid';
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
                  isPartial || (!isEmpty && (frontError || backError)) ? 'border-l-4 border-l-yellow-400' : ''
                } ${
                  isValid ? 'border-l-4 border-l-green-400' : ''
                }`}
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-medium label-text">
                      Card {index + 1}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${cardStatusColor}`}>
                      {cardStatusText}
                    </span>
                    {item.id && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                        Existing
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <GripVertical size={24} className="text-gray-400 rotate-90" />
                    <button
                      onClick={() => swapFields(index)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                      title="Swap Term and Definition"
                      disabled={submitting}
                    >
                      <ArrowUpDown size={20} />
                    </button>
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                        title="Remove Card"
                        disabled={submitting}
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <ValidatedInput
                    label="Term"
                    name="flashcardQuestion"
                    type="textarea"
                    value={item.front}
                    onChange={(e) => updateItem(index, 'front', e.target.value)}
                    required={true}
                    onValidityChange={() => {}}
                    rows={4}
                    disabled={submitting}
                    variant="card"
                    placeholder="Enter the term or question for this flashcard"
                  />

                  <ValidatedInput
                    label="Definition"
                    name="flashcardAnswer"
                    type="textarea"
                    value={item.back}
                    onChange={(e) => updateItem(index, 'back', e.target.value)}
                    required={true}
                    onValidityChange={() => {}}
                    rows={4}
                    disabled={submitting}
                    variant="card"
                    placeholder="Enter the definition or answer for this flashcard"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Section */}
        {items.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
            <h3 className="text-lg font-medium label-text mb-3">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{cardValidationStatus.validCardCount}</div>
                <div className="text-gray-600">Valid Cards</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{cardValidationStatus.partialCardCount}</div>
                <div className="text-gray-600">Incomplete Cards</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{cardValidationStatus.invalidCardCount}</div>
                <div className="text-gray-600">Invalid Cards</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-500">{cardValidationStatus.emptyCardCount}</div>
                <div className="text-gray-600">Empty Cards</div>
              </div>
            </div>
            {cardValidationStatus.validCardCount > 0 && (
              <p className="text-sm text-blue-700 mt-4">
                ✅ {cardValidationStatus.validCardCount} card(s) will be saved.
                {cardValidationStatus.emptyCardCount > 0 && ` ${cardValidationStatus.emptyCardCount} empty card(s) will be ignored.`}
              </p>
            )}
            {cardValidationStatus.hasProblems && (
              <p className="text-sm text-amber-700 mt-2">
                ⚠️ Complete all incomplete or invalid cards before saving.
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between mt-8">
          <button
            onClick={addNewItem}
            className="exam-button-mini"
            data-hover="Add New"
            disabled={submitting}
          >
            Add New Flashcard
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
                  : cardValidationStatus.hasProblems
                    ? "Complete all cards to save"
                    : !cardValidationStatus.hasValidCards
                      ? "Add at least one valid card"
                      : (isEditMode ? `Update ${cardValidationStatus.validCardCount} Flashcard(s)` : `Create ${cardValidationStatus.validCardCount} Flashcard(s)`)
              }
              disabled={isDisabled}
              data-hover="Create"
            >
              {submitting 
                ? (isEditMode ? "Updating..." : "Creating...") 
                : (isEditMode ? "Update Flashcards" : "Create Flashcards")
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateFlashcards;