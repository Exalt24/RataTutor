import { ArrowLeft, Globe, GripVertical, Lock, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

const CreateQuiz = ({ onClose }) => {
  const [items, setItems] = useState([{ 
    question: '', 
    choices: ['', ''], 
    correctAnswer: 0 
  }]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isPrivate, setIsPrivate] = useState(true);

  const MAX_DESCRIPTION_LENGTH = 100;

  const addNewItem = () => {
    setItems([...items, { 
      question: '', 
      choices: ['', ''], 
      correctAnswer: 0 
    }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const updateChoice = (itemIndex, choiceIndex, value) => {
    const newItems = [...items];
    newItems[itemIndex].choices[choiceIndex] = value;
    setItems(newItems);
  };

  const addChoice = (itemIndex) => {
    const newItems = [...items];
    newItems[itemIndex].choices.push('');
    setItems(newItems);
  };

  const removeChoice = (itemIndex, choiceIndex) => {
    const newItems = [...items];
    newItems[itemIndex].choices = newItems[itemIndex].choices.filter((_, i) => i !== choiceIndex);
    // Adjust correctAnswer if needed
    if (newItems[itemIndex].correctAnswer >= choiceIndex) {
      newItems[itemIndex].correctAnswer = Math.max(0, newItems[itemIndex].correctAnswer - 1);
    }
    setItems(newItems);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
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

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving:', { title, description, items });
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_DESCRIPTION_LENGTH) {
      setDescription(value);
    }
  };

  return (
    <div className="letter-no-lines">
      <div className="max-w-[90rem] mx-auto px-10 py-3">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full mr-4"
            >
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-3xl font-semibold label-text">
              Create Quiz
            </h2>
          </div>
          <button
            onClick={() => setIsPrivate(!isPrivate)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
              isPrivate 
                ? 'bg-white border-gray-300 hover:bg-gray-50' 
                : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
            }`}
            title={isPrivate ? "Make Public" : "Make Private"}
          >
            {isPrivate ? (
              <>
                <Lock size={20} className="text-gray-600" />
                <span className="text-gray-600 font-medium">Private</span>
              </>
            ) : (
              <>
                <Globe size={20} className="text-[#1b81d4]" />
                <span className="text-[#1b81d4] font-medium">Public</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-all mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-medium label-text">Details</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="label-text block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                placeholder="Enter title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-lg text-lg label-text bg-white focus:bg-white focus:ring-2 focus:ring-[#7BA7CC]/30 focus:border-[#1b81d4] transition-colors outline-none"
              />
            </div>
            <div>
              <label className="label-text block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <div className="relative">
                <textarea
                  placeholder="Enter description"
                  value={description}
                  onChange={handleDescriptionChange}
                  className="w-full p-4 border border-gray-200 rounded-lg text-lg label-text bg-white focus:bg-white focus:ring-2 focus:ring-[#7BA7CC]/30 focus:border-[#1b81d4] transition-colors outline-none resize-none"
                  rows={1}
                />
                <div className="absolute right-3 bottom-3 text-sm text-gray-400">
                  {description.length}/{MAX_DESCRIPTION_LENGTH}
                </div>
              </div>
            </div>
          </div>
        </div>

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
              <div className="flex items-center mb-6">
                <div className="flex-1">
                  <h3 className="text-xl font-medium label-text">Question {index + 1}</h3>
                </div>
                <div className="flex-1 flex justify-center">
                  <GripVertical size={24} className="text-gray-400 rotate-90" />
                </div>
                <div className="flex-1 flex justify-end">
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                      title="Remove Question"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="label-text block text-sm font-medium text-gray-700 mb-2">
                    Question
                  </label>
                  <textarea
                    value={item.question}
                    onChange={(e) => updateItem(index, 'question', e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-lg label-text bg-white focus:bg-white focus:ring-2 focus:ring-[#7BA7CC]/30 focus:border-[#1b81d4] transition-colors outline-none"
                    rows={3}
                    placeholder="Enter your question..."
                  />
                </div>
                <div>
                  <label className="label-text block text-sm font-medium text-gray-700 mb-2">
                    Choices
                  </label>
                  <div className="space-y-3">
                    {item.choices.map((choice, choiceIndex) => (
                      <div key={choiceIndex} className="flex items-center gap-3 group relative">
                        <input
                          type="text"
                          value={choice}
                          onChange={(e) => updateChoice(index, choiceIndex, e.target.value)}
                          className="flex-1 p-3 border border-gray-200 rounded-lg label-text bg-white focus:bg-white focus:ring-2 focus:ring-[#7BA7CC]/30 focus:border-[#1b81d4] transition-colors outline-none pr-16"
                          placeholder={`Choice ${choiceIndex + 1}`}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                          <input
                            type="radio"
                            name={`correct-answer-${index}`}
                            checked={item.correctAnswer === choiceIndex}
                            onChange={() => updateItem(index, 'correctAnswer', choiceIndex)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                          />
                          {item.choices.length > 2 && (
                            <button
                              onClick={() => removeChoice(index, choiceIndex)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                              title="Remove Choice"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => addChoice(index)}
                      className="flex items-center gap-2 text-[#1b81d4] hover:text-blue-700"
                    >
                      <Plus size={18} />
                      <span>Add Choice</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-8">
          <button
            onClick={addNewItem}
            className="exam-button-mini"
            data-hover="Add New Question"
          >
            Add New Question
          </button>
          <div className="space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="exam-button-mini"
              data-hover="Save Changes"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz; 