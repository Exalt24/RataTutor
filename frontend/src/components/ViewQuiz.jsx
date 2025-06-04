import { ArrowLeft, ArrowRight, CheckCircle2, Edit, Globe, Lock, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import CreateQuiz from './CreateQuiz';

const ViewQuiz = ({ material, onClose }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isPrivate, setIsPrivate] = useState(true);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);

  // Sample quiz data - replace with actual data from material prop
  const quiz = {
    title: "General Knowledge Quiz",
    description: "Test your knowledge with these general questions",
    questions: [
      {
        id: 1,
        question: "What is the chemical symbol for gold?",
        options: ["Ag", "Au", "Fe", "Cu"],
        correctAnswer: "Au",
        explanation: "Gold's chemical symbol 'Au' comes from the Latin word 'aurum', meaning gold."
      },
      {
        id: 2,
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: "Mars",
        explanation: "Mars is called the Red Planet because of the reddish iron oxide on its surface."
      },
      {
        id: 3,
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic", "Indian", "Arctic", "Pacific"],
        correctAnswer: "Pacific",
        explanation: "The Pacific Ocean is the largest and deepest ocean on Earth."
      }
    ]
  };

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = () => {
    setQuizSubmitted(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowExplanation(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowExplanation(false);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    return (correct / quiz.questions.length) * 100;
  };

  const getQuestionStatus = (questionId) => {
    if (!quizSubmitted) return null;
    const answer = selectedAnswers[questionId];
    const correctAnswer = quiz.questions.find(q => q.id === questionId)?.correctAnswer;
    return answer === correctAnswer ? 'correct' : 'incorrect';
  };

  const handleEdit = () => {
    setShowCreateQuiz(true);
  };

  if (showCreateQuiz) {
    return <CreateQuiz material={material} onClose={() => setShowCreateQuiz(false)} />;
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br rounded-xl from-emerald-50 via-green-50 to-teal-50">
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
                  {quiz.title}
                </h1>
                <p className="text-sm text-gray-500 label-text">{quiz.description}</p>
              </div>
            </div>
            {!quizSubmitted && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full label-text">
                    Question {currentQuestionIndex + 1} of {quiz.questions.length}
                  </span>
                  <div className="h-1.5 w-32 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1b81d4] transition-all duration-300"
                      style={{
                        width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`,
                      }}
                    />
                  </div>
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
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 py-8 h-[calc(100vh-12rem)]">
          {!quizSubmitted ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 p-8 h-[calc(100%-2rem)]">
              <div className="mb-6">
                <h2 className="text-2xl font-medium bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4 label-text">
                  {quiz.questions[currentQuestionIndex].question}
                </h2>
                <div className="space-y-3">
                  {quiz.questions[currentQuestionIndex].options.map((option) => (
                    <label
                      key={option}
                      className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                        selectedAnswers[quiz.questions[currentQuestionIndex].id] === option
                          ? 'border-[#1b81d4] bg-blue-50'
                          : 'border-gray-200 hover:border-[#1b81d4]'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${quiz.questions[currentQuestionIndex].id}`}
                        value={option}
                        checked={selectedAnswers[quiz.questions[currentQuestionIndex].id] === option}
                        onChange={() => handleAnswerSelect(quiz.questions[currentQuestionIndex].id, option)}
                        className="mr-3"
                      />
                      <span className="label-text">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

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
                {currentQuestionIndex === quiz.questions.length - 1 ? (
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
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 p-8 h-full">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold bg-gradient-to-r from-[#1b81d4] to-[#1670b3] bg-clip-text text-transparent mb-2 label-text">
                  {calculateScore()}%
                </div>
                <p className="text-gray-600 label-text">
                  You got {Math.round(calculateScore() / 20)} out of {quiz.questions.length} questions correct!
                </p>
              </div>

              <div className="space-y-4 max-h-[calc(100%-8rem)] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400/50 pr-4">
                {quiz.questions.map((question, index) => {
                  const status = getQuestionStatus(question.id);
                  return (
                    <div key={question.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {status === 'correct' ? (
                            <CheckCircle2 size={24} className="text-[#1F7D2F]" />
                          ) : (
                            <XCircle size={24} className="text-[#7D1F1F]" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-4 label-text">
                            {index + 1}. {question.question}
                          </h3>
                          <div className="space-y-2">
                            {question.options.map((option) => (
                              <div
                                key={option}
                                className={`p-3 rounded-lg transition-all duration-200 ${
                                  option === question.correctAnswer
                                    ? 'bg-[#BAFFC9] text-[#1F7D2F]'
                                    : option === selectedAnswers[question.id]
                                    ? 'bg-[#FFB3BA] text-[#7D1F1F]'
                                    : 'bg-gray-50'
                                }`}
                              >
                                <span className="label-text">{option}</span>
                              </div>
                            ))}
                          </div>
                          {showExplanation && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                              <p className="text-[#1b81d4] label-text">{question.explanation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => {
                    setQuizSubmitted(false);
                    setSelectedAnswers({});
                    setCurrentQuestionIndex(0);
                  }}
                  className="exam-button-mini"
                  data-hover="Try Again"
                >
                  <span className="label-text">Try Again</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewQuiz; 