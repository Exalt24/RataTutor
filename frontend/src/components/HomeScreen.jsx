import { Edit2, FilePlus, FileText, HelpCircle, Sparkles } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCombinedSuccessMessage, trackActivityAndNotify } from '../utils/streakNotifications';
import ChooseModal from './ChooseModal';
import { useLoading } from './Loading/LoadingContext';
import { useToast } from './Toast/ToastContext';
import UploadFile from './UploadFile';
import UploadPurposeModal from './UploadPurposeModal';

const HomeScreen = ({ 
  selectedFile, 
  handleFileChange, 
  uploadAndGenerate, 
  generated,
  materialsData,
  onRefreshMaterials,
  onAddMaterial,
  onUpdateMaterial,
  onNavigateToMaterial
}) => {
  const navigate = useNavigate();
  
  // ✅ REMOVED: createType and selectedMaterial state (now using routing)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploadPurposeModalOpen, setIsUploadPurposeModalOpen] = useState(false);
  const [isChooseModalOpen, setIsChooseModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [modalMode, setModalMode] = useState('upload'); // 'upload', 'manual', or 'attachment'
  const [pendingManualType, setPendingManualType] = useState(null); // ✅ NEW: Track manual creation type

  // Add refs and hooks for file upload functionality
  const fileInputRef = useRef(null);
  const { showLoading, hideLoading } = useLoading();
  const { showToast } = useToast();

  const openUploadModal = () => setIsUploadModalOpen(true);
  const closeUploadModal = () => setIsUploadModalOpen(false);

  // ✅ UPDATED: Use navigation instead of local state
  const openManualCreate = (type) => {
    setPendingManualType(type);
    setModalMode('manual');
    setIsChooseModalOpen(true);
  };

  // ✅ UPDATED: Reset state without createType and selectedMaterial
  const closeCreate = () => {
    setPendingManualType(null);
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
        throw new Error('Selected material not found');
      }
    }

    if (material) {
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
      } else if (modalMode === 'manual') {
        // ✅ UPDATED: Navigate to creation route - this will now auto-navigate to view after creation
        const createType = pendingManualType || type;
        const createUrl = `/dashboard/materials/${material.id}/${createType}/create`;
        
        // Close modal first
        closeCreate();
        
        // Navigate to creation route
        // Note: With the updated MaterialsScreen wrappers, this will automatically
        // navigate to the view page after successful creation
        navigate(createUrl);
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
    
    // Track activity but suppress immediate notification
    const streakResult = await trackActivityAndNotify(showToast, true);

    // Refresh materials data to get updated attachments
    await onRefreshMaterials();
    
    // Create combined message using helper function
    const baseTitle = "Files uploaded successfully!";
    const baseSubtitle = `${uploadedFiles.length} file(s) have been attached to "${material.title}".`;
    
    const combinedMessage = createCombinedSuccessMessage(baseTitle, baseSubtitle, streakResult);
    
    // Show single combined toast
    showToast({
      variant: "success",
      title: combinedMessage.title,
      subtitle: combinedMessage.subtitle,
    });

    // ✅ UPDATED: Navigate directly to MaterialContent with attachments section expanded
    // Since attachments don't have their own view routes like flashcards/notes/quizzes,
    // going to MaterialContent makes sense, but we could add a hash or query param
    // to scroll to or highlight the attachments section
    navigate(`/dashboard/materials/${material.id}?section=attachments`);
    
    // Close modal and reset state
    setIsChooseModalOpen(false);
    setUploadedFiles([]);
    setModalMode('upload');

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

  // ✅ REMOVED: handleCreationSuccess (no longer needed with routing)
  // ✅ REMOVED: Local component rendering logic

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // ✅ REMOVED: Conditional rendering of create components (now handled by routing)

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
          setPendingManualType(null);
          setUploadedFiles([]);
          setModalMode('upload');
        }}
        onCreate={handleMaterialAndTypeChoice}
        existingMaterials={materialsData || []}
        mode={modalMode}
        preselectedType={pendingManualType}
      />
    </div>
  );
};

export default HomeScreen;