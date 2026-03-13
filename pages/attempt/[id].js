import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";

export default function AttemptQuiz() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(null);
  const [testModule, setTestModule] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const timerRef = useRef(null);
  const autoSubmitRef = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      router.push("/login");
      return;
    }

    if (id) {
      fetchAttemptDetails(token);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id]);

  useEffect(() => {
    if (testModule && attempt) {
      const elapsed = Math.floor((new Date() - new Date(attempt.startedAt || attempt.started_at)) / 1000);
      const totalSeconds = testModule.duration * 60;
      const remaining = Math.max(0, totalSeconds - elapsed);
      setTimeLeft(remaining);

      // Start timer
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Auto-submit when timer expires (no confirmation needed)
            autoSubmitRef.current = true;
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [testModule, attempt]);

  const fetchAttemptDetails = async (token) => {
    try {
      const response = await fetch(`/api/attempts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAttempt(data.attempt);
        setTestModule(data.testModule);
        setAnswers(data.attempt.answers || {});
        setFlaggedQuestions(data.attempt.flaggedQuestions || data.attempt.flagged_questions || []);
      } else {
        router.push('/my-tests');
      }
    } catch (error) {
      console.error("Error fetching attempt details:", error);
      router.push('/my-tests');
    } finally {
      setLoading(false);
    }
  };

  const saveAnswer = async (questionNumber, answer) => {
    const newAnswers = { ...answers, [questionNumber]: answer };
    setAnswers(newAnswers);

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      await fetch(`/api/attempts/${id}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          answers: newAnswers,
          flaggedQuestions,
        }),
      });
    } catch (error) {
      console.error("Error saving answer:", error);
    } finally {
      setSaving(false);
    }
  };

  const toggleFlag = async (questionNumber) => {
    const newFlagged = flaggedQuestions.includes(questionNumber)
      ? flaggedQuestions.filter(q => q !== questionNumber)
      : [...flaggedQuestions, questionNumber];
    
    setFlaggedQuestions(newFlagged);

    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/attempts/${id}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          answers,
          flaggedQuestions: newFlagged,
        }),
      });
    } catch (error) {
      console.error("Error flagging question:", error);
    }
  };

  const handleFinishClick = () => {
    // Show confirmation modal only for manual finish (not auto-submit)
    setShowFinishModal(true);
  };

  const handleSubmit = async (skipConfirmation = false) => {
    // If auto-submitting (timer expired), skip confirmation
    if (!skipConfirmation && !autoSubmitRef.current) {
      // This shouldn't be called directly anymore, use handleFinishClick instead
      return;
    }

    // Clear timer to prevent multiple submissions
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/attempts/${id}/finish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers, flaggedQuestions }),
      });

      if (response.ok) {
        router.push(`/test/${testModule._id || testModule.id}`);
      } else {
        alert("Error submitting attempt. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting attempt:", error);
      alert("Error submitting attempt");
    }
  };

  const confirmFinish = () => {
    setShowFinishModal(false);
    autoSubmitRef.current = true; // Mark as confirmed
    handleSubmit(true);
  };

  const cancelFinish = () => {
    setShowFinishModal(false);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!attempt || !testModule) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Attempt Not Found</h2>
          <button
            onClick={() => router.push('/my-tests')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Back to My Tests
          </button>
        </div>
      </div>
    );
  }

  const moduleType = testModule.module_type || testModule.moduleType;
  const questionsRaw = testModule.questions || [];
  const questions = questionsRaw.map((q, idx) => {
    const qNumber = q.questionNumber || q.number || q.id || idx + 1;
    const questionText =
      q.question ||
      q.prompt ||
      q.text ||
      (q.content && q.content.prompt) ||
      testModule.content?.prompt ||
      "";
    return {
      ...q,
      qNumber,
      questionText,
      marks: q.marks || 1,
      questionType: q.questionType || (moduleType === "writing" ? "long_text" : "short_answer"),
    };
  });

  const question = questions[currentQuestion];
  const qNumber = question?.qNumber || currentQuestion + 1;
  const questionText = question?.questionText || "";

  return (
    <>
      <Head>
        <title>{testModule.title} - Attempt - IELTS Mock Platform</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-md border-b-2 border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900">{testModule.title}</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className={`text-lg font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                  Time Left: {formatTime(timeLeft)}
                </div>
                <button
                  onClick={() => router.push(`/test/${testModule._id || testModule.id}`)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex">
          {/* Quiz Content */}
          <div className="flex-1 p-8">
            <button
              onClick={() => router.push(`/test/${testModule._id || testModule.id}`)}
              className="mb-4 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Back
            </button>

            {question ? (
              <div className="bg-white rounded-xl shadow-md p-8">
                {/* Question Header */}
                <div className="mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-2">
                        Question {qNumber}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {answers[qNumber] ? 'Answered' : 'Not yet answered'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Marked out of {question?.marks || 1}.00
                      </p>
                    </div>
                    <button
                      onClick={() => toggleFlag(qNumber)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                        flaggedQuestions.includes(qNumber)
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                      </svg>
                      <span className="text-sm font-medium">Flag question</span>
                    </button>
                  </div>
                </div>

                {/* Question Content */}
                <div className="mb-8 space-y-4">
                  {moduleType === 'listening' && testModule.content?.audioUrl && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <p className="font-semibold text-gray-900 mb-2">Audio</p>
                      <audio controls className="w-full">
                        <source src={testModule.content.audioUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}

                  {moduleType === 'writing' ? (
                    <div className="bg-blue-50 p-6 rounded-lg mb-6">
                      <div className="prose max-w-none space-y-3">
                        {testModule.content?.tasks?.[currentQuestion] ? (
                          <>
                            <h3 className="font-bold text-gray-900">
                              Task {testModule.content.tasks[currentQuestion].taskNumber}
                            </h3>
                            <div className="whitespace-pre-wrap text-gray-800">
                              {testModule.content.tasks[currentQuestion].prompt}
                            </div>
                            {testModule.content.tasks[currentQuestion].instructions && (
                              <div className="text-sm text-gray-600">
                                <strong>Instructions:</strong> {testModule.content.tasks[currentQuestion].instructions}
                              </div>
                            )}
                            {testModule.content.tasks[currentQuestion].wordLimit && (
                              <div className="text-sm text-gray-600">
                                <strong>Word limit:</strong> {testModule.content.tasks[currentQuestion].wordLimit} words
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <h3 className="font-bold text-gray-900">Task</h3>
                            <div className="whitespace-pre-wrap text-gray-800">
                              {questionText || testModule.content?.prompt || 'No question text provided.'}
                            </div>
                            {(testModule.content?.instructions || question.instructions) && (
                              <div className="text-sm text-gray-600">
                                <strong>Instructions:</strong>{' '}
                                {testModule.content?.instructions || question.instructions}
                              </div>
                            )}
                            {(testModule.content?.word_limit || question.wordLimit) && (
                              <div className="text-sm text-gray-600">
                                <strong>Word limit:</strong> {testModule.content?.word_limit || question.wordLimit} words
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 p-6 rounded-lg mb-6">
                      <div className="prose max-w-none">
                        <p className="text-gray-800 whitespace-pre-wrap">
                          {question.question || questionText || 'No question text provided.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Answer Input */}
                  {moduleType === 'writing' ? (
                    // Text Editor for Writing
                    <div>
                      <div className="bg-gray-100 border border-gray-300 rounded-t-lg p-2 flex space-x-2">
                        <button className="p-2 hover:bg-gray-200 rounded" title="Undo">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                        </button>
                        <button className="p-2 hover:bg-gray-200 rounded" title="Redo">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                          </svg>
                        </button>
                        <button className="p-2 hover:bg-gray-200 rounded font-bold" title="Bold">B</button>
                        <button className="p-2 hover:bg-gray-200 rounded italic" title="Italic">I</button>
                        <button className="p-2 hover:bg-gray-200 rounded" title="Link">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        </button>
                      </div>
                      <textarea
                        className="w-full border border-t-0 border-gray-300 rounded-b-lg p-4 min-h-[400px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Write your answer here..."
                        value={answers[qNumber] || ''}
                        onChange={(e) => saveAnswer(qNumber, e.target.value)}
                      />
                      <div className="mt-2 text-sm text-gray-600">
                        Word count: {(answers[qNumber] || '').split(/\s+/).filter(w => w).length}
                      </div>
                    </div>
                  ) : question.questionType === 'multiple_choice' ? (
                    // Multiple Choice
                    <div className="space-y-3">
                      {question.options?.map((option, idx) => (
                        <label
                          key={idx}
                          className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition"
                        >
                          <input
                            type="radio"
                            name={`question-${qNumber}`}
                            checked={answers[qNumber] === option}
                            onChange={() => saveAnswer(qNumber, option)}
                            className="w-5 h-5 text-blue-600"
                          />
                          <span className="text-gray-800">{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    // Short Answer / Fill in the blanks
                    <input
                      type="text"
                      className="w-full border-2 border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Type your answer here..."
                      value={answers[qNumber] || ''}
                      onChange={(e) => saveAnswer(qNumber, e.target.value)}
                    />
                  )}
                </div>

                {saving && (
                  <div className="text-sm text-gray-600 mb-4">
                    <span className="inline-flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                    className={`px-6 py-2 rounded-lg font-medium transition ${
                      currentQuestion === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    ← Previous
                  </button>
                  
                  <button
                    onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                    disabled={currentQuestion === questions.length - 1}
                    className={`px-6 py-2 rounded-lg font-medium transition ${
                      currentQuestion === questions.length - 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Next →
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <p className="text-gray-600">No questions available</p>
              </div>
            )}
          </div>

          {/* Quiz Navigation Sidebar */}
          <div className="w-80 bg-white border-l border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quiz navigation</h3>
            
            <div className="grid grid-cols-5 gap-2 mb-6">
              {questions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestion(idx)}
                  className={`aspect-square rounded-lg font-medium transition ${
                    idx === currentQuestion
                      ? 'bg-blue-600 text-white'
                      : answers[q.questionNumber]
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : flaggedQuestions.includes(q.questionNumber)
                      ? 'bg-red-100 text-red-800 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {q.questionNumber}
                </button>
              ))}
            </div>

            <button
              onClick={handleFinishClick}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Finish attempt ...
            </button>

            <div className="mt-6 text-sm text-gray-600 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-100 rounded"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-100 rounded"></div>
                <span>Not answered</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-100 rounded"></div>
                <span>Flagged</span>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Finish Confirmation Modal */}
        {showFinishModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Finish Attempt?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to finish this attempt? Once submitted, you cannot change your answers.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={cancelFinish}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmFinish}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Finish
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
