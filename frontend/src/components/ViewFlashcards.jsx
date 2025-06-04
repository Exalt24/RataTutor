import { ArrowLeft, ArrowRight, BookOpen, Globe, Lock, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import '../styles/components/flashcards.css';

const ViewFlashcards = ({ material, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyMode, setStudyMode] = useState('all'); // 'all', 'unmastered', 'mastered'
  const [masteredCards, setMasteredCards] = useState(new Set());
  const [isFlipping, setIsFlipping] = useState(false);
  const [isPrivate, setIsPrivate] = useState(true);

  // Use material's flashcards if available, otherwise use sample data
  const flashcards = material?.flashcards || [
    { front: "What is the capital of France?", back: "Paris" },
    { front: "What is the largest planet in our solar system?", back: "Jupiter" },
    { front: "Who painted the Mona Lisa?", back: "Leonardo da Vinci" },
    { front: "What is the chemical symbol for gold?", back: "Au" },
    { front: "Which planet is known as the Red Planet?", back: "Mars" }
  ];

  const filteredFlashcards = flashcards.filter((_, index) => {
    if (studyMode === 'all') return true;
    if (studyMode === 'mastered') return masteredCards.has(index);
    if (studyMode === 'unmastered') return !masteredCards.has(index);
    return true;
  });

  const handleNext = () => {
    setShowAnswer(false);
    setCurrentIndex((prev) => (prev + 1) % filteredFlashcards.length);
  };

  const handlePrevious = () => {
    setShowAnswer(false);
    setCurrentIndex((prev) => (prev - 1 + filteredFlashcards.length) % filteredFlashcards.length);
  };

  const toggleMastered = () => {
    setMasteredCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentIndex)) {
        newSet.delete(currentIndex);
      } else {
        newSet.add(currentIndex);
      }
      return newSet;
    });
  };

  const handleFlip = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setShowAnswer(!showAnswer);
      setIsFlipping(false);
    }, 150); // Half of the animation duration
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="flex-none border-b border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-[90rem] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {material?.title || 'Flashcards'}
                </h1>
                <p className="text-sm text-gray-500">Study and master your flashcards</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
                    <span className="text-gray-600 font-medium">Private</span>
                  </>
                ) : (
                  <>
                    <Globe size={20} className="text-[#1b81d4]" />
                    <span className="text-[#1b81d4] font-medium">Public</span>
                  </>
                )}
              </button>
              <select
                value={studyMode}
                onChange={(e) => setStudyMode(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7BA7CC]/30 focus:border-[#1b81d4] transition-all duration-200 hover:border-gray-300"
              >
                <option value="all">All Cards</option>
                <option value="unmastered">Unmastered</option>
                <option value="mastered">Mastered</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {filteredFlashcards.length > 0 ? (
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              {/* Progress */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <BookOpen size={20} className="text-[#1b81d4]" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {currentIndex + 1} of {filteredFlashcards.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Sparkles size={20} className="text-[#1F7D2F]" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Mastered: {masteredCards.size} / {flashcards.length}
                  </span>
                </div>
              </div>

              {/* Flashcard with 3D flip animation */}
              <div 
                className="relative h-[500px] w-[600px] mx-auto mb-8"
                style={{ perspective: '1000px' }}
                onClick={handleFlip}
              >
                <div 
                  className="w-full h-full cursor-pointer"
                  style={{
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: showAnswer ? 'rotateY(180deg)' : 'none',
                    pointerEvents: isFlipping ? 'none' : 'auto'
                  }}
                >
                  {/* Front of card */}
                  <div 
                    className="absolute w-full h-full bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-xl flex items-center justify-center"
                    style={{
                      backfaceVisibility: 'hidden',
                      opacity: showAnswer ? 0 : 1
                    }}
                  >
                    <div className="text-center px-12">
                      <h2 className="text-4xl font-medium bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        {filteredFlashcards[currentIndex].front}
                      </h2>
                      <p className="text-sm text-gray-500 mt-6">Click to show answer</p>
                    </div>
                  </div>
                  
                  {/* Back of card */}
                  <div 
                    className="absolute w-full h-full bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-xl flex items-center justify-center"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      opacity: showAnswer ? 1 : 0
                    }}
                  >
                    <div className="text-center px-12">
                      <h2 className="text-4xl font-medium bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        {filteredFlashcards[currentIndex].back}
                      </h2>
                      <p className="text-sm text-gray-500 mt-6">Click to show question</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevious}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-all duration-200 hover:scale-105"
                >
                  <ArrowLeft size={20} />
                  Previous
                </button>
                <button
                  onClick={toggleMastered}
                  className={`px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                    masteredCards.has(currentIndex)
                      ? 'bg-gradient-to-r from-[#BAFFC9] to-[#A8FFB9] text-[#1F7D2F] hover:from-[#A8FFB9] hover:to-[#BAFFC9]'
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-100'
                  }`}
                >
                  {masteredCards.has(currentIndex) ? 'Mastered' : 'Mark as Mastered'}
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-all duration-200 hover:scale-105"
                >
                  Next
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <BookOpen size={48} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No flashcards available</h3>
              <p className="text-gray-600">Try changing your study mode or check back later for new content.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewFlashcards; 