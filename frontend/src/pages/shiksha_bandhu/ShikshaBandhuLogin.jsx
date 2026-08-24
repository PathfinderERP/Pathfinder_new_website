import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DEMO_BANDHU } from "./ShikshaBandhuData";
import { shikshaBandhuAPI } from "../../services/api";

export const ShikshaBandhuLogin = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await shikshaBandhuAPI.login({ identifier, password });
      if (res.data && res.data.success) {
        localStorage.setItem("shiksha_bandhu_user", JSON.stringify(res.data.user));
        navigate("/shiksha-bandhu/dashboard");
      } else {
        setError("Invalid credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      // Fallback demo support for SB004 / demo123
      if ((identifier.trim().toUpperCase() === "SB004" || identifier.trim() === "9147178886") && password === "demo123") {
        localStorage.setItem("shiksha_bandhu_user", JSON.stringify(DEMO_BANDHU));
        navigate("/shiksha-bandhu/dashboard");
      } else {
        setError(err.response?.data?.error || "Invalid Shiksha Bandhu credentials. Try SB004 / demo123");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      {/* Header Banner */}
      <header className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <img
            src="/images/icon/logo-1.svg"
            alt="Pathfinder Logo"
            className="h-10 w-auto filter drop-shadow"
          />
          <span className="text-xs font-black uppercase tracking-wider text-[#66090D] bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
            Shiksha Bandhu Portal
          </span>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
            <div className="space-y-2">
              <span className="inline-block bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase">
                Shiksha Bandhu Program
              </span>
              <h1 className="text-2xl font-black text-[#66090D]">Welcome to Shiksha Bandhu</h1>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Share Pathfinder programs. Help students. Earn rewards.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3.5 rounded-2xl">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-700">
              <div className="space-y-1.5">
                <label htmlFor="identifier" className="uppercase tracking-wider">
                  Shiksha Bandhu ID / Mobile Number
                </label>
                <input
                  id="identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="SB004"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#66090D] text-slate-900 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="uppercase tracking-wider">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#66090D] text-slate-900 font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#66090D] hover:bg-[#800b11] text-white font-extrabold rounded-xl uppercase tracking-wider text-center transition shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login to Dashboard"}
              </button>

              <button
                type="button"
                onClick={() => alert("Password reset link will be sent to your registered mobile number by Pathfinder team.")}
                className="w-full text-center text-xs font-bold text-[#66090D] hover:underline pt-1"
              >
                Forgot Password?
              </button>
            </form>

            <div className="border-t border-slate-100 pt-5 text-center space-y-2">
              <p className="text-xs font-bold text-slate-700">Not a Shiksha Bandhu yet?</p>
              <p className="text-[11px] text-slate-500 font-semibold">
                Join the Shiksha Bandhu Partner Program
              </p>
              <button
                onClick={() => alert("Registration opens soon! Call 9147178886 to join.")}
                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-extrabold text-xs rounded-xl uppercase tracking-wider transition"
              >
                Register Now
              </button>
            </div>
          </div>

          <div className="bg-slate-100 border border-slate-200 rounded-2xl p-3 text-center text-xs text-slate-600 font-semibold">
            Demo login — ID: <strong className="font-mono text-slate-900">SB004</strong> · Password: <strong className="font-mono text-slate-900">demo123</strong>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-400 font-semibold border-t border-slate-200 bg-white">
        © {new Date().getFullYear()} Pathfinder Institute. All rights reserved.
      </footer>
    </div>
  );
};
