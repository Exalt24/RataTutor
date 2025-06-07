// Optional performance improvements - only apply if you want consistency

import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { AlertCircle, AlignCenter, AlignLeft, AlignRight, ArrowLeft, Bold, FileText, Heading1, Heading2, Heading3, Highlighter, Italic, MinusCircle, RotateCcw, RotateCw, Strikethrough, Underline as UnderlineIcon } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLoading } from '../components/Loading/LoadingContext';
import { useToast } from '../components/Toast/ToastContext';
import ValidatedInput from '../components/ValidatedInput';
import { createNote, updateNote } from '../services/apiService';
import { createCombinedSuccessMessage, trackActivityAndNotify } from '../utils/streakNotifications';

// ✅ NEW: Memoized components for better performance
const ErrorBanner = React.memo(({ errors }) => {
  if (errors.length === 0) return null;
  
  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start space-x-2">
        <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-red-700">
          {errors.map((error, idx) => (
            <p key={idx}>{error}</p>
          ))}
        </div>
      </div>
    </div>
  );
});

ErrorBanner.displayName = 'ErrorBanner';

const ContentStats = React.memo(({ contentValidation, validities }) => (
  <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-8">
    <h3 className="text-lg font-medium label-text mb-3">Summary</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-600">{contentValidation.length}</div>
        <div className="text-gray-600">Characters</div>
      </div>
      <div className="text-center">
        <div className={`text-2xl font-bold ${contentValidation.isValid ? 'text-green-600' : 'text-gray-500'}`}>
          {contentValidation.isValid ? '✓' : '✗'}
        </div>
        <div className="text-gray-600">Content Valid</div>
      </div>
      <div className="text-center">
        <div className={`text-2xl font-bold ${validities.title ? 'text-green-600' : 'text-gray-500'}`}>
          {validities.title ? '✓' : '✗'}
        </div>
        <div className="text-gray-600">Title Valid</div>
      </div>
    </div>
    {contentValidation.isValid && validities.title && (
      <p className="text-sm text-purple-700 mt-4">
        ✅ Your note is ready to be saved.
      </p>
    )}
    {(!contentValidation.isValid || !validities.title) && (
      <p className="text-sm text-amber-700 mt-2">
        ⚠️ Complete all required fields to save your note.
      </p>
    )}
  </div>
));

ContentStats.displayName = 'ContentStats';

