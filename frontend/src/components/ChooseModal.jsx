import { Edit2, FileText, HelpCircle, Plus } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import ValidatedInput from './ValidatedInput';

const ChooseModal = ({ 
  isOpen, 
  onClose, 
  onCreate, 
  existingMaterials = [],
  mode = 'upload', // 'upload' or 'manual'
  preselectedType = null // for manual mode, the content type is already selected
}) => {
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newMaterialDescription, setNewMaterialDescription] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [step, setStep] = useState('material');
  const [validities, setValidities] = useState({
    materialTitle: false,
    materialDescription: true // Description is optional
  });

  // Reset state when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setSelectedMaterial('');
      setIsCreatingNew(false);
      setNewMaterialName('');
      setNewMaterialDescription('');
      setSelectedType(preselectedType);
      setStep('material');
      setValidities({ 
        materialTitle: false, 
        materialDescription: true 
      });
    }
  }, [isOpen, mode, preselectedType]);

  if (!isOpen) return null;

  const contentOptions = [
    {
      icon: <FileText size={24} className="text-blue-500" aria-label="Flashcards icon" />,
      title: 'Create Flashcards',
      desc: mode === 'upload' ? 'Generate flashcards from your uploaded content' : 'Create flashcards for this material',
      type: 'flashcards',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      icon: <HelpCircle size={24} className="text-[#22C55E]" aria-label="Quiz icon" />,
      title: 'Create Quiz',
      desc: mode === 'upload' ? 'Generate quiz questions from your uploaded content' : 'Create quiz questions for this material',
      type: 'quiz',
      bgColor: 'bg-green-50 hover:bg-green-100'
    },
    {
      icon: <Edit2 size={24} className="text-purple-500" aria-label="Notes icon" />,
      title: 'Create Notes',
      desc: mode === 'upload' ? 'Generate notes from your uploaded content' : 'Create notes for this material',
      type: 'notes',
      bgColor: 'bg-purple-50 hover:bg-purple-100'
    }
  ];

  const handleCreate = () => {
    if (!isMaterialStepValid()) return;
    
    // For manual mode with preselected type, skip content type selection
    if (mode === 'manual' && preselectedType) {
      const materialData = isCreatingNew 
        ? { name: newMaterialName, description: newMaterialDescription, isNew: true }
        : { id: parseInt(selectedMaterial), isNew: false }; // Convert to number
      
      onCreate(preselectedType, materialData);
      return;
    }

    // For upload mode or manual mode without preselected type, go to content selection
    if (!selectedType) return;
    
    const materialData = isCreatingNew 
      ? { name: newMaterialName, description: newMaterialDescription, isNew: true }
      : { id: parseInt(selectedMaterial), isNew: false }; // Convert to number
    
    onCreate(selectedType, materialData);
  };

  const handleContinue = () => {
    if (mode === 'manual' && preselectedType) {
      // Skip to creation directly for manual mode with preselected type
      handleCreate();
    } else {
      // Go to content type selection
      setStep('content');
    }
  };

  const isMaterialStepValid = () => {
    if (isCreatingNew) {
      return validities.materialTitle && newMaterialName.trim().length >= 2;
    }
    return selectedMaterial !== '';
  };

  const isFormValid = () => {
    if (mode === 'manual' && preselectedType) {
      return isMaterialStepValid();
    }
    if (!selectedType) return false;
    return isMaterialStepValid();
  };

  const getModalTitle = () => {
    if (mode === 'manual' && preselectedType) {
      const typeNames = {
        flashcards: 'Flashcards',
        quiz: 'Quiz',
        notes: 'Notes'
      };
      return `Create ${typeNames[preselectedType]} - Choose Material`;
    }
    
    if (step === 'material') {
      return 'Choose Material';
    }
    
    return 'Choose Content Type';
  };

  const getButtonText = () => {
    if (mode === 'manual' && preselectedType) {
      return 'Create';
    }
    
    if (step === 'material') {
      return 'Continue';
    }
    
    return 'Create';
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'materialTitle') {
      setNewMaterialName(value);
    } else if (name === 'materialDescription') {
      setNewMaterialDescription(value);
    }
  };

  // Handle validation state changes
  const handleValidityChange = (field, isValid) => {
    setValidities(prev => ({
      ...prev,
      [field]: isValid
    }));
  };

  const renderMaterialStep = () => (
    <div className="space-y-4 px-4 pb-4">
      <div className="flex items-center gap-4" role="radiogroup" aria-label="Material selection options">
        <button
          onClick={() => {
            setIsCreatingNew(false);
            setNewMaterialName('');
            setNewMaterialDescription('');
          }}
          className={`bg-white flex-1 p-3 rounded-lg border cursor-pointer transition-all ${
            !isCreatingNew 
              ? 'border-blue-500 bg-blue-50 text-blue-700' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          role="radio"
          aria-checked={!isCreatingNew}
          tabIndex="0"
        >
          <div className="flex items-center gap-2 label-text">
            <FileText size={20} aria-hidden="true" />
            <span>Choose existing material</span>
          </div>
        </button>

        <button
          onClick={() => {
            setIsCreatingNew(true);
            setSelectedMaterial('');
          }}
          className={`bg-white flex-1 p-3 rounded-lg border cursor-pointer transition-all ${
            isCreatingNew 
              ? 'border-blue-500 bg-blue-50 text-blue-700' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          role="radio"
          aria-checked={isCreatingNew}
          tabIndex="0"
        >
          <div className="flex items-center gap-2 label-text">
            <Plus size={20} aria-hidden="true" />
            <span>Create new material</span>
          </div>
        </button>
      </div>

      {!isCreatingNew && (
        <div className="mt-4">
          <label htmlFor="existing-material" className="sr-only">Select existing material</label>
          <select
            id="existing-material"
            value={selectedMaterial}
            onChange={(e) => setSelectedMaterial(e.target.value)}
            className="bg-white label-text w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
            aria-label="Select existing material"
          >
            <option value="">Select existing material</option>
            {existingMaterials
              .filter(material => material.status === 'active')
              .map(material => (
                <option key={material.id} value={material.id}>
                  {material.title}
                </option>
              ))}
          </select>
          {existingMaterials.filter(m => m.status === 'active').length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              No existing materials found. Create a new one below.
            </p>
          )}
        </div>
      )}

      {isCreatingNew && (
        <div className="mt-4 space-y-4">
          <ValidatedInput
            variant="card"
            label="Material Title"
            name="materialTitle"
            type="text"
            value={newMaterialName}
            onChange={handleChange}
            onValidityChange={handleValidityChange}
            placeholder="Enter new material title"
            required
          />
          <ValidatedInput
            variant="card"
            label="Description (Optional)"
            name="materialDescription"
            type="textarea"
            value={newMaterialDescription}
            onChange={handleChange}
            onValidityChange={handleValidityChange}
            placeholder="Add a short description (optional)"
            rows={3}
          />
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleContinue}
          disabled={!isMaterialStepValid()}
          className={`exam-button-mini ${
            !isMaterialStepValid() ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label={mode === 'manual' && preselectedType ? 'Create content' : 'Continue to content type selection'}
          data-hover={getButtonText()}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );

  const renderContentStep = () => (
    <>
      <div className="px-4 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8" role="radiogroup" aria-label="Content type options">
        {contentOptions.map((option, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg shadow-sm transition-all duration-200 cursor-pointer ${
              selectedType === option.type 
                ? `${option.bgColor} ring-2 ring-offset-2 ring-blue-500` 
                : `${option.bgColor} hover:ring-2 hover:ring-offset-2 hover:ring-blue-500/50`
            }`}
            onClick={() => setSelectedType(option.type)}
            role="radio"
            aria-checked={selectedType === option.type}
            tabIndex="0"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedType(option.type);
              }
            }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-2 rounded-full bg-white shadow-sm mb-3">
                {option.icon}
              </div>
              <h3 className="font-medium text-gray-800">{option.title}</h3>
              <p className="text-gray-600 text-sm mt-1">{option.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4">
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setStep('material')}
            className="text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-6 py-2 rounded-full transition-colors"
            aria-label="Back to material selection"
          >
            Back
          </button>
          <button
            onClick={handleCreate}
            disabled={!isFormValid()}
            className={`exam-button-mini ${
              !isFormValid() ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label="Create content"
            data-hover="Create"
          >
            Create
          </button>
        </div>
      </div>
    </>
  );

  // For manual mode with preselected type, only show material step
  const shouldShowContentStep = step === 'content' && !(mode === 'manual' && preselectedType);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="letter-no-lines max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 id="modal-title" className="text-xl font-semibold text-gray-800 pt-3 px-3 label-text">
            {getModalTitle()}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-4 transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        
        {shouldShowContentStep ? renderContentStep() : renderMaterialStep()}
      </div>
    </div>
  );
};

export default ChooseModal;