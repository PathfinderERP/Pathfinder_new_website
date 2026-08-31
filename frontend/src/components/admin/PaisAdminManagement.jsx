import React, { useState, useEffect } from "react";
import {
  UserGroupIcon,
  BuildingOffice2Icon,
  ComputerDesktopIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  PencilSquareIcon,
  EyeIcon,
  CalendarIcon,
  FunnelIcon,
  ChevronDownIcon,
  AcademicCapIcon,
  DocumentCheckIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { paisAPI } from "../../services/api";

const PRESET_CENTRES = [
  "Hazra (Head Office)",
  "Salt Lake (BF-142)",
  "Garia Centre",
  "Tamluk Centre",
  "Siliguri Centre",
  "Durgapur Centre",
  "Asansol Centre",
  "Malda Centre",
  "Kharagpur Centre",
  "Berhampore Centre",
  "Burdwan Centre",
  "Midnapore Centre",
  "Online Exam (From Home)",
];

const PRESET_DATES = [
  "All Dates",
  "11/10/2026",
  "25/10/2026",
  "01/11/2026",
  "27 Oct – 01 Nov 2026",
];

const PRESET_TIME_SLOTS = [
  "Morning 10:30 AM to 11:30 AM",
  "Evening 04:00 PM to 05:00 PM",
  "Slot: 10:00 AM – 10:00 PM",
];

const PRESET_CLASSES = [
  "All Classes",
  "Class V",
  "Class VI",
  "Class VII",
  "Class VIII",
  "Class IX",
  "Class X",
  "Class XI",
  "Class XII",
  "Class XII Pass",
];

const PRESET_SUBJECTS = ["All Subjects", "Physics", "Chemistry", "Mathematics", "Mental Ability"];

export const PaisAdminManagement = () => {
  const [activeTab, setActiveTab] = useState("offline"); // 'offline' | 'online' | 'students' | 'sample_questions' | 'pais_questions'
  const [students, setStudents] = useState([]);
  const [capacities, setCapacities] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("All Dates");
  const [selectedCenter, setSelectedCenter] = useState("All Centers");
  const [selectedClass, setSelectedClass] = useState("All Classes");

  // Question Filters
  const [selectedQuestionSubject, setSelectedQuestionSubject] = useState("All Subjects");
  const [selectedExamDate, setSelectedExamDate] = useState("11/10/2026");
  const [selectedExamSlot, setSelectedExamSlot] = useState("Morning 10:30 AM to 11:30 AM");

  // Center detail modal
  const [selectedCenterModal, setSelectedCenterModal] = useState(null);
  const [centerSearchQuery, setCenterSearchQuery] = useState("");
  const [centerDateFilter, setCenterDateFilter] = useState("All Dates");

  // Capacity edit state
  const [editingCapId, setEditingCapId] = useState(null);
  const [newCapVal, setNewCapVal] = useState("");

  // Add Center Slot Modal state
  const [showAddCenterModal, setShowAddCenterModal] = useState(false);
  const [newCenterForm, setNewCenterForm] = useState({
    centre_name: "Hazra (Head Office)",
    exam_date: "11/10/2026",
    time_slot: "Morning 10:30 AM to 11:30 AM",
    exam_mode: "Offline Exam (At Centre)",
    max_capacity: 100,
  });
  const [creatingSlot, setCreatingSlot] = useState(false);

  // Add Question Modal state
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [isSampleQuestionAdd, setIsSampleQuestionAdd] = useState(true);
  const [newQuestionForm, setNewQuestionForm] = useState({
    subject: "Physics",
    class_level: "Class X",
    question_text: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correct_option: 0, // 0: A, 1: B, 2: C, 3: D
    marks: 2,
    exam_date: "11/10/2026",
    time_slot: "Morning 10:30 AM to 11:30 AM",
  });
  const [creatingQuestion, setCreatingQuestion] = useState(false);

  // Edit Student Modal state
  const [editingStudent, setEditingStudent] = useState(null);
  const [editStudentForm, setEditStudentForm] = useState({
    name: "",
    centre: "",
    exam_mode: "Offline Exam (At Centre)",
    exam_date: "11/10/2026",
    exam_time: "Morning 10:30 AM to 11:30 AM",
    student_class: "Class X",
    admission_status: "Ticket Issued",
  });
  const [savingStudent, setSavingStudent] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [stuRes, capRes, qRes] = await Promise.all([
        paisAPI.adminGetStudents().catch(() => ({ data: { students: [] } })),
        paisAPI.adminGetCapacities().catch(() => ({ data: { capacities: [] } })),
        paisAPI.adminGetQuestions().catch(() => ({ data: { questions: [] } })),
      ]);

      if (stuRes.data && stuRes.data.students) setStudents(stuRes.data.students);
      if (capRes.data && capRes.data.capacities) setCapacities(capRes.data.capacities);
      if (qRes.data && qRes.data.questions) setQuestions(qRes.data.questions);
    } catch (err) {
      console.error("Error loading admin PAIS data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCenterSlot = async (e) => {
    e.preventDefault();
    setCreatingSlot(true);
    try {
      await paisAPI.adminCreateCapacity(newCenterForm);
      setShowAddCenterModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      setCapacities((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          ...newCenterForm,
          current_bookings: 0,
          is_active: true,
          fill_percentage: 0,
        },
      ]);
      setShowAddCenterModal(false);
    } finally {
      setCreatingSlot(false);
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    setCreatingQuestion(true);
    try {
      const payload = {
        subject: newQuestionForm.subject,
        class_level: newQuestionForm.class_level,
        question_text: newQuestionForm.question_text,
        options: [
          newQuestionForm.optionA,
          newQuestionForm.optionB,
          newQuestionForm.optionC,
          newQuestionForm.optionD,
        ],
        correct_option: parseInt(newQuestionForm.correct_option, 10),
        marks: parseInt(newQuestionForm.marks, 10),
        is_sample_test: isSampleQuestionAdd,
        exam_date: newQuestionForm.exam_date,
        time_slot: newQuestionForm.time_slot,
      };

      await paisAPI.adminCreateQuestion(payload);
      setShowAddQuestionModal(false);
      loadData();
    } catch (err) {
      console.error("Error adding question:", err);
    } finally {
      setCreatingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await paisAPI.adminDeleteQuestion(qId);
      loadData();
    } catch (err) {
      console.error("Error deleting question:", err);
      setQuestions((prev) => prev.filter((q) => q.id !== qId));
    }
  };

  const handleUpdateCapacity = async (id, maxCap) => {
    try {
      await paisAPI.adminUpdateCapacity({ id, max_capacity: parseInt(maxCap, 10) });
      setEditingCapId(null);
      loadData();
    } catch (err) {
      console.error(err);
      setCapacities((prev) =>
        prev.map((c) => (c.id === id ? { ...c, max_capacity: parseInt(maxCap, 10) } : c))
      );
      setEditingCapId(null);
    }
  };

  const handleToggleSlotActive = async (id, currentActive) => {
    try {
      await paisAPI.adminUpdateCapacity({ id, is_active: !currentActive });
      loadData();
    } catch (err) {
      console.error(err);
      setCapacities((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: !currentActive } : c))
      );
    }
  };

  const openStudentEditModal = (stu) => {
    setEditingStudent(stu);
    setEditStudentForm({
      name: stu.name,
      centre: stu.centre,
      exam_mode: stu.exam_mode || "Offline Exam (At Centre)",
      exam_date: stu.exam_date || "11/10/2026",
      exam_time: stu.exam_time || "Morning 10:30 AM to 11:30 AM",
      student_class: stu.student_class || "Class X",
      admission_status: stu.admission_status || "Ticket Issued",
    });
  };

  const handleSaveStudentEdit = async (e) => {
    e.preventDefault();
    setSavingStudent(true);
    try {
      if (editingStudent?.id) {
        await paisAPI.adminUpdateStudent(editingStudent.id, editStudentForm);
      }
      setEditingStudent(null);
      loadData();
    } catch (err) {
      console.error(err);
      setStudents((prev) =>
        prev.map((s) => (s.id === editingStudent.id ? { ...s, ...editStudentForm } : s))
      );
      setEditingStudent(null);
    } finally {
      setSavingStudent(false);
    }
  };

  const getAttendingStudents = (centreName, examDate = null) => {
    return students.filter((s) => {
      const matchCenter =
        s.centre?.toLowerCase() === centreName.toLowerCase() ||
        s.centre?.toLowerCase().includes(centreName.split(" ")[0].toLowerCase());
      const matchDate = !examDate || examDate === "All Dates" || s.exam_date === examDate;
      return matchCenter && matchDate;
    });
  };

  const openCenterStudentsModal = (cap) => {
    setSelectedCenterModal(cap);
    setCenterSearchQuery("");
    setCenterDateFilter(cap.exam_date || "All Dates");
  };

  const viewCenterInStudentTab = (centreName) => {
    setSelectedCenter(centreName);
    setActiveTab("students");
  };

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(q) ||
      s.phone.includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.centre.toLowerCase().includes(q);

    const matchesDate = selectedDate === "All Dates" || s.exam_date === selectedDate;
    const matchesCenter =
      selectedCenter === "All Centers" ||
      s.centre.toLowerCase().includes(selectedCenter.split(" ")[0].toLowerCase());
    const matchesClass = selectedClass === "All Classes" || s.student_class === selectedClass;

    return matchesSearch && matchesDate && matchesCenter && matchesClass;
  });

  const offlineCapacities = capacities.filter(
    (c) => !c.exam_mode?.includes("Online") && !c.centre_name?.includes("Online")
  );
  const onlineCapacities = capacities.filter(
    (c) => c.exam_mode?.includes("Online") || c.centre_name?.includes("Online")
  );

  const sampleQuestions = questions.filter(
    (q) =>
      q.is_sample_test &&
      (selectedQuestionSubject === "All Subjects" || q.subject === selectedQuestionSubject)
  );

  const paisQuestions = questions.filter(
    (q) =>
      !q.is_sample_test &&
      (selectedQuestionSubject === "All Subjects" || q.subject === selectedQuestionSubject) &&
      (selectedExamDate === "All Dates" || q.exam_date === selectedExamDate)
  );

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase text-[#66090D] bg-red-50 px-3 py-1 rounded-full border border-red-100">
            PAIS 2026 Admin Portal
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-2">Offline & Online Exam Center Management</h1>
          <p className="text-xs text-slate-500 font-semibold">
            Track exact registered student numbers per center, manage Question Sets for Sample & Official PAIS exams, and configure slots.
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowActionsDropdown(!showActionsDropdown)}
            className="px-5 py-3 bg-[#66090D] hover:bg-[#800b11] text-white font-black text-xs rounded-2xl uppercase flex items-center gap-2 shadow-lg transition"
          >
            <SparklesIcon className="w-4 h-4 text-amber-300" />
            Actions & Setup
            <ChevronDownIcon className="w-4 h-4 text-white ml-1" />
          </button>

          {showActionsDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 p-2 space-y-1 font-bold text-xs">
              <button
                onClick={() => {
                  setShowActionsDropdown(false);
                  setNewCenterForm({
                    centre_name: "Hazra (Head Office)",
                    exam_date: "11/10/2026",
                    time_slot: "Morning 10:30 AM to 11:30 AM",
                    exam_mode: "Offline Exam (At Centre)",
                    max_capacity: 100,
                  });
                  setShowAddCenterModal(true);
                }}
                className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-slate-50 text-slate-800 flex items-center gap-2"
              >
                <BuildingOffice2Icon className="w-4 h-4 text-[#66090D]" />
                Add New Offline Center
              </button>

              <button
                onClick={() => {
                  setShowActionsDropdown(false);
                  setNewCenterForm({
                    centre_name: "Online Exam (From Home)",
                    exam_date: "27 Oct – 01 Nov 2026",
                    time_slot: "Slot: 10:00 AM – 10:00 PM",
                    exam_mode: "Online Exam (From Home)",
                    max_capacity: 5000,
                  });
                  setShowAddCenterModal(true);
                }}
                className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-slate-50 text-slate-800 flex items-center gap-2"
              >
                <ComputerDesktopIcon className="w-4 h-4 text-sky-600" />
                Add New Online Exam Slot
              </button>

              <hr className="border-slate-100" />

              <button
                onClick={() => {
                  setShowActionsDropdown(false);
                  setActiveTab("sample_questions");
                }}
                className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-slate-50 text-slate-800 flex items-center gap-2"
              >
                <AcademicCapIcon className="w-4 h-4 text-emerald-600" />
                Sample Test Question Set Management
              </button>

              <button
                onClick={() => {
                  setShowActionsDropdown(false);
                  setActiveTab("pais_questions");
                }}
                className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-slate-50 text-slate-800 flex items-center gap-2"
              >
                <DocumentCheckIcon className="w-4 h-4 text-amber-600" />
                PAIS Official Exam Question Set
              </button>

              <hr className="border-slate-100" />

              <button
                onClick={() => {
                  setShowActionsDropdown(false);
                  loadData();
                }}
                className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-slate-50 text-slate-800 flex items-center gap-2"
              >
                <ArrowPathIcon className={`w-4 h-4 text-slate-600 ${loading ? "animate-spin" : ""}`} />
                Refresh Data
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex border-b border-slate-200 gap-2 font-bold text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab("offline")}
          className={`py-3 px-5 border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === "offline"
              ? "border-[#66090D] text-[#66090D] font-black"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <BuildingOffice2Icon className="w-4 h-4" />
          Offline Exam Centers ({offlineCapacities.length})
        </button>

        <button
          onClick={() => setActiveTab("online")}
          className={`py-3 px-5 border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === "online"
              ? "border-[#66090D] text-[#66090D] font-black"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <ComputerDesktopIcon className="w-4 h-4" />
          Online Exam Slots ({onlineCapacities.length})
        </button>

        <button
          onClick={() => setActiveTab("sample_questions")}
          className={`py-3 px-5 border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === "sample_questions"
              ? "border-[#66090D] text-[#66090D] font-black"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <AcademicCapIcon className="w-4 h-4" />
          Sample Test Questions ({sampleQuestions.length})
        </button>

        <button
          onClick={() => setActiveTab("pais_questions")}
          className={`py-3 px-5 border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === "pais_questions"
              ? "border-[#66090D] text-[#66090D] font-black"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <DocumentCheckIcon className="w-4 h-4" />
          PAIS Question Sets ({paisQuestions.length})
        </button>

        <button
          onClick={() => setActiveTab("students")}
          className={`py-3 px-5 border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === "students"
              ? "border-[#66090D] text-[#66090D] font-black"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <UserGroupIcon className="w-4 h-4" />
          Student Registrations ({students.length})
        </button>
      </div>

      {activeTab === "offline" && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 font-semibold flex items-center gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <strong className="block font-black uppercase text-[10px]">Offline Center Crowd Control & Real-Time Roster:</strong>
              Showing exact real student counts registered in the database for each offline exam center. Click <strong>'Show Attending Students'</strong> to inspect student names and details.
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {offlineCapacities.map((cap) => {
              const attending = getAttendingStudents(cap.centre_name, cap.exam_date);
              const exactRealCount = attending.length;
              const fillPct =
                cap.max_capacity > 0 ? Math.round((exactRealCount / cap.max_capacity) * 100) : 0;

              let statusBg = "bg-emerald-50 border-emerald-200 text-emerald-800";
              let barColor = "bg-emerald-500";
              if (fillPct >= 90) {
                statusBg = "bg-red-50 border-red-200 text-red-800";
                barColor = "bg-red-600";
              } else if (fillPct >= 70) {
                statusBg = "bg-amber-50 border-amber-200 text-amber-800";
                barColor = "bg-amber-500";
              }

              return (
                <div
                  key={cap.id}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-500 font-mono flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                        {cap.exam_date}
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${statusBg}`}>
                        {fillPct >= 90 ? "Crowd Full" : fillPct >= 70 ? "High Demand" : "Available"}
                      </span>
                    </div>

                    <h3 className="font-black text-slate-900 text-base">{cap.centre_name}</h3>
                    <p className="text-xs text-slate-500 font-semibold">{cap.time_slot}</p>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-500 uppercase text-[10px]">Exact Registered Seats</span>
                      <span className="font-mono font-black text-[#66090D] text-sm">
                        {exactRealCount} / {cap.max_capacity} ({fillPct}%)
                      </span>
                    </div>

                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(fillPct, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                    <button
                      onClick={() => openCenterStudentsModal(cap)}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl uppercase flex items-center justify-center gap-2 shadow-sm transition"
                    >
                      <EyeIcon className="w-4 h-4 text-amber-400" />
                      Show Attending Students ({exactRealCount})
                    </button>

                    <div className="flex items-center justify-between pt-1">
                      {editingCapId === cap.id ? (
                        <div className="flex items-center gap-2 w-full">
                          <input
                            type="number"
                            value={newCapVal}
                            onChange={(e) => setNewCapVal(e.target.value)}
                            className="w-24 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                          />
                          <button
                            onClick={() => handleUpdateCapacity(cap.id, newCapVal)}
                            className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-lg uppercase"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingCapId(cap.id);
                            setNewCapVal(cap.max_capacity);
                          }}
                          className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
                        >
                          <AdjustmentsHorizontalIcon className="w-4 h-4 text-sky-500" />
                          Edit Capacity
                        </button>
                      )}

                      <button
                        onClick={() => handleToggleSlotActive(cap.id, cap.is_active)}
                        className={`text-xs font-bold ${cap.is_active ? "text-emerald-600" : "text-slate-400"}`}
                      >
                        {cap.is_active ? "Active Slot" : "Disabled"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "online" && (
        <div className="space-y-6">
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-xs text-sky-900 font-semibold flex items-center gap-3">
            <ComputerDesktopIcon className="w-6 h-6 text-sky-600 shrink-0" />
            <div>
              <strong className="block font-black uppercase text-[10px]">Online Exam (From Home) Slot Management:</strong>
              Monitor online exam time slot bookings and manage capacity.
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {onlineCapacities.map((cap) => {
              const attending = students.filter(
                (s) => s.exam_mode?.includes("Online") || s.centre?.includes("Online")
              );
              const exactRealCount = attending.length;
              const fillPct =
                cap.max_capacity > 0 ? Math.round((exactRealCount / cap.max_capacity) * 100) : 0;

              return (
                <div
                  key={cap.id}
                  className="bg-white border border-slate-200 hover:border-sky-300 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200 font-mono">
                        {cap.exam_date}
                      </span>
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200">
                        Online Active
                      </span>
                    </div>

                    <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                      <ComputerDesktopIcon className="w-5 h-5 text-sky-600" />
                      {cap.centre_name}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold">{cap.time_slot}</p>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-500 uppercase text-[10px]">Exact Online Registered Seats</span>
                      <span className="font-mono font-black text-sky-700 text-sm">
                        {exactRealCount} / {cap.max_capacity} ({fillPct}%)
                      </span>
                    </div>

                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                      <div
                        className="h-full bg-sky-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(fillPct, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                    <button
                      onClick={() => openCenterStudentsModal(cap)}
                      className="w-full py-2 bg-sky-900 hover:bg-sky-800 text-white font-extrabold text-xs rounded-xl uppercase flex items-center justify-center gap-2 shadow-sm transition"
                    >
                      <EyeIcon className="w-4 h-4 text-sky-300" />
                      Show Online Candidates ({exactRealCount})
                    </button>
                    
                    <div className="flex items-center justify-between pt-1">
                      {editingCapId === cap.id ? (
                        <div className="flex items-center gap-2 w-full">
                          <input
                            type="number"
                            value={newCapVal}
                            onChange={(e) => setNewCapVal(e.target.value)}
                            className="w-24 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                          />
                          <button
                            onClick={() => handleUpdateCapacity(cap.id, newCapVal)}
                            className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-lg uppercase"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingCapId(cap.id);
                            setNewCapVal(cap.max_capacity);
                          }}
                          className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
                        >
                          <AdjustmentsHorizontalIcon className="w-4 h-4 text-sky-500" />
                          Edit Capacity
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "sample_questions" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Sample Practice Test
                </span>
                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                  sampleQuestions.length > 0
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-red-50 text-red-800 border-red-200"
                }`}>
                  {sampleQuestions.length > 0 ? "✓ Question Set Available" : "⚠ No Questions Available"}
                </span>
              </div>

              <h2 className="text-xl font-black text-slate-900 mt-2">Sample Test Question Set Management</h2>
              <p className="text-xs text-slate-500 font-semibold">
                Manage practice test questions with 4 MCQ options and assign correct answers.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedQuestionSubject}
                onChange={(e) => setSelectedQuestionSubject(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
              >
                {PRESET_SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    Subject: {s}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  setIsSampleQuestionAdd(true);
                  setShowAddQuestionModal(true);
                }}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl uppercase flex items-center gap-2 shadow"
              >
                <PlusIcon className="w-4 h-4" />
                Add New Question
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {sampleQuestions.map((q, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-slate-500">Q{q.id}</span>
                    <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {q.subject}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">[{q.class_level}]</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-700">{q.marks} Marks</span>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="font-extrabold text-slate-900 text-sm">{q.text}</p>

                <div className="grid sm:grid-cols-2 gap-2 pt-2">
                  {q.options?.map((opt, optIdx) => (
                    <div
                      key={optIdx}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between ${
                        q.correct_option === optIdx
                          ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <span>
                        <strong className="mr-2 font-mono">{String.fromCharCode(65 + optIdx)}.</strong>
                        {opt}
                      </span>
                      {q.correct_option === optIdx && (
                        <span className="text-[10px] font-black uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                          Correct Answer
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {sampleQuestions.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-400 font-semibold">
                No sample test questions available for the selected subject. Click <strong>'Add New Question'</strong> to create questions.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "pais_questions" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  PAIS 2026 Official Scholarship Exam
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-2">PAIS Official Exam Question Sets</h2>
                <p className="text-xs text-slate-500 font-semibold">
                  Configure question sets for specific official exam dates and time slots.
                </p>
              </div>

              <button
                onClick={() => {
                  setIsSampleQuestionAdd(false);
                  setNewQuestionForm((prev) => ({
                    ...prev,
                    exam_date: selectedExamDate,
                    time_slot: selectedExamSlot,
                  }));
                  setShowAddQuestionModal(true);
                }}
                className="px-4 py-2.5 bg-[#66090D] hover:bg-[#800b11] text-white font-black text-xs rounded-xl uppercase flex items-center gap-2 shadow"
              >
                <PlusIcon className="w-4 h-4" />
                Add Official Question
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-100 pt-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Target Exam Date</label>
                <select
                  value={selectedExamDate}
                  onChange={(e) => setSelectedExamDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                >
                  {PRESET_DATES.filter(d => d !== "All Dates").map((d) => (
                    <option key={d} value={d}>
                      Exam Date: {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Target Time Slot</label>
                <select
                  value={selectedExamSlot}
                  onChange={(e) => setSelectedExamSlot(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                >
                  {PRESET_TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>
                      Slot: {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Subject Filter</label>
                <select
                  value={selectedQuestionSubject}
                  onChange={(e) => setSelectedQuestionSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                >
                  {PRESET_SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      Subject: {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {paisQuestions.map((q, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-slate-500">Q{q.id}</span>
                    <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      {q.subject}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 font-mono">
                      {q.exam_date} • {q.time_slot}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-700">{q.marks} Marks</span>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="font-extrabold text-slate-900 text-sm">{q.text}</p>

                <div className="grid sm:grid-cols-2 gap-2 pt-2">
                  {q.options?.map((opt, optIdx) => (
                    <div
                      key={optIdx}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between ${
                        q.correct_option === optIdx
                          ? "bg-amber-50 border-amber-300 text-amber-950"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <span>
                        <strong className="mr-2 font-mono">{String.fromCharCode(65 + optIdx)}.</strong>
                        {opt}
                      </span>
                      {q.correct_option === optIdx && (
                        <span className="text-[10px] font-black uppercase bg-amber-600 text-white px-2 py-0.5 rounded-full">
                          Correct Option
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {paisQuestions.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-400 font-semibold">
                No official PAIS questions configured for {selectedExamDate}. Click <strong>'Add Official Question'</strong> to create question set for this slot.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "students" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-[#66090D]">
              <FunnelIcon className="w-4 h-4" />
              Filter & Search Student Records
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Name, Phone, ID..."
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="All Dates">Filter by Date: All Dates</option>
                  {PRESET_DATES.filter(d => d !== "All Dates").map((d) => (
                    <option key={d} value={d}>Date: {d}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedCenter}
                  onChange={(e) => setSelectedCenter(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="All Centers">Filter by Center: All Centers</option>
                  {PRESET_CENTRES.map((c) => (
                    <option key={c} value={c}>Center: {c}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="All Classes">Filter by Class: All Classes</option>
                  {PRESET_CLASSES.filter(c => c !== "All Classes").map((c) => (
                    <option key={c} value={c}>Class: {c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedCenterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] flex flex-col">
            <button
              onClick={() => setSelectedCenterModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase text-[#66090D] bg-red-50 px-3 py-1 rounded-full border border-red-100">
                Attendance Roster
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                Attending Candidates — {selectedCenterModal.centre_name}
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Date: <strong>{selectedCenterModal.exam_date}</strong> • Slot: <strong>{selectedCenterModal.time_slot}</strong>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={centerSearchQuery}
                  onChange={(e) => setCenterSearchQuery(e.target.value)}
                  placeholder="Search student name, phone or PAIS ID..."
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <select
                  value={centerDateFilter}
                  onChange={(e) => setCenterDateFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="All Dates">Filter Date: All Dates</option>
                  {PRESET_DATES.filter(d => d !== "All Dates").map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-y-auto border border-slate-200 rounded-2xl flex-1">
              <table className="w-full text-left text-xs font-medium text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] font-black text-slate-500 sticky top-0 bg-slate-50 z-10">
                  <tr>
                    <th className="p-3">PAIS ID</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {getAttendingStudents(selectedCenterModal.centre_name, centerDateFilter)
                    .filter((s) => {
                      const q = centerSearchQuery.toLowerCase();
                      return s.name.toLowerCase().includes(q) || s.phone.includes(q) || s.id.toLowerCase().includes(q);
                    })
                    .map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-mono font-black text-slate-900">{s.id}</td>
                        <td className="p-3 font-bold text-slate-900">{s.name}</td>
                        <td className="p-3 font-mono">{s.phone}</td>
                        <td className="p-3 font-bold text-[#66090D]">{s.student_class}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              setSelectedCenterModal(null);
                              openStudentEditModal(s);
                            }}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] rounded-lg uppercase"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setSelectedCenterModal(null);
                  viewCenterInStudentTab(selectedCenterModal.centre_name);
                }}
                className="text-xs font-bold text-[#66090D] hover:underline"
              >
                View Full Student Tab with Filters →
              </button>

              <button
                onClick={() => setSelectedCenterModal(null)}
                className="px-5 py-2 bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddCenterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4">
            <button
              onClick={() => setShowAddCenterModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase text-[#66090D] bg-red-50 px-3 py-1 rounded-full border border-red-100">
                Exam Center Setup
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                Add New {newCenterForm.exam_mode?.includes("Online") ? "Online Exam Slot" : "Offline Exam Center"}
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Configure slot timing, mode and max capacity limit.
              </p>
            </div>

            <form onSubmit={handleCreateCenterSlot} className="space-y-3 text-xs font-bold text-slate-700">
              <div className="space-y-1">
                <label className="uppercase">Center Name *</label>
                <input
                  type="text"
                  required
                  value={newCenterForm.centre_name}
                  onChange={(e) => setNewCenterForm({ ...newCenterForm, centre_name: e.target.value })}
                  placeholder="e.g. Hazra (Head Office) or Online Exam (From Home)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase">Exam Mode *</label>
                  <select
                    value={newCenterForm.exam_mode}
                    onChange={(e) => setNewCenterForm({ ...newCenterForm, exam_mode: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="Offline Exam (At Centre)">Offline Exam (At Centre)</option>
                    <option value="Online Exam (From Home)">Online Exam (From Home)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="uppercase">Max Capacity *</label>
                  <input
                    type="number"
                    required
                    value={newCenterForm.max_capacity}
                    onChange={(e) => setNewCenterForm({ ...newCenterForm, max_capacity: parseInt(e.target.value, 10) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCenterModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingSlot}
                  className="flex-1 py-3 bg-[#66090D] hover:bg-[#800b11] text-white font-black text-xs rounded-xl uppercase shadow"
                >
                  {creatingSlot ? "Saving..." : "Save Center Slot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddQuestionModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div>
              <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                isSampleQuestionAdd
                  ? "text-emerald-800 bg-emerald-50 border-emerald-200"
                  : "text-amber-800 bg-amber-50 border-amber-200"
              }`}>
                {isSampleQuestionAdd ? "Sample Test Question Set" : "PAIS Official Exam Question Set"}
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                Create New {isSampleQuestionAdd ? "Sample Practice" : "Official Exam"} Question
              </h3>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-3 text-xs font-bold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase">Subject *</label>
                  <select
                    value={newQuestionForm.subject}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, subject: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    {PRESET_SUBJECTS.filter(s => s !== "All Subjects").map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="uppercase">Marks *</label>
                  <input
                    type="number"
                    required
                    value={newQuestionForm.marks}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, marks: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-mono"
                  />
                </div>
              </div>

              {!isSampleQuestionAdd && (
                <div className="grid grid-cols-2 gap-3 bg-amber-50/50 p-3 rounded-2xl border border-amber-100">
                  <div className="space-y-1">
                    <label className="uppercase text-amber-900">Target Exam Date *</label>
                    <select
                      value={newQuestionForm.exam_date}
                      onChange={(e) => setNewQuestionForm({ ...newQuestionForm, exam_date: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl focus:outline-none"
                    >
                      {PRESET_DATES.filter((d) => d !== "All Dates").map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="uppercase text-amber-900">Target Time Slot *</label>
                    <select
                      value={newQuestionForm.time_slot}
                      onChange={(e) => setNewQuestionForm({ ...newQuestionForm, time_slot: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl focus:outline-none"
                    >
                      {PRESET_TIME_SLOTS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="uppercase">Question Text *</label>
                <textarea
                  required
                  rows="3"
                  value={newQuestionForm.question_text}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, question_text: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                ></textarea>
              </div>

              <div className="space-y-2 pt-1">
                <label className="uppercase text-slate-500 font-extrabold text-[10px]">MCQ Options (4 Required)</label>
                <div className="grid grid-cols-2 gap-2">
                  {['optionA', 'optionB', 'optionC', 'optionD'].map((opt, i) => (
                    <input key={opt} type="text" required placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      value={newQuestionForm[opt]}
                      onChange={(e) => setNewQuestionForm({...newQuestionForm, [opt]: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-1 bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                <label className="uppercase text-emerald-900 font-black text-[10px]">Select Correct Option *</label>
                <select
                  value={newQuestionForm.correct_option}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, correct_option: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-black text-emerald-900 focus:outline-none"
                >
                  <option value={0}>Option A is Correct</option>
                  <option value={1}>Option B is Correct</option>
                  <option value={2}>Option C is Correct</option>
                  <option value={3}>Option D is Correct</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAddQuestionModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl uppercase">Cancel</button>
                <button type="submit" disabled={creatingQuestion} className="flex-1 py-3 bg-[#66090D] hover:bg-[#800b11] text-white font-black text-xs rounded-xl uppercase shadow">{creatingQuestion ? "Saving..." : "Save Question"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4">
            <button
              onClick={() => setEditingStudent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase text-[#66090D] bg-red-50 px-3 py-1 rounded-full border border-red-100">
                Admin Student Edit ({editingStudent.id})
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">Change Student Details</h3>
            </div>

            <form onSubmit={handleSaveStudentEdit} className="space-y-3 text-xs font-bold text-slate-700">
              <div className="space-y-1">
                <label className="uppercase">Student Name *</label>
                <input
                  type="text"
                  required
                  value={editStudentForm.name}
                  onChange={(e) => setEditStudentForm({ ...editStudentForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="uppercase">Assigned Exam Center *</label>
                <input
                  type="text"
                  required
                  value={editStudentForm.centre}
                  onChange={(e) => setEditStudentForm({ ...editStudentForm, centre: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-semibold text-slate-900"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditingStudent(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl uppercase">Cancel</button>
                <button type="submit" disabled={savingStudent} className="flex-1 py-3 bg-[#66090D] hover:bg-[#800b11] text-white font-black text-xs rounded-xl uppercase shadow">{savingStudent ? "Saving..." : "Update Student"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
