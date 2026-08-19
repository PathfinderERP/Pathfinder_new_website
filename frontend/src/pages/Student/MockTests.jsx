import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { mockTestsAPI } from "../../services/api";
import { ClockIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, AcademicCapIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

const MockTests = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // States
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Active Test State
  const [activeTest, setActiveTest] = useState(null);
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { question_id: option_index }
  const [markedForReview, setMarkedForReview] = useState({}); // { question_id: true }
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);
  
  // Results State
  const [results, setResults] = useState(null);

  // Preparation Illusion State
  const [isPreparing, setIsPreparing] = useState(false);
  const [preparingStatus, setPreparingStatus] = useState("");

  // Fetch all available mock tests
  useEffect(() => {
    fetchMockTests();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const fetchMockTests = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await mockTestsAPI.getAll();
      setTests(res.data || []);
    } catch (err) {
      console.error("Failed to load mock tests:", err);
      setError("Could not load mock tests. Please check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Start Exam
  const handleStartTest = async (testId) => {
    try {
      setLoading(true);
      setError(null);
      const res = await mockTestsAPI.getQuestions(testId);
      const testData = res.data;
      setLoading(false);
      
      // Start serious test console initialization sequence
      setIsPreparing(true);
      setPreparingStatus("Locking test console environment...");
      
      setTimeout(() => {
        setPreparingStatus("Downloading official questions set...");
      }, 1000);
      
      setTimeout(() => {
        setPreparingStatus("Synchronizing exam countdown timer...");
      }, 2000);
      
      setTimeout(() => {
        setIsPreparing(false);
        setActiveTest(testData);
        setActiveQuestions(testData.questions || []);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setMarkedForReview({});
        setResults(null);
        
        // Initialize Timer
        const totalSeconds = testData.duration_minutes * 60;
        setTimeLeft(totalSeconds);
        startTimeRef.current = totalSeconds;
        
        // Start Countdown Interval
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              handleAutoSubmit(testData.id);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, 3000);
      
    } catch (err) {
      console.error("Failed to start mock test:", err);
      setError("Failed to initialize the test session. Please try again.");
      setLoading(false);
    }
  };

  // Handle auto-submit on timer end
  const handleAutoSubmit = async (testId) => {
    alert("Time is up! Your mock test is being submitted automatically.");
    submitTestAnswers(testId, selectedAnswers);
  };

  // Submit test manual
  const handleSubmitTest = async () => {
    if (window.confirm("Are you sure you want to submit your mock test?")) {
      if (timerRef.current) clearInterval(timerRef.current);
      submitTestAnswers(activeTest.id, selectedAnswers);
    }
  };

  const submitTestAnswers = async (testId, answers) => {
    try {
      setLoading(true);
      setError(null);
      const timeTaken = startTimeRef.current - timeLeft;
      
      const payload = {
        answers: answers,
        time_taken_seconds: timeTaken
      };
      
      const res = await mockTestsAPI.submit(testId, payload);
      setResults(res.data);
      setActiveTest(null);
    } catch (err) {
      console.error("Failed to submit test:", err);
      setError("An error occurred while submitting your test. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper formatting for timer
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Set option selected
  const handleSelectOption = (questionId, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  // Mark for review toggle
  const toggleMarkForReview = (questionId) => {
    setMarkedForReview((prev) => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Reset exam
  const handleResetExamState = () => {
    setActiveTest(null);
    setResults(null);
    fetchMockTests();
  };

  // Render 0: Test Preparation Console loading illusion
  if (isPreparing) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#0d0f14] flex flex-col items-center justify-center text-white px-4">
        {/* Glow effect */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#66090D] opacity-10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-900 opacity-10 rounded-full blur-[100px]"></div>
        
        <div className="max-w-md w-full text-center space-y-8 z-10">
          {/* Pulsating Shield / Icon */}
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full border border-red-500/30 animate-ping"></div>
            <div className="absolute inset-2 rounded-full border border-blue-500/20 animate-pulse"></div>
            <div className="absolute inset-4 bg-slate-900 border border-slate-700/50 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-[#66090D] tracking-wider animate-pulse">AITS</span>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-extrabold tracking-tight uppercase">Entering Secure Console</h2>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">DO NOT REFRESH OR CLOSE WINDOW</p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800/50 rounded-full h-1.5 overflow-hidden border border-slate-700/30">
            <div 
              className="bg-[#66090D] h-full rounded-full transition-all duration-1000 ease-out" 
              style={{
                width: preparingStatus.includes("Locking") ? "33%" : 
                       preparingStatus.includes("Downloading") ? "66%" : "100%"
              }}
            ></div>
          </div>

          {/* Status logs */}
          <div className="bg-[#141822]/85 backdrop-blur border border-slate-800/80 rounded-2xl p-4 font-mono text-left text-xs space-y-2 text-slate-400 max-h-40 overflow-hidden shadow-inner">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Secure socket initialized...</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={preparingStatus.includes("Locking") ? "text-yellow-500 animate-pulse" : "text-green-500"}>
                {preparingStatus.includes("Locking") ? "●" : "✓"}
              </span>
              <span className={preparingStatus.includes("Locking") ? "text-white" : ""}>Locking test environment...</span>
            </div>
            {!preparingStatus.includes("Locking") && (
              <div className="flex items-center gap-2">
                <span className={preparingStatus.includes("Downloading") ? "text-yellow-500 animate-pulse" : "text-green-500"}>
                  {preparingStatus.includes("Downloading") ? "●" : "✓"}
                </span>
                <span className={preparingStatus.includes("Downloading") ? "text-white" : ""}>Downloading official questions set...</span>
              </div>
            )}
            {preparingStatus.includes("Synchronizing") && (
              <div className="flex items-center gap-2">
                <span className="text-yellow-500 animate-pulse">●</span>
                <span className="text-white">Synchronizing exam countdown timer...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render 1: Dashboard Mock Test list
  if (!activeTest && !results) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[#66090D] text-xs font-extrabold tracking-widest uppercase bg-red-50 px-4 py-1.5 rounded-full border border-red-100/50 shadow-sm">
              Assessments
            </span>
            <h1 className="text-4xl font-extrabold text-slate-900 mt-4">
              Pathfinder <span className="text-[#66090D]">Mock Tests</span>
            </h1>
            <p className="text-slate-600 mt-2 max-w-xl mx-auto text-sm font-medium">
              Challenge yourself with our curated Chapter Tests & Mock Assessments. Practice with real exam timers and get detailed explanations instantly.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-semibold flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#66090D]"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tests.map((test) => (
                <div key={test.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase ${
                        test.course_type === 'JEE' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {test.course_type}
                      </span>
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <ClockIcon className="w-3.5 h-3.5" />
                        {test.duration_minutes} Mins
                      </span>
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-lg leading-tight mb-2">{test.title}</h3>
                    <p className="text-xs text-slate-500 font-medium line-clamp-3 mb-4">{test.description}</p>
                  </div>

                  <div className="border-t border-slate-50 pt-4 mt-4">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-4">
                      <span>Questions: {test.question_count}</span>
                      <span>Total Marks: {test.total_marks}</span>
                    </div>
                    <button
                      onClick={() => handleStartTest(test.id)}
                      className="w-full bg-[#66090D] hover:bg-[#55080b] text-white font-extrabold py-3 rounded-xl transition-all shadow-md hover:shadow-lg uppercase tracking-wider text-xs active:scale-[0.99]"
                    >
                      Start Mock Test
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render 2: Active Test Screen
  if (activeTest) {
    const currentQuestion = activeQuestions[currentQuestionIndex];
    const isQuestionAnswered = selectedAnswers[currentQuestion.id] !== undefined;
    const isQuestionMarked = markedForReview[currentQuestion.id];

    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-6 mt-6">
          
          {/* Main Question Panel */}
          <div className="lg:col-span-3 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[60vh]">
            <div>
              {/* Header Bar */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h2 className="font-extrabold text-slate-800 text-lg">{activeTest.title}</h2>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Question {currentQuestionIndex + 1} of {activeQuestions.length}
                  </span>
                </div>
                
                {/* Live Timer block */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border font-mono text-lg font-bold ${
                  timeLeft < 60 ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-slate-50 text-slate-700 border-slate-100'
                }`}>
                  <ClockIcon className="w-5 h-5" />
                  <span>{formatTime(timeLeft)}</span>
                </div>
              </div>

              {/* Question Body */}
              <div className="space-y-6">
                <div className="text-slate-800 font-bold text-base leading-relaxed whitespace-pre-line">
                  {currentQuestionIndex + 1}. {currentQuestion.question_text}
                </div>

                {currentQuestion.image_url && (
                  <div className="max-w-md bg-slate-50 p-4 border border-slate-100 rounded-2xl mx-auto shadow-inner">
                    <img src={currentQuestion.image_url} alt="Question Diagram" className="w-full h-auto object-contain" />
                  </div>
                )}

                {/* Answer Options Radio Grid */}
                <div className="grid gap-3 pt-4">
                  {currentQuestion.options.map((option, idx) => {
                    const optionNumber = idx + 1;
                    const isSelected = selectedAnswers[currentQuestion.id] === optionNumber;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(currentQuestion.id, optionNumber)}
                        className={`w-full text-left px-5 py-4 rounded-2xl border-2 font-semibold text-sm transition-all duration-200 flex items-center gap-4 ${
                          isSelected
                            ? 'border-[#66090D] bg-red-50/10 text-slate-900 shadow-sm'
                            : 'border-slate-100 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold border transition-all ${
                          isSelected ? 'bg-[#66090D] border-[#66090D] text-white' : 'border-slate-300 bg-slate-50 text-slate-500'
                        }`}>
                          {optionNumber}
                        </span>
                        <span>{option}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Navigation Buttons Row */}
            <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-6 mt-10 gap-3">
              <div className="flex gap-2">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  className="px-5 py-3 border border-slate-200 hover:border-slate-400 rounded-xl text-xs font-extrabold text-slate-700 uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => toggleMarkForReview(currentQuestion.id)}
                  className={`px-5 py-3 border rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
                    isQuestionMarked
                      ? 'bg-yellow-500 border-yellow-500 text-white hover:bg-yellow-600'
                      : 'border-slate-200 hover:border-slate-400 text-slate-700'
                  }`}
                >
                  {isQuestionMarked ? 'Unmark Review' : 'Mark for Review'}
                </button>
              </div>

              <div className="flex gap-2">
                {selectedAnswers[currentQuestion.id] !== undefined && (
                  <button
                    onClick={() => {
                      const updated = { ...selectedAnswers };
                      delete updated[currentQuestion.id];
                      setSelectedAnswers(updated);
                    }}
                    className="px-4 py-3 text-xs font-extrabold text-red-600 hover:text-red-800 transition"
                  >
                    Clear Choice
                  </button>
                )}

                {currentQuestionIndex < activeQuestions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all active:scale-[0.99]"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitTest}
                    className="px-6 py-3 bg-[#66090D] hover:bg-[#55080b] text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all active:scale-[0.99] shadow-lg shadow-red-900/10"
                  >
                    Submit Test
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Side Navigation Grid Panel */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold text-slate-800 mb-4 border-b border-slate-50 pb-2 text-sm uppercase tracking-wider">
                Question Grid
              </h3>
              
              <div className="grid grid-cols-5 gap-2 max-h-[40vh] overflow-y-auto pr-1">
                {activeQuestions.map((q, idx) => {
                  const isSelected = selectedAnswers[q.id] !== undefined;
                  const isMarked = markedForReview[q.id];
                  const isCurrent = idx === currentQuestionIndex;

                  let btnClass = "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100";
                  if (isSelected && isMarked) {
                    btnClass = "bg-yellow-500 text-white border-yellow-600";
                  } else if (isSelected) {
                    btnClass = "bg-green-600 text-white border-green-700";
                  } else if (isMarked) {
                    btnClass = "bg-yellow-400 text-white border-yellow-500";
                  }

                  if (isCurrent) {
                    btnClass += " ring-2 ring-offset-2 ring-[#66090D]";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-10 rounded-lg border text-xs font-bold transition-all flex items-center justify-center ${btnClass}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Grid Legend Keys */}
              <div className="mt-8 space-y-3 pt-6 border-t border-slate-50">
                <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Legend</h4>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
                  <span className="w-3.5 h-3.5 bg-green-600 rounded"></span>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
                  <span className="w-3.5 h-3.5 bg-yellow-400 rounded"></span>
                  <span>Marked for Review</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
                  <span className="w-3.5 h-3.5 bg-slate-50 border border-slate-200 rounded"></span>
                  <span>Unvisited / Skipped</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50 mt-8">
              <button
                onClick={handleSubmitTest}
                className="w-full py-3 bg-[#66090D] hover:bg-[#55080b] text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all active:scale-[0.99] shadow-md hover:shadow-lg"
              >
                Submit Examination
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Render 3: Result Analysis Screen
  if (results) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Card 1: Score Banner */}
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-400 via-yellow-400 to-[#66090D]"></div>
            
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-extrabold text-slate-800">Mock Test Completed!</h2>
            <p className="text-slate-500 font-medium text-sm mt-1">Here is your instantaneous performance scorecard.</p>

            {/* Dynamic circular / block score layout */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-50">
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Score</span>
                <p className="text-2xl font-extrabold text-[#66090D] mt-1">{results.score} / {results.total_marks}</p>
              </div>
              <div className="bg-green-50/20 p-4 rounded-2xl border border-green-100/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-600">Correct Answers</span>
                <p className="text-2xl font-extrabold text-green-600 mt-1">{results.correct_count}</p>
              </div>
              <div className="bg-red-50/20 p-4 rounded-2xl border border-red-100/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">Incorrect Answers</span>
                <p className="text-2xl font-extrabold text-red-600 mt-1">{results.incorrect_count}</p>
              </div>
              <div className="bg-slate-100/50 p-4 rounded-2xl border border-slate-200/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Skipped/Left</span>
                <p className="text-2xl font-extrabold text-slate-600 mt-1">{results.skipped_count}</p>
              </div>
            </div>

            <button
              onClick={handleResetExamState}
              className="mt-8 px-6 py-3 border border-slate-200 hover:border-slate-400 text-slate-700 font-extrabold text-xs uppercase tracking-wider rounded-xl transition"
            >
              Back to Dashboard
            </button>
          </div>

          {/* Card 2: Question Breakdown accordion list */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-800 text-lg border-b border-slate-200 pb-2 uppercase tracking-wider text-sm">
              Questions & Solutions Review
            </h3>

            {results.questions?.map((item, idx) => {
              let statusLabel = "";
              let cardBorder = "border-slate-100";
              let badgeBg = "";

              if (item.is_skipped) {
                statusLabel = "Skipped";
                cardBorder = "border-slate-200 bg-slate-50/30";
                badgeBg = "bg-slate-100 text-slate-600";
              } else if (item.is_correct) {
                statusLabel = "Correct";
                cardBorder = "border-green-200 bg-green-50/5";
                badgeBg = "bg-green-50 text-green-600";
              } else {
                statusLabel = "Incorrect";
                cardBorder = "border-red-200 bg-red-50/5";
                badgeBg = "bg-red-50 text-red-600";
              }

              return (
                <div key={item.id} className={`bg-white border rounded-3xl p-6 shadow-sm transition-all ${cardBorder}`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-slate-500">Question {idx + 1}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase ${badgeBg}`}>
                      {statusLabel}
                    </span>
                  </div>

                  <p className="font-bold text-slate-800 leading-relaxed mb-4">{item.question_text}</p>
                  
                  {item.image_url && (
                    <div className="max-w-xs bg-slate-50 p-2 border border-slate-100 rounded-xl mb-4">
                      <img src={item.image_url} alt="Question Diagram" className="w-full h-auto object-contain" />
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    {item.options.map((opt, oIdx) => {
                      const oNum = oIdx + 1;
                      const isSelected = item.selected_option === oNum;
                      const isCorrectOption = item.correct_option === oNum;

                      let optClass = "border-slate-100 bg-slate-50/30 text-slate-700";
                      if (isCorrectOption) {
                        optClass = "border-green-300 bg-green-50 text-green-800 font-semibold";
                      } else if (isSelected && !item.is_correct) {
                        optClass = "border-red-300 bg-red-50 text-red-800 font-semibold";
                      }

                      return (
                        <div key={oIdx} className={`px-4 py-2.5 rounded-xl border text-xs flex items-center gap-3 ${optClass}`}>
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                            isCorrectOption 
                              ? 'bg-green-600 border-green-600 text-white' 
                              : isSelected ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-slate-300 text-slate-500'
                          }`}>
                            {oNum}
                          </span>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  {item.explanation && (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mt-4">
                      <h4 className="text-xs font-extrabold text-slate-700 flex items-center gap-1 mb-1.5 uppercase tracking-wider">
                        <AcademicCapIcon className="w-4 h-4 text-slate-600" />
                        Explanation / Solution
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-semibold">{item.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center pt-4">
            <button
              onClick={handleResetExamState}
              className="px-8 py-3.5 bg-[#66090D] hover:bg-[#55080b] text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition shadow-md hover:shadow-lg"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MockTests;
