import { Edit2, FileText, HelpCircle, Plus } from 'lucide-react';
import React, { useState } from 'react';

const ChooseModal = ({ isOpen, onClose, onCreate }) => {
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newMaterialDescription, setNewMaterialDescription] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [step, setStep] = useState('material'); // 'material' or 'content'

  // This would typically come from your backend/state management
  const existingMaterials = [
    { id: '1', name: 'Mathematics' },
    { id: '2', name: 'Physics' },
    { id: '3', name: 'Chemistry' },
  ];

  if (!isOpen) return null;

  const options = [
    {
      icon: <FileText size={24} className="text-blue-500" aria-label="Flashcards icon" />,
      title: 'Create Flashcards',
      desc: 'Generate flashcards from your uploaded content',
      type: 'flashcards',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      icon: <HelpCircle size={24} className="text-[#22C55E]" aria-label="Quiz icon" />,
      title: 'Create Quiz',
      desc: 'Generate quiz questions from your uploaded content',
      type: 'quiz',
      bgColor: 'bg-green-50 hover:bg-green-100'
    },
    {
      icon: <Edit2 size={24} className="text-purple-500" aria-label="Notes icon" />,
      title: 'Create Notes',
      desc: 'Generate notes from your uploaded content',
      type: 'notes',
      bgColor: 'bg-purple-50 hover:bg-purple-100'
    }
  ];

  const handleCreate = () => {
    if (!selectedType) return;
    
    const materialData = isCreatingNew 
      ? { name: newMaterialName, description: newMaterialDescription, isNew: true }
      : { id: selectedMaterial, isNew: false };
    
    onCreate(selectedType, materialData);
    onClose(); // Close the modal after creation
  };

  const isMaterialStepValid = () => {
    if (isCreatingNew) {
      return newMaterialName.trim().length > 0;
    }
    return selectedMaterial !== '';
  };

  const isFormValid = () => {
    if (!selectedType) return false;
    return isMaterialStepValid();
  };

  const renderMaterialStep = () => (
      <div className="space-y-4 px-4 pb-4">
        <div className="flex items-center gap-4" role="radiogroup" aria-label="Material selection options">
          <button
            onClick={() => {
              setIsCreatingNew(false);
              setNewMaterialName('');
            }}
            className={`bg-white flex-1 p-3 rounded-lg border cursor-pointer ${
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
            className={`bg-white flex-1 p-3 rounded-lg border cursor-pointer ${
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
              className="bg-white label-text w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none"
              aria-label="Select existing material"
            >
              <option value="">Select existing material</option>
              {existingMaterials.map(material => (
                <option key={material.id} value={material.id}>
                  {material.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {isCreatingNew && (
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="new-material-name" className="sr-only">New material name</label>
              <input
                id="new-material-name"
                type="text"
                value={newMaterialName}
                onChange={(e) => setNewMaterialName(e.target.value)}
                placeholder="Enter new material name"
                className="bg-white label-text w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none"
                aria-label="Enter new material name"
              />
            </div>
            <div>
              <label htmlFor="new-material-description" className="sr-only">Material description</label>
              <textarea
                id="new-material-description"
                value={newMaterialDescription}
                onChange={(e) => setNewMaterialDescription(e.target.value)}
                placeholder="Add a short description (optional)"
                className="bg-white label-text w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none resize-none"
                rows="3"
                aria-label="Add a short description (optional)"
              />
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            onClick={() => setStep('content')}
            disabled={!isMaterialStepValid()}
            className={`exam-button-mini`}
            aria-label="Continue to content type selection"
            data-hover="Continue"
          >
            Continue
          </button>
        </div>
      </div>
  );

  const renderContentStep = () => (
    <>
      <div className="px-4 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8" role="radiogroup" aria-label="Content type options">
        {options.map((option, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg shadow-sm transition-all duration-200 ${
              selectedType === option.type 
                ? `${option.bgColor} ring-2 ring-offset-2 ring-blue-500` 
                : `${option.bgColor} hover:ring-2 hover:ring-offset-2 hover:ring-blue-500/50`
            } cursor-pointer`}
            onClick={() => setSelectedType(option.type)}
            role="radio"
            aria-checked={selectedType === option.type}
            tabIndex="0"
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

      <div>
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setStep('material')}
            className="text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-6 rounded-full"
            aria-label="Back to material selection"
          >
            Back
          </button>
          <button
            onClick={handleCreate}
            disabled={!isFormValid()}
            className={`exam-button-mini`}
            aria-label="Create content"
            data-hover="Create"
          >
            Create
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="letter-no-lines max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 id="modal-title" className="text-xl font-semibold text-gray-800 pt-3 px-3 label-text">
            {step === 'material' ? 'Choose Material' : 'Choose Content Type'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-4"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        
        {step === 'material' ? renderMaterialStep() : renderContentStep()}
      </div>
    </div>
  );
};

export default ChooseModal; 