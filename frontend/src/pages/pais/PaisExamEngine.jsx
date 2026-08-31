import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClockIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  TrophyIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { paisAPI } from "../../services/api";

const FALLBACK_QUESTIONS = [
  { id: 1, subject: "Physics", text: "A ray of light enters a glass slab of refractive index 1.5. If the velocity of light in vacuum is 3 × 10^8 m/s, what is its velocity in glass?", options: ["2.0 × 10^8 m/s", "1.5 × 10^8 m/s", "2.5 × 10^8 m/s", "3.0 × 10^8 m/s"], marks: 2 },
  { id: 2, subject: "Physics", text: "What is the SI unit of electrical resistance?", options: ["Volt", "Ampere", "Ohm", "Watt"], marks: 2 },
  { id: 3, subject: "Physics", text: "A car accelerates uniformly from rest to 72 km/h in 10 seconds. The distance covered by the car is:", options: ["100 m", "200 m", "360 m", "720 m"], marks: 2 },
  { id: 4, subject: "Physics", text: "Work done by a gravitational force on a body moving in a circular path is:", options: ["Maximum", "Zero", "Minimum", "Infinite"], marks: 2 },
  { id: 5, subject: "Physics", text: "The focal length of a concave mirror having radius of curvature 40 cm is:", options: ["40 cm", "20 cm", "80 cm", "10 cm"], marks: 2 },
  { id: 6, subject: "Chemistry", text: "Which gas is evolved when dilute hydrochloric acid reacts with zinc metal?", options: ["Oxygen", "Hydrogen", "Carbon Dioxide", "Chlorine"], marks: 2 },
  { id: 7, subject: "Chemistry", text: "What is the pH value of a neutral aqueous solution at 25°C?", options: ["0", "7", "14", "1"], marks: 2 },
  { id: 8, subject: "Chemistry", text: "The chemical formula of Plaster of Paris is:", options: ["CaSO4 · 2H2O", "CaSO4 · 1/2 H2O", "CuSO4 · 5H2O", "Na2CO3 · 10H2O"], marks: 2 },
  { id: 9, subject: "Chemistry", text: "Which oxide is amphoteric in nature?", options: ["Na2O", "K2O", "Al2O3", "MgO"], marks: 2 },
  { id: 10, subject: "Mathematics", text: "If the roots of quadratic equation ax^2 + bx + c = 0 are real and equal, then discriminant D is:", options: ["D > 0", "D = 0", "D < 0", "D >= 1"], marks: 2 },
  { id: 11, subject: "Mathematics", "text": "The 10th term of AP: 2, 7, 12, ... is:", options: ["47", "52", "42", "57"], marks: 2 },
  { id: 12, subject: "Mathematics", "text": "If sin A = 3/5, then value of cos A is:", options: ["4/5", "5/4", "3/4", "4/3"], marks: 2 },
  { id: 13, subject: "Mental Ability", "text": "Complete the series: 3, 7, 15, 31, 63, ?", options: ["95", "127", "111", "125"], marks: 3 },
  { id: 14, subject: "Mental Ability", "text": "If 'CAT' is coded as 3120, how will 'DOG' be coded?", options: ["4157", "4147", "41515", "4158"], marks: 3 },
  { id: 15, subject: "Mental Ability", "text": "Find the odd one out:", options: ["Mercury", "Venus", "Earth", "Moon"], marks: 3 },
];

