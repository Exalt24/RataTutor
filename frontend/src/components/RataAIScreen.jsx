import { BookOpen, ChevronDown, ChevronRight, FileText, MoreHorizontal, Search, Send, Upload, X } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

const RataAIScreen = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m Rata AI, your learning companion. How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [expandedFolders, setExpandedFolders] = useState({})
  const [selectedFile, setSelectedFile] = useState(null)
  const [isPanelVisible, setIsPanelVisible] = useState(true)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [input])

  const files = [
    {
      name: 'Exam ni eli jang',
      flashcards: [
        { title: 'Algebra Formulas', created: '2h ago' },
        { title: 'Geometry Theorems', created: '1d ago' }
      ],
      notes: [
        { title: 'Calculus Summary', created: '3h ago' },
        { title: 'Statistics Notes', created: '5h ago' }
      ]
    },
    {
      name: 'Intro to Programming',
      flashcards: [
        { title: 'World War II Dates', created: '1d ago' },
        { title: 'Ancient Civilizations', created: '2d ago' }
      ],
      notes: [
        { title: 'Renaissance Period', created: '4h ago' },
        { title: 'Industrial Revolution', created: '6h ago' }
      ]
    }
  ]

  const filteredFiles = files.map(file => ({
    ...file,
    flashcards: file.flashcards.filter(card => 
      card.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    notes: file.notes.filter(note => 
      note.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.flashcards.length > 0 ||
    file.notes.length > 0
  )

  const handleSend = () => {
    if (!input.trim()) return
    setMessages([...messages, { role: 'user', content: input }])
    setInput('')
    // TODO: Add API call to get AI response
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleFolder = (fileIndex, folderType) => {
    setExpandedFolders(prev => ({
      ...prev,
      [`${fileIndex}-${folderType}`]: !prev[`${fileIndex}-${folderType}`]
    }))
  }

  const handleFileUpload = (event) => {
    const files = event.target.files
    if (files.length > 0) {
      console.log('Selected file:', files[0].name)
      // Here you would typically handle the file upload, e.g., send to a backend
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current.click()
  }

  return (
    <div className="flex h-full">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Toggle Button */}
        <div className="flex justify-end p-2">
          <button
            onClick={() => setIsPanelVisible(!isPanelVisible)}
            className="bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors"
          >
            <MoreHorizontal size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 break-words ${
                  message.role === 'user'
                    ? 'text-white'
                    : 'text-gray-800'
                }`}
                style={{ 
                  backgroundColor: message.role === 'user' ? 'var(--pastel-blue)' : 'white',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                }}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white/50">
          <div className="flex items-center gap-2">
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Upload file"
              onClick={triggerFileUpload}
              style={{ backgroundColor: 'var(--pastel-green)' }}
            >
              <Upload size={20} className="text-white" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full p-2 pr-12 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-400 resize-none min-h-[40px] max-h-[120px]"
                rows={1}
                style={{ 
                  overflowY: 'auto',
                  transition: 'height 0.1s ease-out'
                }}
              />
            </div>
            <button
              onClick={handleSend}
              className="p-2 text-white rounded-full hover:bg-blue-600 transition-colors"
              title="Send message"
              style={{ backgroundColor: 'var(--pastel-blue)' }}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Files Panel */}
      {isPanelVisible && (
        <div className="w-80 bg-white/50 border-l border-gray-200 flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="label-text text-lg font-semibold">Materials</h2>
              <div className="flex items-center">
                {!isSearchExpanded ? (
                  <button
                    onClick={() => setIsSearchExpanded(true)}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <Search size={16} className="text-gray-600" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search files..."
                        className="label-text w-48 px-3 py-1 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue-400 transition-all duration-300 ease-in-out"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          setIsSearchExpanded(false)
                          setSearchQuery('')
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4 transition-all duration-300 ease-in-out">
              {filteredFiles.map((file, fileIndex) => (
                <div 
                  key={fileIndex} 
                  className="exam-card exam-card--alt p-3 transition-all duration-300 ease-in-out"
                >
                  <h3 className="font-medium mb-2">{file.name}</h3>
                  
                  {/* Flashcards Folder */}
                  <div className="mb-2">
                    <button
                      onClick={() => toggleFolder(fileIndex, 'flashcards')}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                    >
                      {expandedFolders[`${fileIndex}-flashcards`] ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                      <BookOpen size={16} />
                      <span>Flashcards</span>
                    </button>
                    {expandedFolders[`${fileIndex}-flashcards`] && (
                      <div className="ml-6 mt-2 space-y-2">
                        {file.flashcards.map((card, cardIndex) => (
                          <div
                            key={cardIndex}
                            className="text-xs p-2 hover:bg-gray-100 rounded cursor-pointer"
                            onClick={() => setSelectedFile(card)}
                          >
                            <div className="font-medium">{card.title}</div>
                            <div className="text-gray-500 text-[10px]">Created {card.created}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Notes Folder */}
                  <div>
                    <button
                      onClick={() => toggleFolder(fileIndex, 'notes')}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                    >
                      {expandedFolders[`${fileIndex}-notes`] ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                      <FileText size={16} />
                      <span>Notes</span>
                    </button>
                    {expandedFolders[`${fileIndex}-notes`] && (
                      <div className="ml-6 mt-2 space-y-2">
                        {file.notes.map((note, noteIndex) => (
                          <div
                            key={noteIndex}
                            className="text-xs p-2 hover:bg-gray-100 rounded cursor-pointer"
                            onClick={() => setSelectedFile(note)}
                          >
                            <div className="font-medium">{note.title}</div>
                            <div className="text-gray-500 text-[10px]">Created {note.created}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RataAIScreen 