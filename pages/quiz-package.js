import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function QuizPackage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [hasPackage, setHasPackage] = useState(false);
  const [testType, setTestType] = useState("Academic");
  const [modules, setModules] = useState([]);
  const [eligibility, setEligibility] = useState(null);
  const [accessMap, setAccessMap] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(userData));
    checkAccess(token);
  }, []);

  useEffect(() => {
    if (hasPackage) {
      fetchModules(testType);
      fetchEligibility(testType);
    }
  }, [testType, hasPackage]);

  const fetchModules = async (type) => {
    try {
      const response = await fetch(`/api/modules?testType=${encodeURIComponent(type)}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setModules(data.modules || []);
      }
    } catch (error) {
      console.error("Error fetching modules", error);
    }
  };

  const fetchEligibility = async (type) => {
    try {
      const response = await fetch(`/api/check-module-eligibility?testType=${encodeURIComponent(type)}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setEligibility(data);
      }
    } catch (error) {
      console.error("Error fetching eligibility", error);
    }
  };

  const checkAccess = async (token) => {
    try {
      const response = await fetch("/api/my-subscriptions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Build access map for both test types
        const access = { Academic: false, General: false };
        (data.activeSubscriptions || []).forEach((s) => {
          const type = s.test_type || s.testType || "Academic";
          const mod = s.test_module || s.testModule;
          if (mod === "full_package" || mod === "package") {
            access[type] = true;
          }
        });
        setAccessMap(access);

        const hasAnyPackage = access.Academic || access.General;
        setHasPackage(hasAnyPackage);

        if (!hasAnyPackage) {
          router.replace("/buy-quiz/Academic");
          return;
        }

        // Set initial test type to first available
        const initialType = access.Academic ? "Academic" : "General";
        setTestType(initialType);
        fetchModules(initialType);
        fetchEligibility(initialType);
      }
    } catch (error) {
      console.error("Error checking package access", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading package...</p>
        </div>
      </div>
    );
  }

  if (!hasPackage) {
    return null;
  }

  const getModuleByType = (moduleType) =>
    modules.find((m) => m.module_type === moduleType || m.moduleType === moduleType) || null;

  const getModuleEligibility = (moduleType) => {
    return eligibility?.modules?.[moduleType] || { allowed: false, reason: 'Loading...' };
  };

  const getModuleStatus = (moduleType) => {
    if (!eligibility) return { label: 'Loading...', color: 'gray', canClick: false };

    const elig = getModuleEligibility(moduleType);

    if (elig.allowed) {
      if (elig.isRetake) {
        return { label: 'Retake Test', color: 'green', canClick: true };
      } else if (elig.isFirstAttempt) {
        return { label: 'Start Test', color: 'blue', canClick: true };
      }
      return { label: 'Start Test', color: 'blue', canClick: true };
    } else {
      if (elig.requiresBooking) {
        return { label: 'Book Appointment', color: 'purple', canClick: true };
      } else if (elig.needsSpeaking) {
        return { label: 'Complete Speaking First', color: 'yellow', canClick: false };
      } else if (elig.reason === 'No active subscription') {
        return { label: 'Locked', color: 'gray', canClick: false };
      }
      return { label: 'Locked', color: 'gray', canClick: false };
    }
  };

  const handleModuleClick = (moduleType) => {
    const elig = getModuleEligibility(moduleType);
    const status = getModuleStatus(moduleType);

    if (!status.canClick) {
      alert(elig.reason || 'This module is not available yet');
      return;
    }

    if (moduleType === 'speaking') {
      router.push('/speaking-appointment');
    } else {
      const mod = getModuleByType(moduleType);
      if (mod) {
        router.push(`/test/${mod.id}`);
      } else {
        alert(`${moduleType} module not found yet.`);
      }
    }
  };

  const moduleCards = [
    {
      key: "listening",
      title: "Listening",
      description: "Practice IELTS listening with authentic audio.",
      icon: "🎧",
      duration: "30 min",
    },
    {
      key: "reading",
      title: "Reading",
      description: "Improve comprehension with academic passages.",
      icon: "📖",
      duration: "60 min",
    },
    {
      key: "writing",
      title: "Writing",
      description: "Task 1 and Task 2 practice with timed prompts.",
      icon: "✍️",
      duration: "60 min",
    },
    {
      key: "speaking",
      title: "Speaking",
      description: "Book a live speaking session with an examiner.",
      icon: "🎤",
      duration: "Live appointment",
    },
  ];

  return (
    <>
      <Head>
        <title>IELTS Quiz Package - IELTS Mock Platform</title>
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
                  onClick={() => router.push("/dashboard")}
                  className="text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  ← Back to Dashboard
                </button>
                <span className="text-gray-700">👤 {user?.name}</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          {/* Header with tabs */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Quiz Package</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setTestType("Academic")}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  testType === "Academic"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Academic
              </button>
              <button
                onClick={() => setTestType("General")}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  testType === "General"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                General
              </button>
            </div>
          </div>

          {/* Package info card */}
          <div className={`bg-white rounded-xl shadow-md border-2 ${accessMap[testType] ? 'border-green-300' : 'border-gray-200'} p-6`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-14 h-14 ${testType === "Academic" ? "bg-blue-100" : "bg-green-100"} rounded-xl flex items-center justify-center text-3xl`}>
                  📦
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{testType} IELTS - Full Package</h2>
                  <p className="text-gray-500 text-sm">
                    Listening, Reading, Writing + Speaking (live appointment).
                  </p>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                    <span>⏱ Full test set</span>
                    <span>📄 3 online modules + 1 live speaking</span>
                    <span>$ 50</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {accessMap[testType] ? (
                  <>
                    <div className="flex items-center space-x-2 bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-semibold text-green-700">Unlocked</span>
                    </div>
                    <button
                      onClick={() => {/* scroll to modules or do nothing */}}
                      className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Open Package
                    </button>
                  </>
                ) : (
                  <>
                    <div className={`text-xl font-bold ${testType === "Academic" ? "text-blue-600" : "text-green-600"}`}>
                      $50
                    </div>
                    <button
                      onClick={() => router.push(`/buy-quiz/${testType}`)}
                      className={`px-5 py-2 rounded-lg font-semibold text-white transition ${
                        testType === "Academic" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      Purchase Package
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {accessMap[testType] && (
          <div className="grid md:grid-cols-2 gap-4">
            {moduleCards.map((card) => {
              const status = getModuleStatus(card.key);
              const colorClasses = {
                blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200 hover:border-blue-300', icon: 'text-blue-600' },
                green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200 hover:border-green-300', icon: 'text-green-600' },
                yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: 'text-yellow-600' },
                purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200 hover:border-purple-300', icon: 'text-purple-600' },
                gray: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', icon: 'text-gray-500' }
              };
              const colors = colorClasses[status.color] || colorClasses.gray;

              return (
                <div
                  key={card.key}
                  onClick={() => handleModuleClick(card.key)}
                  className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all ${
                    status.canClick ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'
                  } border-2 ${colors.border} p-6 flex flex-col space-y-4`}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center text-2xl`}>
                      {card.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{card.title}</h3>
                      <p className="text-sm text-gray-600">{card.description}</p>
                      <div className="flex items-center space-x-3 text-xs text-gray-500 mt-2">
                        <span>⏱ {card.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center space-x-2 ${colors.bg} px-4 py-2 rounded-lg`}>
                      {status.canClick ? (
                        <svg className={`w-5 h-5 ${colors.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                        </svg>
                      ) : (
                        <svg className={`w-5 h-5 ${colors.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                      <span className={`text-sm font-semibold ${colors.text}`}>{status.label}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </div>
    </>
  );
}
