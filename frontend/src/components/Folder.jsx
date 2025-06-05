import { Folder as FolderIcon } from 'lucide-react';
import React, { useState } from 'react';
import FolderDialog from './FolderDialog';

const Folder = ({ title, onClick, files = [] }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleClick = () => {
    setIsDialogOpen(true);
    if (onClick) onClick();
  };

  return (
    <>
      <div
        className="relative w-48 h-32 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
        onClick={handleClick}
      >
        {/* Folder Tab */}
        <div className="absolute -top-2 left-4 w-24 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-t-lg shadow-sm flex items-center justify-center">
          <FolderIcon size={16} className="text-blue-600 mr-2" />
          <span className="text-xs font-medium text-blue-700 truncate">{title}</span>
        </div>
        
        {/* Folder Body */}
        <div className="absolute inset-0 pt-8 p-4">
          <div className="w-full h-full border-2 border-blue-200 rounded-lg bg-white/50 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <FolderIcon size={32} className="text-blue-400 mx-auto mb-1" />
              <span className="text-xs text-blue-600">{files.length} items</span>
            </div>
          </div>
        </div>
      </div>

      <FolderDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={title}
        files={files}
      />
    </>
  );
};

export default Folder; 