export const PaisExamEngine = () => {
  const navigate = useNavigate();
  const [viewState, setViewState] = useState("instructions"); // 'instructions' | 'test' | 'result'
  const [questions, setQuestions] = useState(FALLBACK_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { 1: 0, 2: 2, ... }
  const [markedForReview, setMarkedForReview] = useState({}); // { 1: true }
  const [visited, setVisited] = useState({ 1: true });
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes = 3600s
  const [submitting, setSubmitting] = useState(false);
  const [examResult, setExamResult] = useState(null);

  useEffect(() => {
    paisAPI.getQuestions().then((res) => {
      if (res.data && res.data.questions && res.data.questions.length > 0) {
        setQuestions(res.data.questions);
      }
    }).catch((err) => console.error("Questions load error:", err));
  }, []);

  // Timer countdown when test is running
  useEffect(() => {
    if (viewState !== "test") return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [viewState]);

  const handleStartTest = () => {
    setViewState("test");
    setVisited((prev) => ({ ...prev, [questions[0]?.id || 1]: true }));
  };

  const handleSelectOption = (optIndex) => {
    const qId = questions[currentIndex].id;
    setUserAnswers((prev) => ({ ...prev, [qId]: optIndex }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setVisited((prev) => ({ ...prev, [questions[nextIdx].id]: true }));
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      setVisited((prev) => ({ ...prev, [questions[prevIdx].id]: true }));
    }
  };

  const handleToggleReview = () => {
    const qId = questions[currentIndex].id;
    setMarkedForReview((prev) => ({ ...prev, [qId]: !prev[qId] }));
    handleNext();
  };

  const handleClearResponse = () => {
    const qId = questions[currentIndex].id;
    setUserAnswers((prev) => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    const savedUser = localStorage.getItem("pais_student_user");
    let studentId = "PNTSE20261001";
    let studentName = "Soumojit Saha";
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        studentId = parsed.id || studentId;
        studentName = parsed.name || studentName;
      } catch (e) {}
    }

    // Accurate local calculation
    let score = 0;
    let totalMarks = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    questions.forEach((q) => {
      const qMarks = q.marks || 2;
      const correctIdx = q.correct_option !== undefined ? q.correct_option : q.correct;
      totalMarks += qMarks;

      const userAns = userAnswers[q.id];
      if (userAns !== undefined && userAns !== null) {
        if (Number(userAns) === Number(correctIdx)) {
          score += qMarks;
          correctCount++;
        } else {
          incorrectCount++;
        }
      } else {
        unansweredCount++;
      }
    });

    const pct = totalMarks > 0 ? Math.round((score / totalMarks) * 1000) / 10 : 0;

    try {
      const res = await paisAPI.submitExam({
        registration_id: studentId,
        student_name: studentName,
        exam_type: "Sample Test",
        answers: userAnswers,
      });

      if (res.data && res.data.result) {
        setExamResult(res.data.result);
      } else {
        setExamResult({
          score,
          total_marks: totalMarks,
          correct_count: correctCount,
          incorrect_count: incorrectCount,
          unanswered_count: unansweredCount,
          percentage: pct,
          scholarship_percentage: 0,
        });
      }
      setViewState("result");
    } catch (err) {
      console.error(err);
      setExamResult({
        score,
        total_marks: totalMarks,
        correct_count: correctCount,
        incorrect_count: incorrectCount,
        unanswered_count: unansweredCount,
        percentage: pct,
        scholarship_percentage: 0,
      });
      setViewState("result");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentQ = questions[currentIndex] || questions[0];

  const getPaletteBg = (qId) => {
    if (markedForReview[qId]) return "bg-purple-600 text-white font-bold";
    if (userAnswers[qId] !== undefined) return "bg-emerald-600 text-white font-bold";
    if (visited[qId]) return "bg-red-500 text-white font-bold";
    return "bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold";
  };

  // ==================== SCREEN 1: GENERAL INSTRUCTIONS (MATCHING SCREENSHOT 3) ====================
  if (viewState === "instructions") {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
        <header className="bg-sky-500 text-white px-6 py-3 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white text-[#66090D] flex items-center justify-center font-black text-lg border-2 border-amber-400">
              P
            </div>
            <div>
              <h1 className="font-black text-sm uppercase text-white">PATHFINDER ACADEMY</h1>
              <p className="text-[10px] text-sky-100 font-semibold">Sample Paper PNTSE 2026 Power Step Course for JEE / NEET</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-lg">English (En)</span>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">General Instructions:</h2>
                <p className="text-xs font-bold text-red-600 mt-1">Please read the instructions carefully</p>
              </div>

              <div className="flex items-center gap-6 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="text-center">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Duration</span>
                  <span className="text-lg font-black text-slate-900 font-mono">60 mins</span>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div className="text-center">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Questions</span>
                  <span className="text-lg font-black text-slate-900 font-mono">40</span>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div className="text-center">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Marks</span>
                  <span className="text-lg font-black text-[#66090D] font-mono">90</span>
                </div>
              </div>
            </div>

            <ol className="list-decimal list-inside space-y-4 text-xs font-medium text-slate-700 leading-relaxed">
              <li>Total duration of exam is <strong>60 min</strong>.</li>
              <li>The Test consists of <strong>40 questions</strong>. The maximum marks are <strong>90</strong>.</li>
              <li>The question paper consists of 4 parts (Physics, Chemistry, Mathematics/Biology, and Mental Ability).</li>
              <li>
                Pattern of the questions are as under:
                <ul className="list-disc list-inside ml-5 mt-2 space-y-1 text-slate-600">
                  <li><strong>Section-I (Physics, Chemistry, Math/Bio):</strong> Contains multiple choice questions carrying +2 marks each. There is NO negative marking for wrong answers.</li>
                  <li><strong>Section-II (Mental Ability):</strong> Contains reasoning questions carrying +3 marks each with NO negative marking.</li>
                </ul>
              </li>
              <li>The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination. When the timer reaches zero, the examination will end by itself.</li>
              <li>
                The Questions Palette displayed on the right side of screen will show the status of each question using one of the following:
                <div className="flex flex-wrap gap-4 mt-3 font-semibold text-[11px]">
                  <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-emerald-600 inline-block"></span> Answered</span>
                  <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-red-500 inline-block"></span> Not Answered</span>
                  <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-purple-600 inline-block"></span> Marked for Review</span>
                  <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-slate-200 inline-block"></span> Not Visited</span>
                </div>
              </li>
            </ol>

            <div className="pt-6 text-center">
              <button
                onClick={handleStartTest}
                className="w-full sm:w-80 py-4 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-2xl text-sm uppercase tracking-wider shadow-lg transition transform hover:scale-105"
              >
                Start Test
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ==================== SCREEN 3: DIAGNOSTIC RESULT SCREEN (SAMPLE TEST UI) ====================
  if (viewState === "result" && examResult) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-sky-100 text-sky-600 mx-auto flex items-center justify-center border-4 border-sky-300 shadow">
            <CheckCircleIcon className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-sky-800 bg-sky-100 px-3 py-1 rounded-full border border-sky-200">
              Sample Test Analysis Completed
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">{examResult.student_name}</h2>
            <p className="text-xs text-slate-500 font-semibold">Diagnostic Performance & Speed Analysis</p>
          </div>

          {/* Accurate Score Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-slate-500 uppercase">Your Total Score</span>
              <span className="font-mono font-black text-xl text-[#66090D]">{examResult.score} / {examResult.total_marks}</span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-slate-200 pt-2">
              <span className="font-extrabold text-slate-500 uppercase">Accuracy Score</span>
              <span className="font-mono font-black text-lg text-slate-900">{examResult.percentage}%</span>
            </div>
            <div className="grid grid-cols-3 gap-2 border-t border-slate-200 pt-3 text-[11px] font-bold">
              <div className="bg-emerald-50 text-emerald-700 p-2 rounded-xl border border-emerald-100">
                <span className="block font-black text-sm">{examResult.correct_count || 0}</span>
                <span className="text-[9px] uppercase">Correct</span>
              </div>
              <div className="bg-red-50 text-red-700 p-2 rounded-xl border border-red-100">
                <span className="block font-black text-sm">{examResult.incorrect_count || 0}</span>
                <span className="text-[9px] uppercase">Incorrect</span>
              </div>
              <div className="bg-slate-100 text-slate-700 p-2 rounded-xl border border-slate-200">
                <span className="block font-black text-sm">{examResult.unanswered_count || 0}</span>
                <span className="text-[9px] uppercase">Unanswered</span>
              </div>
            </div>
          </div>

          {/* Sample test note banner instead of Scholarship Awarded */}
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 text-xs font-semibold leading-relaxed text-left space-y-1">
            <span className="font-black text-amber-950 uppercase text-[10px] block tracking-wider">📌 Practice Test Note</span>
            <p>
              This is a sample diagnostic paper. Scholarship percentages are awarded exclusively during the official <strong>PAIS 2026 Exam</strong> on 11 Oct / 25 Oct 2026.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => navigate("/pais/dashboard")}
              className="py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl uppercase tracking-wider"
            >
              Return to Dashboard
            </button>
            <button
              onClick={() => {
                setViewState("instructions");
                setCurrentIndex(0);
                setUserAnswers({});
              }}
              className="py-3.5 bg-[#66090D] hover:bg-[#800b11] text-white font-black text-xs rounded-xl uppercase tracking-wider shadow"
            >
              Re-take Sample Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== SCREEN 2: INTERACTIVE TEST ENGINE ====================
  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#66090D] text-amber-300 font-black text-sm flex items-center justify-center border border-amber-400">
            P
          </div>
          <div>
            <h1 className="font-black text-xs uppercase text-white tracking-wider">PAIS 2026 Exam Engine</h1>
            <p className="text-[10px] text-slate-400 font-semibold">{currentQ.subject} Section</p>
          </div>
        </div>

        {/* Real Countdown Timer */}
        <div className="flex items-center gap-2 bg-amber-400/20 border border-amber-400/40 px-4 py-1.5 rounded-full text-amber-300 font-mono font-black text-sm shadow">
          <ClockIcon className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>{formatTimer(timeLeft)}</span>
        </div>
      </header>

      {/* Main Test Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Question Card & Controls */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 flex flex-col justify-between min-h-[500px]">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-xs font-black uppercase tracking-wider text-[#66090D] bg-red-50 px-3 py-1 rounded-full border border-red-100">
                Question {currentIndex + 1} of {questions.length} • {currentQ.subject}
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">+{currentQ.marks || 2} Marks</span>
            </div>

            <p className="text-base sm:text-lg font-extrabold text-slate-900 leading-relaxed">
              {currentQ.text}
            </p>

            {/* Option Choices */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt, idx) => {
                const isSelected = userAnswers[currentQ.id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-4 rounded-2xl border text-left font-bold text-xs transition flex items-center gap-3 ${
                      isSelected
                        ? "bg-sky-50 border-sky-500 text-sky-950 shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center font-mono text-xs ${
                      isSelected ? "bg-sky-500 text-white border-sky-500" : "bg-white text-slate-500 border-slate-300"
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-100">
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-extrabold text-xs rounded-xl uppercase disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={handleClearResponse}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-extrabold text-xs rounded-xl uppercase"
              >
                Clear
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleToggleReview}
                className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-extrabold text-xs rounded-xl uppercase"
              >
                {markedForReview[currentQ.id] ? "Unmark Review" : "Mark for Review & Next"}
              </button>

              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-[#66090D] hover:bg-[#800b11] text-white font-extrabold text-xs rounded-xl uppercase tracking-wider shadow"
              >
                Save & Next
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Question Palette */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-slate-900 uppercase">Question Palette</h3>
            <p className="text-[11px] text-slate-400 font-semibold">Click any number to jump to question</p>
          </div>

          {/* Question grid */}
          <div className="grid grid-cols-5 gap-2 font-mono text-xs max-h-64 overflow-y-auto p-1">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => {
                  setCurrentIndex(idx);
                  setVisited((prev) => ({ ...prev, [q.id]: true }));
                }}
                className={`h-10 rounded-xl flex items-center justify-center border transition ${getPaletteBg(q.id)} ${
                  currentIndex === idx ? "ring-2 ring-sky-500 scale-105" : ""
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-600 border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-600"></span> Answered ({Object.keys(userAnswers).length})
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-red-500"></span> Not Answered
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-purple-600"></span> Marked Review ({Object.keys(markedForReview).filter(k => markedForReview[k]).length})
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-slate-200"></span> Not Visited
            </div>
          </div>

          {/* Final Submit Button */}
          <button
            onClick={handleFinalSubmit}
            disabled={submitting}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl uppercase tracking-wider transition shadow-md disabled:opacity-50"
          >
            {submitting ? "Submitting Exam..." : "Submit Test Now"}
          </button>
        </div>

      </main>
    </div>
  );
};
