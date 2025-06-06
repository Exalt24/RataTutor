import {
  BookOpen,
  CheckSquare,
  File,
  FileAudio,
  FileImage,
  FileText,
  FileType,
  FileVideo,
  Folder as FolderIcon,
  Grid,
  HelpCircle,
  List,
  RefreshCw, Search,
  Trash2,
  X
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const FolderDialog = ({ isOpen, onClose, title, files = [] }) => {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, file: null });
  const [textContent, setTextContent] = useState('');
  const contextMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setContextMenu({ show: false, x: 0, y: 0, file: null });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (selectedFile && selectedFile.type.toLowerCase() === 'txt') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTextContent(e.target.result);
      };
      reader.readAsText(selectedFile.file);
    }
  }, [selectedFile]);

  if (!isOpen) return null;

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText className="text-red-500" />;
      case 'doc':
      case 'docx':
        return <File className="text-blue-500" />;
      case 'ppt':
      case 'pptx':
        return <File className="text-orange-500" />;
      case 'txt':
        return <FileType className="text-gray-500" />;
      case 'img':
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileImage className="text-green-500" />;
      case 'video':
      case 'mp4':
      case 'mov':
        return <FileVideo className="text-purple-500" />;
      case 'audio':
      case 'mp3':
      case 'wav':
        return <FileAudio className="text-yellow-500" />;
      default:
        return <File className="text-gray-500" />;
    }
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map(file => file.name));
    }
  };

  const handleDelete = () => {
    setSelectedFiles([]);
  };

  const handleFileClick = (file) => {
    if (selectedFiles.includes(file.name)) {
      setSelectedFiles(selectedFiles.filter(name => name !== file.name));
    } else {
      setSelectedFiles([...selectedFiles, file.name]);
    }
    setSelectedFile(file);
  };

  const handleCloseFileView = () => {
    setSelectedFile(null);
    setTextContent('');
  };

  const handleContextMenu = (e, file) => {
    e.preventDefault();
    if (file.type.toLowerCase() === 'pdf') {
      setContextMenu({
        show: true,
        x: e.clientX,
        y: e.clientY,
        file: file
      });
    }
  };

  const handleGenerateOption = (type) => {
    setContextMenu({ show: false, x: 0, y: 0, file: null });
  };

  const renderContextMenu = () => {
    if (!contextMenu.show) return null;

    return (
      <div
        ref={contextMenuRef}
        className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[70]"
        style={{
          top: contextMenu.y,
          left: contextMenu.x,
        }}
      >
        <button
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-gray-700"
          onClick={() => handleGenerateOption('flashcards')}
        >
          <BookOpen size={16} className="text-blue-500" />
          Generate Flashcards
        </button>
        <button
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-gray-700"
          onClick={() => handleGenerateOption('notes')}
        >
          <FileText size={16} className="text-purple-500" />
          Generate Notes
        </button>
        <button
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-gray-700"
          onClick={() => handleGenerateOption('quiz')}
        >
          <HelpCircle size={16} className="text-green-500" />
          Generate Quiz
        </button>
      </div>
    );
  };

  const renderFileView = () => {
    if (!selectedFile) return null;

    const file = selectedFile;
    const fileType = file.type.toLowerCase();

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
          {/* Title Bar */}
          <div className="flex items-center justify-between p-2 bg-gray-100 rounded-t-lg">
            <div className="flex items-center gap-2">
              {getFileIcon(fileType)}
              <h2 className="text-sm font-medium text-gray-800">{file.name}</h2>
            </div>
            <button
              onClick={handleCloseFileView}
              className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          {/* File Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {fileType.includes('image') ? (
              <div className="flex items-center justify-center h-full">
                <img 
                  src={URL.createObjectURL(file.file)} 
                  alt={file.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : fileType.includes('video') ? (
              <div className="flex items-center justify-center h-full">
                <video 
                  src={URL.createObjectURL(file.file)} 
                  controls
                  className="max-w-full max-h-full"
                />
              </div>
            ) : fileType.includes('audio') ? (
              <div className="flex items-center justify-center h-full">
                <audio 
                  src={URL.createObjectURL(file.file)} 
                  controls
                  className="w-full"
                />
              </div>
            ) : fileType.includes('pdf') ? (
              <iframe 
                src={URL.createObjectURL(file.file)} 
                className="w-full h-full"
                title={file.name}
                onContextMenu={(e) => handleContextMenu(e, file)}
              />
            ) : fileType === 'txt' ? (
              <div className="w-full h-full bg-white p-4 rounded-lg">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
                  {textContent || 'Loading...'}
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Preview not available for this file type</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
          {/* Title Bar */}
          <div className="flex items-center justify-between p-2 bg-gray-100 rounded-t-xl">
            <div className="flex items-center gap-2">
              <FolderIcon size={20} className="text-blue-500" />
              <h2 className="text-sm font-medium text-gray-800">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          {/* Navigation Bar */}
          <div className="flex items-center gap-2 p-2 border-b bg-gray-50">
            <button 
              onClick={handleSelectAll}
              className="flex items-center gap-1 px-2 py-1 hover:bg-gray-200 rounded-xl transition-colors text-sm text-gray-600"
            >
              <CheckSquare size={16} />
              <span>Select All</span>
            </button>
            <button 
              onClick={handleDelete}
              disabled={selectedFiles.length === 0}
              className={`flex items-center gap-1 px-2 py-1 rounded-xl transition-colors text-sm ${
                selectedFiles.length === 0 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-red-500 hover:bg-red-50'
              }`}
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
            <button className="p-1 hover:bg-gray-200 rounded-xl transition-colors">
              <RefreshCw size={18} className="text-gray-600" />
            </button>
            <div className="flex-1 flex items-center gap-2 px-3 py-1 bg-white border rounded-xl">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-sm"
              />
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1 rounded-xl transition-colors ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
              >
                <List size={18} className="text-gray-600" />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded-xl transition-colors ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
              >
                <Grid size={18} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Address Bar */}
          <div className="flex items-center gap-2 px-4 py-2 border-b bg-white">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <FolderIcon size={16} className="text-blue-500" />
              <span>Recent Files</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {viewMode === 'list' ? (
              // List View
              <div className="divide-y">
                {filteredFiles.map((file, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedFiles.includes(file.name) ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleFileClick(file)}
                    onContextMenu={(e) => handleContextMenu(e, file)}
                  >
                    <div className="p-2 bg-gray-50 rounded-xl">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-800">{file.name}</h3>
                      <p className="text-xs text-gray-500">{file.size} • {file.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Grid View
              <div className="grid grid-cols-4 gap-4 p-4">
                {filteredFiles.map((file, index) => (
                  <div
                    key={index}
                    className={`flex flex-col items-center p-4 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors ${
                      selectedFiles.includes(file.name) ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleFileClick(file)}
                    onContextMenu={(e) => handleContextMenu(e, file)}
                  >
                    <div className="p-3 bg-gray-50 rounded-xl mb-2">
                      {getFileIcon(file.type)}
                    </div>
                    <h3 className="text-sm font-medium text-gray-800 text-center truncate w-full">{file.name}</h3>
                    <p className="text-xs text-gray-500">{file.size}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className="px-4 py-2 border-t bg-gray-50 text-xs text-gray-500 rounded-b-xl">
            {selectedFiles.length > 0 
              ? `${selectedFiles.length} items selected` 
              : `${filteredFiles.length} items`}
          </div>
        </div>
      </div>
      {renderFileView()}
      {renderContextMenu()}
    </>
  );
};

export default FolderDialog;