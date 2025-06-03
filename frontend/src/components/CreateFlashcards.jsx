import { ArrowLeft, ArrowUpDown, Globe, GripVertical, Lock, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

const CreateFlashcards = ({ onClose }) => {
  const [items, setItems] = useState([{ front: '', back: '' }]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isPrivate, setIsPrivate] = useState(true);

  const MAX_DESCRIPTION_LENGTH = 100;

  const addNewItem = () => {
    setItems([...items, { front: '', back: '' }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
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
              Create Flashcards
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
                <Globe size={20} className="text-blue-600" />
                <span className="text-blue-600 font-medium">Public</span>
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
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-medium label-text">Item {index + 1}</h3>
                </div>
                <div className="flex items-center gap-4">
                  <GripVertical size={24} className="text-gray-400 rotate-90" />
                  <button
                    onClick={() => swapFields(index)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                    title="Swap Term and Definition"
                  >
                    <ArrowUpDown size={20} />
                  </button>
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                      title="Remove Item"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="label-text block text-sm font-medium text-gray-700 mb-2">
                    Term
                  </label>
                  <textarea
                    value={item.front}
                    onChange={(e) => updateItem(index, 'front', e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-lg label-text bg-white focus:bg-white focus:ring-2 focus:ring-[#7BA7CC]/30 focus:border-[#1b81d4] transition-colors outline-none"
                    rows={4}
                    placeholder="Enter term..."
                  />
                </div>
                <div>
                  <label className="label-text block text-sm font-medium text-gray-700 mb-2">
                    Definition
                  </label>
                  <textarea
                    value={item.back}
                    onChange={(e) => updateItem(index, 'back', e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-lg label-text bg-white focus:bg-white focus:ring-2 focus:ring-[#7BA7CC]/30 focus:border-[#1b81d4] transition-colors outline-none"
                    rows={4}
                    placeholder="Enter definition..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={addNewItem}
            className="exam-button-mini"
            data-hover="Add New"
          >
            Add New Flashcard
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

export default CreateFlashcards; 