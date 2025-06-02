import { Edit2, FilePlus, FileText, Mic } from 'lucide-react';
import React, { useState } from 'react';
import UploadFile from './UploadFile';

const HomeScreen = ({ selectedFile, handleFileChange, uploadAndGenerate, generated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="space-y-4">
      <h1 className="exam-greeting text-end sm:text-xl px-6">Welcome, Nikka!</h1>
      <section>
        <h2 className="exam-subheading sm:text-sm ">Create</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ">
          {[
            { icon: <FilePlus size={20} />, title: 'Upload a PDF, PPT, Video, or Audio', desc: 'Get flashcards, summaries & quiz questions instantly.', action: openModal },
            { icon: <Mic size={20} />, title: 'Create from live recording', desc: 'Start a live lecture recording now.' },
            { icon: <FileText size={20} />, title: 'Create flashcards manually', desc: 'Create flashcards without AI for free.' },
            { icon: <Edit2 size={20} />, title: 'Create notes manually', desc: 'Create notes without AI for free.' }
          ].map((card, i) => (
            <div key={i} className="exam-card p-2 sm:p-4 text-xs sm:text-sm flex items-start cursor-pointer" onClick={card.action}>
              <div className="mr-2">{card.icon}</div>
              <div>
                <h3>{card.title}</h3>
                <p >{card.desc}</p>
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
