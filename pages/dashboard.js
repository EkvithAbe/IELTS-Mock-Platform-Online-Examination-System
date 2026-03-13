import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Academic");
  const [subscriptions, setSubscriptions] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(true);
  const [accessMap, setAccessMap] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [progressData, setProgressData] = useState(null);
  const [progressLoading, setProgressLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(userData));
    fetchSubscriptions();
    fetchModules(activeTab);
    fetchProgress();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading && user) {
      fetchModules(activeTab);
    }
  }, [activeTab, loading]);

  const fetchSubscriptions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/my-subscriptions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions || []);

        const access = {};
        (data.activeSubscriptions || []).forEach((s) => {
          const type = s.test_type || s.testType || "Academic";
          const mod = s.test_module || s.testModule;
          if (!access[type]) {
            access[type] = { fullPackage: false, modules: [] };
          }
          if (mod === "full_package" || mod === "package") {
            access[type].fullPackage = true;
            access[type].modules.push("listening", "reading", "writing", "speaking");
          } else if (mod) {
            access[type].modules.push(mod);
          }
        });
        setAccessMap(access);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    }
  };

  const fetchModules = async (type) => {
    setModulesLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        type ? `/api/modules?testType=${encodeURIComponent(type)}` : "/api/modules",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAvailableModules(data.modules || []);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    } finally {
      setModulesLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/progress", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProgressData(data);
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setProgressLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");
    router.push("/");
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

  const filteredModules = availableModules.filter((mod) => mod.test_type === activeTab);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    setMenuOpen(false);
  };

  return (
    <>
      <Head>
        <title>Dashboard - IELTS Mock Test Platform</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-md relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <a href="/dashboard" className="text-2xl font-bold text-blue-600">
                  IELTS Mock Platform
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <a href="/profile" className="text-gray-700 hover:text-blue-600 font-medium transition">
                  Profile
                </a>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Welcome / Instructions */}
        <div id="top" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6 relative">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
                <p className="text-blue-100">Ready to practice your IELTS skills?</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg">
                ℹ️
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-blue-900 mb-3">How it works</h3>
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                    <div>
                      <p className="font-semibold text-blue-900">Buy package</p>
                      <p className="text-blue-700">Use the card below to purchase</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                    <div>
                      <p className="font-semibold text-blue-900">Admin approves</p>
                      <p className="text-blue-700">Wait for approval notification</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                    <div>
                      <p className="font-semibold text-blue-900">Start quizzes</p>
                      <p className="text-blue-700">Listening/Reading/Writing unlocked</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
                    <div>
                      <p className="font-semibold text-blue-900">Speaking</p>
                      <p className="text-blue-700">Book a live appointment</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
          {/* Packages */}
          <section id="packages" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Quiz Package</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab("Academic")}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    activeTab === "Academic" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                  }`}
                >
                  Academic
                </button>
                <button
                  onClick={() => setActiveTab("General")}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    activeTab === "General" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"
                  }`}
                >
                  General
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {modulesLoading ? (
                <div className="text-center py-8 text-gray-600">Loading modules...</div>
              ) : (
                <div
                  onClick={() =>
                    accessMap[activeTab]?.fullPackage
                      ? router.push("/quiz-package")
                      : router.push(`/buy-quiz/${activeTab}`)
                  }
                  className={`bg-white rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer border-2 p-6 ${
                    accessMap[activeTab]?.fullPackage
                      ? "border-green-300 hover:border-green-400"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {accessMap[activeTab]?.fullPackage ? (
                    /* Unlocked state - horizontal layout */
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-14 h-14 ${activeTab === "Academic" ? "bg-blue-100" : "bg-green-100"} rounded-xl flex items-center justify-center text-3xl`}>
                          📦
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{activeTab} IELTS - Full Package</h3>
                          <p className="text-gray-500 text-sm">Listening, Reading, Writing + Speaking (live appointment).</p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                            <span>⏱ Full test set</span>
                            <span>📄 3 online modules + 1 live speaking</span>
                            <span>$ 50</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
                          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm font-semibold text-green-700">Unlocked</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push("/quiz-package");
                          }}
                          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                          Open Package
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Locked state - with included modules on the right */
                    <div className="flex items-start gap-6">
                      {/* Left side - Package info */}
                      <div className="flex-shrink-0">
                        <h3 className="text-lg font-bold text-gray-900">{activeTab} IELTS - Full Package</h3>
                        <p className="text-gray-500 text-sm mt-1">
                          Listening, Reading, Writing<br />+ Speaking (live appointment).
                        </p>
                        <div className="flex items-center space-x-4 mt-3">
                          <div className={`w-12 h-12 ${activeTab === "Academic" ? "bg-blue-100" : "bg-green-100"} rounded-xl flex items-center justify-center text-2xl`}>
                            📦
                          </div>
                          <div className={`text-3xl font-bold ${activeTab === "Academic" ? "text-blue-600" : "text-green-600"}`}>
                            $50
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Click to purchase package</p>
                        <div className="flex items-center space-x-3 mt-3 text-xs text-gray-400">
                          <span>⏱ Full test set</span>
                          <span>📄 3 online modules + 1 live speaking</span>
                          <span>$ 50</span>
                        </div>
                      </div>

                      {/* Right side - Included modules */}
                      <div className="flex-1 border border-dashed border-gray-300 rounded-xl p-4">
                        <p className="text-sm font-semibold text-gray-700 mb-3">Included modules</p>
                        {filteredModules.length === 0 ? (
                          <p className="text-sm text-gray-500">No modules published yet for this test type.</p>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {filteredModules.slice(0, 4).map((mod) => (
                              <div
                                key={mod.id}
                                className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                              >
                                <div>
                                  <p className="text-sm font-semibold text-gray-900 capitalize">{mod.module_type}</p>
                                  <p className="text-xs text-gray-500 truncate">{mod.title}</p>
                                </div>
                                <span className="text-xs text-gray-500">{mod.duration} min</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Purchased */}
          <section id="purchased" className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Purchased Quizzes</h2>
            <div className="bg-white rounded-xl shadow-md p-6">
              {(() => {
                const packageSubs = subscriptions.filter((sub) => {
                  const mod = sub.test_module || sub.testModule;
                  return mod === "full_package" || mod === "package";
                });

                if (packageSubs.length === 0) {
                  return (
                    <div className="text-center py-10 text-gray-600">
                      No packages purchased yet. Buy a package above to unlock quizzes.
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {packageSubs.map((sub) => (
                      <div
                        key={sub.id}
                        className={`border-2 rounded-xl p-4 flex items-center justify-between ${
                          sub.status === "active" ? "border-green-300" : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 ${(sub.test_type || sub.testType) === "Academic" ? "bg-blue-100" : "bg-green-100"} rounded-xl flex items-center justify-center text-2xl`}>
                            📦
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {sub.test_type || sub.testType} IELTS - Full Package
                            </p>
                            <p className="text-sm text-gray-500">
                              Status: <span className={sub.status === "active" ? "text-green-600 font-medium" : "text-yellow-600"}>{sub.status}</span> · Tests used: {sub.tests_used}/{sub.tests_allowed}
                            </p>
                            <p className="text-xs text-gray-400">
                              Purchased: {new Date(sub.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {sub.status === "active" && (
                          <button
                            onClick={() => router.push("/quiz-package")}
                            className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                          >
                            Open Package
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </section>

          {/* Progress */}
          <section id="progress" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Progress</h2>

            {progressLoading ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your progress...</p>
              </div>
            ) : progressData && progressData.overallStats.totalAttempts > 0 ? (
              <>
                {/* Stats Cards */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-100 text-sm font-medium">Total Attempts</span>
                      <svg className="w-8 h-8 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-4xl font-bold">{progressData.overallStats.totalAttempts}</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-green-100 text-sm font-medium">Average Score</span>
                      <svg className="w-8 h-8 text-green-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <p className="text-4xl font-bold">{progressData.overallStats.averageScore || 'N/A'}%</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-purple-100 text-sm font-medium">Best Score</span>
                      <svg className="w-8 h-8 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <p className="text-4xl font-bold">{progressData.overallStats.bestScore || 'N/A'}%</p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-orange-100 text-sm font-medium">Time Spent</span>
                      <svg className="w-8 h-8 text-orange-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-4xl font-bold">{Math.floor(progressData.overallStats.totalTimeSpent / 60)}<span className="text-2xl">h</span></p>
                  </div>
                </div>

                {/* Module Performance Chart */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Performance by Module</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      {
                        name: 'Listening',
                        score: progressData.statsByModule.listening?.averageScore || 0,
                        attempts: progressData.statsByModule.listening?.totalAttempts || 0
                      },
                      {
                        name: 'Reading',
                        score: progressData.statsByModule.reading?.averageScore || 0,
                        attempts: progressData.statsByModule.reading?.totalAttempts || 0
                      },
                      {
                        name: 'Writing',
                        score: progressData.statsByModule.writing?.averageScore || 0,
                        attempts: progressData.statsByModule.writing?.totalAttempts || 0
                      },
                      {
                        name: 'Speaking',
                        score: progressData.statsByModule.speaking?.averageScore || 0,
                        attempts: progressData.statsByModule.speaking?.totalAttempts || 0
                      }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white border-2 border-gray-200 rounded-lg p-3 shadow-lg">
                                <p className="font-semibold text-gray-900">{payload[0].payload.name}</p>
                                <p className="text-sm text-gray-600">Average Score: <span className="font-bold text-blue-600">{payload[0].value}%</span></p>
                                <p className="text-sm text-gray-600">Attempts: {payload[0].payload.attempts}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                        {[
                          { name: 'Listening', color: '#3b82f6' },
                          { name: 'Reading', color: '#10b981' },
                          { name: 'Writing', color: '#8b5cf6' },
                          { name: 'Speaking', color: '#f59e0b' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Module Details Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  {['listening', 'reading', 'writing', 'speaking'].map((moduleType) => {
                    const stats = progressData.statsByModule[moduleType];
                    const icons = {
                      listening: '🎧',
                      reading: '📖',
                      writing: '✍️',
                      speaking: '🎤'
                    };
                    const colors = {
                      listening: 'blue',
                      reading: 'green',
                      writing: 'purple',
                      speaking: 'orange'
                    };
                    const color = colors[moduleType];

                    return stats ? (
                      <div key={moduleType} className={`bg-white border-2 border-${color}-200 rounded-xl shadow-md p-6`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-3xl">{icons[moduleType]}</span>
                            <h3 className="text-lg font-bold text-gray-900 capitalize">{moduleType}</h3>
                          </div>
                          <span className={`px-3 py-1 bg-${color}-100 text-${color}-700 rounded-full text-sm font-semibold`}>
                            {stats.totalAttempts} {stats.totalAttempts === 1 ? 'attempt' : 'attempts'}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Average Score:</span>
                            <span className="text-lg font-bold text-gray-900">{stats.averageScore}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Best Score:</span>
                            <span className="text-lg font-bold text-green-600">{stats.bestScore}%</span>
                          </div>
                          {stats.latestScore && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Latest Score:</span>
                              <span className="text-lg font-bold text-blue-600">{stats.latestScore}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>

                {/* Recent Attempts */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Attempts</h3>
                  <div className="space-y-3">
                    {progressData.attempts.slice(0, 5).map((attempt) => (
                      <div key={attempt.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                            attempt.module_type === 'listening' ? 'bg-blue-100' :
                            attempt.module_type === 'reading' ? 'bg-green-100' :
                            attempt.module_type === 'writing' ? 'bg-purple-100' : 'bg-orange-100'
                          }`}>
                            {attempt.module_type === 'listening' ? '🎧' :
                             attempt.module_type === 'reading' ? '📖' :
                             attempt.module_type === 'writing' ? '✍️' : '🎤'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{attempt.title}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(attempt.completed_at).toLocaleDateString()} • {attempt.duration} minutes
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {attempt.score_percentage !== null ? (
                            <>
                              <p className="text-2xl font-bold text-gray-900">{attempt.score_percentage.toFixed(1)}%</p>
                              <p className="text-sm text-gray-600">{attempt.score_obtained}/{attempt.score_total} marks</p>
                            </>
                          ) : (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                              Pending Grading
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Progress Yet</h3>
                <p className="text-gray-600 mb-6">
                  You haven't completed any quizzes yet. Purchase a package and start practicing!
                </p>
                <button
                  onClick={() => scrollToSection('packages')}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Browse Quiz Packages
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
