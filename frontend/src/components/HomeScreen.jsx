import { Edit2, FilePlus, FileText, HelpCircle, Sparkles } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { useLoading } from './Loading/LoadingContext';
import { useToast } from './Toast/ToastContext';
import ChooseModal from './ChooseModal';
import CreateFlashcards from './CreateFlashcards';
import CreateNotes from './CreateNotes';
import CreateQuiz from './CreateQuiz';
import UploadFile from './UploadFile'; // This now uses the enhanced version
import UploadPurposeModal from './UploadPurposeModal';
import { trackActivityAndNotify, createCombinedSuccessMessage } from '../utils/streakNotifications';

const HomeScreen = ({ 
  selectedFile, 
  handleFileChange, 
  uploadAndGenerate, 
  generated,
  materialsData,
  onRefreshMaterials,
  onAddMaterial,
  onUpdateMaterial
}) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploadPurposeModalOpen, setIsUploadPurposeModalOpen] = useState(false);
  const [isChooseModalOpen, setIsChooseModalOpen] = useState(false);
  const [createType, setCreateType] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [modalMode, setModalMode] = useState('upload'); // 'upload', 'manual', or 'attachment'

  // Add refs and hooks for file upload functionality
  const fileInputRef = useRef(null);
  const { showLoading, hideLoading } = useLoading();
  const { showToast } = useToast();

  const openUploadModal = () => setIsUploadModalOpen(true);
  const closeUploadModal = () => setIsUploadModalOpen(false);

  const openManualCreate = (type) => {
    setCreateType(type);
    setModalMode('manual');
    setIsChooseModalOpen(true);
  };

  const closeCreate = () => {
    setCreateType(null);
    setSelectedMaterial(null);
    setIsChooseModalOpen(false);
    setIsUploadPurposeModalOpen(false);
    setUploadedFiles([]);
    setModalMode('upload');
  };

  const handleFileUpload = (files) => {
    // Files are already validated in the UploadFile component
    const newFiles = files.map(file => {
      const extension = file.name.split('.').pop().toLowerCase();
      
      let type = extension;
      if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
        type = 'image';
      } else if (['mp4', 'mov', 'avi'].includes(extension)) {
        type = 'video';
      } else if (['mp3', 'wav'].includes(extension)) {
        type = 'audio';
      } else if (['doc', 'docx'].includes(extension)) {
        type = 'doc';
      } else if (['ppt', 'pptx'].includes(extension)) {
        type = 'ppt';
      } else if (extension === 'pdf') {
        type = 'pdf';
      } else if (extension === 'txt') {
        type = 'txt';
      }

      return {
        name: file.name,
        type: type,
        size: formatFileSize(file.size),
        date: new Date().toISOString().split('T')[0],
        file: file
      };
    });
    
    setUploadedFiles(newFiles);
    closeUploadModal();
    setIsUploadPurposeModalOpen(true);
  };

  const handlePurposeChoice = (purpose) => {
    setIsUploadPurposeModalOpen(false);
    
    if (purpose === 'ai-generate') {
      setModalMode('upload'); // Regular upload mode with content type selection
    } else if (purpose === 'attach-files') {
      setModalMode('attachment'); // Attachment mode with material selection only
    }
    
    setIsChooseModalOpen(true);
  };

  const handleMaterialAndTypeChoice = async (type, materialData) => {
    try {
      let material = null;

      if (materialData.isNew) {
        // Create new material
        const newMaterialData = {
          title: materialData.name,
          description: materialData.description || '',
          status: 'active',
          pinned: false,
          public: false
        };

        // You'll need to import createMaterial from apiService
        const { createMaterial } = await import('../services/apiService');
        const response = await createMaterial(newMaterialData);
        material = response.data;
        
        // Add to state
        onAddMaterial(material);
      } else {
        // Use existing material
        const materialId = parseInt(materialData.id);
        material = materialsData.find(m => m.id === materialId);
        
        if (!material) {
          console.error('Material not found with ID:', materialId);
          console.log('Available materials:', materialsData.map(m => ({ id: m.id, title: m.title })));
          throw new Error('Selected material not found');
        }
      }

      if (material) {
        setSelectedMaterial(material);
        
        // Handle different modal modes
        if (modalMode === 'attachment') {
          // Upload files as attachments
          await handleAttachmentUpload(material);
        } else if (modalMode === 'upload') {
          // AI generation mode - TODO: Implement AI generation logic
          // For now, just show a placeholder message
          showToast({
            variant: "info",
            title: "AI Generation Coming Soon",
            subtitle: `AI generation for ${type} will be implemented soon. Files have been attached to "${material.title}" instead.`,
          });
          
          // Temporarily attach files until AI is implemented
          await handleAttachmentUpload(material);
        } else {
          // Manual creation mode (flashcards, notes, quiz)
          setCreateType(type);
          setIsChooseModalOpen(false);
        }
      }
    } catch (error) {
      console.error('Error handling material selection:', error);
      showToast({ 
        variant: "error", 
        title: "Error", 
        subtitle: error.message || "Failed to process selection. Please try again." 
      });
    }
  };

  /// Update the handleAttachmentUpload function (around line 150-190):
