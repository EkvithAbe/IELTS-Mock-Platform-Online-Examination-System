import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function QuizPage() {
  const router = useRouter();
  const { module } = router.query;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState([]);
  const [hasAccess, setHasAccess] = useState(false);

  const quizDetails = {
    listening: {
      name: 'Listening Quiz',
      icon: '🎧',
      duration: 30,
      questions: 40,
      color: 'blue',
      description: 'Test your listening comprehension with authentic IELTS audio materials',
    },
    reading: {
      name: 'Reading Quiz',
      icon: '📖',
      duration: 60,
      questions: 40,
      color: 'green',
      description: 'Improve your reading skills with academic passages and questions',
    },
    writing: {
      name: 'Writing Quiz',
      icon: '✍️',
      duration: 60,
      questions: 2,
      color: 'purple',
      description: 'Practice Task 1 and Task 2 academic writing',
    },
    speaking: {
      name: 'Speaking Quiz',
      icon: '🎤',
      duration: 15,
      questions: 3,
      color: 'orange',
      description: 'Practice all three parts of the IELTS speaking test',
    },
  };

  const quiz = quizDetails[module] || quizDetails.listening;

  useEffect(() => {
    checkAuth();
    if (module) {
      checkAccess();
      fetchAttempts();
    }
  }, [module]);

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
          router.replace('/buy-quiz/Academic');
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      console.error('Error checking access:', error);
      setLoading(false);
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
    if (module === 'speaking') {
      router.push('/speaking-appointment');
      return;
    }
    router.push(`/take-quiz/${module}`);
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

  if (module === 'speaking') {
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
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Speaking Slot</h1>
                  <p className="text-gray-600 mb-4">
                    Speaking tests are conducted live with an examiner. Please schedule an appointment with our admin to take your speaking test.
                  </p>
                  <ul className="text-gray-700 space-y-2">
                    <li>• Choose a time that suits you — we will confirm availability.</li>
                    <li>• You will receive a Zoom/WhatsApp link once confirmed.</li>
                    <li>• Have your ID ready for verification during the call.</li>
                  </ul>
                  <div className="mt-6 flex flex-wrap gap-3">
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

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Purchase the IELTS full package to unlock this module.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/buy-quiz/Academic')}
              className="bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Buy Academic Package
            </button>
            <button
              onClick={() => router.push('/buy-quiz/General')}
              className="bg-green-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Buy General Package
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-200 text-gray-800 px-5 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700 border-blue-500',
    green: 'bg-green-600 hover:bg-green-700 border-green-500',
    purple: 'bg-purple-600 hover:bg-purple-700 border-purple-500',
    orange: 'bg-orange-600 hover:bg-orange-700 border-orange-500',
  };

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
                <p className="text-gray-600 mb-4">{quiz.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-700">
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
                    <span>{quiz.questions} {module === 'writing' ? 'tasks' : 'questions'}</span>
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
                className={`w-full sm:w-auto px-8 py-4 text-white rounded-lg font-semibold transition text-lg ${colorClasses[quiz.color]}`}
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
