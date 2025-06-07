import { ArrowLeft, ArrowRight, CheckCircle2, Edit, HelpCircle, XCircle } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import Confetti from 'react-confetti';
import { useToast } from '../components/Toast/ToastContext';
import { createCombinedSuccessMessage, trackActivityAndNotify } from '../utils/streakNotifications';

const ViewQuiz = ({ 
  mainMaterial, 
  material, 
  onClose, 
  readOnly = false, 
  onSuccess,
  onEdit // ✅ NEW: Navigation handler for editing
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  // ✅ REMOVED: showCreateQuiz state (no longer needed)
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
    if (quizSubmitted) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [quizSubmitted]);

  // ✅ Derived state using useMemo instead of complex useEffect
  const quizData = useMemo(() => {
    if (!material) return null;
    
    return {
      title: material.title || 'Quiz',
      description: material.description || 'Test your knowledge',
      questions: material.questions || []
    };
  }, [material]);

  // ✅ Derived state for safe bounds checking
  const safeCurrentIndex = useMemo(() => {
    if (!quizData?.questions || quizData.questions.length === 0) return 0;
    return Math.min(currentQuestionIndex, quizData.questions.length - 1);
  }, [currentQuestionIndex, quizData?.questions?.length]);

  // ✅ Simple bounds checking when data changes
  useEffect(() => {
    if (!quizData?.questions || quizData.questions.length === 0) {
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setQuizSubmitted(false);
    } else if (safeCurrentIndex !== currentQuestionIndex) {
      setCurrentQuestionIndex(safeCurrentIndex);
    }
  }, [safeCurrentIndex, currentQuestionIndex, quizData?.questions?.length]);

  // ✅ UPDATED: Use navigation instead of local state
  const handleEdit = () => {
    if (!readOnly && onEdit) {
      onEdit(material); // Navigate to edit route
    }
  };

  // ✅ REMOVED: handleEditSuccess (no longer needed with routing)
  // ✅ REMOVED: showCreateQuiz logic (no longer needed with routing)

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    setQuizSubmitted(true);
    
    // Calculate score for the message
    const score = calculateScore();
    const questionsCorrect = Math.round((score / 100) * quizData.questions.length);
    
    // Track activity but suppress immediate notification
    const streakResult = await trackActivityAndNotify(showToast, true);
    
    // Create combined message using helper function
    const baseTitle = "Quiz completed!";
    const baseSubtitle = `You scored ${score}% (${questionsCorrect}/${quizData.questions.length}) on "${quizData.title}".`;
    
    const combinedMessage = createCombinedSuccessMessage(baseTitle, baseSubtitle, streakResult);
    
    // Show single combined toast
    showToast({
      variant: "success",
      title: combinedMessage.title,
      subtitle: combinedMessage.subtitle,
    });
  };

  const handleNextQuestion = () => {
    if (quizData?.questions && currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    if (!quizData?.questions) return 0;
    
    let correct = 0;
    quizData.questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correct_answer) {
        correct++;
      }
    });
    return Math.round((correct / quizData.questions.length) * 100);
  };

  const getQuestionStatus = (questionId) => {
    if (!quizSubmitted) return null;
    const answer = selectedAnswers[questionId];
    const correctAnswer = quizData?.questions.find(q => q.id === questionId)?.correct_answer;
    return answer === correctAnswer ? 'correct' : 'incorrect';
  };

  const resetQuiz = () => {
    setQuizSubmitted(false);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
  };

  // ✅ REMOVED: Conditional rendering of CreateQuiz

  return (
    <div className="flex flex-col bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-xl h-[calc(100vh-7rem)]">
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
                  {quizData?.title || 'Quiz'}
                </h1>
                <p className="text-sm text-gray-500 label-text">
                  {quizData?.description || 'Test your knowledge'} • {quizData?.questions?.length || 0} questions
                  {quizSubmitted && <span className="ml-2 text-green-600">• Completed</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Progress indicator */}
              {!quizSubmitted && quizData?.questions && quizData.questions.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full label-text">
                    Question {safeCurrentIndex + 1} of {quizData.questions.length}
                  </span>
                  <div className="h-1.5 w-32 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{
                        width: `${((safeCurrentIndex + 1) / quizData.questions.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
              {/* Edit button */}
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
          {quizData?.questions && quizData.questions.length > 0 ? (
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
              {!quizSubmitted ? (
                // Quiz taking interface
                <>
                  {/* Progress */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <HelpCircle size={20} className="text-green-500" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 label-text">
                        Question {safeCurrentIndex + 1} of {quizData.questions.length}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 label-text">
                      {Object.keys(selectedAnswers).length} of {quizData.questions.length} answered
                    </div>
                  </div>

                  {/* Question */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-medium bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6 label-text">
                      {quizData.questions[safeCurrentIndex]?.question_text || 'Loading...'}
                    </h2>
                    <div className="space-y-3">
                      {(quizData.questions[safeCurrentIndex]?.choices || []).map((option, index) => (
                        <label
                          key={index}
                          className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                            selectedAnswers[quizData.questions[safeCurrentIndex].id] === option
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-green-400'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${quizData.questions[safeCurrentIndex].id}`}
                            value={option}
                            checked={selectedAnswers[quizData.questions[safeCurrentIndex].id] === option}
                            onChange={() => handleAnswerSelect(quizData.questions[safeCurrentIndex].id, option)}
                            className="mr-3 text-green-500 focus:ring-green-500"
                          />
                          <span className="label-text">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                      className={`flex items-center gap-2 px-4 py-2 transition-all duration-200 ${
                        currentQuestionIndex === 0
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-600 hover:text-gray-800 hover:scale-105'
                      }`}
                    >
                      <ArrowLeft size={16} />
                      <span className="label-text">Previous</span>
                    </button>
                    
                    <div className="text-sm text-gray-500 label-text">
                      Question {Math.min(safeCurrentIndex + 1, quizData.questions.length)} of {quizData.questions.length}
                    </div>

                    {currentQuestionIndex === quizData.questions.length - 1 ? (
                      <button
                        onClick={handleSubmit}
                        className="exam-button-mini"
                        data-hover="Submit Quiz"
                      >
                        <span className="label-text">Submit Quiz</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuestion}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-all duration-200 hover:scale-105"
                      >
                        <span className="label-text">Next</span>
                        <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                </>
              ) : (
                // Results interface
                <>
                  <div className="text-center mb-8">
                    <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4 label-text">
                      {calculateScore()}%
                    </div>
                    <h2 className="text-2xl font-medium bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent label-text mb-2">
                      Quiz Completed!
                    </h2>
                    <p className="text-gray-600 label-text">
                      You got {Math.round((calculateScore() / 100) * quizData.questions.length)} out of {quizData.questions.length} questions correct!
                    </p>
                  </div>

                  {/* Results breakdown */}
                  <div className="space-y-4 max-h-[calc(100%-12rem)] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-green-300/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-green-400/50 pr-4">
                    {quizData.questions.map((question, index) => {
                      const status = getQuestionStatus(question.id);
                      return (
                        <div key={question.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              {status === 'correct' ? (
                                <CheckCircle2 size={24} className="text-green-600" />
                              ) : (
                                <XCircle size={24} className="text-red-500" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 mb-4 label-text">
                                {index + 1}. {question.question_text}
                              </h3>
                              <div className="space-y-2">
                                {(question.choices || []).map((option, optIndex) => (
                                  <div
                                    key={optIndex}
                                    className={`p-3 rounded-lg transition-all duration-200 ${
                                      option === question.correct_answer
                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                        : option === selectedAnswers[question.id] && option !== question.correct_answer
                                        ? 'bg-red-100 text-red-800 border border-red-200'
                                        : 'bg-gray-50'
                                    }`}
                                  >
                                    <span className="label-text">{option}</span>
                                    {option === question.correct_answer && (
                                      <span className="ml-2 text-green-600 text-sm">✓ Correct</span>
                                    )}
                                    {option === selectedAnswers[question.id] && option !== question.correct_answer && (
                                      <span className="ml-2 text-red-600 text-sm">✗ Your answer</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Try again button */}
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={resetQuiz}
                      className="exam-button-mini"
                      data-hover="Try Again"
                    >
                      <span className="label-text">Try Again</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            // Empty state
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <HelpCircle size={48} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2 label-text">No questions available</h3>
              <p className="text-gray-600 label-text">This quiz is empty.</p>
              {!readOnly && onEdit && (
                <button
                  onClick={handleEdit}
                  className="mt-4 exam-button-mini"
                  data-hover="Add Questions"
                >
                  Add Questions
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewQuiz;