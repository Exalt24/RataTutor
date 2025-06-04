import { ArrowLeft, BookOpen, Download, FileQuestion, FileText, HelpCircle, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import MaterialFile from './MaterialFile'
import ViewFlashcards from './ViewFlashcards'
import ViewNotes from './ViewNotes'
import ViewQuiz from './ViewQuiz'

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-12">
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl mb-6 shadow-lg">
      <FileQuestion size={64} className="text-[#1b81d4]" />
    </div>
    <h3 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
      No Content Available
    </h3>
    <p className="text-gray-600 text-center max-w-md leading-relaxed">
      This material doesn't have any content yet. Use the buttons above to create flashcards, notes, or a quiz.
    </p>
  </div>
)

const SectionHeader = ({ icon: Icon, title, count }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <div className="p-2 bg-blue-50 rounded-lg">
        <Icon size={20} className="text-[#1b81d4]" />
      </div>
      <h2 className="text-xl font-medium bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
        {title}
      </h2>
    </div>
    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
      {count} {count === 1 ? 'item' : 'items'}
    </span>
  </div>
)

const SectionEmptyState = ({ title }) => (
  <div className="flex flex-col items-center justify-center py-8 bg-white/50 rounded-xl border border-dashed border-gray-200">
    <div className="bg-blue-50 p-4 rounded-full mb-3">
      <FileQuestion size={24} className="text-[#1b81d4]" />
    </div>
    <h3 className="text-base font-medium text-gray-900 mb-1">No {title} Yet</h3>
    <p className="text-sm text-gray-500 text-center">
      Use the buttons above to create your first {title.toLowerCase()}
    </p>
  </div>
)

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
  const hasContent = material?.content?.length > 0
  const [showViewFlashcards, setShowViewFlashcards] = useState(false)
  const [showViewQuiz, setShowViewQuiz] = useState(false)
  const [showViewNotes, setShowViewNotes] = useState(false)
  const [selectedContent, setSelectedContent] = useState(null)

  // Sample content with flashcards
  const [items, setItems] = useState([
    // Flashcards
    {
      id: '1',
      title: "Introduction to Calculus",
      author: "John Doe",
      description: "A comprehensive guide covering limits, derivatives, and integrals with practical examples and exercises.",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ["Flashcard"],
      flashcards: [
        { front: "What is a derivative?", back: "The rate of change of a function with respect to its variable" },
        { front: "What is an integral?", back: "The area under a curve or the accumulation of a quantity" },
        { front: "What is a limit?", back: "The value that a function approaches as the input approaches some value" }
      ]
    },
    {
      id: '2',
      title: "Advanced Calculus",
      author: "John Doe",
      description: "Advanced topics in calculus including multivariable calculus and vector calculus.",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ["Flashcard"],
      flashcards: [
        { front: "What is a partial derivative?", back: "The derivative of a function with respect to one variable while holding others constant" },
        { front: "What is a gradient?", back: "A vector of partial derivatives representing the direction of steepest ascent" }
      ]
    },
    {
      id: '3',
      title: "Calculus Applications",
      author: "John Doe",
      description: "Real-world applications of calculus in physics, engineering, and economics.",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ["Flashcard"],
      flashcards: [
        { front: "How is calculus used in physics?", back: "To describe motion, forces, and rates of change in physical systems" },
        { front: "What is optimization in calculus?", back: "Finding maximum or minimum values of functions" }
      ]
    },
    {
      id: '4',
      title: "Calculus Practice Problems",
      author: "John Doe",
      description: "Collection of practice problems and solutions for calculus students.",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ["Flashcard"],
      flashcards: [
        { front: "Solve: ∫x²dx", back: "x³/3 + C" },
        { front: "Find the derivative of sin(x)", back: "cos(x)" }
      ]
    },
    {
      id: '13',
      title: "Calculus Series",
      author: "John Doe",
      description: "Understanding infinite series and their convergence.",
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ["Flashcard"],
      flashcards: [
        { front: "What is a power series?", back: "An infinite sum of terms with increasing powers of a variable" },
        { front: "What is the radius of convergence?", back: "The distance from the center where a power series converges" }
      ]
    },
    {
      id: '14',
      title: "Calculus Integration Techniques",
      author: "John Doe",
      description: "Various methods for solving integrals.",
      createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ["Flashcard"],
      flashcards: [
        { front: "What is integration by parts?", back: "A technique based on the product rule for derivatives" },
        { front: "What is partial fraction decomposition?", back: "Breaking down complex fractions into simpler ones" }
      ]
    },
    // Notes
    {
      id: '5',
      title: "Linear Algebra Fundamentals",
      author: "Jane Smith",
      description: "An introduction to vectors, matrices, and linear transformations.",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ["Notes", "Math"],
      content: `# Linear Algebra Fundamentals

## Vectors and Matrices
- Vectors: Ordered lists of numbers representing magnitude and direction
- Matrices: Rectangular arrays of numbers
- Operations: Addition, multiplication, and transformations

## Linear Transformations
- Matrix multiplication as transformation
- Determinants and their geometric meaning
- Eigenvalues and eigenvectors

## Applications
- Computer graphics
- Machine learning
- Quantum mechanics`
    },
    {
      id: '6',
      title: "Advanced Linear Algebra",
      author: "Jane Smith",
      description: "Advanced topics in linear algebra including eigenvalues and eigenvectors.",
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ["Notes", "Math"],
      content: `# Advanced Linear Algebra

## Eigenvalues and Eigenvectors
- Definition and properties
- Characteristic polynomial
- Diagonalization

## Applications
- Principal Component Analysis
- Quantum Mechanics
- Stability Analysis`
    },
    {
      id: '7',
      title: "Linear Algebra Applications",
      author: "Jane Smith",
      description: "Real-world applications of linear algebra in various fields.",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ["Notes", "Math"],
      content: `# Linear Algebra Applications

## Computer Graphics
- 3D transformations
- Projection matrices
- Animation

## Data Science
- Dimensionality reduction
- Image processing
- Machine learning algorithms`
    },
    {
      id: '8',
      title: "Linear Algebra Practice",
      author: "Jane Smith",
      description: "Practice problems and solutions for linear algebra concepts.",
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ["Notes", "Math"],
      content: `# Linear Algebra Practice

## Problem Sets
- Matrix operations
- Vector spaces
- Linear transformations
- Eigenvalue problems`
    },
    {
      id: '15',
      title: "Linear Algebra in Machine Learning",
      author: "Jane Smith",
      description: "Applications of linear algebra in machine learning algorithms.",
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ["Notes", "Math"],
      content: `# Linear Algebra in Machine Learning

## Neural Networks
- Weight matrices
- Activation functions
- Backpropagation

## Data Processing
- Feature extraction
- Dimensionality reduction
- Data normalization`
    },
    {
      id: '16',
      title: "Linear Algebra in Computer Graphics",
      author: "Jane Smith",
      description: "How linear algebra powers modern computer graphics.",
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ["Notes", "Math"],
      content: `# Linear Algebra in Computer Graphics

## 3D Graphics
- Transformation matrices
- Projection techniques
- Lighting calculations

## Animation
- Keyframe interpolation
- Skeletal animation
- Physics simulation`
    },
    // Quizzes
    {
      id: '9',
      title: "World History: Ancient Civilizations",
      author: "Peter Jones",
      description: "Exploring the origins and development of early human societies.",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ["Quiz", "History"],
      questions: [
        {
          question: "Which civilization is known as the 'Cradle of Civilization'?",
          choices: [
            "Mesopotamia",
            "Ancient Egypt",
            "Ancient Greece",
            "Roman Empire"
          ],
          correctAnswer: 0
        },
        {
          question: "What was the main contribution of Ancient Egypt to world history?",
          choices: [
            "Democracy",
            "Pyramids and hieroglyphics",
            "Philosophy",
            "Road networks"
          ],
          correctAnswer: 1
        },
        {
          question: "Which ancient civilization developed the first known writing system?",
          choices: [
            "Ancient Greece",
            "Mesopotamia",
            "Ancient China",
            "Indus Valley"
          ],
          correctAnswer: 1
        }
      ]
    },
    {
      id: '10',
      title: "World History: Middle Ages",
      author: "Peter Jones",
      description: "The period between ancient and modern history, focusing on European development.",
      createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ["Quiz", "History"],
      questions: [
        {
          question: "What was the main economic system during the Middle Ages?",
          choices: [
            "Capitalism",
            "Feudalism",
            "Socialism",
            "Mercantilism"
          ],
          correctAnswer: 1
        },
        {
          question: "Which event marked the end of the Middle Ages?",
          choices: [
            "The Renaissance",
            "The Industrial Revolution",
            "The French Revolution",
            "The Fall of Constantinople"
          ],
          correctAnswer: 0
        }
      ]
    },
    {
      id: '11',
      title: "World History: Modern Era",
      author: "Peter Jones",
      description: "Major events and developments from the Renaissance to the present day.",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ["Quiz", "History"],
      questions: [
        {
          question: "What was the Industrial Revolution?",
          choices: [
            "A political movement",
            "A period of technological advancement",
            "A religious reformation",
            "An artistic movement"
          ],
          correctAnswer: 1
        },
        {
          question: "Which event started World War I?",
          choices: [
            "The sinking of the Lusitania",
            "The assassination of Archduke Franz Ferdinand",
            "The invasion of Poland",
            "The bombing of Pearl Harbor"
          ],
          correctAnswer: 1
        }
      ]
    },
    {
      id: '12',
      title: "World History: Contemporary Period",
      author: "Peter Jones",
      description: "Recent historical events and their impact on the modern world.",
      createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ["Quiz", "History"],
      questions: [
        {
          question: "What was the Cold War?",
          choices: [
            "A military conflict",
            "A period of political tension",
            "An economic crisis",
            "A cultural movement"
          ],
          correctAnswer: 1
        },
        {
          question: "Which event marked the end of the Cold War?",
          choices: [
            "The fall of the Berlin Wall",
            "The Cuban Missile Crisis",
            "The Vietnam War",
            "The Korean War"
          ],
          correctAnswer: 0
        }
      ]
    },
    {
      id: '17',
      title: "World History: Ancient Asia",
      author: "Peter Jones",
      description: "The development of civilizations in ancient Asia.",
      createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ["Quiz", "History"],
      questions: [
        {
          question: "Which dynasty built the Great Wall of China?",
          choices: [
            "Han Dynasty",
            "Ming Dynasty",
            "Qin Dynasty",
            "Tang Dynasty"
          ],
          correctAnswer: 2
        },
        {
          question: "What was the Silk Road?",
          choices: [
            "A military route",
            "A trade network",
            "A religious pilgrimage path",
            "A migration route"
          ],
          correctAnswer: 1
        }
      ]
    },
    {
      id: '18',
      title: "World History: Ancient Americas",
      author: "Peter Jones",
      description: "The civilizations of the ancient Americas.",
      createdAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ["Quiz", "History"],
      questions: [
        {
          question: "Which civilization built Machu Picchu?",
          choices: [
            "Aztecs",
            "Incas",
            "Mayans",
            "Olmecs"
          ],
          correctAnswer: 1
        },
        {
          question: "What was the main achievement of the Mayan civilization?",
          choices: [
            "Pyramids",
            "Calendar system",
            "Road networks",
            "Written language"
          ],
          correctAnswer: 1
        }
      ]
    }
  ]);

  const onDelete = (e, id) => {
    e.stopPropagation(); // Prevent click from bubbling up to the parent
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const handleViewContent = (item) => {
    setSelectedContent(item)
    if (item.tags.includes('Flashcard')) {
      setShowViewFlashcards(true)
    } else if (item.tags.includes('Quiz')) {
      setShowViewQuiz(true)
    } else if (item.tags.includes('Notes')) {
      setShowViewNotes(true)
    }
  }

  const handleCloseView = () => {
    setShowViewFlashcards(false)
    setShowViewQuiz(false)
    setShowViewNotes(false)
    setSelectedContent(null)
  }

  if (showViewFlashcards) {
    return (
      <ViewFlashcards
        material={selectedContent}
        onClose={handleCloseView}
      />
    )
  }

  if (showViewQuiz) {
    return (
      <ViewQuiz
        material={selectedContent}
        onClose={handleCloseView}
      />
    )
  }

  if (showViewNotes) {
    return (
      <ViewNotes
        material={selectedContent}
        onClose={handleCloseView}
      />
    )
  }

  const flashcards = items.filter(item => item.tags.includes('Flashcard'))
  const notes = items.filter(item => item.tags.includes('Notes'))
  const quizzes = items.filter(item => item.tags.includes('Quiz'))

  const totalItems = flashcards.length + notes.length + quizzes.length

  if (totalItems === 0) {
    return (
      <div className=" flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="flex-none border-b border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm">
          <div className="max-w-[90rem] mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105"
                >
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {material?.title || 'Material'}
                  </h1>
                  <p className="text-sm text-gray-500">View and manage your content</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onExport(material.title)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105"
                  title="Export Material"
                  aria-label="Export Material"
                >
                  <Download size={20} className="text-gray-600" />
                </button>
                <div className="h-6 w-px bg-gray-200"></div>
                <button
                  className="exam-button-mini py-2 px-4 flex items-center gap-2 bg-gradient-to-r from-[#1b81d4] to-[#1670b3] text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
                  onClick={() => onCreateFlashcards(material)}
                  data-hover="Create Flashcards"
                >
                  <BookOpen size={16} />
                  Create Flashcards
                </button>
                <button
                  className="exam-button-mini py-2 px-4 flex items-center gap-2 bg-gradient-to-r from-[#1b81d4] to-[#1670b3] text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
                  onClick={() => onCreateNotes(material)}
                  data-hover="Create Notes"
                >
                  <FileText size={16} />
                  Create Notes
                </button>
                <button
                  className="exam-button-mini py-2 px-4 flex items-center gap-2 bg-gradient-to-r from-[#1b81d4] to-[#1670b3] text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
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

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center">
          <EmptyState />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
      {/* Header */}
      <div className="flex-none border-b border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-[90rem] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
                <div>
                <h1 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {material?.title || 'Material'}
                </h1>
                <p className="text-sm text-gray-500">View and manage your content</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onExport(material.title)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105"
                title="Export Material"
                aria-label="Export Material"
              >
                <Download size={20} className="text-gray-600" />
              </button>
              <div className="h-6 w-px bg-gray-200"></div>
              <button
                className="exam-button-mini py-2 px-4 flex items-center gap-2 bg-gradient-to-r from-[#1b81d4] to-[#1670b3] text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
                onClick={() => onCreateFlashcards(material)}
                data-hover="Create Flashcards"
              >
                <BookOpen size={16} />
                Create Flashcards
              </button>
              <button
                className="exam-button-mini py-2 px-4 flex items-center gap-2 bg-gradient-to-r from-[#1b81d4] to-[#1670b3] text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
                onClick={() => onCreateNotes(material)}
                data-hover="Create Notes"
              >
                <FileText size={16} />
                Create Notes
              </button>
              <button
                className="exam-button-mini py-2 px-4 flex items-center gap-2 bg-gradient-to-r from-[#1b81d4] to-[#1670b3] text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
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

      {/* Content */}
      <div className=" bg-gradient-to-br from-gray-50 to-gray-400 rounded-b-xl">
        <div className="max-w-[90rem] mx-auto pl-6 py-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Sparkles size={20} className="text-[#1b81d4]" />
            </div>
            <h2 className="text-xl font-medium bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Your Learning Materials
            </h2>
          </div>

          <div className="h-screen overflow-y-auto pr-2 space-y-12">
            {/* Flashcards Section */}
            <div>
              <SectionHeader icon={BookOpen} title="Flashcards" count={flashcards.length} />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {flashcards.length > 0 ? (
                  flashcards.map((item) => (
                    <div
                      key={item.id}
                      className="relative transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                    >
                      <div 
                        onClick={() => handleViewContent(item)}
                        className="cursor-pointer"
                      >
                        <MaterialFile content={item} onDelete={(e) => onDelete(e, item.id)} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full">
                    <SectionEmptyState title="Flashcards" />
                  </div>
                )}
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <SectionHeader icon={FileText} title="Notes" count={notes.length} />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {notes.length > 0 ? (
                  notes.map((item) => (
                    <div
                      key={item.id}
                      className="relative transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                    >
                      <div 
                        onClick={() => handleViewContent(item)}
                        className="cursor-pointer"
                      >
                        <MaterialFile content={item} onDelete={(e) => onDelete(e, item.id)} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full">
                    <SectionEmptyState title="Notes" />
                          </div>
                        )}
              </div>
            </div>

            {/* Quiz Section */}
            <div>
              <SectionHeader icon={HelpCircle} title="Quizzes" count={quizzes.length} />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {quizzes.length > 0 ? (
                  quizzes.map((item) => (
                    <div
                      key={item.id}
                      className="relative transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                    >
                      <div 
                        onClick={() => handleViewContent(item)}
                        className="cursor-pointer"
                      >
                        <MaterialFile content={item} onDelete={(e) => onDelete(e, item.id)} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full">
                    <SectionEmptyState title="Quizzes" />
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