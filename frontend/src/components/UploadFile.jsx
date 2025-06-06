import { AlertCircle, Check, FileText, Trash2, Upload, X } from 'lucide-react';
import React, { useRef, useState } from 'react';

const UploadFile = ({ isOpen, onClose, onUpload }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Validation constants
  const validExtensions = ['.pdf', '.docx', '.pptx', '.txt'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const validateFile = (file) => {
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    const isValidType = validExtensions.includes(fileExtension);
    const isValidSize = file.size <= maxSize;
    
    return {
      isValid: isValidType && isValidSize,
      errors: [
        ...(!isValidType ? ['Invalid file type'] : []),
        ...(!isValidSize ? ['File too large (max 10MB)'] : [])
      ]
    };
  };

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const processedFiles = fileArray.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      sizeFormatted: formatFileSize(file.size),
      validation: validateFile(file)
    }));

    setSelectedFiles(prev => [...prev, ...processedFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
    // Reset the input value so the same file can be selected again
    e.target.value = '';
  };

  const removeFile = (fileId) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleUpload = () => {
    const validFiles = selectedFiles.filter(f => f.validation.isValid);
    if (validFiles.length > 0) {
      onUpload(validFiles.map(f => f.file));
      setSelectedFiles([]);
    }
  };

  const handleClose = () => {
    setSelectedFiles([]);
    onClose();
  };

  const validFilesCount = selectedFiles.filter(f => f.validation.isValid).length;
  const invalidFilesCount = selectedFiles.length - validFilesCount;
  const hasInvalidFiles = invalidFilesCount > 0;
  const canUpload = validFilesCount > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
      <div className="letter-no-lines max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 px-6 pt-6">
          <h2 className="text-xl font-semibold text-gray-800 label-text">
            Upload Files
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 p-2 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 flex-1 overflow-y-auto">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer bg-gray-50 ${
              isDragOver
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={48} className={`mx-auto mb-4 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
            <h3 className="text-lg font-medium text-gray-800 mb-2 label-text">
              {isDragOver ? 'Drop files here' : 'Choose files or drag & drop'}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              PDF, DOCX, PPTX, or TXT files only • Maximum 10MB per file
            </p>
            <button
              type="button"
              className="exam-button-mini"
              data-hover="Browse Files"
            >
              Browse Files
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.pptx,.txt"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4 label-text">
                Selected Files ({selectedFiles.length})
              </h3>
              
              {/* Summary */}
              {selectedFiles.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      {validFilesCount > 0 && (
                        <span className="flex items-center gap-1 text-green-600">
                          <Check size={16} />
                          {validFilesCount} valid file{validFilesCount !== 1 ? 's' : ''}
                        </span>
                      )}
                      {invalidFilesCount > 0 && (
                        <span className="flex items-center gap-1 text-red-600 label-text">
                          <AlertCircle size={16} />
                          {invalidFilesCount} invalid file{invalidFilesCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <span className="text-gray-600 label-text">
                      Total: {formatFileSize(selectedFiles.reduce((sum, f) => sum + f.size, 0))}
                    </span>
                  </div>
                </div>
              )}

              {/* Files List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedFiles.map((fileData) => {
                  const { isValid, errors } = fileData.validation;
                  
                  return (
                    <div
                      key={fileData.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        isValid
                          ? 'border-green-200 bg-green-50'
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-full ${isValid ? 'bg-green-100' : 'bg-red-100'}`}>
                          <FileText size={20} className={isValid ? 'text-green-600' : 'text-red-600'} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-800 truncate">
                              {fileData.name}
                            </p>
                            {isValid ? (
                              <Check size={16} className="text-green-600 flex-shrink-0" />
                            ) : (
                              <X size={16} className="text-red-600 flex-shrink-0" />
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs">
                            <span className={`font-medium ${
                              fileData.size > maxSize ? 'text-red-600' : 'text-gray-600'
                            } label-text`}>
                              {fileData.sizeFormatted}
                            </span>
                            
                            {!isValid && (
                              <span className="text-red-600 label-text">• {errors.join(', ')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => removeFile(fileData.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all flex-shrink-0 ml-2"
                        title="Remove file"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center gap-3 p-6">
          <button
            onClick={handleClose}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!canUpload || hasInvalidFiles}
            className={`exam-button-mini px-6 py-2 cursor-pointer ${
              !canUpload ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            data-hover={
              !canUpload 
                ? hasInvalidFiles 
                  ? "Remove invalid files first"
                  : "Select files to upload"
                : `Upload ${validFilesCount} file${validFilesCount !== 1 ? 's' : ''}`
            }
          >
            {canUpload ? `Upload ${validFilesCount} File${validFilesCount !== 1 ? 's' : ''}` : 'Upload Files'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadFile;