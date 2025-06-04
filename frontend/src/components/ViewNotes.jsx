import { ArrowLeft, Edit, Globe, Lock, Search } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CreateNotes from './CreateNotes';

const ViewNotes = ({ material, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [showCreateNotes, setShowCreateNotes] = useState(false);

  const notes = [
    {
      id: 1,
      title: "Complete Markdown Guide",
      content: `# Markdown Guide

Welcome to this **comprehensive** *markdown* guide!
Use markdown to write rich text easily.

---

## Headings

# This is an H1 heading "#"
## This is an H2 heading  "##"
### This is an H3 heading  "###"

---

## Text Formatting

- **Bold text** is written with double asterisks or underscores.  
- *Italic text* is written with single asterisks or underscores.  
- ***Bold and italic combined*** works too!

---

## Lists

### Unordered list (-)

- Item 1  
- Item 2  
  - Nested item 2.1  
  - Nested item 2.2  

### Ordered list (numbers)

1. First item  
2. Second item  
   1. Nested ordered 2.1  
   2. Nested ordered 2.2  

---

## Task List []

- [x] Completed task  
- [ ] Incomplete task  

---

## Code

Inline code looks like \`console.log('Hello World');\`.

Code block example:

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
greet('Markdown');
\`\`\`

---

## Blockquotes ">"

> This is a blockquote.  

> It can span multiple lines.

---

## Horizontal Rule
3 dash (-) for line divider

---

That's it! Practice using **markdown** for your notes to keep them structured and easy to read.
`,
      updated: "a few minutes ago",
    }
  ];

  const [selectedNote] = useState(notes[0]);

  // Recursive function to highlight matched text inside ReactMarkdown content
  function highlightReactNodes(children, query) {
    if (!query) return children;

    if (typeof children === 'string') {
      const parts = children.split(new RegExp(`(${query})`, 'gi'));
      return parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="bg-yellow-200">{part}</span>
        ) : (
          part
        )
      );
    }

    if (Array.isArray(children)) {
      return children.map((child, i) => (
        <React.Fragment key={i}>{highlightReactNodes(child, query)}</React.Fragment>
      ));
    }

    if (React.isValidElement(children)) {
      return React.cloneElement(children, {
        children: highlightReactNodes(children.props.children, query),
      });
    }

    return children;
  }

  // Override ReactMarkdown's rendering for components with highlight and proper styles
  const components = {
    // Apply highlight recursively on text nodes inside paragraphs, headings, lists, etc.
    p({ node, children }) {
      return <p className="label-text">{highlightReactNodes(children, searchQuery)}</p>;
    },
    h1({ node, children }) {
      return <h1 className="text-4xl font-semibold my-4 label-text">{highlightReactNodes(children, searchQuery)}</h1>;
    },
    h2({ node, children }) {
      return <h2 className="text-2xl font-semibold my-3 label-text">{highlightReactNodes(children, searchQuery)}</h2>;
    },
    h3({ node, children }) {
      return <h3 className="text-xl font-semibold my-2 label-text">{highlightReactNodes(children, searchQuery)}</h3>;
    },
    li({ node, children }) {
      return <li className="label-text">{highlightReactNodes(children, searchQuery)}</li>;
    },
    blockquote({ node, children }) {
      return (
        <blockquote className="border-l-4 pl-4 italic text-gray-600 my-4 label-text">
          {highlightReactNodes(children, searchQuery)}
        </blockquote>
      );
    },
    code({ node, inline, className, children, ...props }) {
      return inline ? (
        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono label-text" {...props}>
          {children}
        </code>
      ) : (
        <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-gray-800 my-4" {...props}>
          <code className={`${className} label-text`}>{children}</code>
        </pre>
      );
    },
    // Also style unordered and ordered lists properly with padding
    ul({ node, children }) {
      return <ul className="list-disc pl-6 mb-4 label-text">{children}</ul>;
    },
    ol({ node, children }) {
      return <ol className="list-decimal pl-6 mb-4 label-text">{children}</ol>;
    },
    hr() {
      return <hr className="border-gray-300 my-6" />;
    },
  };

  const handleEdit = () => {
    setShowCreateNotes(true);
  };

  if (showCreateNotes) {
    return <CreateNotes material={material} onClose={() => setShowCreateNotes(false)} />;
  }

  return (
    <div className="flex flex-col bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50 rounded-xl h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex-none rounded-t-xl border-b border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-[90rem] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105"
                aria-label="Go back"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent label-text">
                  {material?.title || 'Notes'}
                </h1>
                <p className="text-sm text-gray-500 label-text">Study and review your notes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7BA7CC]/30 focus:border-[#1b81d4] transition-all duration-200 hover:border-gray-300 label-text"
                  aria-label="Search notes"
                />
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <div className="h-6 w-px bg-gray-200"></div>
              <button
                onClick={() => setIsPrivate(!isPrivate)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 hover:scale-105 ${
                  isPrivate 
                    ? 'bg-white border-gray-300 hover:bg-gray-50' 
                    : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                }`}
                title={isPrivate ? "Make Public" : "Make Private"}
              >
                {isPrivate ? (
                  <>
                    <Lock size={20} className="text-gray-600" />
                    <span className="text-gray-600 font-medium label-text">Private</span>
                  </>
                ) : (
                  <>
                    <Globe size={20} className="text-[#1b81d4]" />
                    <span className="text-[#1b81d4] font-medium label-text">Public</span>
                  </>
                )}
              </button>
              <div className="h-6 w-px bg-gray-200"></div>
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-all duration-200 hover:scale-105"
              >
                <Edit size={16} />
                <span className="label-text">Edit</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400/50">
        <div className="max-w-[90rem] mx-auto px-6 py-8 h-[calc(100vh-12rem)]">
          <div className="flex-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 p-8 h-[calc(100%-2rem)]">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent label-text">
                  {selectedNote.title}
                </h2>
                <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full label-text">
                  {selectedNote.updated}
                </span>
              </div>
              <div className="prose max-w-none prose-p:text-gray-700 overflow-y-auto h-[calc(100%-4rem)] pr-4 custom-scrollbar">
                <ReactMarkdown
                  components={components}
                  remarkPlugins={[remarkGfm]}
                >
                  {selectedNote.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewNotes;
