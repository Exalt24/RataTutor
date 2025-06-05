import { CloudUpload, X } from 'lucide-react';
import React, { useRef, useState } from 'react';

const UploadFile = ({ isOpen, onClose }) => {
  const [files, setFiles] = useState([]);
  const inputRef = useRef(null);

  if (!isOpen) return null;

  // Trigger the hidden file input
  const openFilePicker = () => {
    inputRef.current?.click();
  };

  // Handle files selected via the native file picker
  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length) {
      setFiles((prev) => [...prev, ...selected]);
    }
  };

  // Handle files dropped into the drop area
  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length) {
      setFiles((prev) => [...prev, ...dropped]);
    }
  };

  // Prevent default to allow drop
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Remove a single file from the list
  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="letter-no-lines p-6 space-y-6 shadow-lg border border-gray-200 relative w-full max-w-sm md:max-w-md lg:max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <X size={20} />
        </button>

        {/* Drag & drop area */}
        <div
          className="bg-white/60 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg py-8 mt-10 px-4 cursor-pointer hover:border-gray-400 w-4/5 mx-auto"
          onClick={openFilePicker}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="bg-blue-100 rounded-full p-5 mb-4">
            <CloudUpload size={50} className="text-blue-600" />
          </div>
          <h3 className="label-text text-2xl font-semibold text-gray-800">
            Drag & drop files here
          </h3>
          <p className="text-base text-gray-600 mt-2">
            or click to browse your files
          </p>
        </div>

        {/* “Select files” button (also triggers file picker) */}
        <button
          onClick={openFilePicker}
          className="exam-button w-4/5 flex justify-center mx-auto"
          data-hover="Select files"
        >
          Select files
        </button>

        {/* Hidden file input with multiple attribute */}
        <input
          type="file"
          multiple
          ref={inputRef}
          className="hidden"
          onChange={handleFileSelect}
          accept="*/*"
        />

        {/* List of selected files */}
        {files.length > 0 && (
          <div className="mt-6 text-left space-y-2 w-4/5 mx-auto">
            <h4 className="text-lg font-medium text-gray-700">Files to upload:</h4>
            <ul className="max-h-48 overflow-y-auto">
              {files.map((file, idx) => (
                <li
                  key={`${file.name}-${idx}`}
                  className="flex items-center justify-between bg-gray-100 rounded-md px-3 py-2 my-1"
                >
                  <span className="truncate text-gray-800">{file.name}</span>
                  <button
                    onClick={() => removeFile(idx)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none ml-2"
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action buttons */}
        {files.length > 0 && (
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // TODO: Implement upload functionality
                onClose();
              }}
              className="exam-button-mini"
              data-hover="Upload"
            >
              Upload
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadFile;
