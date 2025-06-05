import { ArrowLeft, ArrowUpDown, Globe, GripVertical, Lock, Trash2, AlertCircle } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import ValidatedInput from '../components/ValidatedInput';
import { useLoading } from '../components/Loading/LoadingContext';
import { useToast } from '../components/Toast/ToastContext';
import { defaultValidators } from '../utils/validation';
import { createFlashcardSet, updateFlashcardSet } from '../services/apiService';

const CreateFlashcards = ({ 
  material, 
  flashcardSet = null, // New prop for editing mode
  onClose, 
  onSuccess 
}) => {
  const { showLoading, hideLoading } = useLoading();
  const { showToast } = useToast();

  // Determine if we're in edit mode
  const isEditMode = !!flashcardSet;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const [items, setItems] = useState([{ front: '', back: '' }]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [bannerErrors, setBannerErrors] = useState([]);
  const [validities, setValidities] = useState({
    title: false,
    description: true, // Optional field
  });
  const [submitting, setSubmitting] = useState(false);

  // Initialize form data based on mode (create vs edit)
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
          id: card.id // Keep track of existing card IDs for updates
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
      // Create mode: can auto-suggest title based on material
      setFormData(prev => ({
        ...prev,
        title: `${material.title} - Flashcards`,
      }));
      setValidities(prev => ({
        ...prev,
        title: true,
      }));
    }
  }, [flashcardSet, material, isEditMode]);

  const addNewItem = () => {
    setItems([...items, { front: '', back: '' }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const swapFields = (index) => {
    const newItems = [...items];
    const temp = newItems[index].front;
    newItems[index].front = newItems[index].back;
    newItems[index].back = temp;
    setItems(newItems);
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);
    setItems(newItems);
    setDraggedIndex(null);
  };

  // Memoized handlers to prevent infinite re-renders
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

  const validateFlashcards = () => {
    const errors = [];
    
    // Check if we have at least one flashcard
    if (items.length === 0) {
      errors.push('At least one flashcard is required.');
      return errors;
    }

    let validCardCount = 0;
    let emptyCardCount = 0;

    // Check each flashcard using our validators
    items.forEach((item, index) => {
      const frontTrimmed = item.front.trim();
      const backTrimmed = item.back.trim();
      
      // Check if card is completely empty
      const isEmpty = !frontTrimmed && !backTrimmed;
      
      if (isEmpty) {
        emptyCardCount++;
        return; // Skip validation for empty cards
      }

      // Card has some content, so validate both fields
      const frontError = defaultValidators.flashcardQuestion(item.front);
      const backError = defaultValidators.flashcardAnswer(item.back);
      
      if (frontError) {
        errors.push(`Card ${index + 1} - Term: ${frontError}`);
      }
      if (backError) {
        errors.push(`Card ${index + 1} - Definition: ${backError}`);
      }

      // If both fields are valid, count as valid card
      if (!frontError && !backError) {
        validCardCount++;
      }
    });

    // Check if we have at least one valid card (excluding empty ones)
    if (validCardCount === 0) {
      errors.push('At least one complete flashcard is required.');
    }

    // Optional: warn about empty cards if there are many
    if (emptyCardCount > 0 && validCardCount > 0) {
      errors.push(`Note: ${emptyCardCount} empty card(s) will be ignored.`);
    }

    return errors;
  };

  const handleSave = async () => {
    setBannerErrors([]);
    
    // Validate flashcards
    const flashcardErrors = validateFlashcards();
    if (flashcardErrors.length > 0) {
      setBannerErrors(flashcardErrors);
      return;
    }

    setSubmitting(true);
    showLoading();

    try {
      // Prepare flashcard data - only include non-empty valid cards
      const validFlashcards = items
        .filter(item => {
          const frontTrimmed = item.front.trim();
          const backTrimmed = item.back.trim();
          
          // Skip completely empty cards
          if (!frontTrimmed && !backTrimmed) {
            return false;
          }
          
          // Only include cards that pass validation
          const frontError = defaultValidators.flashcardQuestion(item.front);
          const backError = defaultValidators.flashcardAnswer(item.back);
          return !frontError && !backError;
        })
        .map(item => ({
          question: item.front.trim(),
          answer: item.back.trim(),
          ...(item.id && { id: item.id }) // Include ID for existing cards if editing
        }));

      // Double-check we have valid cards before submitting
      if (validFlashcards.length === 0) {
        setBannerErrors(['No valid flashcards to save. Please complete at least one flashcard.']);
        return;
      }

      const flashcardSetData = {
        material: material.id,
        title: formData.title,
        description: formData.description,
        flashcards: validFlashcards
      };

      console.log(`${isEditMode ? 'Updating' : 'Creating'} flashcard set data:`, flashcardSetData);

      let response;
      if (isEditMode) {
        // Update existing flashcard set
        response = await updateFlashcardSet(flashcardSet.id, flashcardSetData);
      } else {
        // Create new flashcard set
        response = await createFlashcardSet(flashcardSetData);
      }

      showToast({
        variant: "success",
        title: `Flashcards ${isEditMode ? 'updated' : 'created'} successfully!`,
        subtitle: `${isEditMode ? 'Updated' : 'Created'} ${validFlashcards.length} flashcards in "${formData.title}" set.`,
      });

      if (onSuccess) {
        onSuccess(response.data);
      }

      onClose();

    } catch (err) {
      // Enhanced error handling
      const data = err.response?.data || {};
      const msgs = [];

      // Handle nested validation errors (for flashcards)
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

      // Handle other errors
      Object.entries(data).forEach(([key, val]) => {
        if (key !== 'cards') { // Skip cards as we handled them above
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
      
      console.log('Full error object:', err);
      console.log('Error response:', err.response);
      console.log('Error data:', err.response?.data);

    } finally {
      setSubmitting(false);
      hideLoading();
    }
  };

  // Enhanced validation for submit button
  const getCardValidationStatus = () => {
    let validCardCount = 0;
    let invalidCardCount = 0;
    let emptyCardCount = 0;
    let partialCardCount = 0;

    items.forEach((item) => {
      const frontTrimmed = item.front.trim();
      const backTrimmed = item.back.trim();
      
      // Check if card is completely empty
      const isEmpty = !frontTrimmed && !backTrimmed;
      // Check if card is partially filled
      const isPartial = (frontTrimmed && !backTrimmed) || (!frontTrimmed && backTrimmed);
      
      if (isEmpty) {
        emptyCardCount++;
      } else if (isPartial) {
        partialCardCount++;
      } else {
        // Card has both fields, check if they're valid
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
  };

  const cardStatus = getCardValidationStatus();
  
  // Button should be disabled if:
  // 1. Title is invalid
  // 2. No valid cards exist
  // 3. There are partially filled or invalid cards
  // 4. Currently submitting
  const isDisabled = !validities.title || !cardStatus.hasValidCards || cardStatus.hasProblems || submitting;

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
                  for "{material.title}"
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
            {/* Title Field - Uses flashcardSetTitle validator */}
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

            {/* Description Field - Uses flashcardSetDescription validator */}
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
            // Get validation status for this card
            const frontTrimmed = item.front.trim();
            const backTrimmed = item.back.trim();
            const isEmpty = !frontTrimmed && !backTrimmed;
            const isPartial = (frontTrimmed && !backTrimmed) || (!frontTrimmed && backTrimmed);
            const frontError = defaultValidators.flashcardQuestion(item.front);
            const backError = defaultValidators.flashcardAnswer(item.back);
            const isValid = !isEmpty && !frontError && !backError;
            
            // Determine card status for styling
            let cardStatusColor = 'bg-gray-100 text-gray-600'; // empty
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
                key={item.id || index} // Use ID if available, otherwise index
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
                  {/* Term Field - Uses flashcardQuestion validator */}
                  <ValidatedInput
                    label="Term"
                    name="flashcardQuestion"
                    type="textarea"
                    value={item.front}
                    onChange={(e) => updateItem(index, 'front', e.target.value)}
                    required={true}
                    onValidityChange={() => {}} // No-op since we handle validation differently for cards
                    rows={4}
                    disabled={submitting}
                    variant="card"
                    placeholder="Enter the term or question for this flashcard"
                  />

                  {/* Definition Field - Uses flashcardAnswer validator */}
                  <ValidatedInput
                    label="Definition"
                    name="flashcardAnswer"
                    type="textarea"
                    value={item.back}
                    onChange={(e) => updateItem(index, 'back', e.target.value)}
                    required={true}
                    onValidityChange={() => {}} // No-op since we handle validation differently for cards
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
                <div className="text-2xl font-bold text-green-600">{cardStatus.validCardCount}</div>
                <div className="text-gray-600">Valid Cards</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{cardStatus.partialCardCount}</div>
                <div className="text-gray-600">Incomplete Cards</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{cardStatus.invalidCardCount}</div>
                <div className="text-gray-600">Invalid Cards</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-500">{cardStatus.emptyCardCount}</div>
                <div className="text-gray-600">Empty Cards</div>
              </div>
            </div>
            {cardStatus.validCardCount > 0 && (
              <p className="text-sm text-blue-700 mt-4">
                ✅ {cardStatus.validCardCount} card(s) will be saved.
                {cardStatus.emptyCardCount > 0 && ` ${cardStatus.emptyCardCount} empty card(s) will be ignored.`}
              </p>
            )}
            {cardStatus.hasProblems && (
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
                  : cardStatus.hasProblems
                    ? "Complete all cards to save"
                    : !cardStatus.hasValidCards
                      ? "Add at least one valid card"
                      : (isEditMode ? `Update ${cardStatus.validCardCount} Flashcard(s)` : `Create ${cardStatus.validCardCount} Flashcard(s)`)
              }
              disabled={isDisabled}
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