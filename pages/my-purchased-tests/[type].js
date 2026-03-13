import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function MyPurchasedTests() {
  const router = useRouter();
  const { type, quizId } = router.query; // Academic or General, quiz ID
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  const testDetails = {
    Academic: {
      name: 'Academic IELTS',
      icon: '🎓',
      color: 'blue',
      tests: [
        { 
          id: 'listening', 
          name: 'Listening Test', 
          icon: '🎧', 
          duration: '30 min', 
          questions: '40 questions',
          description: 'Test your listening comprehension with academic audio materials',
          color: 'blue'
        },
        { 
          id: 'reading', 
          name: 'Reading Test', 
          icon: '📖', 
          duration: '60 min', 
          questions: '40 questions',
          description: 'Analyze academic passages and answer comprehension questions',
          color: 'green'
        },
        { 
          id: 'writing', 
          name: 'Writing Test', 
          icon: '✍️', 
          duration: '60 min', 
          questions: '2 tasks',
          description: 'Complete Task 1 (graph/chart) and Task 2 (essay writing)',
          color: 'purple'
        },
        { 
          id: 'speaking', 
          name: 'Speaking Test', 
          icon: '🎤', 
          duration: '15 min', 
          questions: '3 parts',
          description: 'Practice speaking with structured interview format',
          color: 'orange'
        }
      ]
    },
    General: {
      name: 'General IELTS',
      icon: '🌍',
      color: 'green',
      tests: [
        { 
          id: 'listening', 
          name: 'Listening Test', 
          icon: '🎧', 
          duration: '30 min', 
          questions: '40 questions',
          description: 'Test your listening comprehension with everyday situations',
          color: 'blue'
        },
        { 
          id: 'reading', 
          name: 'Reading Test', 
          icon: '📖', 
          duration: '60 min', 
          questions: '40 questions',
          description: 'Read general interest articles and answer questions',
          color: 'green'
        },
        { 
          id: 'writing', 
          name: 'Writing Test', 
          icon: '✍️', 
          duration: '60 min', 
          questions: '2 tasks',
          description: 'Write a letter (Task 1) and an essay (Task 2)',
          color: 'purple'
        },
        { 
          id: 'speaking', 
          name: 'Speaking Test', 
          icon: '🎤', 
          duration: '15 min', 
          questions: '3 parts',
          description: 'Practice speaking about familiar topics and personal experiences',
          color: 'orange'
        }
      ]
    }
  };

  const currentTest = testDetails[type] || testDetails.Academic;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(userData));
    fetchSubscription();
    setLoading(false);
  }, [type]);

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch('/api/my-subscriptions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Find subscription for this test type and quiz ID
        const sub = data.subscriptions.find(s => {
          const quizIdMatch = s.notes?.match(/Quiz ID: (\d+)/);
          const subQuizId = quizIdMatch ? quizIdMatch[1] : '1';
          return s.test_type === type && s.status === 'active' && subQuizId === quizId;
        });
        setSubscription(sub);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handleStartTest = (testId) => {
    if (subscription) {
      router.push(`/test-attempt/${type}/${testId}?quizId=${quizId}`);
    } else {
      alert('Please purchase this quiz package first!');
      router.push('/dashboard');
    }
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

  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700 border-blue-500 text-blue-600',
    green: 'bg-green-600 hover:bg-green-700 border-green-500 text-green-600',
    purple: 'bg-purple-600 hover:bg-purple-700 border-purple-500 text-purple-600',
    orange: 'bg-orange-600 hover:bg-orange-700 border-orange-500 text-orange-600',
  };

  return (
    <>
      <Head>
        <title>{currentTest.name} Tests - IELTS Mock Platform</title>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="text-8xl mb-4">{currentTest.icon}</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{currentTest.name}</h1>
            <p className="text-xl text-gray-600 mb-6">
              Complete test preparation with 4 modules
            </p>
            
            {subscription ? (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 max-w-md mx-auto">
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-800 font-semibold">Package Unlocked!</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Tests Used: {subscription.testsUsed} / {subscription.testsAllowed}
                </p>
              </div>
            ) : (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 max-w-md mx-auto">
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-red-800 font-semibold">Package Locked</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  Purchase this package to unlock all tests
                </p>
              </div>
            )}
          </div>

          {/* Test Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {currentTest.tests.map((test, index) => (
              <div key={test.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all">
                <div className="p-8">
                  <div className="text-center mb-6">
                    <div className="text-5xl mb-4">{test.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{test.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{test.description}</p>
                    
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{test.duration}</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>{test.questions}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartTest(test.id)}
                    disabled={!subscription}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition ${
                      subscription 
                        ? `bg-${test.color}-600 hover:bg-${test.color}-700 text-white` 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {subscription ? 'Start Test' : 'Locked'}
                  </button>

                  {subscription && (
                    <div className="mt-4 text-center">
                      <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                        ✓ Available
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Purchase Section */}
          {!subscription && (
            <div className="mt-12 text-center">
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Unlock All Tests</h3>
                <p className="text-gray-600 mb-6">
                  Get access to all 4 {type} IELTS tests for complete preparation
                </p>
                <div className="text-3xl font-bold text-gray-900 mb-6">$50</div>
                <button
                  onClick={() => router.push(`/buy-quiz/${type}`)}
                  className={`w-full bg-${currentTest.color}-600 hover:bg-${currentTest.color}-700 text-white py-3 px-6 rounded-lg font-semibold transition`}
                >
                  Purchase Package
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
