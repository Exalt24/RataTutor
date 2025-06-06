import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React from 'react';

const DeleteModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Delete Confirmation",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel"
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="max-w-md relative letter-no-lines"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-500 transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="px-4 pt-8 pb-4">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <ExclamationTriangleIcon className="w-18 h-18 text-red-500" />
          </div>

          {/* Title */}
          <h2 className="label-text text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3 text-center">
            {title}
          </h2>

          {/* Message */}
          <p className="text-gray-600 text-center max-w-md mx-auto leading-relaxed mb-8">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button 
              className="label-text px-4 py-2 rounded-full text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={onClose}
            >
              {cancelText}
            </button>
            <button 
              className="exam-button-mini"
              data-hover="Confirm"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal; 