import { Edit2, FilePlus, FileText, HelpCircle } from 'lucide-react';
import React, { useState } from 'react';
import CreateFlashcards from './CreateFlashcards';
import CreateNotes from './CreateNotes';
import CreateQuiz from './CreateQuiz';
import UploadFile from './UploadFile';

const HomeScreen = ({ selectedFile, handleFileChange, uploadAndGenerate, generated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createType, setCreateType] = useState(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openCreate = (type) => {
    setCreateType(type);
  };

  const closeCreate = () => {
    setCreateType(null);
  };

  if (createType === 'flashcards') {
    return <CreateFlashcards onClose={closeCreate} />;
  } else if (createType === 'notes') {
    return <CreateNotes onClose={closeCreate} />;
  } else if (createType === 'quiz') {
    return <CreateQuiz onClose={closeCreate} />;
  }

  return (
    <div className="space-y-4">
      <section>
        <h2 className="exam-subheading sm:text-sm ">Create</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ">
          {[
            { icon: <FilePlus size={20} />, title: 'Upload a PDF, PPT, Video, or Audio', desc: 'Get flashcards, summaries & quiz questions instantly.', action: openModal },
            { icon: <HelpCircle size={20} />, title: 'Create quiz manually', desc: 'Create quiz questions without AI for free.', action: () => openCreate('quiz') },
            { icon: <FileText size={20} />, title: 'Create flashcards manually', desc: 'Create flashcards without AI for free.', action: () => openCreate('flashcards') },
            { icon: <Edit2 size={20} />, title: 'Create notes manually', desc: 'Create notes without AI for free.', action: () => openCreate('notes') }
          ].map((card, i) => (
            <div key={i} className="exam-card p-2 sm:p-4 text-xs sm:text-sm flex items-start cursor-pointer" onClick={card.action}>
              <div className="mr-2">{card.icon}</div>
              <div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <UploadFile isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default HomeScreen;
