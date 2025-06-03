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
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, ArrowLeft, Bold, Globe, Heading1, Heading2, Heading3, Highlighter, Image as ImageIcon, Italic, Link as LinkIcon, Lock, MinusCircle, RotateCcw, RotateCw, Strikethrough, Underline as UnderlineIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const CreateNotes = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const MAX_TITLE_LENGTH = 50;

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
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  useEffect(() => {
    // Set initial content if needed (e.g., for editing existing notes)
    // editor?.commands.setContent(initialContent);
  }, [editor]);

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving note:', { title, content: editor.getHTML() });
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    if (newTitle.length <= MAX_TITLE_LENGTH) {
      setTitle(newTitle);
    }
  };

  const MenuBar = ({ editor }) => {
    if (!editor) {
      return null;
    }

    // Helper to apply text color
    const setTextColor = (color) => {
      editor.chain().focus().setColor(color).run();
    };

    return (
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-300 mb-4">
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBold().run();
          }}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-1 rounded ${editor.isActive('bold') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
          title="Bold"
        >
          <Bold size={18} />
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleItalic().run();
          }}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-1 rounded ${editor.isActive('italic') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
          title="Italic"
        >
          <Italic size={18} />
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleUnderline().run();
          }}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          className={`p-1 rounded ${editor.isActive('underline') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
          title="Underline"
        >
          <UnderlineIcon size={18} />
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleStrike().run();
          }}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`p-1 rounded ${editor.isActive('strike') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
          title="Strikethrough"
        >
          <Strikethrough size={18} />
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleHighlight({ color: 'yellow' }).run();
          }}
          className={`p-1 rounded ${editor.isActive('highlight') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
          title="Highlight"
        >
          <Highlighter size={18} />
        </button>
        
        {/* Alignment */}
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().setTextAlign('left').run();
          }}
          className={`p-1 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
          title="Align Left"
        >
          <AlignLeft size={18} />
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().setTextAlign('center').run();
          }}
          className={`p-1 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
          title="Align Center"
        >
          <AlignCenter size={18} />
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().setTextAlign('right').run();
          }}
          className={`p-1 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
          title="Align Right"
        >
          <AlignRight size={18} />
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().setTextAlign('justify').run();
          }}
          className={`p-1 rounded ${editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
          title="Align Justify"
        >
          <AlignJustify size={18} />
        </button>
        {/* Hierarchy/Headings */}
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleHeading({ level: 1 }).run();
          }}
          className={`p-1 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
          title="Heading 1"
        >
          <Heading1 size={18} />
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleHeading({ level: 2 }).run();
          }}
          className={`p-1 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
          title="Heading 2"
        >
          <Heading2 size={18} />
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleHeading({ level: 3 }).run();
          }}
          className={`p-1 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
          title="Heading 3"
        >
          <Heading3 size={18} />
        </button>
        {/* Link and Image */}
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().setLink({ href: '' }).run();
          }}
          className={`p-1 rounded ${editor.isActive('link') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
          title="Link"
        >
          <LinkIcon size={18} />
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().setImage({ src: '' }).run();
          }}
          className={`p-1 rounded hover:bg-gray-200`}
          title="Image"
        >
          <ImageIcon size={18} />
        </button>

        <button 
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().undo().run();
          }} 
          disabled={!editor.can().chain().focus().undo().run()} 
          className="p-1 rounded hover:bg-gray-200" 
          title="Undo"
        >
          <RotateCcw size={18} />
        </button>
        <button 
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().redo().run();
          }} 
          disabled={!editor.can().chain().focus().redo().run()} 
          className="p-1 rounded hover:bg-gray-200" 
          title="Redo"
        >
          <RotateCw size={18} />
        </button>

        {/* Color buttons */}
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            setTextColor('#F85B5A');
          }}
          className={`w-6 h-6 rounded-full bg-[#F85B5A] border border-gray-300 ${editor.isActive('textStyle', { color: '#F85B5A' }) ? 'ring-2 ring-blue-500' : ''}`}
          title="Set Text Color to Red"
        />
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            setTextColor('#7BA7CC');
          }}
          className={`w-6 h-6 rounded-full bg-[#7BA7CC] border border-gray-300 ${editor.isActive('textStyle', { color: '#7BA7CC' }) ? 'ring-2 ring-blue-500' : ''}`}
          title="Set Text Color to Blue"
        />
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().unsetColor().run();
          }}
          disabled={!editor.isActive('textStyle')}
          className={`w-6 h-6 rounded-full bg-gray-300 border border-gray-300 flex items-center justify-center ${!editor.isActive('textStyle') ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-400'}`}
          title="Unset Text Color"
        >
          <MinusCircle size={12} className="text-gray-600" />
        </button>

      </div>
    );
  };

  return (
    <div className="letter-no-lines">
      <div className="max-w-[90rem] mx-auto px-10 py-3">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full mr-4"
            >
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-3xl font-semibold label-text">
              Create Notes
            </h2>
          </div>
          <button
            onClick={() => setIsPrivate(!isPrivate)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
              isPrivate 
                ? 'bg-white border-gray-300 hover:bg-gray-50' 
                : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
            }`}
            title={isPrivate ? "Make Public" : "Make Private"}
          >
            {isPrivate ? (
              <>
                <Lock size={20} className="text-gray-600" />
                <span className="text-gray-600 font-medium">Private</span>
              </>
            ) : (
              <>
                <Globe size={20} className="text-[#1b81d4]" />
                <span className="text-[#1b81d4] font-medium">Public</span>
              </>
            )}
          </button>
        </div>

        {/* Title Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Add a title"
            value={title}
            onChange={handleTitleChange}
            className="label-text w-full p-4 text-3xl font-semibold bg-transparent border-b outline-none placeholder-gray-500 text-gray-900 mb-4"
          />
          <div className="absolute right-0 top-4 text-sm text-gray-500">
            {title.length}/{MAX_TITLE_LENGTH}
          </div>
        </div>

        {/* TipTap Editor for Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <MenuBar editor={editor} />
          <div className="relative">
            <EditorContent 
              editor={editor} 
              className="min-h-[calc(100vh-300px)] p-12 rounded-lg bg-white outline-none prose max-w-none
                [&_.ProseMirror]:min-h-[calc(100vh-300px)]
                [&_.ProseMirror]:outline-none
                [&_.ProseMirror]:focus:ring-0
                [&_.ProseMirror]:focus:border-0
                [&_.ProseMirror]:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBvcGFjaXR5PSIwLjA1Ij48cGF0aCBkPSJNMSAxMGgxOE0xMCAxdjE4IiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMSIvPjwvZz48L3N2Zz4=')]
                [&_.ProseMirror]:bg-[length:20px_20px]
                [&_.ProseMirror_strong]:font-extrabold
                [&_.ProseMirror_strong]:tracking-wide"
            />
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-4"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="exam-button-mini"
            data-hover="Save Changes"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateNotes; 