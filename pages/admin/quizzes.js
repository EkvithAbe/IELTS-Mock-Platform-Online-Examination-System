import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const defaultQuestion = {
  question: "",
  correctAnswer: "",
  marks: 1,
  questionType: "fill_blanks",
};

export default function AdminQuizzes() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Create/Edit form state
  const [formData, setFormData] = useState({
    testType: "Academic",
    moduleType: "listening",
    title: "",
    description: "",
    price: 0,
    duration: 30,
    instructions: "",
    // Content fields
    audioUrl: "",
    transcript: "",
    passage: "",
    source: "",
    writingPrompt: "",
    wordLimit: 250,
  });
  const [questions, setQuestions] = useState([{ ...defaultQuestion }]);
  const [audioFile, setAudioFile] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "admin") {
      alert("Access denied. Admin only.");
      router.push("/dashboard");
      return;
    }

    setUser(parsedUser);
    setLoading(false);
    fetchModules();
  };

  const fetchModules = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      const response = await fetch("/api/admin/test-modules", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setModules(data.modules || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error fetching modules:", errorData.message || response.status);
        if (response.status === 401) {
          router.push("/login");
        }
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  };

  const showNotification = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3500);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Filter modules
  const getFilteredModules = () => {
    let filtered = modules;

    if (activeTab !== "all") {
      filtered = filtered.filter((m) => m.module_type === activeTab);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title?.toLowerCase().includes(term) ||
          m.description?.toLowerCase().includes(term) ||
          m.test_type?.toLowerCase().includes(term)
      );
    }

    return filtered;
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      testType: "Academic",
      moduleType: "listening",
      title: "",
      description: "",
      price: 0,
      duration: 30,
      instructions: "",
      audioUrl: "",
      transcript: "",
      passage: "",
      source: "",
      writingPrompt: "",
      wordLimit: 250,
    });
    setQuestions([{ ...defaultQuestion }]);
    setAudioFile(null);
  };

  // Open create modal
  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  // Open edit modal
  const openEditModal = (module) => {
    setSelectedModule(module);
    setFormData({
      testType: module.test_type || "Academic",
      moduleType: module.module_type || "listening",
      title: module.title || "",
      description: module.description || "",
      price: module.price || 0,
      duration: module.duration || 30,
      instructions: module.instructions || "",
      audioUrl: module.content?.audioUrl || "",
      transcript: module.content?.transcript || "",
      passage: module.content?.passage || "",
      source: module.content?.source || "",
      writingPrompt: module.content?.prompt || "",
      wordLimit: module.content?.word_limit || 250,
    });

    // Load questions
    const loadedQuestions = (module.questions || []).map((q) => ({
      question: q.question || q.prompt || "",
      correctAnswer: q.correctAnswer || q.answer || "",
      marks: q.marks || 1,
      questionType: q.questionType || "fill_blanks",
    }));
    setQuestions(loadedQuestions.length > 0 ? loadedQuestions : [{ ...defaultQuestion }]);
    setAudioFile(null);
    setShowEditModal(true);
  };

  // Open view modal
  const openViewModal = (module) => {
    setSelectedModule(module);
    setShowViewModal(true);
  };

  // Question management
  const addQuestion = () => {
    setQuestions([...questions, { ...defaultQuestion }]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index, field, value) => {
    const updated = questions.map((q, i) =>
      i === index ? { ...q, [field]: value } : q
    );
    setQuestions(updated);
  };

  // Create new quiz
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Please enter a title");
      return;
    }

    setSaving(true);

    const fd = new FormData();
    fd.append("testType", formData.testType);
    fd.append("moduleType", formData.moduleType);
    fd.append("title", formData.title);
    fd.append("description", formData.description);
    fd.append("price", formData.price);
    fd.append("duration", formData.duration);
    fd.append("instructions", formData.instructions);

    // Transform questions for auto-grading
    const transformedQuestions = questions
      .filter((q) => q.question.trim())
      .map((q, idx) => ({
        questionNumber: idx + 1,
        id: `${formData.moduleType}-${idx + 1}`,
        question: q.question,
        correctAnswer: q.correctAnswer,
        marks: Number(q.marks) || 1,
        questionType: q.questionType,
      }));

    if (formData.moduleType === "listening") {
      fd.append("transcript", formData.transcript);
      fd.append("listeningInstructions", formData.instructions);
      fd.append("listeningQuestions", JSON.stringify(transformedQuestions));
      if (audioFile) {
        fd.append("audio", audioFile);
      }
    } else if (formData.moduleType === "reading") {
      fd.append("passage", formData.passage);
      fd.append("source", formData.source);
      fd.append("readingQuestions", JSON.stringify(transformedQuestions));
    } else if (formData.moduleType === "writing") {
      fd.append("prompt", formData.writingPrompt);
      fd.append("wordLimit", formData.wordLimit);
      fd.append("writingInstructions", formData.instructions);
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/test-modules", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (response.ok) {
        showNotification("Quiz created successfully!");
        setShowCreateModal(false);
        resetForm();
        fetchModules();
      } else {
        const err = await response.json();
        alert(err.message || "Failed to create quiz");
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
      alert("Failed to create quiz");
    } finally {
      setSaving(false);
    }
  };

  // Update existing quiz
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedModule) return;

    setSaving(true);

    const fd = new FormData();
    fd.append("testType", formData.testType);
    fd.append("moduleType", formData.moduleType);
    fd.append("title", formData.title);
    fd.append("description", formData.description);
    fd.append("price", formData.price);
    fd.append("duration", formData.duration);
    fd.append("instructions", formData.instructions);

    // Transform questions
    const transformedQuestions = questions
      .filter((q) => q.question.trim())
      .map((q, idx) => ({
        questionNumber: idx + 1,
        id: `${formData.moduleType}-${idx + 1}`,
        question: q.question,
        correctAnswer: q.correctAnswer,
        marks: Number(q.marks) || 1,
        questionType: q.questionType,
      }));

    if (formData.moduleType === "listening") {
      fd.append("transcript", formData.transcript);
      fd.append("listeningInstructions", formData.instructions);
      fd.append("listeningQuestions", JSON.stringify(transformedQuestions));
      if (audioFile) {
        fd.append("audio", audioFile);
      }
    } else if (formData.moduleType === "reading") {
      fd.append("passage", formData.passage);
      fd.append("source", formData.source);
      fd.append("readingQuestions", JSON.stringify(transformedQuestions));
    } else if (formData.moduleType === "writing") {
      fd.append("prompt", formData.writingPrompt);
      fd.append("wordLimit", formData.wordLimit);
      fd.append("writingInstructions", formData.instructions);
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/test-modules/${selectedModule.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (response.ok) {
        showNotification("Quiz updated successfully!");
        setShowEditModal(false);
        fetchModules();
      } else {
        const err = await response.json();
        alert(err.message || "Failed to update quiz");
      }
    } catch (error) {
      console.error("Error updating quiz:", error);
      alert("Failed to update quiz");
    } finally {
      setSaving(false);
    }
  };

  // Delete quiz
  const handleDelete = async (moduleId) => {
    if (!confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/test-modules/${moduleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        showNotification("Quiz deleted successfully!");
        fetchModules();
      } else {
        alert("Failed to delete quiz");
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
      alert("Failed to delete quiz");
    }
  };

  // Get module icon
  const getModuleIcon = (moduleType) => {
    const icons = {
      listening: "🎧",
      reading: "📖",
      writing: "✍️",
      speaking: "🎤",
    };
    return icons[moduleType] || "📝";
  };

  // Get module color
  const getModuleColor = (moduleType) => {
    const colors = {
      listening: "blue",
      reading: "green",
      writing: "purple",
      speaking: "orange",
    };
    return colors[moduleType] || "gray";
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

  const filteredModules = getFilteredModules();

  return (
    <>
      <Head>
        <title>Quiz Management - Admin</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-blue-600">IELTS Admin</h1>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                  Admin
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <a
                  href="/admin/dashboard"
                  className="text-gray-600 hover:text-blue-600 font-medium"
                >
                  Subscriptions
                </a>
                <a
                  href="/admin/quizzes"
                  className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1"
                >
                  Quizzes
                </a>
                <a
                  href="/admin/users"
                  className="text-gray-600 hover:text-blue-600 font-medium"
                >
                  Users
                </a>
                <span className="text-gray-700">|</span>
                <span className="text-gray-700">{user?.name}</span>
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

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Quiz Management</h2>
              <p className="text-gray-600 mt-1">Create, edit, and manage IELTS quizzes</p>
            </div>
            <button
              onClick={openCreateModal}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create New Quiz</span>
            </button>
          </div>

          {/* Notification */}
          {message && (
            <div className="mb-6 bg-green-100 text-green-800 px-4 py-3 rounded-lg">
              {message}
            </div>
          )}

          {/* Stats */}
          <div className="grid md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-600">Total Quizzes</p>
              <p className="text-2xl font-bold text-blue-600">{modules.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-600">Listening</p>
              <p className="text-2xl font-bold text-blue-600">
                {modules.filter((m) => m.module_type === "listening").length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-600">Reading</p>
              <p className="text-2xl font-bold text-green-600">
                {modules.filter((m) => m.module_type === "reading").length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-600">Writing</p>
              <p className="text-2xl font-bold text-purple-600">
                {modules.filter((m) => m.module_type === "writing").length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-600">Speaking</p>
              <p className="text-2xl font-bold text-orange-600">
                {modules.filter((m) => m.module_type === "speaking").length}
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex space-x-2">
                {["all", "listening", "reading", "writing", "speaking"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      activeTab === tab
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-64 border border-gray-300 rounded-lg px-4 py-2 pl-10"
                />
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Quiz List */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.length === 0 ? (
              <div className="col-span-full bg-white rounded-xl shadow-md p-12 text-center">
                <p className="text-gray-500 text-lg">No quizzes found</p>
                <button
                  onClick={openCreateModal}
                  className="mt-4 text-blue-600 font-medium hover:underline"
                >
                  Create your first quiz
                </button>
              </div>
            ) : (
              filteredModules.map((module) => (
                <div
                  key={module.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  <div className={`h-2 bg-${getModuleColor(module.module_type)}-500`}></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{getModuleIcon(module.module_type)}</span>
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase">
                            {module.test_type} - {module.module_type}
                          </span>
                          <h3 className="text-lg font-bold text-gray-900">{module.title}</h3>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        module.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {module.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {module.description || "No description"}
                    </p>

                    <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-500">Questions</p>
                        <p className="font-bold text-gray-900">
                          {module.questions?.length || module.total_questions || 0}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="font-bold text-gray-900">{module.duration} min</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-500">Price</p>
                        <p className="font-bold text-gray-900">${module.price || 0}</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => openViewModal(module)}
                        className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg font-medium hover:bg-gray-200 transition text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => openEditModal(module)}
                        className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg font-medium hover:bg-blue-200 transition text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(module.id)}
                        className="bg-red-100 text-red-700 px-3 py-2 rounded-lg font-medium hover:bg-red-200 transition text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Create New Quiz</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
                  <select
                    value={formData.testType}
                    onChange={(e) => setFormData({ ...formData, testType: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="Academic">Academic</option>
                    <option value="General">General Training</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Module Type</label>
                  <select
                    value={formData.moduleType}
                    onChange={(e) => setFormData({ ...formData, moduleType: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="listening">Listening</option>
                    <option value="reading">Reading</option>
                    <option value="writing">Writing</option>
                    <option value="speaking">Speaking</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="e.g., Academic Listening Test 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Brief description"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                  <input
                    type="text"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Test instructions"
                  />
                </div>
              </div>

              {/* Module-specific content */}
              {formData.moduleType === "listening" && (
                <div className="bg-blue-50 rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold text-blue-900">Listening Content</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Audio File *</label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                      className="w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transcript</label>
                    <textarea
                      rows={3}
                      value={formData.transcript}
                      onChange={(e) => setFormData({ ...formData, transcript: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Audio transcript (optional)"
                    />
                  </div>
                </div>
              )}

              {formData.moduleType === "reading" && (
                <div className="bg-green-50 rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold text-green-900">Reading Content</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reading Passage *</label>
                    <textarea
                      rows={6}
                      required
                      value={formData.passage}
                      onChange={(e) => setFormData({ ...formData, passage: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Enter the reading passage here..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                    <input
                      type="text"
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="e.g., The Guardian, 2024"
                    />
                  </div>
                </div>
              )}

              {formData.moduleType === "writing" && (
                <div className="bg-purple-50 rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold text-purple-900">Writing Content</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Writing Prompt *</label>
                    <textarea
                      rows={4}
                      required
                      value={formData.writingPrompt}
                      onChange={(e) => setFormData({ ...formData, writingPrompt: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Enter the writing task prompt..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Word Limit</label>
                    <input
                      type="number"
                      min="50"
                      value={formData.wordLimit}
                      onChange={(e) => setFormData({ ...formData, wordLimit: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
              )}

              {/* Questions Section */}
              {(formData.moduleType === "listening" || formData.moduleType === "reading") && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900">Questions & Answers</h3>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="text-blue-600 font-medium hover:underline"
                    >
                      + Add Question
                    </button>
                  </div>

                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {questions.map((q, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Question {index + 1}</span>
                          {questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeQuestion(index)}
                              className="text-red-600 text-sm hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div>
                          <input
                            type="text"
                            value={q.question}
                            onChange={(e) => updateQuestion(index, "question", e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            placeholder="Enter question text"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Correct Answer</label>
                            <input
                              type="text"
                              value={q.correctAnswer}
                              onChange={(e) => updateQuestion(index, "correctAnswer", e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              placeholder="Correct answer"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Marks</label>
                            <input
                              type="number"
                              min="1"
                              value={q.marks}
                              onChange={(e) => updateQuestion(index, "marks", e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create Quiz"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal - Similar to Create */}
      {showEditModal && selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Edit Quiz</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
                  <select
                    value={formData.testType}
                    onChange={(e) => setFormData({ ...formData, testType: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="Academic">Academic</option>
                    <option value="General">General Training</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Module Type</label>
                  <select
                    value={formData.moduleType}
                    disabled
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100"
                  >
                    <option value="listening">Listening</option>
                    <option value="reading">Reading</option>
                    <option value="writing">Writing</option>
                    <option value="speaking">Speaking</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                  <input
                    type="text"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              {/* Module-specific content */}
              {formData.moduleType === "listening" && (
                <div className="bg-blue-50 rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold text-blue-900">Listening Content</h3>
                  {formData.audioUrl && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600 mb-1">Current Audio:</p>
                      <audio controls className="w-full">
                        <source src={formData.audioUrl} type="audio/mpeg" />
                      </audio>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Replace Audio (optional)
                    </label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transcript</label>
                    <textarea
                      rows={3}
                      value={formData.transcript}
                      onChange={(e) => setFormData({ ...formData, transcript: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
              )}

              {formData.moduleType === "reading" && (
                <div className="bg-green-50 rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold text-green-900">Reading Content</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reading Passage</label>
                    <textarea
                      rows={6}
                      value={formData.passage}
                      onChange={(e) => setFormData({ ...formData, passage: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                    <input
                      type="text"
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
              )}

              {formData.moduleType === "writing" && (
                <div className="bg-purple-50 rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold text-purple-900">Writing Content</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Writing Prompt</label>
                    <textarea
                      rows={4}
                      value={formData.writingPrompt}
                      onChange={(e) => setFormData({ ...formData, writingPrompt: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Word Limit</label>
                    <input
                      type="number"
                      min="50"
                      value={formData.wordLimit}
                      onChange={(e) => setFormData({ ...formData, wordLimit: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
              )}

              {/* Questions Section */}
              {(formData.moduleType === "listening" || formData.moduleType === "reading") && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900">Questions & Answers</h3>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="text-blue-600 font-medium hover:underline"
                    >
                      + Add Question
                    </button>
                  </div>

                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {questions.map((q, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Question {index + 1}</span>
                          {questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeQuestion(index)}
                              className="text-red-600 text-sm hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div>
                          <input
                            type="text"
                            value={q.question}
                            onChange={(e) => updateQuestion(index, "question", e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            placeholder="Enter question text"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Correct Answer</label>
                            <input
                              type="text"
                              value={q.correctAnswer}
                              onChange={(e) => updateQuestion(index, "correctAnswer", e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Marks</label>
                            <input
                              type="number"
                              min="1"
                              value={q.marks}
                              onChange={(e) => updateQuestion(index, "marks", e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{getModuleIcon(selectedModule.module_type)}</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedModule.title}</h2>
                  <p className="text-sm text-gray-500">
                    {selectedModule.test_type} - {selectedModule.module_type}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-bold text-lg">{selectedModule.duration} min</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-bold text-lg">${selectedModule.price || 0}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Questions</p>
                  <p className="font-bold text-lg">
                    {selectedModule.questions?.length || selectedModule.total_questions || 0}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Total Marks</p>
                  <p className="font-bold text-lg">{selectedModule.total_marks || 0}</p>
                </div>
              </div>

              {/* Description */}
              {selectedModule.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700">{selectedModule.description}</p>
                </div>
              )}

              {/* Instructions */}
              {selectedModule.instructions && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Instructions</h3>
                  <p className="text-gray-700">{selectedModule.instructions}</p>
                </div>
              )}

              {/* Content */}
              {selectedModule.module_type === "listening" && selectedModule.content?.audioUrl && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3">Audio</h3>
                  <audio controls className="w-full">
                    <source src={selectedModule.content.audioUrl} type="audio/mpeg" />
                  </audio>
                  {selectedModule.content.transcript && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-blue-700 font-medium">
                        View Transcript
                      </summary>
                      <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                        {selectedModule.content.transcript}
                      </p>
                    </details>
                  )}
                </div>
              )}

              {selectedModule.module_type === "reading" && selectedModule.content?.passage && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-3">Reading Passage</h3>
                  {selectedModule.content.source && (
                    <p className="text-sm text-gray-500 mb-2">Source: {selectedModule.content.source}</p>
                  )}
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedModule.content.passage}</p>
                </div>
              )}

              {selectedModule.module_type === "writing" && selectedModule.content?.prompt && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-3">Writing Prompt</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedModule.content.prompt}</p>
                  {selectedModule.content.word_limit && (
                    <p className="text-sm text-purple-700 mt-2">
                      Word limit: {selectedModule.content.word_limit} words
                    </p>
                  )}
                </div>
              )}

              {/* Questions */}
              {selectedModule.questions && selectedModule.questions.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Questions ({selectedModule.questions.length})
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedModule.questions.map((q, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              Q{index + 1}: {q.question || q.prompt}
                            </p>
                            <p className="text-green-700 mt-1">
                              <span className="font-medium">Answer:</span>{" "}
                              {q.correctAnswer || q.answer || "N/A"}
                            </p>
                          </div>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                            {q.marks || 1} mark{(q.marks || 1) > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    openEditModal(selectedModule);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit Quiz
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
