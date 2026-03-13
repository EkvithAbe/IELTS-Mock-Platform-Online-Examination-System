import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { readingQuiz, writingQuiz } from "../../data/sampleQuizzes";

export default function TakeQuiz() {
  const router = useRouter();
  const { module } = router.query;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Quiz state
  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassage, setShowPassage] = useState(true);

  useEffect(() => {
    checkAuth();
    if (module) {
      loadQuiz();
    }
  }, [module]);

  // Timer
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (quizData) {
      const autoSave = setInterval(() => {
        saveProgress();
      }, 30000);
      return () => clearInterval(autoSave);
    }
  }, [answers]);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(userData));
    setLoading(false);
  };

  const loadQuiz = () => {
    if (module === 'reading') {
      setQuizData(readingQuiz);
      setTimeRemaining(readingQuiz.duration * 60);
    } else if (module === 'writing') {
      setQuizData(writingQuiz);
      setTimeRemaining(writingQuiz.duration * 60);
    } else if (module === 'speaking') {
      setQuizData({ type: 'speaking' });
      setLoading(false);
    }
  };

  const saveProgress = () => {
    // Auto-save to localStorage or API
    localStorage.setItem(`quiz_progress_${module}`, JSON.stringify({
      answers,
      flaggedQuestions: Array.from(flaggedQuestions),
      currentQuestion,
      timeRemaining,
    }));
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const toggleFlag = (questionId) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    if (!confirm('Are you sure you want to submit your quiz?')) return;
    
    setIsSubmitting(true);
    
    // Calculate score for reading quiz
    let score = 0;
    if (module === 'reading') {
      quizData.questions.forEach(q => {
        const userAnswer = answers[q.id];
        if (q.questionType === 'multiple_choice') {
          if (parseInt(userAnswer) === q.correctAnswer) score++;
        } else if (q.questionType === 'true_false_ng') {
          if (parseInt(userAnswer) === q.correctAnswer) score++;
        } else if (q.questionType === 'fill_blanks') {
          if (userAnswer && userAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase()) score++;
        }
      });
    }
    
    // For writing, score will be manual
    alert(`Quiz submitted! ${module === 'reading' ? `Score: ${score}/${quizData.questions.length}` : 'Your writing will be graded by an examiner.'}`);
    router.push(`/quiz/${module}`);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (questionId) => {
    if (flaggedQuestions.has(questionId)) return 'flagged';
    if (answers[questionId] !== undefined && answers[questionId] !== '') return 'answered';
    return 'unanswered';
  };

  if (loading || !quizData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (module === 'speaking') {
    return (
      <>
        <Head>
          <title>Speaking Test Appointment - IELTS Mock Platform</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-3xl w-full bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
            <div className="flex items-start space-x-4">
              <div className="text-6xl">🎤</div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Speaking test is live only</h1>
                <p className="text-gray-600 mb-4">
                  Please schedule a call with our admin to take your speaking test with an examiner.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => router.push('/speaking-appointment')}
                    className="bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Book Appointment
                  </button>
                  <a
                    href="https://wa.me/1234567890"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-green-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    Message Admin on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Render based on module type
  if (module === 'reading') {
    const currentQ = quizData.questions[currentQuestion];
    const currentPassage = quizData.passages.find(p => p.id === currentQ.passageId);

    return (
      <>
        <Head>
          <title>Reading Quiz - IELTS Mock Platform</title>
        </Head>

        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* Header */}
          <div className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">📖 Reading Test</h1>
              <span className="text-gray-600">Question {currentQuestion + 1} of {quizData.questions.length}</span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`font-bold ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
              >
                Submit Quiz
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Passage Panel */}
            <div className={`bg-white border-r transition-all ${showPassage ? 'w-1/2' : 'w-0'} overflow-y-auto`}>
              {showPassage && currentPassage && (
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentPassage.title}</h2>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {currentPassage.text}
                  </div>
                </div>
              )}
            </div>

            {/* Question Panel */}
            <div className="flex-1 flex">
              <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-3xl mx-auto">
                  {/* Toggle Passage Button */}
                  <button
                    onClick={() => setShowPassage(!showPassage)}
                    className="mb-6 text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>{showPassage ? 'Hide' : 'Show'} Passage</span>
                  </button>

                  {/* Question Card */}
                  <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <span className="text-sm font-semibold text-blue-600 mb-2 block">
                          Question {currentQ.questionNumber}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900">{currentQ.question}</h3>
                      </div>
                      <button
                        onClick={() => toggleFlag(currentQ.id)}
                        className={`p-2 rounded-lg transition ${
                          flaggedQuestions.has(currentQ.id)
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-gray-100 text-gray-400 hover:text-gray-600'
                        }`}
                        title="Flag for review"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" />
                        </svg>
                      </button>
                    </div>

                    {/* Answer Options */}
                    <div className="space-y-3">
                      {currentQ.questionType === 'multiple_choice' && (
                        currentQ.options.map((option, index) => (
                          <label
                            key={index}
                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                              answers[currentQ.id] === index
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 hover:border-blue-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={currentQ.id}
                              value={index}
                              checked={answers[currentQ.id] === index}
                              onChange={(e) => handleAnswerChange(currentQ.id, parseInt(e.target.value))}
                              className="w-5 h-5 text-blue-600"
                            />
                            <span className="ml-3 text-gray-900">{option}</span>
                          </label>
                        ))
                      )}

                      {currentQ.questionType === 'true_false_ng' && (
                        currentQ.options.map((option, index) => (
                          <label
                            key={index}
                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                              answers[currentQ.id] === index
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 hover:border-blue-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={currentQ.id}
                              value={index}
                              checked={answers[currentQ.id] === index}
                              onChange={(e) => handleAnswerChange(currentQ.id, parseInt(e.target.value))}
                              className="w-5 h-5 text-blue-600"
                            />
                            <span className="ml-3 text-gray-900 font-medium">{option}</span>
                          </label>
                        ))
                      )}

                      {currentQ.questionType === 'fill_blanks' && (
                        <input
                          type="text"
                          value={answers[currentQ.id] || ''}
                          onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                          placeholder="Type your answer here..."
                          className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t">
                      <button
                        onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestion === 0}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ← Previous
                      </button>
                      <button
                        onClick={() => setCurrentQuestion(prev => Math.min(quizData.questions.length - 1, prev + 1))}
                        disabled={currentQuestion === quizData.questions.length - 1}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Sidebar */}
              <div className="w-64 bg-white border-l p-6 overflow-y-auto">
                <h3 className="font-bold text-gray-900 mb-4">Question Navigation</h3>
                <div className="grid grid-cols-5 gap-2 mb-6">
                  {quizData.questions.map((q, index) => {
                    const status = getQuestionStatus(q.id);
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestion(index)}
                        className={`w-10 h-10 rounded-lg font-semibold transition ${
                          index === currentQuestion
                            ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                            : status === 'answered'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : status === 'flagged'
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-100 rounded"></div>
                    <span className="text-gray-600">Answered</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-100 rounded"></div>
                    <span className="text-gray-600">Flagged</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-100 rounded"></div>
                    <span className="text-gray-600">Not answered</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // WRITING QUIZ
  if (module === 'writing') {
    const currentTask = quizData.tasks[currentQuestion];

    return (
      <>
        <Head>
          <title>Writing Quiz - IELTS Mock Platform</title>
        </Head>

        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* Header */}
          <div className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">✍️ Writing Test</h1>
              <span className="text-gray-600">Task {currentQuestion + 1} of {quizData.tasks.length}</span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`font-bold ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Words: <span className="font-bold">{(answers[currentTask.id] || '').split(/\s+/).filter(w => w).length}</span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
              >
                Submit Quiz
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Writing Area */}
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-8">
                  {/* Task Instructions */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                    <h3 className="font-bold text-blue-900 mb-2">
                      Task {currentTask.taskNumber}: {currentTask.taskType}
                    </h3>
                    <p className="text-sm text-blue-800 whitespace-pre-line">{currentTask.instructions}</p>
                  </div>

                  {/* Task Prompt */}
                  <div className="mb-6">
                    <div className="prose max-w-none">
                      <p className="text-gray-900 whitespace-pre-line leading-relaxed">
                        {currentTask.prompt}
                      </p>
                    </div>
                  </div>

                  {/* Word Count Info */}
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <span className="text-gray-600">
                      Minimum words: <span className="font-semibold">{currentTask.wordLimit}</span>
                    </span>
                    <span className={`font-semibold ${
                      (answers[currentTask.id] || '').split(/\s+/).filter(w => w).length >= currentTask.wordLimit
                        ? 'text-green-600'
                        : 'text-orange-600'
                    }`}>
                      Current: {(answers[currentTask.id] || '').split(/\s+/).filter(w => w).length} words
                    </span>
                  </div>

                  {/* Text Area */}
                  <textarea
                    value={answers[currentTask.id] || ''}
                    onChange={(e) => handleAnswerChange(currentTask.id, e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full h-96 p-6 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-gray-900 resize-none"
                    style={{ lineHeight: '1.8' }}
                  />

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8 pt-6 border-t">
                    <button
                      onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                      disabled={currentQuestion === 0}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Previous Task
                    </button>
                    <button
                      onClick={() => setCurrentQuestion(prev => Math.min(quizData.tasks.length - 1, prev + 1))}
                      disabled={currentQuestion === quizData.tasks.length - 1}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next Task →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-64 bg-white border-l p-6 overflow-y-auto">
              <h3 className="font-bold text-gray-900 mb-4">Tasks</h3>
              <div className="space-y-3">
                {quizData.tasks.map((task, index) => {
                  const wordCount = (answers[task.id] || '').split(/\s+/).filter(w => w).length;
                  const isComplete = wordCount >= task.wordLimit;
                  
                  return (
                    <button
                      key={task.id}
                      onClick={() => setCurrentQuestion(index)}
                      className={`w-full p-4 rounded-lg text-left transition ${
                        index === currentQuestion
                          ? 'bg-blue-600 text-white'
                          : isComplete
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="font-semibold mb-1">Task {task.taskNumber}</div>
                      <div className="text-sm opacity-90">{wordCount} / {task.wordLimit} words</div>
                      <div className="text-xs opacity-75 mt-1">{task.duration} min</div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t text-sm text-gray-600">
                <p className="mb-2">💡 Tips:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Plan before writing</li>
                  <li>• Check word count</li>
                  <li>• Review grammar</li>
                  <li>• Auto-saves every 30s</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}
