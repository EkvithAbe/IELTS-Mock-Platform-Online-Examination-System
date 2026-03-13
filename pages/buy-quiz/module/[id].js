import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const moduleIcons = {
  listening: "🎧",
  reading: "📖",
  writing: "✍️",
};

export default function BuyModule() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState(null);
  const [moduleData, setModuleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    transactionId: "",
    paymentMethod: "bank_transfer",
    notes: "",
  });
  const [paymentSlip, setPaymentSlip] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setFormData((prev) => ({
      ...prev,
      fullName: parsedUser.name || "",
      email: parsedUser.email || "",
      phone: parsedUser.phone || "",
    }));

    if (id) {
      fetchModule(id);
    }
  }, [id]);

  const fetchModule = async (moduleId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/modules/${moduleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setModuleData(data.module);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error loading module", error);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      setPaymentSlip(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!moduleData) return;

    if (!paymentSlip) {
      alert("Please upload your payment receipt");
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      data.append("testType", moduleData.test_type);
      data.append("testModule", moduleData.module_type);
      data.append("moduleId", moduleData.id);
      data.append("moduleTitle", moduleData.title);
      data.append("quizId", moduleData.id);
      data.append("quizName", moduleData.title);
      data.append("price", moduleData.price || 0);
      data.append("testsAllowed", 1);
      data.append("paymentSlip", paymentSlip);

      const response = await fetch("/api/quiz-purchase/submit", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (response.ok) {
        alert("Payment submitted successfully! Our admin will review and unlock your quiz.");
        router.push("/dashboard");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to submit payment");
      }
    } catch (error) {
      console.error("Error submitting payment:", error);
      alert("Failed to submit payment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !moduleData) {
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
    Academic: "bg-blue-600 hover:bg-blue-700 border-blue-500",
    General: "bg-green-600 hover:bg-green-700 border-green-500",
  };

  return (
    <>
      <Head>
        <title>Purchase {moduleData.title} - IELTS Mock Platform</title>
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
                onClick={() => router.push("/dashboard")}
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Module Info Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-start space-x-6">
              <div className="text-7xl">{moduleIcons[moduleData.module_type] || "📝"}</div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{moduleData.title}</h1>
                <p className="text-gray-600 mb-4">{moduleData.description}</p>

                <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                  <span className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{moduleData.duration} minutes</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="capitalize">{moduleData.module_type} module</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c1.38 0 2.5-1.12 2.5-2.5S13.38 3 12 3s-2.5 1.12-2.5 2.5S10.62 8 12 8zm0 0v13m-6-6h12" />
                    </svg>
                    <span>${moduleData.price || 0}</span>
                  </span>
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="easypaisa">Easypaisa</option>
                      <option value="jazzcash">JazzCash</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction ID *
                    </label>
                    <input
                      type="text"
                      name="transactionId"
                      value={formData.transactionId}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Upload Slip */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Receipt *</h3>
                <p className="text-sm text-gray-600 mb-2">Upload your payment receipt (max 5MB)</p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="w-full"
                  required
                />
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Any extra information for the admin"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total payable</p>
                  <p className="text-3xl font-bold text-gray-900">${moduleData.price || 0}</p>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-8 py-3 text-white rounded-lg font-semibold transition ${colorClasses[moduleData.test_type] || 'bg-blue-600 hover:bg-blue-700 border-blue-500'} disabled:opacity-60`}
                >
                  {submitting ? "Submitting..." : "Submit Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
