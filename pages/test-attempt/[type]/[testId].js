import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function TestAttempt() {
  const router = useRouter();
  const { type, testId } = router.query; // type: Academic/General, testId: listening/reading/writing/speaking
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [testModule, setTestModule] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [content, setContent] = useState(null);

  const defaultTestDetails = {
    listening: {
      name: 'Listening Test',
      icon: '🎧',
      duration: 30,
      color: 'blue',
      instructions: 'Listen carefully to the audio recordings and answer the questions.',
    },
    reading: {
      name: 'Reading Test',
      icon: '📖',
      duration: 60,
      color: 'green',
      instructions: 'Read the passages carefully and answer all questions.',
    },
    writing: {
      name: 'Writing Test',
      icon: '✍️',
      duration: 60,
      color: 'purple',
      instructions: 'Complete the writing task within the time limit.',
    },
    speaking: {
      name: 'Speaking Test',
      icon: '🎤',
      duration: 15,
      color: 'orange',
      instructions: 'This is a simulated speaking test. Record your responses.',
    }
  };

  const currentTestDefaults = defaultTestDetails[testId] || defaultTestDetails.listening;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Fetch test module with questions from database
    const fetchTestModule = async () => {
      try {
        const response = await fetch(
          `/api/modules?testType=${type}&moduleType=${testId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.modules && data.modules.length > 0) {
            const mod = data.modules[0];
            setTestModule(mod);

            // Parse questions
            const moduleQuestions = mod.questions || [];
            setQuestions(moduleQuestions);

            // Parse content (passage, audio, etc.)
            setContent(mod.content || {});

            // Set timer based on module duration
            const duration = mod.duration || currentTestDefaults.duration;
            setTimeLeft(duration * 60);
          } else {
            // No module found, use defaults
            setTimeLeft(currentTestDefaults.duration * 60);
            setQuestions([]);
          }
        } else {
          console.error('Failed to fetch test module');
          setTimeLeft(currentTestDefaults.duration * 60);
        }
      } catch (error) {
        console.error('Error fetching test module:', error);
        setTimeLeft(currentTestDefaults.duration * 60);
      } finally {
        setLoading(false);
      }
    };

    if (type && testId) {
      fetchTestModule();
    }
  }, [type, testId]);

  // Timer countdown effect
  useEffect(() => {
    if (loading || isSubmitted) return; // Don't run timer if loading or submitted
    
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      console.log('Time is up! Auto-submitting...');
      handleSubmit();
    }
  }, [timeLeft, loading, isSubmitted]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionNum, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionNum]: answer
    }));
  };

  const handleSubmit = async () => {
    // Show confirmation dialog
    const answeredCount = Object.keys(answers).length;
    const totalQuestionsCount = questions.length || 1;

    if (answeredCount < totalQuestionsCount) {
      const unanswered = totalQuestionsCount - answeredCount;
      const confirmed = window.confirm(
        `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}.\n\n` +
        `Are you sure you want to finish the test?`
      );
      if (!confirmed) return;
    } else {
      const confirmed = window.confirm(
        `Are you ready to submit your test?\n\n` +
        `Once submitted, you cannot change your answers.`
      );
      if (!confirmed) return;
    }

    setIsSubmitted(true);

    try {
      const token = localStorage.getItem("token");
      const duration = testModule?.duration || currentTestDefaults.duration;
      const response = await fetch('/api/test-attempts/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          testType: type,
          testModule: testId,
          testModuleId: testModule?.id || null,
          answers,
          timeSpent: (duration * 60) - timeLeft,
          totalQuestions: totalQuestionsCount
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.isGraded) {
          alert(`${data.message}\nGrade: ${data.scoreGrade}`);
        } else {
          alert(data.message);
        }
        router.push(`/test-results/${data.attemptId}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Submission failed:', errorData);
        alert(`Failed to submit test: ${errorData.error || errorData.message || 'Please try again'}`);
        setIsSubmitted(false);
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Failed to submit test. Please try again.');
      setIsSubmitted(false);
    }
  };

  const renderQuestionInput = (questionKey, questionType) => {
    if (testId === 'writing') {
      return (
        <textarea
          value={answers[questionKey] || ''}
          onChange={(e) => handleAnswerChange(questionKey, e.target.value)}
          className="w-full h-40 border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Write your response here..."
        />
      );
    } else if (testId === 'speaking') {
      return (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">
              Speaking test simulation - In a real test, you would speak to an examiner.
            </p>
          </div>
          <textarea
            value={answers[questionKey] || ''}
            onChange={(e) => handleAnswerChange(questionKey, e.target.value)}
            className="w-full h-32 border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Write your speaking response notes here..."
          />
        </div>
      );
    } else if (questionType === 'multiple_choice') {
      return (
        <input
          type="text"
          value={answers[questionKey] || ''}
          onChange={(e) => handleAnswerChange(questionKey, e.target.value)}
          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your answer (e.g., A, B, C, or D)..."
        />
      );
    } else {
      return (
        <input
          type="text"
          value={answers[questionKey] || ''}
          onChange={(e) => handleAnswerChange(questionKey, e.target.value)}
          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your answer..."
        />
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  const totalQuestionsCount = questions.length || 1;
  const testName = testModule?.title || currentTestDefaults.name;
  const testInstructions = testModule?.instructions || content?.instructions || currentTestDefaults.instructions;

  return (
    <>
      <Head>
        <title>{testName} - {type} IELTS</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-md sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <span className="text-2xl">{currentTestDefaults.icon}</span>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{testName}</h1>
                  <p className="text-sm text-gray-600">{type} IELTS</p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-sm text-gray-600">Time Remaining</div>
                  <div className={`text-xl font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatTime(timeLeft)}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-gray-600">Progress</div>
                  <div className="text-xl font-bold text-gray-900">
                    {Object.keys(answers).length} / {totalQuestionsCount}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Instructions */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-bold text-blue-900 mb-2">Instructions</h2>
            <p className="text-blue-800">{testInstructions}</p>
            {testModule && (
              <p className="text-sm text-blue-700 mt-2">
                Total Questions: {totalQuestionsCount} | Duration: {testModule.duration} minutes
              </p>
            )}
          </div>

          {/* Audio Player for Listening */}
          {testId === 'listening' && content?.audioUrl && (
            <div className="bg-gray-100 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Audio Recording</h3>
              <audio controls className="w-full">
                <source src={content.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              {content.transcript && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-blue-600 font-medium">View Transcript</summary>
                  <p className="mt-2 text-gray-700 whitespace-pre-wrap">{content.transcript}</p>
                </details>
              )}
            </div>
          )}

          {/* Reading Passage */}
          {testId === 'reading' && content?.passage && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reading Passage</h3>
              {content.source && (
                <p className="text-sm text-gray-500 mb-3">Source: {content.source}</p>
              )}
              <div className="prose max-w-none text-gray-800 whitespace-pre-wrap">
                {content.passage}
              </div>
            </div>
          )}

          {/* Writing Prompt */}
          {testId === 'writing' && content?.prompt && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-purple-900 mb-4">Writing Task</h3>
              <p className="text-gray-800 whitespace-pre-wrap">{content.prompt}</p>
              {content.word_limit && (
                <p className="text-sm text-purple-700 mt-3">
                  Word limit: {content.word_limit} words
                </p>
              )}
            </div>
          )}

          {/* Questions */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="space-y-8">
              {questions.length > 0 ? (
                questions.map((q, index) => {
                  const questionKey = q.questionNumber || q.id || (index + 1);
                  return (
                    <div key={questionKey} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-blue-600">
                            {index + 1}
                          </span>
                        </div>

                        <div className="flex-1">
                          <div className="mb-4">
                            <h3 className="font-semibold text-gray-900 mb-2">
                              Question {index + 1}
                              {q.marks > 1 && <span className="text-sm font-normal text-gray-500 ml-2">({q.marks} marks)</span>}
                            </h3>
                            <p className="text-gray-700">
                              {q.question || q.prompt || `Question ${index + 1}`}
                            </p>
                          </div>

                          {renderQuestionInput(questionKey, q.questionType)}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                // Fallback for writing/speaking without structured questions
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-blue-600">1</span>
                    </div>
                    <div className="flex-1">
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Your Response</h3>
                        <p className="text-gray-700">Enter your answer below.</p>
                      </div>
                      {renderQuestionInput(1, testId)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit/Finish Button */}
            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitted}
                className="px-10 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-lg font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isSubmitted ? 'Submitted' : 'Finish Test'}
              </button>
            </div>

            {/* Progress Info */}
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>Questions Answered: <strong>{Object.keys(answers).length} / {totalQuestionsCount}</strong></p>
              {Object.keys(answers).length < totalQuestionsCount && (
                <p className="text-yellow-600 mt-2">You have unanswered questions</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
