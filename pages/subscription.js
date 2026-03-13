import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Subscription() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('Academic');
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(userData));
    setLoading(false);
  }, []);

  const testModules = [
    {
      name: 'Listening',
      icon: '🎧',
      description: 'Enhance your listening comprehension skills',
      duration: 30,
      questions: 40,
      price: 15,
      color: 'blue',
    },
    {
      name: 'Reading',
      icon: '📖',
      description: 'Improve your reading and analytical abilities',
      duration: 60,
      questions: 40,
      price: 15,
      color: 'green',
    },
    {
      name: 'Writing',
      icon: '✍️',
      description: 'Master academic and professional writing',
      duration: 60,
      questions: 2,
      price: 25,
      color: 'purple',
    },
    {
      name: 'Speaking',
      icon: '🎤',
      description: 'Build confidence in spoken English',
      duration: 15,
      questions: 3,
      price: 30,
      color: 'orange',
    },
  ];

  const fullPackagePrice = testModules.reduce((sum, module) => sum + module.price, 0);
  const discountedPrice = Math.round(fullPackagePrice * 0.75); // 25% discount

  const handlePurchase = async (moduleType, price) => {
    setPurchasing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          testType: selectedType,
          testModule: moduleType.toLowerCase(),
          price,
          paymentMethod: 'bank_transfer',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/payment/${data.subscription._id}`);
      } else {
        const error = await response.json();
        alert(error.message || "Failed to create subscription");
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      alert("Failed to create subscription");
    } finally {
      setPurchasing(false);
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700',
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-600',
        button: 'bg-green-600 hover:bg-green-700',
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-600',
        button: 'bg-purple-600 hover:bg-purple-700',
      },
      orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-600',
        button: 'bg-orange-600 hover:bg-orange-700',
      },
    };
    return colors[color];
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

  return (
    <>
      <Head>
        <title>Subscribe - IELTS Mock Platform</title>
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
                  Dashboard
                </button>
                <button
                  onClick={() => router.push('/my-tests')}
                  className="text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  My Tests
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">SUBSCRIPTION</h1>
            <p className="text-xl text-gray-600 mb-8">
              Choose your IELTS test modules and start your preparation journey
            </p>

            {/* Test Type Toggle */}
            <div className="inline-flex rounded-lg border-2 border-gray-300 p-1 bg-white">
              <button
                onClick={() => setSelectedType('Academic')}
                className={`px-8 py-3 rounded-lg font-semibold transition ${
                  selectedType === 'Academic'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                IELTS - Academic
              </button>
              <button
                onClick={() => setSelectedType('General')}
                className={`px-8 py-3 rounded-lg font-semibold transition ${
                  selectedType === 'General'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                IELTS - General
              </button>
            </div>
          </div>

          {/* Full Package Offer */}
          <div className="mb-12">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-5xl">🎯</span>
                    <div>
                      <h2 className="text-3xl font-bold">Complete Package</h2>
                      <p className="text-blue-100">All 4 modules - Best Value!</p>
                    </div>
                  </div>
                  <div className="flex items-baseline space-x-3 mb-4">
                    <span className="text-2xl line-through opacity-70">${fullPackagePrice}</span>
                    <span className="text-5xl font-bold">${discountedPrice}</span>
                    <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                      SAVE 25%
                    </span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Listening, Reading, Writing & Speaking</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Full mock test experience</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Detailed feedback and scoring</span>
                    </li>
                  </ul>
                </div>
                <div className="ml-8">
                  <button
                    onClick={() => handlePurchase('full_package', discountedPrice)}
                    disabled={purchasing}
                    className="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition shadow-lg disabled:opacity-50"
                  >
                    {purchasing ? 'Processing...' : 'SUBSCRIBE FOR FREE'}
                  </button>
                  <p className="text-center mt-2 text-sm text-blue-100">Limited Time Offer</p>
                </div>
              </div>
            </div>
          </div>

          {/* Individual Modules */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Or Choose Individual Modules
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {testModules.map((module) => {
                const colors = getColorClasses(module.color);
                return (
                  <div
                    key={module.name}
                    className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all border-2 ${colors.border} overflow-hidden`}
                  >
                    <div className={`${colors.bg} p-6 border-b-2 ${colors.border}`}>
                      <div className="text-center">
                        <div className="text-5xl mb-3">{module.icon}</div>
                        <h3 className={`text-2xl font-bold ${colors.text}`}>
                          {module.name}
                        </h3>
                      </div>
                    </div>

                    <div className="p-6">
                      <p className="text-gray-600 text-sm mb-4">{module.description}</p>

                      <div className="space-y-3 mb-6 text-sm text-gray-700">
                        <div className="flex justify-between">
                          <span className="font-medium">Duration:</span>
                          <span>{module.duration} min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Questions:</span>
                          <span>{module.questions}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="font-medium">Price:</span>
                          <span className="text-2xl font-bold text-gray-900">${module.price}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handlePurchase(module.name, module.price)}
                        disabled={purchasing}
                        className={`w-full ${colors.button} text-white py-3 rounded-lg font-semibold transition disabled:opacity-50`}
                      >
                        {purchasing ? 'Processing...' : 'Subscribe'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Features */}
          <div className="mt-16 bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              What's Included
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Realistic Test Experience</h3>
                <p className="text-gray-600 text-sm">
                  Practice with authentic IELTS-style questions and format
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Instant Results</h3>
                <p className="text-gray-600 text-sm">
                  Get immediate feedback on Listening and Reading tests
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Flexible Timing</h3>
                <p className="text-gray-600 text-sm">
                  Take tests at your convenience, pause and resume anytime
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
