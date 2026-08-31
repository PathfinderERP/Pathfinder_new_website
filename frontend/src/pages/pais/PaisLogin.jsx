import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../add_landingpage/common/Header";
import Footer from "../../components/Footer";
import { paisAPI } from "../../services/api";

export const PaisLogin = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await paisAPI.login({ identifier, password });
      if (res.data && res.data.user) {
        localStorage.setItem("pais_student_user", JSON.stringify(res.data.user));
        navigate("/pais/dashboard");
      } else {
        setError("Invalid Mobile/ID or Password.");
      }
    } catch (err) {
      console.error("Login error:", err);
      if ((identifier === "PAIS20261001" || identifier === "9830012345") && password === "demo123") {
        const demoUser = {
          id: "PAIS20261001",
          name: "Soumojit Saha",
          phone: "9830012345",
          student_class: "Class X",
          exam_mode: "Offline Exam (At Centre)",
          centre: "Tamluk Centre - 3rd Floor, Town Enclave",
          course_type: "Engineering (JEE / WBJEE)",
          exam_date: "11/10/2026",
          exam_time: "Morning 10:30 AM to 11:30 AM",
        };
        localStorage.setItem("pais_student_user", JSON.stringify(demoUser));
        navigate("/pais/dashboard");
      } else {
        setError(err.response?.data?.error || "Invalid credentials. Use demo: 9830012345 / demo123");
      }
    } finally {
      setLoading(false);
    }
  };

  const useDemoCredentials = () => {
    setIdentifier("9830012345");
    setPassword("demo123");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans text-slate-800">
      <Header />

      <main className="py-16 px-4 sm:px-6 lg:px-8 max-w-md mx-auto w-full">
        <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-black uppercase text-[#66090D] bg-red-50 px-3 py-1 rounded-full border border-red-100">
              PAIS 2026 Student Portal
            </span>
            <h1 className="text-2xl font-black text-slate-900 uppercase">Student Login</h1>
            <p className="text-xs text-slate-500 font-semibold">
              Enter your registered mobile number / PAIS ID and password to access your admit card & test dashboard.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs font-bold text-slate-700">
            <div className="space-y-1">
              <label className="uppercase tracking-wider">Mobile Number / PAIS ID *</label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 9830012345 or PAIS20261001"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#66090D] text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="uppercase tracking-wider">Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#66090D] text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#66090D] hover:bg-[#800b11] text-white font-black rounded-xl text-xs uppercase tracking-wider transition shadow-md disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login to PAIS Dashboard"}
            </button>
          </form>

          <div className="border-t border-slate-100 pt-4 text-center space-y-3">
            <button
              type="button"
              onClick={useDemoCredentials}
              className="text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 transition"
            >
              Fill Demo Login (9830012345 / demo123)
            </button>

            <div className="text-xs text-slate-500 font-semibold">
              Don't have an account?{" "}
              <Link to="/apply_now/pais" className="text-[#66090D] font-extrabold hover:underline">
                Register Free for PAIS 2026
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
