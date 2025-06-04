import { ArrowLeft, ArrowUpDown, Globe, GripVertical, Lock, Trash2, AlertCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import ValidatedInput from '../components/ValidatedInput';
import { useLoading } from '../components/Loading/LoadingContext';
import { useToast } from '../components/Toast/ToastContext';
import { defaultValidators } from '../utils/validation';
import { createFlashcardSet, createFlashcard } from '../services/apiService';

const CreateFlashcards = ({ material, onClose, onSuccess }) => {
  const { showLoading, hideLoading } = useLoading();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    public: false,
  });

  const [items, setItems] = useState([{ front: '', back: '' }]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [bannerErrors, setBannerErrors] = useState([]);
  const [validities, setValidities] = useState({
    title: false,
    description: true, // Optional field
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (material?.title) {
      setFormData(prev => ({
        ...prev,
      }));
      setValidities(prev => ({
        ...prev,
      }));
    }
  }, [material]);

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleValidityChange = (field, isValid) => {
    setValidities(prev => ({
      ...prev,
      [field]: isValid
    }));
  };

  const validateFlashcards = () => {
    const errors = [];
    
    // Check if we have at least one flashcard
    if (items.length === 0) {
      errors.push('At least one flashcard is required.');
      return errors;
    }

    // Check each flashcard using our validators
    items.forEach((item, index) => {
      const frontError = defaultValidators.flashcardQuestion(item.front);
      const backError = defaultValidators.flashcardAnswer(item.back);
      
      if (frontError) {
        errors.push(`Card ${index + 1} - Term: ${frontError}`);
      }
      if (backError) {
        errors.push(`Card ${index + 1} - Definition: ${backError}`);
      }
    });

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
      // Create the flashcard set first
      const flashcardSetData = {
        material: material.id,
        title: formData.title,
        description: formData.description,
        public: formData.public,
      };

      const flashcardSetResponse = await createFlashcardSet(flashcardSetData);
      const flashcardSetId = flashcardSetResponse.data.id;

      // Create individual flashcards
      const flashcardPromises = items.map(item => 
        createFlashcard({
          flashcard_set: flashcardSetId,
          question: item.front.trim(),
          answer: item.back.trim(),
        })
      );

      await Promise.all(flashcardPromises);

      showToast({
        variant: "success",
        title: "Flashcards created successfully!",
        subtitle: `Created ${items.length} flashcards in "${formData.title}" set.`,
      });

      if (onSuccess) {
        onSuccess(flashcardSetResponse.data);
      }

      onClose();

    } catch (err) {
      // Enhanced error handling
      const data = err.response?.data || {};
      const msgs = [];

      Object.entries(data).forEach(([key, val]) => {
        if (Array.isArray(val)) {
          val.forEach((m) => msgs.push(m));
        } else if (typeof val === "string") {
          msgs.push(val);
        }
      });

      if (msgs.length === 0) {
        msgs.push('Failed to create flashcards. Please try again.');
      }

      setBannerErrors(msgs);
      
    } finally {
      setSubmitting(false);
      hideLoading();
    }
  };

  const isDisabled = !validities.title || submitting;

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
                Create Flashcards
              </h2>
              {material && (
                <p className="text-sm text-gray-600 mt-1">
                  for "{material.title}"
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setFormData(prev => ({ ...prev, public: !prev.public }))}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
              formData.public 
                ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
            title={formData.public ? "Make Private" : "Make Public"}
            disabled={submitting}
          >
            {formData.public ? (
              <>
                <Globe size={20} className="text-[#1b81d4]" />
                <span className="text-[#1b81d4] font-medium">Public</span>
              </>
            ) : (
              <>
                <Lock size={20} className="text-gray-600" />
                <span className="text-gray-600 font-medium">Private</span>
              </>
            )}
          </button>
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
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              validate={defaultValidators.flashcardSetTitle}
              required={true}
              onValidityChange={handleValidityChange}
              disabled={submitting}
            />

            <ValidatedInput
              label="Description (Optional)"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleChange}
              validate={defaultValidators.flashcardSetDescription}
              required={false}
              onValidityChange={handleValidityChange}
              rows={3}
              disabled={submitting}
            />
          </div>
        </div>

        {/* Flashcards Section */}
        <div className="space-y-6">
          {items.map((item, index) => (
            <div
              key={index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              className={`bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-all cursor-move ${
                draggedIndex === index ? 'shadow-lg' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-medium label-text">Card {index + 1}</h3>
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
                <div>
                  <label className="label-text block text-sm font-medium text-gray-700 mb-2">
                    Term *
                  </label>
                  <textarea
                    value={item.front}
                    onChange={(e) => updateItem(index, 'front', e.target.value)}
                    className={`w-full p-4 border rounded-lg label-text bg-white focus:bg-white focus:ring-2 focus:ring-[#7BA7CC]/30 focus:border-[#1b81d4] transition-colors outline-none ${
                      defaultValidators.flashcardQuestion(item.front) 
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                        : 'border-gray-200'
                    }`}
                    rows={4}
                    disabled={submitting}
                    required
                  />
                  {defaultValidators.flashcardQuestion(item.front) && (
                    <p className="mt-1 text-xs text-red-600">
                      {defaultValidators.flashcardQuestion(item.front)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="label-text block text-sm font-medium text-gray-700 mb-2">
                    Definition *
                  </label>
                  <textarea
                    value={item.back}
                    onChange={(e) => updateItem(index, 'back', e.target.value)}
                    className={`w-full p-4 border rounded-lg label-text bg-white focus:bg-white focus:ring-2 focus:ring-[#7BA7CC]/30 focus:border-[#1b81d4] transition-colors outline-none ${
                      defaultValidators.flashcardAnswer(item.back) 
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                        : 'border-gray-200'
                    }`}
                    rows={4}
                    disabled={submitting}
                    required
                  />
                  {defaultValidators.flashcardAnswer(item.back) && (
                    <p className="mt-1 text-xs text-red-600">
                      {defaultValidators.flashcardAnswer(item.back)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

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
              className="exam-button-mini"
              data-hover={submitting ? "Creating..." : "Create Flashcards"}
              disabled={isDisabled}
            >
              {submitting ? "Creating..." : "Create Flashcards"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateFlashcards;