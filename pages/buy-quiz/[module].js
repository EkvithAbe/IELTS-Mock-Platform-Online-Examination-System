import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function BuyQuiz() {
  const router = useRouter();
  const { module, quizId, quizName } = router.query;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    transactionId: '',
    paymentMethod: 'bank_transfer',
    notes: '',
  });
  const [paymentSlip, setPaymentSlip] = useState(null);

  const quizDetails = {
    Academic: {
    name: 'Academic IELTS Quiz',
    icon: '🎓',
    duration: '3+ hours total',
    tests: 3,
    price: 50,
    color: 'blue',
    description: 'Complete Academic IELTS quiz package with all 3 test modules',
    modules: [
      { name: 'Listening', icon: '🎧', duration: '30 min', questions: '40 questions' },
      { name: 'Reading', icon: '📖', duration: '60 min', questions: '40 questions' },
      { name: 'Writing', icon: '✍️', duration: '60 min', questions: '2 tasks' }
    ]
  },
  General: {
    name: 'General IELTS Quiz',
    icon: '🌍',
    duration: '3+ hours total',
    tests: 3,
    price: 50,
    color: 'green',
    description: 'Complete General IELTS quiz package with all 3 test modules',
    modules: [
      { name: 'Listening', icon: '🎧', duration: '30 min', questions: '40 questions' },
      { name: 'Reading', icon: '📖', duration: '60 min', questions: '40 questions' },
      { name: 'Writing', icon: '✍️', duration: '60 min', questions: '2 tasks' }
    ]
  },
};

  const quiz = quizDetails[module] || quizDetails.Academic;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userData);
    setUser(user);
    
    // Pre-fill user data
    setFormData(prev => ({
      ...prev,
      fullName: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
    }));
    
    setLoading(false);
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setPaymentSlip(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!paymentSlip) {
      alert('Please upload your payment receipt');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      
      // Append form data
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      
      // Append quiz details
      data.append('testType', module); // Academic or General
    data.append('testModule', 'full_package'); // This is a full package with 3 tests
      data.append('quizId', quizId || '1'); // Quiz package ID
      data.append('quizName', quizName || quiz.name);
      data.append('price', quiz.price);
      
      // Append file
      data.append('paymentSlip', paymentSlip);

      const response = await fetch('/api/quiz-purchase/submit', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (response.ok) {
        alert('Payment submitted successfully! Our admin will review and unlock your quiz within 24 hours.');
        router.push('/dashboard');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit payment');
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      alert('Failed to submit payment. Please try again.');
    } finally {
      setSubmitting(false);
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
    blue: 'bg-blue-600 hover:bg-blue-700 border-blue-500',
    green: 'bg-green-600 hover:bg-green-700 border-green-500',
    purple: 'bg-purple-600 hover:bg-purple-700 border-purple-500',
    orange: 'bg-orange-600 hover:bg-orange-700 border-orange-500',
  };

  return (
    <>
      <Head>
        <title>Purchase {quiz.name} - IELTS Mock Platform</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <a href="/dashboard" className="text-2xl font-bold text-blue-600">
                IELTS Mock Platform
              </a>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Quiz Info Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-start space-x-6">
              <div className="text-7xl">{quiz.icon}</div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.name}</h1>
                <p className="text-gray-600 mb-6">{quiz.description}</p>
                
                {/* 3 Test Modules */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {quiz.modules.map((mod, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-2xl mb-2">{mod.icon}</div>
                      <div className="font-semibold text-gray-900 text-sm">{mod.name}</div>
                      <div className="text-xs text-gray-600">{mod.duration}</div>
                      <div className="text-xs text-gray-500">{mod.questions}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900 mb-6">
                  Speaking tests are delivered live with an examiner. After purchase, use the{" "}
                  <a href="/speaking-appointment" className="font-semibold underline">speaking appointment page</a>{" "}
                  to book your slot with the admin.
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                    <span className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Total: {quiz.duration}</span>
                    </span>
                    <span className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>{quiz.tests} complete tests</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-4xl font-bold text-gray-900">${quiz.price}</span>
                    <p className="text-sm text-gray-500">Complete package</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Information</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={formData.paymentMethod === 'bank_transfer'}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600"
                    />
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900">Bank Transfer</span>
                      <p className="text-sm text-gray-600">Transfer to our bank account</p>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3 p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={formData.paymentMethod === 'online'}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600"
                    />
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900">Online Payment</span>
                      <p className="text-sm text-gray-600">UPI, Net Banking, etc.</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Bank Details */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Our Bank Details</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium">Bank Name:</span>
                    <span>ABC Bank</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Account Name:</span>
                    <span>IELTS Mock Platform</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Account Number:</span>
                    <span>1234567890</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">IFSC Code:</span>
                    <span>ABCD0123456</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Amount to Pay:</span>
                    <span className="text-xl font-bold text-blue-600">${quiz.price}</span>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction ID / Reference Number *
                  </label>
                  <input
                    type="text"
                    name="transactionId"
                    value={formData.transactionId}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your transaction/reference number"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Enter the transaction ID from your payment receipt
                  </p>
                </div>
              </div>

              {/* Payment Receipt Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Payment Receipt *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    required
                    className="hidden"
                    id="receipt-upload"
                  />
                  <label htmlFor="receipt-upload" className="cursor-pointer">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-700 font-medium mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-600">
                      PNG, JPG, PDF up to 5MB
                    </p>
                  </label>
                  {paymentSlip && (
                    <div className="mt-4 text-sm text-green-600 font-medium">
                      ✓ {paymentSlip.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional information..."
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-4 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 text-white px-6 py-4 rounded-lg font-semibold transition ${colorClasses[quiz.color]} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {submitting ? 'Submitting...' : 'Submit Payment'}
                </button>
              </div>
            </form>
          </div>

          {/* Information Box */}
          <div className="mt-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
            <h3 className="font-bold text-yellow-900 mb-2">📋 Important Information</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Your quiz will be unlocked within 24 hours after payment verification</li>
              <li>• Make sure to upload a clear image of your payment receipt</li>
              <li>• Keep your transaction ID for reference</li>
              <li>• You will receive an email confirmation once approved</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
