import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

const defaultReadingQuestion = { prompt: "", answer: "", marks: 1 };

export default function AdminContentUpload() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingModule, setUpdatingModule] = useState(false);
  const [message, setMessage] = useState("");
  const [modules, setModules] = useState([]);
  const [editingModule, setEditingModule] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    price: 0,
    duration: 0,
    instructions: "",
    tags: "",
    testType: "Academic",
    moduleType: "listening",
    listeningTranscript: "",
    listeningInstructions: "",
    readingPassage: "",
    readingSource: "",
    writingPrompt: "",
    writingInstructions: "",
    wordLimit: 0,
  });
  const [editQuestionsText, setEditQuestionsText] = useState("[]");
  const [editAudioFile, setEditAudioFile] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [packForm, setPackForm] = useState({
    testType: "Academic",
    baseTitle: "",
    baseDescription: "",
    listeningDuration: 30,
    readingDuration: 60,
    writingDuration: 60,
    packPrice: 0,
    wordLimit: 250,
    listeningInstructions: "",
    listeningTranscript: "",
    readingPassage: "",
    readingSource: "",
    writingPrompt: "",
    writingInstructions: "",
  });
  const [packListeningQuestions, setPackListeningQuestions] = useState([
    { ...defaultReadingQuestion },
  ]);
  const [packReadingQuestions, setPackReadingQuestions] = useState([
    { ...defaultReadingQuestion },
  ]);
  const [packListeningAudio, setPackListeningAudio] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const token = useMemo(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }, []);

  const checkAuth = () => {
    const storedToken = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!storedToken || !userData) {
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setModules(data.modules || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error loading modules:", errorData.message || response.status);
        if (response.status === 401) {
          router.push("/login");
        }
      }
    } catch (error) {
      console.error("Error loading modules", error);
    }
  };

  const openEditModal = (mod) => {
    setEditingModule(mod);
    setEditForm({
      title: mod.title || "",
      description: mod.description || "",
      price: mod.price || 0,
      duration: mod.duration || 0,
      instructions: mod.instructions || "",
      tags: Array.isArray(mod.tags) ? mod.tags.join(", ") : "",
      testType: mod.test_type || "Academic",
      moduleType: mod.module_type || "listening",
      listeningTranscript: mod.content?.transcript || "",
      listeningInstructions: mod.content?.instructions || "",
      readingPassage: mod.content?.passage || "",
      readingSource: mod.content?.source || "",
      writingPrompt: mod.content?.prompt || "",
      writingInstructions: mod.content?.instructions || "",
      wordLimit: mod.content?.word_limit || 0,
    });
    setEditQuestionsText(JSON.stringify(mod.questions || [], null, 2));
    setEditAudioFile(null);
  };

  const closeEditModal = () => {
    setEditingModule(null);
    setEditAudioFile(null);
    setEditQuestionsText("[]");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3500);
  };

  const submitEditModule = async (e) => {
    e.preventDefault();
    if (!editingModule) return;

    let parsedQuestions = [];
    try {
      parsedQuestions = JSON.parse(editQuestionsText || "[]");
    } catch (err) {
      showMessage("Invalid questions JSON.");
      return;
    }

    setUpdatingModule(true);

    const formData = new FormData();
    formData.append("testType", editForm.testType);
    formData.append("moduleType", editForm.moduleType);
    formData.append("title", editForm.title);
    formData.append("description", editForm.description);
    formData.append("price", editForm.price);
    formData.append("duration", editForm.duration);
    formData.append("instructions", editForm.instructions);
    formData.append("tags", editForm.tags);

    if (editForm.moduleType === "listening") {
      formData.append("transcript", editForm.listeningTranscript || "");
      formData.append("listeningInstructions", editForm.listeningInstructions || "");
      formData.append("listeningQuestions", JSON.stringify(parsedQuestions));
      if (editAudioFile) {
        formData.append("audio", editAudioFile);
      }
    } else if (editForm.moduleType === "reading") {
      formData.append("passage", editForm.readingPassage || "");
      formData.append("source", editForm.readingSource || "");
      formData.append("readingQuestions", JSON.stringify(parsedQuestions));
    } else if (editForm.moduleType === "writing") {
      formData.append("prompt", editForm.writingPrompt || "");
      formData.append("wordLimit", editForm.wordLimit);
      formData.append("writingInstructions", editForm.writingInstructions || "");
    }

    try {
      const response = await fetch(`/api/admin/test-modules/${editingModule.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        showMessage("Module updated.");
        closeEditModal();
        fetchModules();
      } else {
        const err = await response.json();
        showMessage(err.message || "Update failed");
      }
    } catch (error) {
      console.error("Module update error", error);
      showMessage("Update failed");
    } finally {
      setUpdatingModule(false);
    }
  };

  const deleteModule = async (modId) => {
    if (!confirm("Delete this module?")) return;
    setDeletingId(modId);
    try {
      const response = await fetch(`/api/admin/test-modules/${modId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        showMessage("Module deleted.");
        fetchModules();
      } else {
        const err = await response.json();
        showMessage(err.message || "Delete failed");
      }
    } catch (error) {
      console.error("Delete module error", error);
      showMessage("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const submitPack = async (e) => {
    e.preventDefault();
    if (!packListeningAudio) {
      showMessage("Please attach listening audio for the pack.");
      return;
    }
    setSaving(true);

    const listeningQs = packListeningQuestions
      .filter((q) => q.prompt.trim())
      .map((q, idx) => ({
        id: `listening-${idx + 1}`,
        prompt: q.prompt,
        answer: q.answer || "",
        marks: Number(q.marks) || 1,
      }));

    const readingQs = packReadingQuestions
      .filter((q) => q.prompt.trim())
      .map((q, idx) => ({
        id: `reading-${idx + 1}`,
        prompt: q.prompt,
        answer: q.answer || "",
        marks: Number(q.marks) || 1,
      }));

    const formData = new FormData();
    formData.append("testType", packForm.testType);
    formData.append("baseTitle", packForm.baseTitle);
    formData.append("baseDescription", packForm.baseDescription);
    formData.append("listeningDuration", packForm.listeningDuration);
    formData.append("readingDuration", packForm.readingDuration);
    formData.append("writingDuration", packForm.writingDuration);
    formData.append("packPrice", packForm.packPrice);
    formData.append("wordLimit", packForm.wordLimit);
    formData.append("listeningInstructions", packForm.listeningInstructions);
    formData.append("listeningTranscript", packForm.listeningTranscript);
    formData.append("readingPassage", packForm.readingPassage);
    formData.append("readingSource", packForm.readingSource);
    formData.append("writingPrompt", packForm.writingPrompt);
    formData.append("writingInstructions", packForm.writingInstructions);
    formData.append("listeningQuestions", JSON.stringify(listeningQs));
    formData.append("readingQuestions", JSON.stringify(readingQs));
    formData.append("listeningAudio", packListeningAudio);

    try {
      const response = await fetch("/api/admin/test-modules/pack", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (response.ok) {
        showMessage("Full pack uploaded (Listening, Reading, Writing).");
        fetchModules();
      } else {
        const err = await response.json();
        showMessage(err.message || "Save failed");
      }
    } catch (error) {
      console.error("Pack upload error", error);
      showMessage("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const updatePackListeningQuestion = (index, field, value) => {
    setPackListeningQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  const addPackListeningQuestion = () => {
    setPackListeningQuestions((prev) => [...prev, { ...defaultReadingQuestion }]);
  };

  const removePackListeningQuestion = (index) => {
    setPackListeningQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePackReadingQuestion = (index, field, value) => {
    setPackReadingQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  const addPackReadingQuestion = () => {
    setPackReadingQuestions((prev) => [...prev, { ...defaultReadingQuestion }]);
  };

  const removePackReadingQuestion = (index) => {
    setPackReadingQuestions((prev) => prev.filter((_, i) => i !== index));
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
        <title>Admin Content Upload - IELTS Mock Platform</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-blue-600">IELTS Admin</span>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">Admin</span>
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
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Upload IELTS Modules</h1>
              <p className="text-gray-600">Academic & General, Listening / Reading / Writing</p>
            </div>
            {message && (
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-sm">
                {message}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
            <div className="px-6 pt-6 pb-2 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Full Pack (Listening / Reading / Writing)</h2>
              <p className="text-sm text-gray-600">Upload all parts together as a single package.</p>
            </div>

            <div className="p-6">
              <form onSubmit={submitPack} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Test Type
                      </label>
                      <select
                        value={packForm.testType}
                        onChange={(e) =>
                          setPackForm({ ...packForm, testType: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500"
                      >
                        <option>Academic</option>
                        <option>General</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pack Price (applies to all modules)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={packForm.packPrice}
                        onChange={(e) =>
                          setPackForm({ ...packForm, packPrice: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500"
                        placeholder="e.g. 50"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pack Title
                      </label>
                      <input
                        type="text"
                        required
                        value={packForm.baseTitle}
                        onChange={(e) =>
                          setPackForm({ ...packForm, baseTitle: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500"
                        placeholder="IELTS Full Pack Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Shared Description
                      </label>
                      <input
                        type="text"
                        value={packForm.baseDescription}
                        onChange={(e) =>
                          setPackForm({ ...packForm, baseDescription: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500"
                        placeholder="Brief description for all modules"
                      />
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Listening</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-gray-700">Duration (min)</label>
                          <input
                            type="number"
                            min="1"
                            value={packForm.listeningDuration}
                            onChange={(e) =>
                              setPackForm({ ...packForm, listeningDuration: e.target.value })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700">Audio</label>
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => setPackListeningAudio(e.target.files?.[0] || null)}
                            className="w-full text-gray-900"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <textarea
                      value={packForm.listeningInstructions}
                      onChange={(e) =>
                        setPackForm({ ...packForm, listeningInstructions: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500"
                      placeholder="Instructions (optional)"
                    />
                    <textarea
                      value={packForm.listeningTranscript}
                      onChange={(e) =>
                        setPackForm({ ...packForm, listeningTranscript: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500"
                      placeholder="Transcript (optional)"
                    />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-md font-semibold text-gray-900">Listening questions</h4>
                        <button
                          type="button"
                          onClick={addPackListeningQuestion}
                          className="text-blue-600 font-medium"
                        >
                          + Add Question
                        </button>
                      </div>
                      {packListeningQuestions.map((q, idx) => (
                        <div
                          key={idx}
                          className="border border-gray-200 rounded-lg p-3 bg-white space-y-2"
                        >
                          <div className="flex justify-between items-center text-sm text-gray-600">
                            <span>Question {idx + 1}</span>
                            {packListeningQuestions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removePackListeningQuestion(idx)}
                                className="text-red-500"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <textarea
                            required
                            value={q.prompt}
                            onChange={(e) =>
                              updatePackListeningQuestion(idx, "prompt", e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500"
                            placeholder="Question text"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={q.answer}
                              onChange={(e) =>
                                updatePackListeningQuestion(idx, "answer", e.target.value)
                              }
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500"
                              placeholder="Answer (optional)"
                            />
                            <input
                              type="number"
                              min="1"
                              value={q.marks}
                              onChange={(e) =>
                                updatePackListeningQuestion(idx, "marks", e.target.value)
                              }
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500"
                              placeholder="Marks"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Reading</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-gray-700">Duration (min)</label>
                          <input
                            type="number"
                            min="1"
                            value={packForm.readingDuration}
                            onChange={(e) =>
                              setPackForm({ ...packForm, readingDuration: e.target.value })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700">Source</label>
                          <input
                            type="text"
                            value={packForm.readingSource}
                            onChange={(e) =>
                              setPackForm({ ...packForm, readingSource: e.target.value })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500"
                            placeholder="Optional source"
                          />
                        </div>
                      </div>
                    </div>
                    <textarea
                      required
                      rows={4}
                      value={packForm.readingPassage}
                      onChange={(e) =>
                        setPackForm({ ...packForm, readingPassage: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500"
                      placeholder="Reading passage"
                    />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-md font-semibold text-gray-900">Reading questions</h4>
                        <button
                          type="button"
                          onClick={addPackReadingQuestion}
                          className="text-blue-600 font-medium"
                        >
                          + Add Question
                        </button>
                      </div>
                      {packReadingQuestions.map((q, idx) => (
                        <div
                          key={idx}
                          className="border border-gray-200 rounded-lg p-3 bg-white space-y-2"
                        >
                          <div className="flex justify-between items-center text-sm text-gray-600">
                            <span>Question {idx + 1}</span>
                            {packReadingQuestions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removePackReadingQuestion(idx)}
                                className="text-red-500"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <textarea
                            required
                            value={q.prompt}
                            onChange={(e) =>
                              updatePackReadingQuestion(idx, "prompt", e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500"
                            placeholder="Question text"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={q.answer}
                              onChange={(e) =>
                                updatePackReadingQuestion(idx, "answer", e.target.value)
                              }
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500"
                              placeholder="Answer (optional)"
                            />
                            <input
                              type="number"
                              min="1"
                              value={q.marks}
                              onChange={(e) =>
                                updatePackReadingQuestion(idx, "marks", e.target.value)
                              }
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500"
                              placeholder="Marks"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Writing</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-gray-700">Duration (min)</label>
                          <input
                            type="number"
                            min="1"
                            value={packForm.writingDuration}
                            onChange={(e) =>
                              setPackForm({ ...packForm, writingDuration: e.target.value })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700">Word limit</label>
                          <input
                            type="number"
                            min="1"
                            value={packForm.wordLimit}
                            onChange={(e) =>
                              setPackForm({ ...packForm, wordLimit: e.target.value })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500"
                          />
                        </div>
                      </div>
                    </div>
                    <textarea
                      required
                      rows={3}
                      value={packForm.writingPrompt}
                      onChange={(e) =>
                        setPackForm({ ...packForm, writingPrompt: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500"
                      placeholder="Writing prompt"
                    />
                    <textarea
                      value={packForm.writingInstructions}
                      onChange={(e) =>
                        setPackForm({ ...packForm, writingInstructions: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500"
                      placeholder="Instructions (optional)"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
                    >
                      {saving ? "Saving..." : "Upload full pack"}
                    </button>
                  </div>
                </form>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Modules</h2>
              <span className="text-sm text-gray-500">{modules.length} saved</span>
            </div>
            {modules.length === 0 ? (
              <p className="text-gray-500">No modules uploaded yet.</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.slice(0, 9).map((mod) => (
                  <div
                    key={mod.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wide text-gray-500">
                        {mod.test_type} · {mod.module_type}
                      </span>
                      <span className="text-blue-700 font-semibold">
                        {mod.duration} min
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{mod.title}</h3>
                    <p className="text-sm text-gray-600">{mod.description}</p>
                    {mod.module_type === "listening" && mod.content?.audioUrl && (
                      <audio controls className="w-full mt-2">
                        <source src={mod.content.audioUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    )}
                    {mod.module_type === "writing" && mod.content?.word_limit && (
                      <p className="text-sm text-gray-700">
                        Word limit: {mod.content.word_limit}
                      </p>
                    )}
                    <div className="flex justify-between items-center pt-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(mod)}
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteModule(mod.id)}
                        className="text-red-600 font-semibold hover:underline disabled:opacity-50"
                        disabled={deletingId === mod.id}
                      >
                        {deletingId === mod.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {editingModule && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Edit Module</h3>
                  <p className="text-sm text-gray-600">
                    {editingModule.test_type} · {editingModule.module_type}
                  </p>
                </div>
                <button onClick={closeEditModal} className="text-gray-500 hover:text-gray-800">
                  ✕
                </button>
              </div>

              <form onSubmit={submitEditModule} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                    <input
                      type="number"
                      min="1"
                      value={editForm.duration}
                      onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                    <input
                      type="text"
                      value={editForm.tags}
                      onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="comma separated"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">General Instructions</label>
                  <textarea
                    rows={2}
                    value={editForm.instructions}
                    onChange={(e) => setEditForm({ ...editForm, instructions: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                {editingModule.module_type === "listening" && (
                  <div className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Transcript
                        </label>
                        <textarea
                          rows={3}
                          value={editForm.listeningTranscript}
                          onChange={(e) =>
                            setEditForm({ ...editForm, listeningTranscript: e.target.value })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Listening Instructions
                        </label>
                        <textarea
                          rows={3}
                          value={editForm.listeningInstructions}
                          onChange={(e) =>
                            setEditForm({ ...editForm, listeningInstructions: e.target.value })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Replace audio (optional)</label>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => setEditAudioFile(e.target.files?.[0] || null)}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}

                {editingModule.module_type === "reading" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Passage</label>
                      <textarea
                        rows={4}
                        value={editForm.readingPassage}
                        onChange={(e) => setEditForm({ ...editForm, readingPassage: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                        <input
                          type="text"
                          value={editForm.readingSource}
                          onChange={(e) => setEditForm({ ...editForm, readingSource: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {editingModule.module_type === "writing" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
                      <textarea
                        rows={3}
                        value={editForm.writingPrompt}
                        onChange={(e) => setEditForm({ ...editForm, writingPrompt: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Word limit</label>
                        <input
                          type="number"
                          min="1"
                          value={editForm.wordLimit}
                          onChange={(e) => setEditForm({ ...editForm, wordLimit: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Writing Instructions
                        </label>
                        <textarea
                          rows={2}
                          value={editForm.writingInstructions}
                          onChange={(e) =>
                            setEditForm({ ...editForm, writingInstructions: e.target.value })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {editingModule.module_type !== "writing" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Questions (JSON)
                    </label>
                    <textarea
                      rows={6}
                      value={editQuestionsText}
                      onChange={(e) => setEditQuestionsText(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500">
                      Edit prompt/answer/marks objects. Keep array format.
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingModule}
                    className="px-5 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-60"
                  >
                    {updatingModule ? "Updating..." : "Update Module"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
