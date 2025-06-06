import { useRef } from 'react';
import { useToast } from '../components/Toast/ToastContext';
import { useLoading } from '../components/Loading/LoadingContext';
import { uploadAttachment } from '../services/apiService';
import { createCombinedSuccessMessage, trackActivityAndNotify } from '../utils/streakNotifications';

export const useFileUpload = () => {
  const fileInputRef = useRef(null);
  const { showToast } = useToast();
  const { showLoading, hideLoading } = useLoading();

  const validateFile = (file) => {
    const validExtensions = ['.docx', '.pptx', '.txt', '.pdf'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      showToast({
        variant: "error",
        title: "Invalid file type",
        subtitle: "Please select a DOCX, PPTX, TXT, or PDF file.",
      });
      return false;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      showToast({
        variant: "error",
        title: "File too large",
        subtitle: "Please select a file smaller than 10MB.",
      });
      return false;
    }

    return true;
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (file, materialId, materialTitle, onSuccess) => {
    if (!file || !validateFile(file)) return;

    try {
      showLoading();
      
      await uploadAttachment(materialId, file);
      
      // Track activity but suppress immediate notification
      const streakResult = await trackActivityAndNotify(showToast, true);
      
      // Call success callback to refresh data
      if (onSuccess) {
        await onSuccess();
      }

      // Create combined message
      const baseTitle = "File uploaded successfully!";
      const baseSubtitle = `"${file.name}" has been attached to "${materialTitle}".`;
      
      const combinedMessage = createCombinedSuccessMessage(baseTitle, baseSubtitle, streakResult);
      
      // Show single combined toast
      showToast({
        variant: "success",
        title: combinedMessage.title,
        subtitle: combinedMessage.subtitle,
      });
    } catch (err) {
      console.error('Error uploading file:', err);
      showToast({
        variant: "error",
        title: "Upload failed",
        subtitle: err.response?.data?.error || "Failed to upload file. Please try again.",
      });
    } finally {
      hideLoading();
    }
  };

  const createFileSelectHandler = (materialId, materialTitle, onSuccess) => {
    return async (event) => {
      const file = event.target.files[0];
      if (file) {
        await handleFileUpload(file, materialId, materialTitle, onSuccess);
      }
      // Clear the file input
      event.target.value = '';
    };
  };

  const FileInput = ({ onFileSelect, accept = ".docx,.pptx,.txt,.pdf" }) => (
    <input
      type="file"
      ref={fileInputRef}
      onChange={onFileSelect}
      accept={accept}
      style={{ display: 'none' }}
    />
  );

  return {
    fileInputRef,
    triggerFileSelect,
    handleFileUpload,
    createFileSelectHandler,
    validateFile,
    FileInput
  };
};