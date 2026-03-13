import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function ReviewAttempt() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(null);
  const [testModule, setTestModule] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      router.push("/login");
      return;
    }

    if (id) {
      fetchAttemptDetails(token);
    }
  }, [id]);

  const fetchAttemptDetails = async (token) => {
    try {
      const response = await fetch(`/api/attempts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.attempt.status !== 'finished') {
          router.push(`/attempt/${id}`);
          return;
        }
        
        setAttempt(data.attempt);
        setTestModule(data.testModule);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading review...</p>
        </div>
      </div>
    );
  }

  if (!attempt || !testModule) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Review Not Available</h2>
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

  const questions = testModule.questions || [];
  const question = questions[currentQuestion];

  const isCorrect = (questionNum) => {
    const q = questions.find(quest => quest.questionNumber === questionNum);
    if (!q) return false;

    const userAnswer = attempt.answers[questionNum];
    const correctAnswer = q.correctAnswer;

    if (!userAnswer || !correctAnswer) return false;

    if (Array.isArray(correctAnswer)) {
      return JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
    }
    return userAnswer.toString().toLowerCase() === correctAnswer.toString().toLowerCase();
  };

  return (
    <>
      <Head>
        <title>Review - {testModule.title} - IELTS Mock Platform</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-md border-b-2 border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{testModule.title} - Review</h1>
                  <p className="text-sm text-gray-600">Attempt {attempt.attemptNumber}</p>
                </div>
              </div>
              
              <button
                onClick={() => router.push(`/test/${testModule._id}`)}
                className="text-gray-600 hover:text-gray-900"
              >
                ✕ Close
              </button>
            </div>
          </div>
        </div>

        {/* Score Summary */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white mb-6">
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-blue-100 text-sm mb-1">Score</p>
                <p className="text-3xl font-bold">
                  {attempt.score?.obtained?.toFixed(2) || 0} / {attempt.score?.total?.toFixed(2) || 0}
                </p>
              </div>
              <div>
                <p className="text-blue-100 text-sm mb-1">Percentage</p>
                <p className="text-3xl font-bold">{attempt.score?.percentage?.toFixed(2) || 0}%</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm mb-1">Grade</p>
                <p className="text-3xl font-bold">{attempt.score?.grade || 'N/A'}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm mb-1">Duration</p>
                <p className="text-3xl font-bold">{attempt.duration || 0} min</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex">
          {/* Question Review */}
          <div className="flex-1 p-8">
            {question ? (
              <div className="bg-white rounded-xl shadow-md p-8">
                {/* Question Header */}
                <div className="mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-2">
                        Question {question.questionNumber}
                      </h2>
                      <p className="text-sm text-gray-600">
                        Marked out of {question.marks || 1}.00
                      </p>
                    </div>
                    {attempt.isGraded && (
                      <span className={`px-4 py-2 rounded-lg font-semibold ${
                        isCorrect(question.questionNumber)
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isCorrect(question.questionNumber) ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Content */}
                <div className="mb-8">
                  <div className="bg-blue-50 p-6 rounded-lg mb-6">
                    <div className="prose max-w-none">
                      <p className="text-gray-800 whitespace-pre-wrap">{question.question}</p>
                    </div>
                  </div>

                  {/* Answer Display */}
                  {testModule.moduleType === 'writing' ? (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Your Answer:</h3>
                      <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                        <p className="whitespace-pre-wrap">{attempt.answers[question.questionNumber] || 'No answer provided'}</p>
                      </div>
                      {attempt.feedback && (
                        <div className="mt-4">
                          <h3 className="font-bold text-gray-900 mb-2">Feedback:</h3>
                          <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
                            <p className="text-gray-800">{attempt.feedback}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : question.questionType === 'multiple_choice' ? (
                    <div>
                      <div className="space-y-3 mb-4">
                        {question.options?.map((option, idx) => {
                          const isUserAnswer = attempt.answers[question.questionNumber] === option;
                          const isCorrectAnswer = question.correctAnswer === option;
                          
                          return (
                            <div
                              key={idx}
                              className={`p-4 border-2 rounded-lg ${
                                isCorrectAnswer
                                  ? 'border-green-500 bg-green-50'
                                  : isUserAnswer
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-gray-200'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-gray-800">{option}</span>
                                {isCorrectAnswer && (
                                  <span className="text-green-600 font-semibold">✓ Correct Answer</span>
                                )}
                                {isUserAnswer && !isCorrectAnswer && (
                                  <span className="text-red-600 font-semibold">✗ Your Answer</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {question.explanation && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h3 className="font-bold text-gray-900 mb-2">Explanation:</h3>
                          <p className="text-gray-700">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h3 className="font-bold text-gray-900 mb-2">Your Answer:</h3>
                          <div className={`p-4 rounded-lg border-2 ${
                            isCorrect(question.questionNumber)
                              ? 'border-green-500 bg-green-50'
                              : 'border-red-500 bg-red-50'
                          }`}>
                            {attempt.answers[question.questionNumber] || 'No answer provided'}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 mb-2">Correct Answer:</h3>
                          <div className="p-4 rounded-lg border-2 border-green-500 bg-green-50">
                            {Array.isArray(question.correctAnswer) 
                              ? question.correctAnswer.join(', ') 
                              : question.correctAnswer}
                          </div>
                        </div>
                      </div>
                      {question.explanation && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h3 className="font-bold text-gray-900 mb-2">Explanation:</h3>
                          <p className="text-gray-700">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

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
            <h3 className="text-lg font-bold text-gray-900 mb-4">Question Navigation</h3>
            
            <div className="grid grid-cols-5 gap-2 mb-6">
              {questions.map((q, idx) => {
                const correct = isCorrect(q.questionNumber);
                const answered = attempt.answers[q.questionNumber] !== undefined;
                
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`aspect-square rounded-lg font-medium transition ${
                      idx === currentQuestion
                        ? 'bg-blue-600 text-white'
                        : attempt.isGraded && correct
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : attempt.isGraded && answered
                        ? 'bg-red-100 text-red-800 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {q.questionNumber}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => router.push(`/test/${testModule._id}`)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mb-4"
            >
              Back to Test
            </button>

            {attempt.isGraded && (
              <div className="mt-6 text-sm text-gray-600 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-100 rounded"></div>
                  <span>Correct</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-100 rounded"></div>
                  <span>Incorrect</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-100 rounded"></div>
                  <span>Not answered</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