const handleAttachmentUpload = async (material) => {
  if (uploadedFiles.length === 0) return;

  try {
    showLoading();
    
    // Import uploadAttachment function
    const { uploadAttachment } = await import('../services/apiService');
    
    // Upload all files (validation already done in handleFileUpload)
    const uploadPromises = uploadedFiles.map(fileData => {
      return uploadAttachment(material.id, fileData.file);
    });

    await Promise.all(uploadPromises);
    
    // 🔥 Track activity but suppress immediate notification (same as other components)
    const streakResult = await trackActivityAndNotify(showToast, true);

    // Refresh materials data to get updated attachments
    await onRefreshMaterials();
    
    // Close modal and reset state
    setIsChooseModalOpen(false);
    setUploadedFiles([]);
    setSelectedMaterial(null);
    setModalMode('upload');

    // 🔥 Create combined message using helper function (same as other components)
    const baseTitle = "Files uploaded successfully!";
    const baseSubtitle = `${uploadedFiles.length} file(s) have been attached to "${material.title}".`;
    
    const combinedMessage = createCombinedSuccessMessage(baseTitle, baseSubtitle, streakResult);
    
    // 🔥 Show single combined toast (same as other components)
    showToast({
      variant: "success",
      title: combinedMessage.title,
      subtitle: combinedMessage.subtitle,
    });

  } catch (error) {
    console.error('Error uploading attachments:', error);
    showToast({
      variant: "error",
      title: "Upload failed",
      subtitle: error.response?.data?.error || error.message || "Failed to upload files. Please try again.",
    });
  } finally {
    hideLoading();
  }
};

  const handleCreationSuccess = async (newContent) => {
    // Refresh materials to get updated data
    await onRefreshMaterials();
    
    // Close the creation component
    setCreateType(null);
    setSelectedMaterial(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // If we have a selected material and create type, show the creation component
  if (selectedMaterial && createType) {
    const commonProps = {
      material: selectedMaterial,
      onClose: closeCreate,
      onSuccess: handleCreationSuccess
    };

    switch (createType) {
      case 'flashcards':
        return <CreateFlashcards {...commonProps} mainMaterial={selectedMaterial} />;
      case 'notes':
        return <CreateNotes {...commonProps} />;
      case 'quiz':
        return <CreateQuiz {...commonProps} />;
      default:
        return null;
    }
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
              title: 'Upload Files',
              desc: 'Upload files for AI generation or attach to materials.', 
              action: openUploadModal,
              bgColor: 'bg-pink-50 hover:bg-pink-100'
            },
            { 
              icon: <HelpCircle size={24} className="text-[#22C55E]" />, 
              title: 'Create quiz manually', 
              desc: 'Create quiz questions without AI for free.', 
              action: () => openManualCreate('quiz'),
              bgColor: 'bg-[#22C55E]/10 hover:bg-[#22C55E]/20'
            },
            { 
              icon: <FileText size={24} className="text-blue-500" />, 
              title: 'Create flashcards manually', 
              desc: 'Create flashcards without AI for free.', 
              action: () => openManualCreate('flashcards'),
              bgColor: 'bg-blue-50 hover:bg-blue-100'
            },
            { 
              icon: <Edit2 size={24} className="text-purple-500" />, 
              title: 'Create notes manually', 
              desc: 'Create notes without AI for free.', 
              action: () => openManualCreate('notes'),
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

      <UploadFile 
        isOpen={isUploadModalOpen} 
        onClose={closeUploadModal} 
        onUpload={handleFileUpload}
      />

      <UploadPurposeModal
        isOpen={isUploadPurposeModalOpen}
        onClose={() => {
          setIsUploadPurposeModalOpen(false);
          setUploadedFiles([]);
        }}
        onChoosePurpose={handlePurposeChoice}
        uploadedFiles={uploadedFiles}
      />

      <ChooseModal
        isOpen={isChooseModalOpen}
        onClose={() => {
          setIsChooseModalOpen(false);
          setCreateType(null);
          setUploadedFiles([]);
          setModalMode('upload');
        }}
        onCreate={handleMaterialAndTypeChoice}
        existingMaterials={materialsData || []}
        mode={modalMode}
        preselectedType={createType}
      />
    </div>
  );
};

export default HomeScreen;