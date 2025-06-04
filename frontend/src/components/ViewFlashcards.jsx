import { ArrowLeft, ArrowRight, BookOpen, Edit, Globe, Lock, Shuffle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import '../styles/components/flashcards.css';
import CreateFlashcards from './CreateFlashcards';

const ViewFlashcards = ({ mainMaterial, material, onClose, readOnly = false, onSuccess }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffledOrder, setShuffledOrder] = useState([]); // Store shuffled indices
  const [showCreateFlashcards, setShowCreateFlashcards] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isFinished) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isFinished]);

  // Use material's cards (flashcard set object has cards array)
  const flashcards = material?.flashcards || [];

  // Convert API format to component format
  const originalFlashcards = flashcards.map(card => ({
    front: card.question,
    back: card.answer,
    id: card.id
  }));

  // Use shuffled order if shuffled, otherwise original order
  const formattedFlashcards = isShuffled && shuffledOrder.length > 0
    ? shuffledOrder.map(index => originalFlashcards[index]).filter(Boolean)
    : originalFlashcards;

  // Reset shuffle order when original cards change (after edit)
  useEffect(() => {
    if (originalFlashcards.length > 0) {
      // If we were shuffled, create new shuffle order for the updated cards
      if (isShuffled) {
        const newIndices = Array.from({ length: originalFlashcards.length }, (_, i) => i);
        const shuffled = [...newIndices].sort(() => Math.random() - 0.5);
        setShuffledOrder(shuffled);
      }
      
      // Handle index bounds
      if (currentIndex >= originalFlashcards.length) {
        setCurrentIndex(Math.max(0, originalFlashcards.length - 1));
        setShowAnswer(false);
        setIsFinished(false);
      }
    } else {
      setCurrentIndex(0);
      setShowAnswer(false);
      setIsFinished(false);
      setIsShuffled(false);
      setShuffledOrder([]);
    }
  }, [originalFlashcards.length]);

  // Separate effect for currentIndex bounds checking
  useEffect(() => {
    if (formattedFlashcards.length > 0 && currentIndex >= formattedFlashcards.length) {
      setCurrentIndex(Math.max(0, formattedFlashcards.length - 1));
      setShowAnswer(false);
      setIsFinished(false);
    }
  }, [formattedFlashcards.length, currentIndex]);

  const handleNext = () => {
    if (formattedFlashcards.length === 0) return;
    
    setShowAnswer(false);
    if (currentIndex === formattedFlashcards.length - 1) {
      setIsFinished(true);
    } else {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % formattedFlashcards.length;
        return Math.min(next, formattedFlashcards.length - 1);
      });
    }
  };

  const handlePrevious = () => {
    if (formattedFlashcards.length === 0) return;
    
    setShowAnswer(false);
    setCurrentIndex((prev) => {
      const previous = (prev - 1 + formattedFlashcards.length) % formattedFlashcards.length;
      return Math.max(0, previous);
    });
    setIsFinished(false);
  };

  const handleShuffle = () => {
    if (originalFlashcards.length <= 1) return;

    if (isShuffled) {
      // Unshuffle: return to original order
      setIsShuffled(false);
      setShuffledOrder([]);
      setCurrentIndex(0);
      setShowAnswer(false);
      setIsFinished(false);
    } else {
      // Shuffle: create new random order
      const indices = Array.from({ length: originalFlashcards.length }, (_, i) => i);
      const shuffled = [...indices].sort(() => Math.random() - 0.5);
      setShuffledOrder(shuffled);
      setIsShuffled(true);
      setCurrentIndex(0);
      setShowAnswer(false);
      setIsFinished(false);
    }
  };

  const handleFlip = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setShowAnswer(!showAnswer);
      setIsFlipping(false);
    }, 150);
  };

  const handleEdit = () => {
    if (!readOnly) {
      setShowCreateFlashcards(true);
    }
  };

  const handleEditSuccess = (updatedFlashcardSet) => {
    if (onSuccess) {
      onSuccess(updatedFlashcardSet);
    }
    
    // Reset viewing state to provide clean UX after editing
    setCurrentIndex(0);
    setShowAnswer(false);
    setIsFinished(false);
    setIsShuffled(false);
    setShuffledOrder([]);
    setShowCreateFlashcards(false);
  };

  if (showCreateFlashcards) {
    return (
      <CreateFlashcards
        mainMaterial={mainMaterial}
        material={material} 
        flashcardSet={material}
        onClose={() => setShowCreateFlashcards(false)}
        onSuccess={handleEditSuccess}
      />
    );
  }

  return (
    <div className="flex flex-col bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 rounded-xl h-[calc(100vh-6rem)]">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}
      {/* Header */}
      <div className="flex-none border-b rounded-t-xl border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
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
                <h1 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent label-text">
                  {material?.title || 'Flashcards'}
                </h1>
                <p className="text-sm text-gray-500 label-text">
                  {material?.description || 'Study and review your flashcards'} • {formattedFlashcards.length} cards
                  {isShuffled && <span className="ml-2 text-blue-600">• Shuffled</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!readOnly && (
                <>
                  <div className="h-6 w-px bg-gray-200"></div>
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-all duration-200 hover:scale-105"
                  >
                    <Edit size={16} />
                    <span className="label-text">Edit</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 py-4 h-full">
          {formattedFlashcards.length > 0 ? (
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
              {/* Progress */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <BookOpen size={20} className="text-[#1b81d4]" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 label-text">
                    {isFinished ? "Finished" : `${currentIndex + 1} of ${formattedFlashcards.length}`}
                  </span>
                </div>
                <button
                  onClick={handleShuffle}
                  disabled={formattedFlashcards.length <= 1}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                    formattedFlashcards.length <= 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isShuffled
                        ? 'bg-blue-50 text-[#1b81d4] border border-blue-200'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                  title={isShuffled ? "Return to original order" : "Shuffle cards"}
                >
                  <Shuffle size={20} />
                  <span className="label-text">{isShuffled ? "Unshuffle" : "Shuffle"}</span>
                </button>
              </div>

              {/* Flashcard with 3D flip animation */}
              {isFinished ? (
                <div className="relative h-[270px] w-[500px] mx-auto mb-8">
                  <div className="w-full h-full bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-xl flex items-center justify-center">
                    <div className="text-center px-12">
                      <h2 className="text-3xl font-medium bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent label-text mb-4">
                        Congratulations!
                      </h2>
                      <p className="text-lg text-gray-600 label-text mb-6">
                        You've completed reviewing all {formattedFlashcards.length} flashcards
                        {isShuffled && <span className="block text-sm mt-2 text-blue-600">in shuffled order</span>}
                      </p>
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => {
                            setCurrentIndex(0);
                            setIsFinished(false);
                            setShowAnswer(false);
                          }}
                          className="exam-button-mini"
                          data-hover="Review Again"
                        >
                          Review Again
                        </button>
                        {isShuffled && (
                          <button
                            onClick={() => {
                              setIsShuffled(false);
                              setShuffledOrder([]);
                              setCurrentIndex(0);
                              setIsFinished(false);
                              setShowAnswer(false);
                            }}
                            className="exam-button-mini bg-blue-600 hover:bg-blue-700"
                            data-hover="Review Original Order"
                          >
                            Original Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  className="relative h-[270px] w-[500px] mx-auto mb-8"
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
                        <h2 className="text-3xl font-medium bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent label-text">
                          {formattedFlashcards[currentIndex]?.front || 'Loading...'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-6 label-text">Click to show answer</p>
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
                        <h2 className="text-3xl font-medium bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent label-text">
                          {formattedFlashcards[currentIndex]?.back || 'Loading...'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-6 label-text">Click to show question</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Controls */}
              {!isFinished && formattedFlashcards.length > 0 && (
                <div className="flex items-center justify-between">
                  <button
                    onClick={handlePrevious}
                    disabled={formattedFlashcards.length <= 1}
                    className={`flex items-center gap-2 px-4 py-2 transition-all duration-200 hover:scale-105 ${
                      formattedFlashcards.length <= 1 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <ArrowLeft size={20} />
                    <span className="label-text">Previous</span>
                  </button>
                  <div className="text-sm text-gray-500 label-text">
                    Card {Math.min(currentIndex + 1, formattedFlashcards.length)} of {formattedFlashcards.length}
                  </div>
                  <button
                    onClick={handleNext}
                    disabled={formattedFlashcards.length <= 1}
                    className={`flex items-center gap-2 px-4 py-2 transition-all duration-200 hover:scale-105 ${
                      formattedFlashcards.length <= 1 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <span className="label-text">Next</span>
                    <ArrowRight size={20} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <BookOpen size={48} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2 label-text">No flashcards available</h3>
              <p className="text-gray-600 label-text">This flashcard set is empty.</p>
              {!readOnly && (
                <button
                  onClick={handleEdit}
                  className="mt-4 exam-button-mini"
                  data-hover="Add Flashcards"
                >
                  Add Flashcards
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewFlashcards;