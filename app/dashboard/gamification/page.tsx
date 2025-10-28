"use client";
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Toaster, toast } from "react-hot-toast";

type Option = {
  text: string;
  is_correct: boolean;
};

type Question = {
  id: number;
  text: string;
  order: number;
  quiz_id: number;
};

type QuestionCreate = {
  text: string;
  order: number;
  options: Option[];
  feedback: string;
};

type QuizSummary = {
  id: number;
  title: string;
  description: string;
};

const GamificationQuizAdmin: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Quiz creation state
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [questions, setQuestions] = useState<QuestionCreate[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Quiz list state
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [quizListError, setQuizListError] = useState<string | null>(null);
  const [deletingQuizId, setDeletingQuizId] = useState<number | null>(null);
  const [quizToDelete, setQuizToDelete] = useState<QuizSummary | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalQuiz, setModalQuiz] = useState<QuizSummary | null>(null);
  const [modalQuestions, setModalQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Layout controls
  const toggleTheme = () => setIsDarkMode((prev) => !prev);
  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  // Ensure modal is only rendered on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch quizzes
  const fetchQuizzes = async () => {
    setLoadingQuizzes(true);
    setQuizListError(null);
    try {
      const res = await fetch("https://rafikeybot.onrender.com/gamification/quizzes");
      if (!res.ok) {
        throw new Error("Failed to fetch quizzes");
      }
      const data = await res.json();
      setQuizzes(data);
    } catch (err: unknown) {
      let message = "Failed to fetch quizzes";
      if (err instanceof Error) {
        message = err.message;
      }
      setQuizListError(message);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Delete quiz logic
  const handleDeleteQuiz = async (quizId: number) => {
    setDeletingQuizId(quizId);
    const toastId = toast.loading("Deleting quiz...");
    try {
      const res = await fetch(`https://rafikeybot.onrender.com/gamification/quizzes/${quizId}`, {
        method: "DELETE",
      });
      if (res.status === 204) {
        toast.success("Quiz deleted successfully!", { id: toastId });
        setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
      } else {
        let errMsg = "Failed to delete quiz";
        try {
          const err = await res.json();
          errMsg = err.detail || errMsg;
        } catch {}
        toast.error("Error: " + errMsg, { id: toastId });
      }
    } catch (err: unknown) {
      let message = "Network error";
      if (err instanceof Error) {
        message = err.message;
      }
      toast.error("Network error: " + message, { id: toastId });
    } finally {
      setDeletingQuizId(null);
      setQuizToDelete(null);
    }
  };

  // Quiz logic
  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        text: "",
        order: prev.length + 1,
        options: [],
        feedback: "",
      },
    ]);
  };

  const removeQuestion = (idx: number) => {
    const newQuestions = questions.filter((_, i) => i !== idx).map((q, i) => ({
      ...q,
      order: i + 1,
    }));
    setQuestions(newQuestions);
  };

  const updateQuestionText = (idx: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, text: value } : q))
    );
  };

  const updateFeedback = (idx: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, feedback: value } : q))
    );
  };

  const addOption = (qIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? { ...q, options: [...q.options, { text: "", is_correct: false }] }
          : q
      )
    );
  };

  const removeOption = (qIdx: number, oIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options.filter((_, j) => j !== oIdx) }
          : q
      )
    );
  };

  const updateOptionText = (qIdx: number, oIdx: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              options: q.options.map((opt, j) =>
                j === oIdx ? { ...opt, text: value } : opt
              ),
            }
          : q
      )
    );
  };

  const updateOptionCorrect = (qIdx: number, oIdx: number, checked: boolean) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              options: q.options.map((opt, j) =>
                j === oIdx ? { ...opt, is_correct: checked } : opt
              ),
            }
          : q
      )
    );
  };

  const validateQuiz = () => {
    if (!quizTitle.trim()) return false;
    if (questions.length === 0) return false;
    for (const q of questions) {
      if (!q.text.trim()) return false;
      if (q.options.length < 2) return false;
      if (!q.options.some((o) => o.is_correct)) return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateQuiz()) {
      toast.error(
        "Please fill all fields, add at least 2 options per question, and mark a correct answer for each question."
      );
      return;
    }
    setSubmitting(true);
    const payload = {
      title: quizTitle.trim(),
      description: quizDescription.trim(),
      questions: questions.map((q) => ({
        text: q.text,
        order: q.order,
        options: q.options,
        feedback: q.feedback,
      })),
    };
    const toastId = toast.loading("Submitting quiz...");
    try {
      const res = await fetch("https://rafikeybot.onrender.com/gamification/admin/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success("Quiz created successfully!", { id: toastId });
        setQuizTitle("");
        setQuizDescription("");
        setQuestions([]);
        fetchQuizzes(); // Refresh quiz list
      } else {
        let errMsg = "Failed to create quiz";
        try {
          const err = await res.json();
          errMsg = err.detail || errMsg;
        } catch {
          // ignore
        }
        toast.error("Error: " + errMsg, { id: toastId });
      }
    } catch (err: unknown) {
      let message = "Network error";
      if (err instanceof Error) {
        message = err.message;
      }
      toast.error("Network error: " + message, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  // Modal logic
  const openQuizModal = async (quiz: QuizSummary) => {
    setModalQuiz(quiz);
    setShowModal(true);
    setModalQuestions([]);
    setLoadingQuestions(true);
    setQuestionsError(null);
    try {
      // Assuming endpoint: /gamification/quizzes/{quiz_id}/questions returns all questions for a quiz
      const res = await fetch(`https://rafikeybot.onrender.com/gamification/quizzes/${quiz.id}/questions`);
      if (!res.ok) {
        throw new Error("Failed to fetch questions");
      }
      const data = await res.json();
      setModalQuestions(data);
    } catch (err: unknown) {
      let message = "Failed to fetch questions";
      if (err instanceof Error) {
        message = err.message;
      }
      setQuestionsError(message);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalQuiz(null);
    setModalQuestions([]);
    setQuestionsError(null);
  };

  // Modal component using portal
  const Modal = isClient && showModal
    ? ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className={`w-full max-w-lg rounded-2xl shadow-2xl border p-8 relative ${
              isDarkMode
                ? "bg-gray-900 border-gray-700 text-gray-100"
                : "bg-white border-gray-200 text-gray-900"
            }`}
          >
            <button
              className="absolute top-3 right-3 text-xl font-bold text-gray-400 hover:text-red-500"
              onClick={closeModal}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-4">
              Questions for: {modalQuiz?.title}
            </h3>
            {loadingQuestions ? (
              <div className="text-center text-gray-400">Loading questions...</div>
            ) : questionsError ? (
              <div className="text-center text-red-500">{questionsError}</div>
            ) : modalQuestions.length === 0 ? (
              <div className="text-center text-gray-400">No questions found.</div>
            ) : (
              <ul className="space-y-3">
                {modalQuestions.map((q) => (
                  <li
                    key={q.id}
                    className={`rounded-lg p-4 border ${
                      isDarkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="font-semibold">
                      Q{q.order}: {q.text}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        isDarkMode
          ? "bg-gray-900"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      }`}
    >
      <Toaster position="top-center" />
      <Sidebar
        isDarkMode={isDarkMode}
        isSidebarCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />
      <div
        className={`transition-all duration-300 ${
          isSidebarCollapsed ? "ml-0 sm:ml-16" : "ml-0 sm:ml-64"
        }`}
      >
        <Header
          isDarkMode={isDarkMode}
          isSidebarCollapsed={isSidebarCollapsed}
          toggleTheme={toggleTheme}
          toggleSidebar={toggleSidebar}
        />
        <main className="p-4 sm:p-6 md:p-8 flex flex-col items-center">
          <h1
            className={`text-3xl font-bold mb-8 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Gamification Quizzes
          </h1>
          <div className="w-full flex flex-col md:flex-row gap-8 max-w-6xl">
            {/* Quiz Creation Form (Left) */}
            <div className="flex-1">
              <h2
                className={`text-xl font-semibold mb-4 ${
                  isDarkMode ? "text-gray-200" : "text-gray-800"
                }`}
              >
                Create a New Quiz
              </h2>
              <form
                onSubmit={handleSubmit}
                id="quizForm"
                autoComplete="off"
                className={`relative backdrop-blur-md rounded-3xl p-8 h-fit shadow-2xl border transition-all duration-300 ${
                  isDarkMode
                    ? "bg-gray-800/60 border-gray-700/50"
                    : "bg-white/90 border-black/10"
                }`}
              >
                <label className="block mb-4">
                  <span
                    className={`font-semibold ${
                      isDarkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    Quiz Title:
                  </span>
                  <input
                    type="text"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    required
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </label>
                <label className="block mb-4">
                  <span
                    className={`font-semibold ${
                      isDarkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    Description:
                  </span>
                  <textarea
                    value={quizDescription}
                    onChange={(e) => setQuizDescription(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </label>
                <div id="questions">
                  {questions.map((q, qIdx) => (
                    <div
                      className={`mb-6 rounded-xl border ${
                        isDarkMode
                          ? "bg-gray-900/60 border-gray-700"
                          : "bg-gray-50 border-gray-200"
                      } p-4`}
                      key={qIdx}
                    >
                      <label className="block mb-2 font-medium">
                        Question {q.order}:
                        <input
                          type="text"
                          value={q.text}
                          onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                          required
                          className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                      </label>
                      <div>
                        {q.options.map((opt, oIdx) => (
                          <div
                            className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2 ml-4 p-3 rounded-lg border ${
                              isDarkMode
                                ? "bg-gray-800 border-gray-700"
                                : "bg-white border-gray-200"
                            }`}
                            key={oIdx}
                          >
                            <label className="flex-1 font-normal">
                              Option {oIdx + 1}:
                              <input
                                type="text"
                                value={opt.text}
                                onChange={(e) =>
                                  updateOptionText(qIdx, oIdx, e.target.value)
                                }
                                required
                                className="ml-2 w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                              />
                            </label>
                            <label className="flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={opt.is_correct}
                                onChange={(e) =>
                                  updateOptionCorrect(qIdx, oIdx, e.target.checked)
                                }
                                className="accent-purple-600"
                              />
                              <span className="text-sm">Correct</span>
                            </label>
                            <button
                              type="button"
                              className="ml-2 px-3 py-1 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                              onClick={() => removeOption(qIdx, oIdx)}
                            >
                              Remove Option
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          className="px-4 py-1 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                          onClick={() => addOption(qIdx)}
                        >
                          Add Option
                        </button>
                        <button
                          type="button"
                          className="px-4 py-1 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                          onClick={() => removeQuestion(qIdx)}
                        >
                          Remove Question
                        </button>
                      </div>
                      <label className="block mt-3 font-medium">
                        Feedback:
                        <textarea
                          value={q.feedback}
                          onChange={(e) => updateFeedback(qIdx, e.target.value)}
                          className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                      </label>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="mb-6 px-6 py-2 rounded-xl font-semibold text-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:scale-105 hover:shadow-2xl transition"
                  onClick={addQuestion}
                >
                  Add Question
                </button>
                <br />
                <button
                  type="submit"
                  disabled={submitting}
                  className={`relative mt-2 px-6 py-3 rounded-xl font-semibold text-lg flex items-center justify-center transition-all duration-200
                    ${
                      submitting
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:scale-105 hover:shadow-2xl"
                    }
                  `}
                  style={{ minWidth: 140 }}
                >
                  {submitting ? "Submitting..." : "Submit Quiz"}
                </button>
              </form>
            </div>
            {/* Quiz List (Right) */}
            <div className="flex-1">
              <h2
                className={`text-xl font-semibold mb-4 ${
                  isDarkMode ? "text-gray-200" : "text-gray-800"
                }`}
              >
                Existing Quizzes
              </h2>
              <div
                className={`rounded-2xl shadow border transition-all duration-300 ${
                  isDarkMode
                    ? "bg-gray-800/60 border-gray-700/50"
                    : "bg-white/90 border-black/10"
                }`}
              >
                {loadingQuizzes ? (
                  <div className="p-6 text-center text-gray-400">Loading quizzes...</div>
                ) : quizListError ? (
                  <div className="p-6 text-center text-red-500">{quizListError}</div>
                ) : quizzes.length === 0 ? (
                  <div className="p-6 text-center text-gray-400">No quizzes found.</div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 font-semibold text-gray-800 dark:text-gray-200 text-gray-800 ">ID</th>
                        <th className="px-4 py-2 font-semibold text-gray-800 dark:text-gray-200 dark:text-gray-200">Title</th>
                        <th className="px-4 py-2 font-semibold text-gray-800 dark:text-gray-200 dark:text-gray-200">Description</th>
                        <th className="px-4 py-2 font-semibold text-gray-800 dark:text-gray-200 dark:text-gray-200">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quizzes.map((quiz) => (
                        <tr
                          key={quiz.id}
                          className={`border-t hover:bg-purple-100/30 ${
                            isDarkMode
                              ? "border-gray-700 hover:bg-purple-900/30"
                              : "border-gray-200"
                          }`}
                        >
                          <td className="px-4 py-2 cursor-pointer text-gray-800 dark:text-gray-200" onClick={() => openQuizModal(quiz)}>{quiz.id}</td>
                          <td className="px-4 py-2 cursor-pointer text-gray-800 dark:text-gray-200" onClick={() => openQuizModal(quiz)}>{quiz.title}</td>
                          <td className="px-4 py-2 cursor-pointer text-gray-800 dark:text-gray-200" onClick={() => openQuizModal(quiz)}>{quiz.description}</td>
                          <td className="px-4 py-2">
                            <button
                              className={`px-4 py-1 rounded-lg font-semibold text-white transition ${
                                deletingQuizId === quiz.id
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-red-600 hover:bg-red-700"
                              }`}
                              onClick={() => setQuizToDelete(quiz)}
                              disabled={deletingQuizId === quiz.id}
                            >
                              {deletingQuizId === quiz.id ? "Deleting..." : "Delete"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
          {/* Modal for questions */}
          {Modal}
          {/* Modal for quiz deletion */}
          {isClient && quizToDelete && ReactDOM.createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div
                className={`w-full max-w-md rounded-2xl shadow-2xl border p-8 relative ${
                  isDarkMode
                    ? "bg-gray-900 border-gray-700 text-gray-100"
                    : "bg-white border-gray-200 text-gray-900"
                }`}
              >
                <button
                  className="absolute top-3 right-3 text-xl font-bold text-gray-400 hover:text-red-500"
                  onClick={() => setQuizToDelete(null)}
                  aria-label="Close"
                  disabled={deletingQuizId === quizToDelete.id}
                >
                  &times;
                </button>
                <h3 className="text-2xl font-bold mb-4">
                  Delete Quiz
                </h3>
                <p className="mb-6">
                  Are you sure you want to delete the quiz <span className="font-semibold">{quizToDelete.title}</span>?<br />
                  This action cannot be undone.
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    className="px-4 py-2 rounded-lg font-semibold bg-gray-400 text-white hover:bg-gray-500 transition"
                    onClick={() => setQuizToDelete(null)}
                    disabled={deletingQuizId === quizToDelete.id}
                  >
                    Cancel
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg font-semibold text-white transition ${
                      deletingQuizId === quizToDelete.id
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                    onClick={() => handleDeleteQuiz(quizToDelete.id)}
                    disabled={deletingQuizId === quizToDelete.id}
                  >
                    {deletingQuizId === quizToDelete.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
        </main>
      </div>
    </div>
  );
};

export default GamificationQuizAdmin;