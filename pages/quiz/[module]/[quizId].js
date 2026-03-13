import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function QuizAttemptPage() {
  const router = useRouter();
  const { module, quizId } = router.query;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [attempts, setAttempts] = useState([]);

  const quizInfo = {
    'listening-1': { name: 'Listening Quiz 1 - Social Conversation', icon: '🎧', duration: 30, questions: 40 },
    'listening-2': { name: 'Listening Quiz 2 - Monologue', icon: '🎧', duration: 30, questions: 40 },
    'listening-3': { name: 'Listening Quiz 3 - Educational Discussion', icon: '🎧', duration: 30, questions: 40 },
    'listening-4': { name: 'Listening Quiz 4 - Academic Lecture', icon: '🎧', duration: 30, questions: 40 },
    'listening-5': { name: 'Listening Quiz 5 - Full Practice Test', icon: '🎧', duration: 30, questions: 40 },
    
    'reading-1': { name: 'Reading Quiz 1 - Social Context', icon: '📖', duration: 60, questions: 40 },
    'reading-2': { name: 'Reading Quiz 2 - Workplace Context', icon: '📖', duration: 60, questions: 40 },
    'reading-3': { name: 'Reading Quiz 3 - Academic Texts', icon: '📖', duration: 60, questions: 40 },
    'reading-4': { name: 'Reading Quiz 4 - Scientific Articles', icon: '📖', duration: 60, questions: 40 },
    'reading-5': { name: 'Reading Quiz 5 - Full Practice Test', icon: '📖', duration: 60, questions: 40 },
    
    'writing-1': { name: 'Writing Quiz 1 - Basic Task 1', icon: '✍️', duration: 60, tasks: 2 },
    'writing-2': { name: 'Writing Quiz 2 - Basic Task 2', icon: '✍️', duration: 60, tasks: 2 },
    'writing-3': { name: 'Writing Quiz 3 - Complex Data', icon: '✍️', duration: 60, tasks: 2 },
    'writing-4': { name: 'Writing Quiz 4 - Argumentative Essays', icon: '✍️', duration: 60, tasks: 2 },
    'writing-5': { name: 'Writing Quiz 5 - Full Practice Test', icon: '✍️', duration: 60, tasks: 2 },
    
    'speaking-1': { name: 'Speaking Quiz 1 - Introduction', icon: '🎤', duration: 15, parts: 3 },
    'speaking-2': { name: 'Speaking Quiz 2 - Cue Card', icon: '🎤', duration: 15, parts: 3 },
    'speaking-3': { name: 'Speaking Quiz 3 - Discussion', icon: '🎤', duration: 15, parts: 3 },
    'speaking-4': { name: 'Speaking Quiz 4 - Advanced Topics', icon: '🎤', duration: 15, parts: 3 },
    'speaking-5': { name: 'Speaking Quiz 5 - Full Practice Test', icon: '🎤', duration: 15, parts: 3 },
  };

  const quiz = quizInfo[quizId] || { name: 'Quiz', icon: '📝', duration: 30, questions: 40 };

  useEffect(() => {
    checkAuth();
    if (module && quizId) {
      checkAccess();
      fetchAttempts();
    }
  }, [module, quizId]);

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

  const checkAccess = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch('/api/my-subscriptions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const hasActiveSubscription = data.activeSubscriptions.some(
          (s) =>
            s.testModule === module ||
            s.test_module === module ||
            s.testModule === 'full_package' ||
            s.test_module === 'full_package'
        );
        setHasAccess(hasActiveSubscription);

        if (!hasActiveSubscription) {
          alert('You do not have access to this quiz. Please purchase the module first.');
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error checking access:', error);
    }
  };

  const fetchAttempts = async () => {
    try {
      const token = localStorage.getItem("token");
      // This endpoint doesn't exist yet, so we'll show empty for now
      setAttempts([]);
    } catch (error) {
      console.error('Error fetching attempts:', error);
    }
  };

  const startQuiz = () => {
    if (module === 'speaking' || quizId?.startsWith('speaking-')) {
      router.push('/speaking-appointment');
      return;
    }
    router.push(`/take-quiz/${module}?quizId=${quizId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Checking your subscription...</p>
        </div>
      </div>
    );
  }

  if (module === 'speaking' || quizId?.startsWith('speaking-')) {
    return (
      <>
        <Head>
          <title>Speaking Test Appointment - IELTS Mock Platform</title>
        </Head>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <a href="/dashboard" className="text-2xl font-bold text-blue-600">
                  IELTS Mock Platform
                </a>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="text-gray-700 hover:text-blue-600 font-medium transition"
                  >
                    ← Back to Dashboard
                  </button>
                  <span className="text-gray-700">👤 {user?.name}</span>
                </div>
              </div>
            </div>
          </nav>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
              <div className="flex items-start space-x-6">
                <div className="text-7xl">🎤</div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Speaking test by appointment</h1>
                  <p className="text-gray-600 mb-4">
                    Speaking quizzes are conducted live with an examiner. Please book a slot with admin to proceed.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => router.push('/speaking-appointment')}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Book Appointment
                    </button>
                    <a
                      href="https://wa.me/1234567890"
                      target="_blank"
                      rel="noreferrer"
                      className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                      Message Admin on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{quiz.name} - IELTS Mock Platform</title>
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
                <button
                  onClick={() => router.push(`/quiz-list/${module}`)}
                  className="text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  ← Back to Quiz List
                </button>
                <span className="text-gray-700">👤 {user?.name}</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Quiz Header */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-start space-x-6">
              <div className="text-7xl">{quiz.icon}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{quiz.name}</h1>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    ✓ Unlocked
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-700 mb-6">
                  <span className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{quiz.duration} minutes</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>{quiz.questions || quiz.tasks || quiz.parts} {quiz.questions ? 'questions' : quiz.tasks ? 'tasks' : 'parts'}</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Unlimited attempts</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <button
                onClick={startQuiz}
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition text-lg"
              >
                🚀 Start New Attempt
              </button>
            </div>
          </div>

          {/* Attempt History */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Attempt History</h2>

            {attempts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Attempts Yet</h3>
                <p className="text-gray-600 mb-6">
                  You haven't attempted this quiz yet. Click "Start New Attempt" to begin!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {attempts.map((attempt, index) => (
                  <div key={index} className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">
                          {attempt.status === 'completed' ? '✅' : '⏳'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Attempt #{index + 1}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(attempt.startedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {attempt.score ? `${attempt.score}%` : 'In Progress'}
                        </div>
                        <button className="mt-2 text-blue-600 hover:text-blue-800 font-medium text-sm">
                          {attempt.status === 'completed' ? 'Review' : 'Continue'} →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-blue-900 mb-3">📋 Instructions</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• You can attempt this quiz multiple times</li>
              <li>• Each attempt will be timed based on the quiz duration</li>
              <li>• You can save your progress and continue later</li>
              <li>• Review your answers after completing the quiz</li>
              <li>• {module === 'listening' || module === 'reading' ? 'Results will be available immediately' : 'Results will be available after manual grading'}</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
