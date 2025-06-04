import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createMaterial } from '../services/apiService';
import { useLoading } from '../components/Loading/LoadingContext';

const CreateMaterialModal = ({ isOpen, onClose, onCreated }) => {
  const { showLoading, hideLoading } = useLoading();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    showLoading();

    try {
      const res = await createMaterial({ title, description });
      onCreated(res.data); // Notify parent about the new material
      setTitle('');
      setDescription('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create material');
    } finally {
      hideLoading();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold label-text">Create New Material</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="material-title"
                className="label-text block text-sm font-medium text-gray-700 mb-1"
              >
                Title
              </label>
              <input
                id="material-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm label-text bg-white focus:bg-white focus:ring-2 focus:ring-[#7BA7CC]/30 focus:border-[#1b81d4] transition-colors outline-none"
                placeholder="Enter material title"
                required
                disabled={false} // You can disable based on loading state if you want
              />
            </div>

            <div>
              <label
                htmlFor="material-description"
                className="label-text block text-sm font-medium text-gray-700 mb-1"
              >
                Description (Optional)
              </label>
              <textarea
                id="material-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm label-text bg-white focus:bg-white focus:ring-2 focus:ring-[#7BA7CC]/30 focus:border-[#1b81d4] transition-colors outline-none"
                placeholder="Enter material description"
                rows={3}
                disabled={false} // Disable based on loading if you want
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="label-text px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              disabled={false} // Disable if loading
            >
              Cancel
            </button>
            <button
              type="submit"
              className="exam-button-mini"
              data-hover="Create"
              disabled={false} // Disable if loading
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMaterialModal;