import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function QuizList() {
  const router = useRouter();
  const { module } = router.query;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [hasModuleAccess, setHasModuleAccess] = useState(false);

  const moduleDetails = {
    listening: {
      name: 'Listening Module',
      icon: '🎧',
      color: 'blue',
      quizzes: [
        {
          id: 'listening-1',
          title: 'Listening Quiz 1 - Social Conversation',
          description: 'Conversation between two people in everyday social context',
          duration: 30,
          questions: 40,
          difficulty: 'Easy',
          initiallyUnlocked: true,
        },
        {
          id: 'listening-2',
          title: 'Listening Quiz 2 - Monologue',
          description: 'A monologue set in everyday social context',
          duration: 30,
          questions: 40,
          difficulty: 'Easy',
          initiallyUnlocked: true,
        },
        {
          id: 'listening-3',
          title: 'Listening Quiz 3 - Educational Discussion',
          description: 'Conversation in educational or training context',
          duration: 30,
          questions: 40,
          difficulty: 'Medium',
          initiallyUnlocked: false,
        },
        {
          id: 'listening-4',
          title: 'Listening Quiz 4 - Academic Lecture',
          description: 'Monologue on an academic subject',
          duration: 30,
          questions: 40,
          difficulty: 'Medium',
          initiallyUnlocked: false,
        },
        {
          id: 'listening-5',
          title: 'Listening Quiz 5 - Full Practice Test',
          description: 'Complete IELTS listening test with all sections',
          duration: 30,
          questions: 40,
          difficulty: 'Hard',
          initiallyUnlocked: false,
        },
      ],
    },
    reading: {
      name: 'Reading Module',
      icon: '📖',
      color: 'green',
      quizzes: [
        {
          id: 'reading-1',
          title: 'Reading Quiz 1 - Social Context',
          description: 'Short passages on everyday topics',
          duration: 60,
          questions: 40,
          difficulty: 'Easy',
          initiallyUnlocked: true,
        },
        {
          id: 'reading-2',
          title: 'Reading Quiz 2 - Workplace Context',
          description: 'Work-related passages and documents',
          duration: 60,
          questions: 40,
          difficulty: 'Easy',
          initiallyUnlocked: true,
        },
        {
          id: 'reading-3',
          title: 'Reading Quiz 3 - Academic Texts',
          description: 'Academic passages with complex vocabulary',
          duration: 60,
          questions: 40,
          difficulty: 'Medium',
          initiallyUnlocked: false,
        },
        {
          id: 'reading-4',
          title: 'Reading Quiz 4 - Scientific Articles',
          description: 'Scientific and technical reading materials',
          duration: 60,
          questions: 40,
          difficulty: 'Medium',
          initiallyUnlocked: false,
        },
        {
          id: 'reading-5',
          title: 'Reading Quiz 5 - Full Practice Test',
          description: 'Complete IELTS reading test',
          duration: 60,
          questions: 40,
          difficulty: 'Hard',
          initiallyUnlocked: false,
        },
      ],
    },
    writing: {
      name: 'Writing Module',
      icon: '✍️',
      color: 'purple',
      quizzes: [
        {
          id: 'writing-1',
          title: 'Writing Quiz 1 - Basic Task 1',
          description: 'Simple charts and graphs description',
          duration: 60,
          tasks: 2,
          difficulty: 'Easy',
          initiallyUnlocked: true,
        },
        {
          id: 'writing-2',
          title: 'Writing Quiz 2 - Basic Task 2',
          description: 'Opinion essays on familiar topics',
          duration: 60,
          tasks: 2,
          difficulty: 'Easy',
          initiallyUnlocked: true,
        },
        {
          id: 'writing-3',
          title: 'Writing Quiz 3 - Complex Data',
          description: 'Complex charts, tables, and diagrams',
          duration: 60,
          tasks: 2,
          difficulty: 'Medium',
          initiallyUnlocked: false,
        },
        {
          id: 'writing-4',
          title: 'Writing Quiz 4 - Argumentative Essays',
          description: 'Discuss both views essays',
          duration: 60,
          tasks: 2,
          difficulty: 'Medium',
          initiallyUnlocked: false,
        },
        {
          id: 'writing-5',
          title: 'Writing Quiz 5 - Full Practice Test',
          description: 'Complete IELTS writing test',
          duration: 60,
          tasks: 2,
          difficulty: 'Hard',
          initiallyUnlocked: false,
        },
      ],
    },
    speaking: {
      name: 'Speaking Module',
      icon: '🎤',
      color: 'orange',
      quizzes: [
        {
          id: 'speaking-1',
          title: 'Speaking Quiz 1 - Introduction',
          description: 'Part 1: Introduction and interview questions',
          duration: 15,
          parts: 3,
          difficulty: 'Easy',
          initiallyUnlocked: true,
        },
        {
          id: 'speaking-2',
          title: 'Speaking Quiz 2 - Cue Card',
          description: 'Part 2: Individual long turn practice',
          duration: 15,
          parts: 3,
          difficulty: 'Easy',
          initiallyUnlocked: true,
        },
        {
          id: 'speaking-3',
          title: 'Speaking Quiz 3 - Discussion',
          description: 'Part 3: Two-way discussion',
          duration: 15,
          parts: 3,
          difficulty: 'Medium',
          initiallyUnlocked: false,
        },
        {
          id: 'speaking-4',
          title: 'Speaking Quiz 4 - Advanced Topics',
          description: 'Complex abstract topics',
          duration: 15,
          parts: 3,
          difficulty: 'Medium',
          initiallyUnlocked: false,
        },
        {
          id: 'speaking-5',
          title: 'Speaking Quiz 5 - Full Practice Test',
          description: 'Complete IELTS speaking test',
          duration: 15,
          parts: 3,
          difficulty: 'Hard',
          initiallyUnlocked: false,
        },
      ],
    },
  };

  const currentModule = moduleDetails[module] || moduleDetails.listening;

  useEffect(() => {
    checkAuth();
    if (module) {
      checkModuleAccess();
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

  const checkModuleAccess = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch('/api/my-subscriptions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const hasAccess = data.activeSubscriptions.some(
          (s) =>
            s.testModule === module ||
            s.test_module === module ||
            s.testModule === 'full_package' ||
            s.test_module === 'full_package'
        );
        setHasModuleAccess(hasAccess);
        setSubscriptions(data.activeSubscriptions);

        if (!hasAccess) {
          router.replace('/buy-quiz/Academic');
        }
      }
    } catch (error) {
      console.error('Error checking access:', error);
    }
  };

  const handleQuizClick = (quiz) => {
    if (!quiz.initiallyUnlocked) {
      alert('This quiz is locked! Complete previous quizzes or purchase to unlock.');
      return;
    }
    router.push(`/quiz/${module}/${quiz.id}`);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-700';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'Hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const colorClasses = {
    blue: 'bg-blue-600 border-blue-500',
    green: 'bg-green-600 border-green-500',
    purple: 'bg-purple-600 border-purple-500',
    orange: 'bg-orange-600 border-orange-500',
  };

  if (loading || !hasModuleAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Purchase the IELTS package to unlock.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
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

  if (module === 'speaking') {
    return (
      <>
        <Head>
          <title>Speaking Test - Schedule Appointment</title>
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
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">Speaking test by appointment</h1>
                  <p className="text-gray-600 mb-4">
                    Speaking practice is delivered live with an examiner. Please schedule an appointment with our admin to receive your slot and call link.
                  </p>
                  <ul className="text-gray-700 space-y-2">
                    <li>• Pick a preferred date and time.</li>
                    <li>• Admin confirms availability and sends meeting details.</li>
                    <li>• Keep your ID ready for verification during the call.</li>
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

  return (
    <>
      <Head>
        <title>{currentModule.name} - IELTS Mock Platform</title>
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

        {/* Header */}
        <div className={`${colorClasses[currentModule.color]} text-white py-12`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <div className="text-6xl">{currentModule.icon}</div>
              <div>
                <h1 className="text-4xl font-bold mb-2">{currentModule.name}</h1>
                <p className="text-lg opacity-90">
                  Choose a quiz to start practicing • {currentModule.quizzes.length} quizzes available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-blue-800">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-semibold">
                <span className="text-green-700">2 quizzes unlocked</span> with your purchase. 
                Complete them to unlock more!
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {currentModule.quizzes.map((quiz, index) => (
              <div
                key={quiz.id}
                onClick={() => handleQuizClick(quiz)}
                className={`bg-white border-2 rounded-xl p-6 transition-all ${
                  quiz.initiallyUnlocked
                    ? 'border-gray-200 hover:border-blue-500 hover:shadow-lg cursor-pointer'
                    : 'border-gray-200 opacity-60 cursor-not-allowed'
                } relative`}
              >
                {/* Lock Overlay */}
                {!quiz.initiallyUnlocked && (
                  <div className="absolute top-6 right-6">
                    <div className="bg-gray-200 p-3 rounded-full">
                      <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Unlocked Badge */}
                {quiz.initiallyUnlocked && (
                  <div className="absolute top-6 right-6">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      ✓ Unlocked
                    </span>
                  </div>
                )}

                <div className="flex items-start space-x-4">
                  {/* Quiz Icon */}
                  <div className={`w-16 h-16 ${colorClasses[currentModule.color]} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <span className="text-2xl text-white font-bold">{index + 1}</span>
                  </div>

                  {/* Quiz Details */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{quiz.title}</h3>
                    <p className="text-gray-600 mb-4">{quiz.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center space-x-2 text-gray-700">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{quiz.duration} min</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-gray-700">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>{quiz.questions || quiz.tasks} {quiz.questions ? 'questions' : 'tasks'}</span>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(quiz.difficulty)}`}>
                        {quiz.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  {quiz.initiallyUnlocked && (
                    <div className="flex items-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