// ✅ NEW: Memoized MenuBar component
const MenuBar = React.memo(({ editor, submitting }) => {
  if (!editor) {
    return null;
  }

  const setTextColor = useCallback((color) => {
    editor.chain().focus().setColor(color).run();
  }, [editor]);

  const handleAction = useCallback((action) => (e) => {
    e.preventDefault();
    action();
  }, []);

  const menuButtons = useMemo(() => [
    {
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      canExecute: editor.can().chain().focus().toggleBold().run(),
      icon: Bold,
      title: 'Bold'
    },
    {
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      canExecute: editor.can().chain().focus().toggleItalic().run(),
      icon: Italic,
      title: 'Italic'
    },
    {
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline'),
      canExecute: editor.can().chain().focus().toggleUnderline().run(),
      icon: UnderlineIcon,
      title: 'Underline'
    },
    {
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive('strike'),
      canExecute: editor.can().chain().focus().toggleStrike().run(),
      icon: Strikethrough,
      title: 'Strikethrough'
    },
    {
      action: () => editor.chain().focus().toggleHighlight({ color: 'yellow' }).run(),
      isActive: editor.isActive('highlight'),
      canExecute: true,
      icon: Highlighter,
      title: 'Highlight'
    }
  ], [editor]);

  const alignmentButtons = useMemo(() => [
    {
      action: () => editor.chain().focus().setTextAlign('left').run(),
      isActive: editor.isActive({ textAlign: 'left' }),
      icon: AlignLeft,
      title: 'Align Left'
    },
    {
      action: () => editor.chain().focus().setTextAlign('center').run(),
      isActive: editor.isActive({ textAlign: 'center' }),
      icon: AlignCenter,
      title: 'Align Center'
    },
    {
      action: () => editor.chain().focus().setTextAlign('right').run(),
      isActive: editor.isActive({ textAlign: 'right' }),
      icon: AlignRight,
      title: 'Align Right'
    }
  ], [editor]);

  const headingButtons = useMemo(() => [
    {
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive('heading', { level: 1 }),
      icon: Heading1,
      title: 'Heading 1'
    },
    {
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
      icon: Heading2,
      title: 'Heading 2'
    },
    {
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive('heading', { level: 3 }),
      icon: Heading3,
      title: 'Heading 3'
    }
  ], [editor]);

  const colorButtons = useMemo(() => [
    { color: '#F85B5A', title: 'Set Text Color to Red' },
    { color: '#7BA7CC', title: 'Set Text Color to Blue' },
    { color: '#4ECDC4', title: 'Set Text Color to Teal' }
  ], []);

  return (
    <div className="flex flex-wrap gap-0.5 sm:gap-1 p-1.5 sm:p-2 md:p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg min-w-[320px] sm:min-w-[600px]">
      {/* Format buttons */}
      {menuButtons.map(({ action, isActive, canExecute, icon: Icon, title }) => (
        <button
          key={title}
          onMouseDown={handleAction(action)}
          disabled={!canExecute || submitting}
          className={`p-1 sm:p-1.5 md:p-2 rounded transition-colors ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'} ${(!canExecute || submitting) ? 'opacity-50' : ''}`}
          title={title}
        >
          <Icon size={14} className="sm:w-4 sm:h-4" />
        </button>
      ))}
      
      {/* Separator */}
      <div className="w-px h-5 sm:h-6 bg-gray-300 mx-0.5 sm:mx-1"></div>
      
      {/* Alignment buttons */}
      {alignmentButtons.map(({ action, isActive, icon: Icon, title }) => (
        <button
          key={title}
          onMouseDown={handleAction(action)}
          disabled={submitting}
          className={`p-1 sm:p-1.5 md:p-2 rounded transition-colors ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'}`}
          title={title}
        >
          <Icon size={14} className="sm:w-4 sm:h-4" />
        </button>
      ))}
      
      {/* Separator */}
      <div className="w-px h-5 sm:h-6 bg-gray-300 mx-0.5 sm:mx-1"></div>
      
      {/* Heading buttons */}
      {headingButtons.map(({ action, isActive, icon: Icon, title }) => (
        <button
          key={title}
          onMouseDown={handleAction(action)}
          disabled={submitting}
          className={`p-1 sm:p-1.5 md:p-2 rounded transition-colors ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'}`}
          title={title}
        >
          <Icon size={14} className="sm:w-4 sm:h-4" />
        </button>
      ))}
      
      {/* Separator */}
      <div className="w-px h-5 sm:h-6 bg-gray-300 mx-0.5 sm:mx-1"></div>
      
      {/* Undo/Redo */}
      <button 
        onMouseDown={handleAction(() => editor.chain().focus().undo().run())} 
        disabled={!editor.can().chain().focus().undo().run() || submitting} 
        className="p-1 sm:p-1.5 md:p-2 rounded transition-colors hover:bg-gray-200 disabled:opacity-50" 
        title="Undo"
      >
        <RotateCcw size={14} className="sm:w-4 sm:h-4" />
      </button>
      <button 
        onMouseDown={handleAction(() => editor.chain().focus().redo().run())} 
        disabled={!editor.can().chain().focus().redo().run() || submitting} 
        className="p-1 sm:p-1.5 md:p-2 rounded transition-colors hover:bg-gray-200 disabled:opacity-50" 
        title="Redo"
      >
        <RotateCw size={14} className="sm:w-4 sm:h-4" />
      </button>

      {/* Separator */}
      <div className="w-px h-5 sm:h-6 bg-gray-300 mx-0.5 sm:mx-1"></div>

      {/* Color buttons */}
      {colorButtons.map(({ color, title }) => (
        <button
          key={color}
          onMouseDown={handleAction(() => setTextColor(color))}
          disabled={submitting}
          className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full border border-gray-300 ${editor.isActive('textStyle', { color }) ? 'ring-2 ring-blue-500' : ''}`}
          style={{ backgroundColor: color }}
          title={title}
        />
      ))}
      <button
        onMouseDown={handleAction(() => editor.chain().focus().unsetColor().run())}
        disabled={!editor.isActive('textStyle') || submitting}
        className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-gray-300 border border-gray-300 flex items-center justify-center ${!editor.isActive('textStyle') ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-400'}`}
        title="Unset Text Color"
      >
        <MinusCircle size={8} className="sm:w-3 sm:h-3 text-gray-600" />
      </button>
    </div>
  );
});

MenuBar.displayName = 'MenuBar';

// ✅ MAIN: Optimized CreateNotes component
const CreateNotes = React.memo(({ 
  material, 
  note = null, 
  onClose, 
  onSuccess, 
  options = {} 
}) => {
  const { showLoading, hideLoading } = useLoading();
  const { showToast } = useToast();

  // Extract success callback from either direct prop or options
  const successCallback = useMemo(() => 
    options.onSuccess || onSuccess, [options.onSuccess, onSuccess]
  );

  // Edit mode detection - match CreateFlashcards pattern exactly
  const isEditMode = useMemo(() => {
    return options.editMode ?? !!note;
  }, [options.editMode, note]);

  // Edit content calculation - match CreateFlashcards pattern exactly
  const editContent = useMemo(() => {
    return options.editContent || note;
  }, [options.editContent, note]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const [bannerErrors, setBannerErrors] = useState([]);
  const [validities, setValidities] = useState({
    title: false,
    description: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // TipTap Editor setup
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Placeholder.configure({
        placeholder: 'Start writing your notes here...',
        emptyEditorClass: 'cursor-text before:content-[attr(data-placeholder)] before:absolute before:opacity-50 before:pointer-events-none',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose max-w-none min-h-[400px] p-6 focus:outline-none',
      },
    },
  });

  // Initialize form data
  useEffect(() => {
    if (isEditMode && editContent) {
      // Edit mode: populate with existing data
      setFormData({
        title: editContent.title || '',
        description: editContent.description || '',
      });

      // Set editor content
      if (editor && editContent.content) {
        editor.commands.setContent(editContent.content);
      }

      // Set initial validity for pre-filled title
      setValidities(prev => ({
        ...prev,
        title: !!(editContent.title && editContent.title.trim()),
      }));
    } else if (material?.title) {
      // Create mode: auto-suggest title based on material
      setFormData(prev => ({
        ...prev,
        title: `${material.title} - Notes`,
      }));
      setValidities(prev => ({
        ...prev,
        title: true,
      }));
    }
  }, [editContent, material?.title, isEditMode, editor]);

  // ✅ OPTIMIZED: Memoized content validation
  const contentValidation = useMemo(() => {
    const editorContent = editor?.getHTML() || '';
    const textContent = editor?.getText() || '';
    const isEmpty = !textContent.trim();
    const isValid = !isEmpty && textContent.trim().length >= 10;

    return {
      isEmpty,
      isValid,
      length: textContent.length,
      content: editorContent
    };
  }, [editor?.getHTML(), editor?.getText()]);

  // ✅ OPTIMIZED: Form handlers with useCallback
  const handleTitleChange = useCallback((e) => {
    setFormData(prev => ({
      ...prev,
      title: e.target.value
    }));
  }, []);

  const handleDescriptionChange = useCallback((e) => {
    setFormData(prev => ({
      ...prev,
      description: e.target.value
    }));
  }, []);

  const handleTitleValidityChange = useCallback((field, isValid) => {
    setValidities(prev => ({
      ...prev,
      title: isValid
    }));
  }, []);

  const handleDescriptionValidityChange = useCallback((field, isValid) => {
    setValidities(prev => ({
      ...prev,
      description: isValid
    }));
  }, []);

  // Content validation
  const validateContent = useCallback(() => {
    const errors = [];
    
    if (contentValidation.isEmpty) {
      errors.push('Note content cannot be empty.');
    } else if (!contentValidation.isValid) {
      errors.push('Note content must be at least 10 characters long.');
    }

    return errors;
  }, [contentValidation.isEmpty, contentValidation.isValid]);

  // Save handler - keep your existing logic, it's already perfect!
  const handleSave = useCallback(async () => {
    setBannerErrors([]);
    
    const contentErrors = validateContent();
    if (contentErrors.length > 0) {
      setBannerErrors(contentErrors);
      return;
    }

    setSubmitting(true);
    showLoading();

    try {
      const noteData = {
        material: material?.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        content: contentValidation.content,
        public: false
      };

      let response;
      if (isEditMode) {
        response = await updateNote(editContent.id, noteData);
      } else {
        response = await createNote(noteData);
      }

      const streakResult = await trackActivityAndNotify(showToast, true);
      
      const baseTitle = `Note ${isEditMode ? 'updated' : 'created'} successfully!`;
      const baseSubtitle = `${isEditMode ? 'Updated' : 'Created'} "${formData.title}" note.`;
      
      const combinedMessage = createCombinedSuccessMessage(baseTitle, baseSubtitle, streakResult);
      
      showToast({
        variant: "success",
        title: combinedMessage.title,
        subtitle: combinedMessage.subtitle,
      });

      onClose();

      if (successCallback) {
        try {
          await successCallback(response.data);
        } catch (callbackError) {
          console.error('Error in success callback:', callbackError);
        }
      }

    } catch (err) {
      console.error('API Error creating/updating note:', err);
      
      const data = err.response?.data || {};
      const msgs = [];

      Object.entries(data).forEach(([key, val]) => {
        if (Array.isArray(val)) {
          val.forEach((m) => msgs.push(typeof m === 'string' ? m : JSON.stringify(m)));
        } else if (typeof val === "string") {
          msgs.push(val);
        }
      });

      if (msgs.length === 0) {
        msgs.push(`Failed to ${isEditMode ? 'update' : 'create'} note. Please try again.`);
      }

      setBannerErrors(msgs);

    } finally {
      setSubmitting(false);
      hideLoading();
    }
  }, [formData, contentValidation, isEditMode, editContent?.id, material?.id, onClose, validateContent, showLoading, hideLoading, showToast, successCallback]);

  // ✅ OPTIMIZED: Memoized button state
  const isDisabled = useMemo(() => {
    return !validities.title || !contentValidation.isValid || submitting;
  }, [validities.title, contentValidation.isValid, submitting]);

  const buttonText = useMemo(() => {
    if (submitting) {
      return isEditMode ? "Updating..." : "Creating...";
    }
    return isEditMode ? "Update Note" : "Create Note";
  }, [submitting, isEditMode]);

  const buttonHover = useMemo(() => {
    if (submitting) {
      return isEditMode ? "Updating..." : "Creating...";
    } else if (!validities.title) {
      return "Add a title to save";
    } else if (!contentValidation.isValid) {
      return "Add content to save";
    } else {
      return isEditMode ? "Update Note" : "Create Note";
    }
  }, [submitting, isEditMode, validities.title, contentValidation.isValid]);

  return (
    <div className="letter-no-lines">
      <div className="max-w-[90rem] mx-auto px-2 sm:px-4 md:px-6 lg:px-10 py-2 sm:py-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-8">
          <div className="flex items-center mb-4 sm:mb-0">
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full mr-2 sm:mr-4"
              disabled={submitting}
            >
              <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold label-text break-words">
                {isEditMode ? 'Edit Note' : 'Create Note'}
              </h2>
              {material && (
                <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">
                  for "{material.title}"
                  {isEditMode && (
                    <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-100 text-purple-700 rounded-full text-xs inline-block mt-1 sm:mt-0">
                      Editing: {editContent?.title}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Error Banner */}
        <ErrorBanner errors={bannerErrors} />

        {/* Details Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 md:p-6 lg:p-8 shadow-sm hover:shadow-md transition-all mb-4 sm:mb-6 md:mb-8">
          <div className="flex justify-between items-center mb-3 sm:mb-4 md:mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg md:text-xl font-medium label-text">Details</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            <ValidatedInput
              label="Title"
              name="noteTitle"
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              required={true}
              onValidityChange={handleTitleValidityChange}
              disabled={submitting}
              variant='profile'
              placeholder="Enter a descriptive title for your note"
            />

            <ValidatedInput
              label="Description (Optional)"
              name="noteDescription"
              type="textarea"
              value={formData.description}
              onChange={handleDescriptionChange}
              required={false}
              onValidityChange={handleDescriptionValidityChange}
              rows={3}
              disabled={submitting}
              variant='profile'
              placeholder="Add a brief description for your note (optional)"
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all mb-4 sm:mb-6 md:mb-8">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8 pb-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 md:mb-6">
              <div className="flex items-center gap-2 mb-2 sm:mb-0">
                <h3 className="text-base sm:text-lg md:text-xl font-medium label-text">Content</h3>
                <div className="flex items-center gap-1 sm:gap-2">
                  <FileText size={16} className="sm:w-5 sm:h-5 text-purple-500" />
                  <span className="text-xs sm:text-sm text-gray-500">
                    {contentValidation.length} characters
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs ${
                  contentValidation.isValid 
                    ? 'bg-green-100 text-green-700' 
                    : contentValidation.isEmpty
                      ? 'bg-gray-100 text-gray-600'
                      : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {contentValidation.isValid 
                    ? 'Valid' 
                    : contentValidation.isEmpty
                      ? 'Empty'
                      : 'Too Short'
                  }
                </span>
              </div>
            </div>
          </div>
          
          <div className="mx-1 sm:mx-2 md:mx-4 lg:mx-8 mb-3 sm:mb-4 md:mb-6 lg:mb-8 border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto -mx-1 sm:mx-0">
              <MenuBar editor={editor} submitting={submitting} />
            </div>
            <div className="relative h-[calc(100vh-30rem)] overflow-hidden">
              <div className="absolute inset-0 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-purple-300/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-purple-400/50">
                <div className="overflow-x-auto">
                  <EditorContent 
                    editor={editor} 
                    className="min-h-[250px] sm:min-h-[300px] md:min-h-[400px] focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500 transition-all prose-sm sm:prose-base max-w-none px-2 sm:px-4 whitespace-pre-wrap break-words"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <ContentStats contentValidation={contentValidation} validities={validities} />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end mt-4 sm:mt-6 md:mt-8 gap-2 sm:gap-4">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 text-gray-600 hover:text-gray-800 order-2 sm:order-1 text-sm sm:text-base"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`exam-button-mini w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} order-1 sm:order-2 text-sm sm:text-base`}
            data-hover={buttonHover}
            disabled={isDisabled}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
});

CreateNotes.displayName = 'CreateNotes';

export default CreateNotes;