import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // pending, approved, rejected, all
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
    revenue: 0,
  });
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchSubscriptions();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userData);
    
    // Check if user is admin
    if (user.role !== 'admin') {
      alert('Access denied. Admin only.');
      router.push("/dashboard");
      return;
    }

    setUser(user);
    setLoading(false);
  };

  const fetchSubscriptions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch('/api/admin/subscriptions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  const handleApprove = async (subscriptionId) => {
    if (!confirm('Are you sure you want to approve this payment?')) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/subscriptions/${subscriptionId}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Payment approved successfully!');
        fetchSubscriptions();
        setShowModal(false);
      } else {
        alert('Failed to approve payment');
      }
    } catch (error) {
      console.error('Error approving payment:', error);
      alert('Error approving payment');
    }
  };

  const handleReject = async (subscriptionId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/subscriptions/${subscriptionId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        alert('Payment rejected');
        fetchSubscriptions();
        setShowModal(false);
      } else {
        alert('Failed to reject payment');
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      alert('Error rejecting payment');
    }
  };

  const handleReset = async (subscriptionId) => {
    if (!confirm('Are you sure you want to reset this subscription? This will allow the user to retake all modules and delete their existing attempts.')) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/subscriptions/${subscriptionId}/reset`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Subscription reset successfully! The user can now retake all modules.');
        fetchSubscriptions();
        setShowModal(false);
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to reset subscription');
      }
    } catch (error) {
      console.error('Error resetting subscription:', error);
      alert('Error resetting subscription');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const viewDetails = (subscription) => {
    setSelectedSubscription(subscription);
    setShowModal(true);
  };

  const getFilteredSubscriptions = () => {
    if (activeTab === 'all') return subscriptions;
    if (activeTab === 'pending') return subscriptions.filter(s => s.status === 'pending');
    if (activeTab === 'approved') return subscriptions.filter(s => s.status === 'active');
    if (activeTab === 'rejected') return subscriptions.filter(s => s.status === 'cancelled');
    return subscriptions;
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getModuleIcon = (testType, testModule) => {
    if (testModule === 'full_package') {
      return testType === 'Academic' ? '🎓' : '🌍';
    }
    const icons = {
      listening: '🎧',
      reading: '📖',
      writing: '✍️',
      speaking: '🎤',
    };
    return icons[testModule] || '📝';
  };

  const getTestTypeLabel = (testType, testModule) => {
    if (!testModule || testModule === 'full_package') {
      return `${testType || 'IELTS'} Quiz Package`;
    }
    return `${testType || 'IELTS'} ${testModule.charAt(0).toUpperCase() + testModule.slice(1)}`;
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

  const filteredSubscriptions = getFilteredSubscriptions();

  return (
    <>
      <Head>
        <title>Admin Dashboard - IELTS Mock Platform</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Admin Navigation */}
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-blue-600">IELTS Admin</h1>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">Admin</span>
              </div>
              <div className="flex items-center space-x-4">
                <a
                  href="/admin/dashboard"
                  className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1"
                >
                  Subscriptions
                </a>
                <a
                  href="/admin/quizzes"
                  className="text-gray-600 hover:text-blue-600 font-medium"
                >
                  Quizzes
                </a>
                <a
                  href="/admin/users"
                  className="text-gray-600 hover:text-blue-600 font-medium"
                >
                  Users
                </a>
                <span className="text-gray-300">|</span>
                <span className="text-gray-700">{user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approved</p>
                  <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Rejected</p>
                  <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Revenue</p>
                  <p className="text-3xl font-bold text-purple-600">${stats.revenue}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-md mb-6">
            <div className="border-b border-gray-200">
              <div className="flex space-x-8 px-6">
                {['pending', 'approved', 'rejected', 'all'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-2 font-semibold text-sm border-b-2 transition ${
                      activeTab === tab
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)} 
                    {tab === 'pending' && stats.pending > 0 && (
                      <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                        {stats.pending}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Subscriptions Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Quiz</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Payment Method</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Transaction ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSubscriptions.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                        No subscriptions found
                      </td>
                    </tr>
                  ) : (
                    filteredSubscriptions.map((subscription) => (
                      <tr key={subscription.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">{subscription.user_name || 'N/A'}</p>
                            <p className="text-sm text-gray-600">{subscription.user_email || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{getModuleIcon(subscription.testType, subscription.testModule)}</span>
                            <div>
                              <div className="font-medium text-gray-900">{getTestTypeLabel(subscription.testType, subscription.testModule)}</div>
                              {subscription.testModule === 'full_package' && (
                                <div className="text-xs text-gray-500">4 tests included</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-900">${subscription.price}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-700 capitalize">{subscription.payment_method?.replace('_', ' ')}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-mono text-gray-600">{subscription.transaction_id || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(subscription.status)}`}>
                            {subscription.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {new Date(subscription.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => viewDetails(subscription)}
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                            >
                              View
                            </button>
                            {subscription.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(subscription.id)}
                                  className="text-green-600 hover:text-green-800 font-medium text-sm"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(subscription.id)}
                                  className="text-red-600 hover:text-red-800 font-medium text-sm"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Customer Name</p>
                    <p className="font-semibold text-gray-900">{selectedSubscription.user_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="font-semibold text-gray-900">{selectedSubscription.user_email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Quiz Module</p>
                    <p className="font-semibold text-gray-900 capitalize">
                      {getModuleIcon(selectedSubscription.test_module)} {selectedSubscription.test_module}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Price</p>
                    <p className="font-semibold text-gray-900">${selectedSubscription.price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                    <p className="font-semibold text-gray-900 capitalize">
                      {selectedSubscription.payment_method?.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                    <p className="font-semibold text-gray-900 font-mono text-sm">
                      {selectedSubscription.transaction_id || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(selectedSubscription.status)}`}>
                      {selectedSubscription.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Submitted Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedSubscription.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {selectedSubscription.notes && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Customer Information</p>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">{selectedSubscription.notes}</pre>
                    </div>
                  </div>
                )}

                {selectedSubscription.payment_slip && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Payment Receipt</p>
                    <div className="border-2 border-gray-300 rounded-lg p-4">
                      <img 
                        src={selectedSubscription.payment_slip} 
                        alt="Payment Receipt" 
                        className="max-w-full h-auto rounded"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
                        }}
                      />
                      <a 
                        href={selectedSubscription.payment_slip} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Open in new tab →
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {selectedSubscription.status === 'pending' && (
                <div className="flex space-x-4 mt-6 pt-6 border-t">
                  <button
                    onClick={() => handleApprove(selectedSubscription.id)}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    ✓ Approve Payment
                  </button>
                  <button
                    onClick={() => handleReject(selectedSubscription.id)}
                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
                  >
                    ✗ Reject Payment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
