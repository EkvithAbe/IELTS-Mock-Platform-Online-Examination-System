import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Payment() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [paymentSlip, setPaymentSlip] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(userData));
    
    if (id) {
      fetchSubscription(token);
    }
  }, [id]);

  const fetchSubscription = async (token) => {
    try {
      const response = await fetch(`/api/subscriptions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
        setPaymentMethod(data.subscription.paymentMethod || 'bank_transfer');
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentSlip(file);
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    
    if (!paymentSlip && paymentMethod === 'bank_transfer') {
      alert("Please upload payment slip");
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append('paymentMethod', paymentMethod);
      
      if (paymentSlip) {
        formData.append('paymentSlip', paymentSlip);
      }

      const response = await fetch(`/api/subscriptions/${id}/payment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert("Payment submitted successfully! Waiting for admin approval.");
        router.push('/my-tests');
      } else {
        const error = await response.json();
        alert(error.message || "Failed to submit payment");
      }
    } catch (error) {
      console.error("Error submitting payment:", error);
      alert("Failed to submit payment");
    } finally {
      setUploading(false);
    }
  };

  const handleFreeSubscription = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/subscriptions/${id}/activate-free`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("Subscription activated successfully!");
        router.push('/my-tests');
      } else {
        const error = await response.json();
        alert(error.message || "Failed to activate subscription");
      }
    } catch (error) {
      console.error("Error activating subscription:", error);
      alert("Failed to activate subscription");
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

  if (!subscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Subscription Not Found</h2>
          <button
            onClick={() => router.push('/subscription')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Subscriptions
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Payment - IELTS Mock Platform</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <a href="/dashboard" className="text-2xl font-bold text-blue-600">
                IELTS Mock Platform
              </a>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-xl shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Complete Your Payment</h1>

            {/* Subscription Details */}
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Subscription Details</h2>
              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span>Test Type:</span>
                  <span className="font-semibold">{subscription.testType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Module:</span>
                  <span className="font-semibold capitalize">
                    {subscription.testModule.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Attempts Allowed:</span>
                  <span className="font-semibold">{subscription.testsAllowed}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-blue-600 pt-4 border-t border-blue-200">
                  <span>Total Amount:</span>
                  <span>${subscription.price}</span>
                </div>
              </div>
            </div>

            {/* Free Demo Option */}
            {subscription.price === 0 || subscription.testModule === 'full_package' ? (
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Access!</h3>
                  <p className="text-gray-600">
                    This subscription is currently available for free. Click below to activate.
                  </p>
                </div>
                <button
                  onClick={handleFreeSubscription}
                  className="bg-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition"
                >
                  Activate Free Subscription
                </button>
              </div>
            ) : (
              <>
                {/* Payment Method Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Select Payment Method</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank_transfer"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-blue-600"
                      />
                      <div className="flex-1">
                        <span className="font-semibold text-gray-900">Bank Transfer</span>
                        <p className="text-sm text-gray-600">Transfer to our bank account and upload receipt</p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="whatsapp"
                        checked={paymentMethod === 'whatsapp'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-blue-600"
                      />
                      <div className="flex-1">
                        <span className="font-semibold text-gray-900">WhatsApp Payment</span>
                        <p className="text-sm text-gray-600">Contact us on WhatsApp for payment</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Bank Transfer Details */}
                {paymentMethod === 'bank_transfer' && (
                  <div className="mb-6 bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Bank Details</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div>
                        <span className="font-semibold">Bank Name:</span> Example Bank
                      </div>
                      <div>
                        <span className="font-semibold">Account Name:</span> IELTS Mock Platform
                      </div>
                      <div>
                        <span className="font-semibold">Account Number:</span> 1234567890
                      </div>
                      <div>
                        <span className="font-semibold">SWIFT/BIC:</span> EXAMPLEXXX
                      </div>
                    </div>
                  </div>
                )}

                {/* WhatsApp Contact */}
                {paymentMethod === 'whatsapp' && (
                  <div className="mb-6 bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">WhatsApp Contact</h3>
                    <p className="text-gray-700 mb-4">
                      Contact us on WhatsApp to complete your payment:
                    </p>
                    <a
                      href="https://wa.me/1234567890"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                      <span>Chat on WhatsApp</span>
                    </a>
                  </div>
                )}

                {/* Payment Form */}
                <form onSubmit={handleSubmitPayment}>
                  {paymentMethod === 'bank_transfer' && (
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Upload Payment Receipt *
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        required
                        className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        Accepted formats: JPG, PNG, PDF (Max 5MB)
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => router.push('/subscription')}
                      className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {uploading ? 'Submitting...' : 'Submit Payment'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Help Section */}
          <div className="mt-6 bg-blue-50 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600">
              If you have any questions about the payment process, please contact our support team at{' '}
              <a href="mailto:support@ielts-mock.com" className="text-blue-600 hover:underline">
                support@ielts-mock.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
