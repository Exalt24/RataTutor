import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import React, { useState } from 'react';

const ViewQuiz = ({ material, onClose }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

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

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-none border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-[90rem] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{quiz.title}</h1>
                <p className="text-sm text-gray-500">{quiz.description}</p>
              </div>
            </div>
            {!quizSubmitted && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {!quizSubmitted ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
              <div className="mb-8">
                <h2 className="text-xl font-medium text-gray-900 mb-4">
                  {quiz.questions[currentQuestionIndex].question}
                </h2>
                <div className="space-y-3">
                  {quiz.questions[currentQuestionIndex].options.map((option) => (
                    <label
                      key={option}
                      className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${
                        selectedAnswers[quiz.questions[currentQuestionIndex].id] === option
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
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
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className={`flex items-center gap-2 px-4 py-2 ${
                    currentQuestionIndex === 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Previous
                </button>
                {currentQuestionIndex === quiz.questions.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
              <div className="text-center mb-8">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {calculateScore()}%
                </div>
                <p className="text-gray-600">
                  You got {Math.round(calculateScore() / 20)} out of {quiz.questions.length} questions correct!
                </p>
              </div>

              <div className="space-y-6">
                {quiz.questions.map((question, index) => {
                  const status = getQuestionStatus(question.id);
                  return (
                    <div key={question.id} className="border border-gray-200 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {status === 'correct' ? (
                            <CheckCircle2 size={24} className="text-green-500" />
                          ) : (
                            <XCircle size={24} className="text-red-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-4">
                            {index + 1}. {question.question}
                          </h3>
                          <div className="space-y-2">
                            {question.options.map((option) => (
                              <div
                                key={option}
                                className={`p-3 rounded-lg ${
                                  option === question.correctAnswer
                                    ? 'bg-green-50 text-green-700'
                                    : option === selectedAnswers[question.id]
                                    ? 'bg-red-50 text-red-700'
                                    : 'bg-gray-50'
                                }`}
                              >
                                {option}
                              </div>
                            ))}
                          </div>
                          {showExplanation && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                              <p className="text-blue-700">{question.explanation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => {
                    setQuizSubmitted(false);
                    setSelectedAnswers({});
                    setCurrentQuestionIndex(0);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  Try Again
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