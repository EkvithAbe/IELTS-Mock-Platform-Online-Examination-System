import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function TestResults() {
  const router = useRouter();
  const { attemptId } = router.query;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(userData));
    if (attemptId) {
      fetchAttempt();
    }
  }, [attemptId]);

  const fetchAttempt = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/test-attempts/${attemptId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAttempt(data.attempt);
      } else {
        alert('Failed to load test results');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching attempt:', error);
      alert('Failed to load test results');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score, total) => {
    if (!score || !total) return 'text-gray-600';
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreDescription = (score, total) => {
    if (!score || !total) return 'Not Available';
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 60) return 'Good';
    if (percentage >= 40) return 'Fair';
    return 'Needs Improvement';
  };
  
  // Get totalQuestions from attempt (handle both naming conventions)
  const totalQuestions = attempt?.total_questions || attempt?.totalQuestions || attempt?.score_total || 0;
  const score = attempt?.score || attempt?.score_obtained || 0;
  const scorePercentage = attempt?.score_percentage || (totalQuestions > 0 ? (score / totalQuestions) * 100 : 0);
  const scoreGrade = attempt?.score_grade || null;

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const testIcons = {
    listening: '🎧',
    reading: '📖',
    writing: '✍️',
    speaking: '🎤'
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Results Not Found</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Test Results - IELTS Mock Platform</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <a href="/dashboard" className="text-2xl font-bold text-blue-600">
                IELTS Mock Platform
              </a>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Welcome, {user?.name}</span>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  ← Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="text-8xl mb-4">{testIcons[attempt.test_module || attempt.testModule] || '📝'}</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Test Results</h1>
            <p className="text-xl text-gray-600">
              {attempt.test_type || attempt.testType} IELTS - {attempt.test_module ? attempt.test_module.charAt(0).toUpperCase() + attempt.test_module.slice(1) : attempt.testModule ? attempt.testModule.charAt(0).toUpperCase() + attempt.testModule.slice(1) : 'Test'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Completed on {new Date(attempt.completed_at || attempt.completedAt).toLocaleDateString()}
            </p>
          </div>

          {/* Score Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="text-center">
              <div className={`text-6xl font-bold mb-4 ${getScoreColor(score, totalQuestions)}`}>
                {score}/{totalQuestions}
              </div>
              {scoreGrade && (
                <div className={`inline-block px-4 py-2 rounded-full text-xl font-bold mb-2 ${
                  scoreGrade === 'A+' || scoreGrade === 'A' ? 'bg-green-100 text-green-800' :
                  scoreGrade === 'B' ? 'bg-blue-100 text-blue-800' :
                  scoreGrade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  Grade: {scoreGrade}
                </div>
              )}
              <div className="text-2xl font-semibold text-gray-900 mb-2">
                {getScoreDescription(score, totalQuestions)}
              </div>
              <div className="text-lg text-gray-600">
                {Math.round(scorePercentage)}% Correct
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-8">
              <div className="bg-gray-200 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-500 ${
                    (score / totalQuestions) >= 0.8 ? 'bg-green-500' :
                    (score / totalQuestions) >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(score / totalQuestions) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Test Details */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Test Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Test Type:</span>
                  <span className="font-semibold">{attempt.test_type || attempt.testType} IELTS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Module:</span>
                  <span className="font-semibold capitalize">{attempt.test_module || attempt.testModule}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Questions Answered:</span>
                  <span className="font-semibold">{attempt.answers ? Object.keys(attempt.answers).length : 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Spent:</span>
                  <span className="font-semibold">{formatTime(attempt.time_spent || attempt.timeSpent || 0)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Breakdown</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Accuracy</span>
                    <span>{Math.round((score / totalQuestions) * 100)}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(score / totalQuestions) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Completion</span>
                    <span>{Math.round((Object.keys(attempt.answers).length / totalQuestions) * 100)}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(Object.keys(attempt.answers).length / totalQuestions) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grading Details - Show which answers were correct/incorrect */}
          {attempt.is_graded && attempt.gradingDetails && attempt.gradingDetails.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Answer Review</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {attempt.gradingDetails.map((detail, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      detail.isCorrect
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`font-semibold ${detail.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                            Question {detail.questionNumber}
                          </span>
                          {detail.isCorrect ? (
                            <span className="text-green-600 text-sm">Correct</span>
                          ) : (
                            <span className="text-red-600 text-sm">Incorrect</span>
                          )}
                        </div>
                        <div className="mt-2 text-sm">
                          <p className="text-gray-700">
                            <span className="font-medium">Your answer:</span>{' '}
                            <span className={detail.isCorrect ? 'text-green-700' : 'text-red-700'}>
                              {detail.userAnswer || '(No answer)'}
                            </span>
                          </p>
                          {!detail.isCorrect && (
                            <p className="text-gray-700 mt-1">
                              <span className="font-medium">Correct answer:</span>{' '}
                              <span className="text-green-700">{detail.correctAnswer}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className={`font-bold ${detail.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {detail.marks || 0} / {detail.isCorrect ? (detail.marks || 1) : (attempt.questions?.find(q => q.questionNumber == detail.questionNumber)?.marks || 1)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Grading Notice for Writing/Speaking */}
          {!attempt.is_graded && (attempt.test_module === 'writing' || attempt.test_module === 'speaking') && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
              <div className="flex items-center space-x-3">
                <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-yellow-900">Pending Manual Review</h4>
                  <p className="text-yellow-800 text-sm">
                    Your {attempt.test_module} test requires manual grading by an examiner.
                    You will be notified once your results are available.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recommendations</h3>
            <div className="space-y-4">
              {(score / totalQuestions) >= 0.8 ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-green-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-green-900">Excellent Performance!</h4>
                      <p className="text-green-800 text-sm">
                        You're performing very well in this module. Keep practicing to maintain your high level.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (score / totalQuestions) >= 0.6 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-yellow-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-yellow-900">Good Progress!</h4>
                      <p className="text-yellow-800 text-sm">
                        You're on the right track. Focus on areas where you made mistakes and practice more.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-red-900">Needs Improvement</h4>
                      <p className="text-red-800 text-sm">
                        Consider reviewing the fundamentals and practicing more before taking another test.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push(`/my-purchased-tests/${attempt.test_type || attempt.testType}`)}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Take Another Test
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
