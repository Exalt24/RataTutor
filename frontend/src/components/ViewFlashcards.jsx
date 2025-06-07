import { ArrowLeft, ArrowRight, BookOpen, Edit, Shuffle } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import Confetti from 'react-confetti';
import { useToast } from '../components/Toast/ToastContext';
import '../styles/components/flashcards.css';
import { createCombinedSuccessMessage, trackActivityAndNotify } from '../utils/streakNotifications';

const ViewFlashcards = ({ 
  mainMaterial, 
  material, 
  onClose, 
  readOnly = false, 
  onSuccess,
  onEdit // ✅ NEW: Navigation handler for editing
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  // ✅ REMOVED: showCreateFlashcards state (no longer needed)
  const [isFinished, setIsFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const { showToast } = useToast();

  // ✅ Good useEffect - DOM event handling
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

  // ✅ Good useEffect - UI effects based on state
  useEffect(() => {
    if (isFinished) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isFinished]);

  // ✅ Derived state using useMemo instead of complex useEffect
  const originalFlashcards = useMemo(() => {
    const flashcards = material?.flashcards || [];
    return flashcards.map(card => ({
      front: card.question,
      back: card.answer,
      id: card.id
    }));
  }, [material?.flashcards]);

  // ✅ Derived state for shuffled cards using useMemo
  const formattedFlashcards = useMemo(() => {
    if (!isShuffled || originalFlashcards.length <= 1) {
      return originalFlashcards;
    }

    // Create shuffled array using seed for consistency during same session
    const indices = Array.from({ length: originalFlashcards.length }, (_, i) => i);
    
    // Use shuffleSeed to create consistent but different shuffles
    const seededRandom = (seed) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const shuffled = [...indices].sort((a, b) => {
      return seededRandom(shuffleSeed + a + b) - 0.5;
    });

    return shuffled.map(index => originalFlashcards[index]).filter(Boolean);
  }, [originalFlashcards, isShuffled, shuffleSeed]);

  // ✅ Simple bounds checking when data changes
  const safeCurrentIndex = useMemo(() => {
    if (formattedFlashcards.length === 0) return 0;
    return Math.min(currentIndex, formattedFlashcards.length - 1);
  }, [currentIndex, formattedFlashcards.length]);

  // ✅ Reset state when cards change significantly
  useEffect(() => {
    if (formattedFlashcards.length === 0) {
      setCurrentIndex(0);
      setShowAnswer(false);
      setIsFinished(false);
    } else if (safeCurrentIndex !== currentIndex) {
      setCurrentIndex(safeCurrentIndex);
      setShowAnswer(false);
      setIsFinished(false);
    }
  }, [safeCurrentIndex, currentIndex, formattedFlashcards.length]);

  const handleNext = async () => {
    if (formattedFlashcards.length === 0) return;
    
    setShowAnswer(false);
    
    if (currentIndex === formattedFlashcards.length - 1) {
      setIsFinished(true);
      
      // Track activity but suppress immediate notification
      const streakResult = await trackActivityAndNotify(showToast, true);
      
      // Create combined message using helper function
      const baseTitle = "Flashcard review completed!";
      const baseSubtitle = `You've reviewed all ${formattedFlashcards.length} flashcards${isShuffled ? ' in shuffled order' : ''}.`;
      
      const combinedMessage = createCombinedSuccessMessage(baseTitle, baseSubtitle, streakResult);
      
      // Show single combined toast
      showToast({
        variant: "success",
        title: combinedMessage.title,
        subtitle: combinedMessage.subtitle,
      });
    } else {
      setCurrentIndex(prev => Math.min(prev + 1, formattedFlashcards.length - 1));
    }
  };

  const handlePrevious = () => {
    if (formattedFlashcards.length === 0) return;
    
    setShowAnswer(false);
    setCurrentIndex(prev => Math.max(0, prev - 1));
    setIsFinished(false);
  };

  const handleShuffle = () => {
    if (originalFlashcards.length <= 1) return;

    if (isShuffled) {
      // Unshuffle: return to original order
      setIsShuffled(false);
      setCurrentIndex(0);
      setShowAnswer(false);
      setIsFinished(false);
    } else {
      // Shuffle: create new random order by updating seed
      setIsShuffled(true);
      setShuffleSeed(prev => prev + 1);
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

  // ✅ UPDATED: Use navigation instead of local state
  const handleEdit = () => {
    if (!readOnly && onEdit) {
      onEdit(material); // Navigate to edit route
    }
  };

  // ✅ REMOVED: handleEditSuccess (no longer needed with routing)
  // ✅ REMOVED: showCreateFlashcards logic (no longer needed with routing)

  const resetToStart = () => {
    setCurrentIndex(0);
    setIsFinished(false);
    setShowAnswer(false);
  };

  const resetToOriginalOrder = () => {
    setIsShuffled(false);
    setShuffleSeed(0);
    setCurrentIndex(0);
    setIsFinished(false);
    setShowAnswer(false);
  };

  // ✅ REMOVED: Conditional rendering of CreateFlashcards

  return (
    <div className="flex flex-col bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 rounded-xl h-[calc(100vh-7rem)]">
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
                <h1 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent label-text truncate overflow-hidden">
                  {material?.title || 'Flashcards'}
                </h1>
                <p className="text-sm text-gray-500 label-text">
                  {material?.description || 'Study and review your flashcards'} • {formattedFlashcards.length} cards
                  {isShuffled && <span className="ml-2 text-blue-600">• Shuffled</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!readOnly && onEdit && (
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
                    {isFinished ? "Finished" : `${safeCurrentIndex + 1} of ${formattedFlashcards.length}`}
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
                          onClick={resetToStart}
                          className="exam-button-mini"
                          data-hover="Review Again"
                        >
                          Review Again
                        </button>
                        {isShuffled && (
                          <button
                            onClick={resetToOriginalOrder}
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
                        <h2 className="text-2xl font-medium bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent label-text break-words overflow-wrap">
                          {formattedFlashcards[safeCurrentIndex]?.front || 'Loading...'}
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
                        <h2 className="text-2xl font-medium bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent label-text break-words overflow-wrap">
                          {formattedFlashcards[safeCurrentIndex]?.back || 'Loading...'}
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
                    Card {Math.min(safeCurrentIndex + 1, formattedFlashcards.length)} of {formattedFlashcards.length}
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
              {!readOnly && onEdit && (
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