import { BookOpen, Download, FileText, Globe, HelpCircle, Lock } from 'lucide-react'
import React from 'react'

const MaterialContent = ({ 
  material,
  isPublic,
  onVisibilityToggle,
  onExport,
  onCreateFlashcards,
  onCreateNotes,
  onCreateQuiz,
  onBack
}) => {
  return (
    <div className="h-full flex flex-col bg-gray-50 rounded-xl">
      {/* Header - Fixed */}
      <div className="flex-none border-b border-gray-200 bg-white shadow-sm rounded-t-xl">
        <div className="max-w-[90rem] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">{material.title}</h1>
                  <p className="text-sm text-gray-500 mt-1">{material.description}</p>
                </div>
                {isPublic ? (
                  <button
                    onClick={() => onVisibilityToggle(material.title)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    title="Make Private"
                  >
                    <Globe size={20} className="text-[#7BA7CC]" />
                  </button>
                ) : (
                  <button
                    onClick={() => onVisibilityToggle(material.title)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    title="Make Public"
                  >
                    <Lock size={20} className="text-[#7BA7CC]" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onExport(material.title)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                title="Export Material"
              >
                <Download size={20} className="text-gray-600" />
              </button>
              <div className="h-6 w-px bg-gray-200"></div>
              <button
                className="exam-button-mini py-2 px-4 flex items-center gap-2 hover:bg-[#7BA7CC]/90 transition-colors rounded-xl"
                onClick={() => onCreateFlashcards(material)}
                data-hover="Create Flashcards"
              >
                <BookOpen size={16} />
                Create Flashcards
              </button>
              <button
                className="exam-button-mini py-2 px-4 flex items-center gap-2 hover:bg-[#7BA7CC]/90 transition-colors rounded-xl"
                onClick={() => onCreateNotes(material)}
                data-hover="Create Notes"
              >
                <FileText size={16} />
                Create Notes
              </button>
              <button
                className="exam-button-mini py-2 px-4 flex items-center gap-2 hover:bg-[#7BA7CC]/90 transition-colors rounded-xl"
                onClick={() => onCreateQuiz(material)}
                data-hover="Create Quiz"
              >
                <HelpCircle size={16} />
                Create Quiz
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[90rem] mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Flashcards Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#FFB3BA] flex items-center justify-center">
                    <BookOpen size={20} className="text-[#7D1F1F]" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Flashcards</h2>
                </div>
                {material.content?.flashcards && material.content.flashcards.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {material.content.flashcards.map((flashcard, index) => (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{flashcard.title}</h3>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-xl">{flashcard.count} cards</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Last studied: 2d ago</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <BookOpen size={24} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600">No flashcards created yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#BAFFC9] flex items-center justify-center">
                    <FileText size={20} className="text-[#1F7D2F]" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Notes</h2>
                </div>
                {material.content?.notes && material.content.notes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {material.content.notes.map((note, index) => (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{note.title}</h3>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-xl">{note.updated}</span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {note.preview || "No preview available"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <FileText size={24} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600">No notes created yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quizzes Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#BAE1FF] flex items-center justify-center">
                    <HelpCircle size={20} className="text-[#1F4B7D]" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Quizzes</h2>
                </div>
                {material.content?.quizzes && material.content.quizzes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {material.content.quizzes.map((quiz, index) => (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{quiz.title}</h3>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-xl">{quiz.questions} questions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Last taken: 5d ago</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <HelpCircle size={24} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600">No quizzes created yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MaterialContent 