import React, { useState, useEffect } from "react";
import { mockTestsAPI } from "../../services/api";
import { PlusIcon, PencilIcon, AcademicCapIcon, ListBulletIcon, TrophyIcon, UserGroupIcon, CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";

const MockTestsManagement = () => {
  const [activeTab, setActiveTab] = useState("attempts"); // attempts, exams, questions
  const [tests, setTests] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  // Create Test Form State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [newTest, setNewTest] = useState({
    title: "",
    description: "",
    course_type: "JEE",
    target_class: "All",
    duration_minutes: 60,
    total_marks: 0
  });

  // Manage Questions State
  const [selectedTestId, setSelectedTestId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null); // null if adding new
  const [questionForm, setQuestionForm] = useState({
    question_text: "",
    options: ["", "", "", ""],
    correct_option: 1,
    explanation: "",
    image_url: ""
  });

  // Filter states
  const [attemptsSearch, setAttemptsSearch] = useState("");
  const [attemptsFilterStream, setAttemptsFilterStream] = useState("");

  useEffect(() => {
    fetchExams();
    fetchAttempts();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await mockTestsAPI.getAll();
      setTests(res.data || []);
      if (res.data && res.data.length > 0 && !selectedTestId) {
        setSelectedTestId(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load mock tests.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      const res = await mockTestsAPI.getAttempts();
      setAttempts(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load student attempts.");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (testId) => {
    if (!testId) return;
    try {
      setLoading(true);
      const res = await mockTestsAPI.getAdminQuestions(testId);
      setQuestions(res.data?.questions || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load test questions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "questions" && selectedTestId) {
      fetchQuestions(selectedTestId);
    }
  }, [activeTab, selectedTestId]);

  // Create Test Submit
  const handleCreateTestSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await mockTestsAPI.createTest(newTest);
      setSuccessMsg("Mock test created successfully!");
      setIsTestModalOpen(false);
      setNewTest({ title: "", description: "", course_type: "JEE", target_class: "All", duration_minutes: 60, total_marks: 0 });
      fetchExams();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to create mock test.");
    } finally {
      setLoading(false);
    }
  };

  // Question save / edit Submit
  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const payload = {
        ...questionForm,
        id: editingQuestion ? editingQuestion.id : undefined
      };
      await mockTestsAPI.saveQuestion(selectedTestId, payload);
      setSuccessMsg("Question saved successfully!");
      setIsQuestionFormOpen(false);
      setEditingQuestion(null);
      setQuestionForm({ question_text: "", options: ["", "", "", ""], correct_option: 1, explanation: "", image_url: "" });
      fetchQuestions(selectedTestId);
      fetchExams(); // refresh count
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to save question.");
    } finally {
      setLoading(false);
    }
  };

  const startEditQuestion = (q) => {
    setEditingQuestion(q);
    setQuestionForm({
      question_text: q.question_text,
      options: [...q.options],
      correct_option: q.correct_option,
      explanation: q.explanation || "",
      image_url: q.image_url || ""
    });
    setIsQuestionFormOpen(true);
  };

  const startAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm({
      question_text: "",
      options: ["", "", "", ""],
      correct_option: 1,
      explanation: "",
      image_url: ""
    });
    setIsQuestionFormOpen(true);
  };

  // Helper formats
  const formatTimeSpent = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}m ${remaining}s`;
  };

  const formatExamDate = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Filtering attempts
  const filteredAttempts = attempts.filter((a) => {
    const matchesSearch = 
      a.student_name.toLowerCase().includes(attemptsSearch.toLowerCase()) ||
      a.student_email.toLowerCase().includes(attemptsSearch.toLowerCase());
    const matchesStream = attemptsFilterStream ? a.course_type === attemptsFilterStream : true;
    return matchesSearch && matchesStream;
  });

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page title and messages */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-wide">
              Mock Tests Dashboard
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Create mock examinations, edit question keys, and analyze student test scores.
            </p>
          </div>
          {activeTab === "exams" && (
            <button
              onClick={() => setIsTestModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            >
              <PlusIcon className="w-4 h-4" />
              Add Mock Test
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <span>⚠️ {error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-between animate-fade-in">
            <span>✅ {successMsg}</span>
            <button onClick={() => setSuccessMsg("")} className="text-slate-400 hover:text-slate-600">×</button>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab("attempts")}
            className={`pb-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "attempts" ? "border-orange-600 text-orange-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <UserGroupIcon className="w-4 h-4" />
            User Statistics
          </button>
          <button
            onClick={() => setActiveTab("exams")}
            className={`pb-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "exams" ? "border-orange-600 text-orange-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <TrophyIcon className="w-4 h-4" />
            Manage Exams
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            className={`pb-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "questions" ? "border-orange-600 text-orange-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <ListBulletIcon className="w-4 h-4" />
            Question Bank
          </button>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-600"></div>
          </div>
        )}

        {/* Tab Content 1: User Attempts */}
        {activeTab === "attempts" && (
          <div className="space-y-4">
            
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <input
                type="text"
                placeholder="Search student by name or email..."
                value={attemptsSearch}
                onChange={(e) => setAttemptsSearch(e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <select
                value={attemptsFilterStream}
                onChange={(e) => setAttemptsFilterStream(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">All Streams</option>
                <option value="JEE">JEE</option>
                <option value="NEET">NEET</option>
                <option value="WBJEE">WBJEE</option>
                <option value="Foundation">Foundation</option>
              </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                      <th className="p-4">Student</th>
                      <th className="p-4">Mock Exam</th>
                      <th className="p-4">Stream</th>
                      <th className="p-4 text-center">Score</th>
                      <th className="p-4 text-center">Time Spent</th>
                      <th className="p-4">Exam Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {filteredAttempts.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="p-4">
                          <div>
                            <p className="font-extrabold text-slate-800">{item.student_name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{item.student_email}</p>
                          </div>
                        </td>
                        <td className="p-4 font-extrabold text-slate-800">{item.test_title}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase ${
                            item.course_type === 'JEE' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                          }`}>
                            {item.course_type}
                          </span>
                        </td>
                        <td className="p-4 text-center font-extrabold text-orange-600">{item.score} Marks</td>
                        <td className="p-4 text-center font-medium text-slate-500 flex items-center justify-center gap-1 mt-1">
                          <ClockIcon className="w-3.5 h-3.5" />
                          {formatTimeSpent(item.time_taken_seconds)}
                        </td>
                        <td className="p-4 text-slate-500 font-medium">{formatExamDate(item.submitted_at)}</td>
                      </tr>
                    ))}
                    {filteredAttempts.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center p-8 text-slate-400">
                          No test attempt records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Manage Exams list */}
        {activeTab === "exams" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {tests.map((test) => (
              <div key={test.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase ${
                        test.course_type === 'JEE' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {test.course_type}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-slate-100 text-slate-600 tracking-wider uppercase">
                        Class {test.target_class || 'All'}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      <ClockIcon className="w-3.5 h-3.5" />
                      {test.duration_minutes} Mins
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-base leading-tight mb-2">{test.title}</h3>
                  <p className="text-xs text-slate-500 font-medium line-clamp-3 mb-4">{test.description}</p>
                </div>
                <div className="border-t border-slate-50 pt-4 mt-4 flex justify-between items-center text-xs font-bold text-slate-600">
                  <span>Questions: {test.question_count}</span>
                  <span>Total Marks: {test.total_marks}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content 3: Question Bank & Add/Edit */}
        {activeTab === "questions" && (
          <div className="space-y-4">
            
            {/* Test Selector Dropdown */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm justify-between">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Select Mock Exam:</span>
                <select
                  value={selectedTestId}
                  onChange={(e) => setSelectedTestId(e.target.value)}
                  className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  {tests.map((test) => (
                    <option key={test.id} value={test.id}>{test.title} ({test.course_type})</option>
                  ))}
                </select>
              </div>

              {selectedTestId && (
                <button
                  onClick={startAddQuestion}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Question
                </button>
              )}
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={q.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-extrabold text-slate-400">Question {idx + 1}</span>
                    <button
                      onClick={() => startEditQuestion(q)}
                      className="flex items-center gap-1 text-[10px] font-extrabold text-orange-600 hover:text-orange-800 transition uppercase tracking-wider"
                    >
                      <PencilIcon className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  </div>

                  <p className="font-bold text-slate-800 text-sm leading-relaxed">{q.question_text}</p>
                  
                  {q.image_url && (
                    <div className="max-w-xs bg-slate-50 p-2 border border-slate-100 rounded-lg">
                      <img src={q.image_url} alt="Question diagram" className="w-full h-auto object-contain max-h-40" />
                    </div>
                  )}

                  {/* Options */}
                  <div className="grid gap-2 sm:grid-cols-2">
                    {q.options.map((opt, oIdx) => {
                      const oNum = oIdx + 1;
                      const isCorrect = q.correct_option === oNum;
                      return (
                        <div key={oIdx} className={`px-4 py-2 rounded-xl border text-xs flex items-center gap-3 ${
                          isCorrect ? "border-green-300 bg-green-50/50 text-green-800 font-semibold" : "border-slate-100 text-slate-600"
                        }`}>
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold border ${
                            isCorrect ? "bg-green-600 border-green-600 text-white" : "bg-white border-slate-300 text-slate-400"
                          }`}>
                            {oNum}
                          </span>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-600">
                      <span className="font-extrabold text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Explanation:</span>
                      <p className="font-semibold">{q.explanation}</p>
                    </div>
                  )}
                </div>
              ))}

              {questions.length === 0 && selectedTestId && (
                <div className="text-center py-10 bg-white border border-slate-100 rounded-2xl text-slate-400 text-xs font-semibold">
                  No questions exist inside this mock test yet. Click "Add Question" above to start populating it!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal 1: Add Mock Test */}
        {isTestModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-lg border border-slate-100 shadow-2xl relative animate-scale-in">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
                Add New Mock Test
              </h3>
              
              <form onSubmit={handleCreateTestSubmit} className="space-y-4 text-xs font-bold text-slate-600">
                <div className="space-y-1">
                  <label className="uppercase tracking-wider">Exam Title</label>
                  <input
                    type="text"
                    required
                    value={newTest.title}
                    onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                    placeholder="e.g. JEE Main Physics Test 2"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="uppercase tracking-wider">Description</label>
                  <textarea
                    rows="3"
                    value={newTest.description}
                    onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                    placeholder="Description of mock test syllabus..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                  ></textarea>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="uppercase tracking-wider">Course Type</label>
                    <select
                      value={newTest.course_type}
                      onChange={(e) => setNewTest({ ...newTest, course_type: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                    >
                      <option value="JEE">JEE</option>
                      <option value="NEET">NEET</option>
                      <option value="WBJEE">WBJEE</option>
                      <option value="Foundation">Foundation</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="uppercase tracking-wider">Target Class</label>
                    <select
                      value={newTest.target_class}
                      onChange={(e) => setNewTest({ ...newTest, target_class: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                    >
                      <option value="All">All Classes</option>
                      <option value="11">Class 11 (XI)</option>
                      <option value="12">Class 12 (XII)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="uppercase tracking-wider">Duration (Mins)</label>
                    <input
                      type="number"
                      required
                      value={newTest.duration_minutes}
                      onChange={(e) => setNewTest({ ...newTest, duration_minutes: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsTestModalOpen(false)}
                    className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 uppercase tracking-wider text-[10px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl uppercase tracking-wider text-[10px]"
                  >
                    Create Test
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Add/Edit Question */}
        {isQuestionFormOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-2xl border border-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-scale-in">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
                {editingQuestion ? "Edit Question" : "Add New Question"}
              </h3>
              
              <form onSubmit={handleQuestionSubmit} className="space-y-4 text-xs font-bold text-slate-600">
                <div className="space-y-1">
                  <label className="uppercase tracking-wider">Question Text</label>
                  <textarea
                    rows="3"
                    required
                    value={questionForm.question_text}
                    onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                    placeholder="Enter the complete question text..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                  ></textarea>
                </div>

                <div className="space-y-1">
                  <label className="uppercase tracking-wider">Question Diagram Image URL (Optional)</label>
                  <input
                    type="text"
                    value={questionForm.image_url}
                    onChange={(e) => setQuestionForm({ ...questionForm, image_url: e.target.value })}
                    placeholder="e.g. https://R2-bucket-url.com/diagram.png"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="uppercase tracking-wider block mb-1">Answer Options</label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[0, 1, 2, 3].map((optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-extrabold flex-shrink-0">
                          {optIdx + 1}
                        </span>
                        <input
                          type="text"
                          required
                          value={questionForm.options[optIdx] || ""}
                          onChange={(e) => {
                            const newOptions = [...questionForm.options];
                            newOptions[optIdx] = e.target.value;
                            setQuestionForm({ ...questionForm, options: newOptions });
                          }}
                          placeholder={`Option ${optIdx + 1}`}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="uppercase tracking-wider">Correct Option</label>
                    <select
                      value={questionForm.correct_option}
                      onChange={(e) => setQuestionForm({ ...questionForm, correct_option: parseInt(e.target.value) })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                    >
                      <option value="1">Option 1</option>
                      <option value="2">Option 2</option>
                      <option value="3">Option 3</option>
                      <option value="4">Option 4</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="uppercase tracking-wider">Solution / Explanation</label>
                  <textarea
                    rows="2"
                    value={questionForm.explanation}
                    onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                    placeholder="Enter details explaining the correct solution..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsQuestionFormOpen(false)}
                    className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 uppercase tracking-wider text-[10px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl uppercase tracking-wider text-[10px]"
                  >
                    Save Question
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MockTestsManagement;
