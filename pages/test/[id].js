import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function TestDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testModule, setTestModule] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(userData));
    
    if (id) {
      fetchTestDetails(token);
    }
  }, [id]);

  const fetchTestDetails = async (token) => {
    try {
      const response = await fetch(`/api/test-modules/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTestModule(data.testModule);
        setAttempts(data.attempts || []);
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error("Error fetching test details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAttempt = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/attempts/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ testModuleId: id }),
      });

      if (response.ok) {
        const data = await response.json();
        const attemptId = data.attempt?._id || data.attempt?.id;
        if (attemptId) {
          router.push(`/attempt/${attemptId}`);
        } else {
          alert("Unable to start attempt.");
        }
      } else {
        const error = await response.json();
        alert(error.message || "Failed to start attempt");
      }
    } catch (error) {
      console.error("Error starting attempt:", error);
      alert("Failed to start attempt");
    }
  };

  const handleContinueAttempt = (attemptId) => {
    router.push(`/attempt/${attemptId}`);
  };

  const handleReviewAttempt = (attemptId) => {
    router.push(`/attempt/${attemptId}/review`);
  };

  const getModuleIcon = (moduleType) => {
    const icons = {
      listening: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      ),
      reading: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      writing: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      speaking: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
    };
    return icons[moduleType];
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInProgressAttempt = () => {
    return attempts.find(attempt => attempt.status === 'in_progress');
  };

  const isSpeakingModule =
    testModule?.moduleType === 'speaking' || testModule?.module_type === 'speaking';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading test details...</p>
        </div>
      </div>
    );
  }

  if (!testModule) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Test Not Found</h2>
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

  const inProgressAttempt = getInProgressAttempt();

  return (
    <>
      <Head>
        <title>{testModule.title} - IELTS Mock Platform</title>
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
                  onClick={() => router.push('/my-tests')}
                  className="text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  ← Back to My Tests
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Test Header */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-6">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600">
                {getModuleIcon(testModule.moduleType)}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {testModule.title}
                </h1>
                <p className="text-gray-600 mb-4">{testModule.description}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center space-x-2 text-gray-700">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span><strong>Duration:</strong> {testModule.duration} minutes</span>
                  </span>
                  <span className="flex items-center space-x-2 text-gray-700">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span><strong>Questions:</strong> {testModule.totalQuestions || 0}</span>
                  </span>
                  <span className="flex items-center space-x-2 text-gray-700">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <span><strong>Total Marks:</strong> {testModule.totalMarks || 0}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            {isSpeakingModule ? (
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => router.push('/speaking-appointment')}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Book Speaking Appointment
                </button>
                <a
                  href="https://wa.me/1234567890"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Message Admin
                </a>
              </div>
            ) : inProgressAttempt ? (
              <div className="mt-6">
                <button
                  onClick={() => handleContinueAttempt(inProgressAttempt._id || inProgressAttempt.id)}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Continue your attempt
                </button>
              </div>
            ) : (
              <div className="mt-6">
                <button
                  onClick={handleStartAttempt}
                  disabled={!subscription || subscription.status !== 'active'}
                  className={`px-8 py-3 rounded-lg font-semibold transition ${
                    subscription && subscription.status === 'active'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {subscription && subscription.status === 'active' 
                    ? 'Start New Attempt' 
                    : 'Subscription Required'}
                </button>
              </div>
            )}

            <div className="mt-4 text-sm text-gray-600">
              <strong>Grading method:</strong> Highest grade
            </div>
          </div>

          {/* Your Attempts */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your attempts</h2>

            {attempts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No attempts yet. Start your first attempt!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {attempts.map((attempt, index) => (
                  <div
                    key={attempt._id || attempt.id}
                    className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Attempt {attempt.attemptNumber}
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status</span>
                          <span className={`font-semibold ${
                            attempt.status === 'finished' 
                              ? 'text-green-600' 
                              : 'text-orange-600'
                          }`}>
                            {attempt.status === 'finished' ? 'Finished' : 'In progress'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Started</span>
                          <span className="font-medium text-gray-900">
                            {formatDate(attempt.startedAt || attempt.started_at)}
                          </span>
                        </div>
                        {(attempt.completedAt || attempt.completed_at) && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Completed</span>
                              <span className="font-medium text-gray-900">
                                {formatDate(attempt.completedAt || attempt.completed_at)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Duration</span>
                              <span className="font-medium text-gray-900">
                                {attempt.duration || attempt.duration_minutes || 0} min
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {attempt.status === 'finished' && attempt.isGraded && (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Marks</span>
                            <span className="font-medium text-gray-900">
                              {attempt.score.obtained.toFixed(2)}/{attempt.score.total.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Grade</span>
                            <span className="font-bold text-blue-600">
                              {attempt.score.grade} out of 10.00 ({attempt.score.percentage.toFixed(2)}%)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 flex space-x-3">
                      {attempt.status === 'in_progress' && (
                        <button
                          onClick={() => handleContinueAttempt(attempt._id)}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                          Continue
                        </button>
                      )}
                      {attempt.status === 'finished' && attempt.isGraded && (
                        <button
                          onClick={() => handleReviewAttempt(attempt._id)}
                          className="text-blue-600 hover:text-blue-800 font-medium transition"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
