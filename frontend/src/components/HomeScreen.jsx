import { Edit2, FilePlus, FileText, HelpCircle, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import CreateFlashcards from './CreateFlashcards';
import CreateNotes from './CreateNotes';
import CreateQuiz from './CreateQuiz';
import Folder from './Folder';
import UploadFile from './UploadFile';

const HomeScreen = ({ selectedFile, handleFileChange, uploadAndGenerate, generated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createType, setCreateType] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openCreate = (type) => {
    setCreateType(type);
  };

  const closeCreate = () => {
    setCreateType(null);
  };

  const handleFileUpload = (files) => {
    const newFiles = files.map(file => ({
      name: file.name,
      type: file.type.split('/')[1] || 'file',
      size: formatFileSize(file.size),
      date: new Date().toISOString().split('T')[0],
      file: file // Store the actual file object
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (createType === 'flashcards') {
    return <CreateFlashcards onClose={closeCreate} />;
  } else if (createType === 'notes') {
    return <CreateNotes onClose={closeCreate} />;
  } else if (createType === 'quiz') {
    return <CreateQuiz onClose={closeCreate} />;
  }

  return (
    <div className="space-y-8 mt-6 p-4">
      <section>
        <h2 className="exam-subheading sm:text-sm flex items-center gap-2">
          <Sparkles size={18} className="text-[#22C55E]" />
          Create
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { 
              icon: <FilePlus size={24} className="text-pink-500" />, 
              title: 'Upload a PDF, PPT, Video, or Audio', 
              desc: 'Get flashcards, summaries & quiz questions instantly.', 
              action: openModal,
              bgColor: 'bg-pink-50 hover:bg-pink-100'
            },
            { 
              icon: <HelpCircle size={24} className="text-[#22C55E]" />, 
              title: 'Create quiz manually', 
              desc: 'Create quiz questions without AI for free.', 
              action: () => openCreate('quiz'),
              bgColor: 'bg-[#22C55E]/10 hover:bg-[#22C55E]/20'
            },
            { 
              icon: <FileText size={24} className="text-blue-500" />, 
              title: 'Create flashcards manually', 
              desc: 'Create flashcards without AI for free.', 
              action: () => openCreate('flashcards'),
              bgColor: 'bg-blue-50 hover:bg-blue-100'
            },
            { 
              icon: <Edit2 size={24} className="text-purple-500" />, 
              title: 'Create notes manually', 
              desc: 'Create notes without AI for free.', 
              action: () => openCreate('notes'),
              bgColor: 'bg-purple-50 hover:bg-purple-100'
            }
          ].map((card, i) => (
            <div 
              key={i} 
              className={`exam-card p-4 rounded-lg shadow-sm transition-all duration-200 ${card.bgColor} flex items-start cursor-pointer`} 
              onClick={card.action}
            >
              <div className="mr-3 p-2 rounded-full bg-white shadow-sm">{card.icon}</div>
              <div>
                <h3 className="font-medium text-gray-800">{card.title}</h3>
                <p className="text-gray-600 mt-1">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="exam-subheading sm:text-sm flex items-center gap-2">
          <Sparkles size={18} className="text-blue-500" />
          Your Uploads
        </h2>
        <div className="mt-4 flex flex-wrap gap-6">
          <Folder 
            title="Recent Files" 
            onClick={() => console.log('Recent Files clicked')}
            files={uploadedFiles}
          />
        </div>
      </section>

      <UploadFile 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        onUpload={handleFileUpload}
      />
    </div>
  );
};

export default HomeScreen;
