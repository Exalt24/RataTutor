import { Bot, FileText, Sparkles, Upload } from 'lucide-react';
import React from 'react';

const UploadPurposeModal = ({ isOpen, onClose, onChoosePurpose, uploadedFiles = [] }) => {
  if (!isOpen) return null;

  const handleChoice = (purpose) => {
    onChoosePurpose(purpose);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="letter-no-lines max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 id="modal-title" className="text-xl font-semibold text-gray-800 pt-3 px-3 label-text">
            What would you like to do with your files?
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-4 transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        
        <div className="px-4 pb-4">
          {/* Show uploaded files summary */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Files Ready to Upload:</h3>
            <div className="space-y-1">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="text-sm text-blue-700 flex items-center gap-2">
                  <FileText size={16} />
                  <span>{file.name}</span>
                  <span className="text-blue-500">({file.size})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Purpose selection options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* AI Generation Option */}
            <div
              className="p-6 rounded-xl shadow-sm transition-all duration-200 cursor-pointer bg-gradient-to-br from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border-2 border-transparent hover:border-purple-300"
              onClick={() => handleChoice('ai-generate')}
              role="button"
              tabIndex="0"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleChoice('ai-generate');
                }
              }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-full bg-white shadow-sm mb-4">
                  <Bot size={32} className="text-purple-500" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">AI Generate Content</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Use AI to automatically create flashcards, notes, or quiz questions from your uploaded files.
                </p>
                <div className="flex items-center gap-1 text-purple-600 text-xs">
                  <Sparkles size={14} />
                  <span>Powered by AI</span>
                </div>
              </div>
            </div>

            {/* File Attachment Option */}
            <div
              className="p-6 rounded-xl shadow-sm transition-all duration-200 cursor-pointer bg-gradient-to-br from-green-50 to-teal-50 hover:from-green-100 hover:to-teal-100 border-2 border-transparent hover:border-green-300"
              onClick={() => handleChoice('attach-files')}
              role="button"
              tabIndex="0"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleChoice('attach-files');
                }
              }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-full bg-white shadow-sm mb-4">
                  <Upload size={32} className="text-green-500" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Attach Files Only</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Simply attach your files to an existing material or create a new material for organization.
                </p>
                <div className="flex items-center gap-1 text-green-600 text-xs">
                  <FileText size={14} />
                  <span>Simple Upload</span>
                </div>
              </div>
            </div>
          </div>

          {/* Back button */}
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-6 py-2 rounded-full transition-colors"
              aria-label="Back to file selection"
            >
              Back to File Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPurposeModal;