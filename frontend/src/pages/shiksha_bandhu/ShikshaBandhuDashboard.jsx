import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CursorArrowRaysIcon,
  UserPlusIcon,
  CheckCircleIcon,
  BanknotesIcon,
  ShareIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  AcademicCapIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { ShikshaBandhuLayout } from "./components/ShikshaBandhuLayout";
import { StatCard } from "./components/StatCard";
import { ProgramCard } from "./components/ProgramCard";
import { ShareProgramDialog } from "./components/ShareProgramDialog";
import { PROGRAMS, formatINR, referralLink } from "./ShikshaBandhuData";
import { shikshaBandhuAPI } from "../../services/api";

export const ShikshaBandhuDashboard = () => {
  const [searchParams] = useSearchParams();
  const txnNo = searchParams.get("txnNo") || searchParams.get("merchantTxnNo") || searchParams.get("txnID");
  const statusParam = searchParams.get("status");

  const [activeShareProgram, setActiveShareProgram] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [liveStats, setLiveStats] = useState(null);

  const isSuccessPayment = statusParam === "0000" || statusParam === "SUCCESS" || statusParam === "0";

  const purchasedCourse = (() => {
    try {
      const saved = localStorage.getItem("shiksha_bandhu_purchased_course");
      if (saved) return JSON.parse(saved);
      const myCourses = localStorage.getItem("pathfinder_my_courses");
      if (myCourses) {
        const parsed = JSON.parse(myCourses);
        if (parsed && parsed.length > 0) return parsed[0];
      }
      if (txnNo && isSuccessPayment) {
        // Only show if explicitly saved as a Shiksha Bandhu referral course purchase
        return null;
      }
      return null;
    } catch {
      return null;
    }
  })();

  return (
    <ShikshaBandhuLayout>
      {(user) => {
        const link = referralLink(user.id);

        React.useEffect(() => {
          if (user?.id) {
            shikshaBandhuAPI.getStats(user.id).then((res) => {
              if (res.data && res.data.stats) {
                setLiveStats(res.data.stats);
              }
              if (res.data && res.data.partner) {
                const updatedUser = { ...user, ...res.data.partner };
                localStorage.setItem("shiksha_bandhu_user", JSON.stringify(updatedUser));
              }
            }).catch((err) => console.error(err));
          }
        }, [user?.id]);

        const stats = liveStats || user.stats || {
          clicks: 0,
          registrations: 0,
          successfulReferrals: 0,
          totalBonus: 0
        };

        const handleCopyId = () => {
          navigator.clipboard.writeText(user.id);
          setCopiedId(true);
          setTimeout(() => setCopiedId(false), 2000);
        };

        const handleCopyLink = () => {
          navigator.clipboard.writeText(link);
          setCopiedLink(true);
          setTimeout(() => setCopiedLink(false), 2000);
        };

        return (
          <div className="space-y-6 pb-12">
            {/* Payment Success Notice */}
            {txnNo && isSuccessPayment && (
              <section className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 p-5 text-white shadow-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg">
                    <CheckCircleIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                      <SparklesIcon className="w-3.5 h-3.5" />
                      <span>Payment Confirmed</span>
                    </div>
                    <h3 className="font-black text-base text-white">Payment Received & Course Enrolled! 🎉</h3>
                    <p className="text-xs text-slate-300 font-medium">
                      Txn Ref: <span className="font-mono font-bold text-emerald-300">{txnNo}</span> • Mock test access & referral portal privileges are active.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Purchased Course Banner */}
            {purchasedCourse && (
              <section className="rounded-3xl border-2 border-emerald-400/40 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                    <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Enrolled Course</span>
                  </div>
                  <h2 className="text-xl font-black text-white">{purchasedCourse.name}</h2>
                  <p className="text-xs text-slate-300 font-semibold">
                    Purchased Package • Mock test papers, answer script review & Key to Success booklet unlocked.
                  </p>
                </div>
                <Link
                  to="/shiksha-bandhu/mock-tests"
                  className="px-5 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs rounded-2xl uppercase tracking-wider shadow-lg transition shrink-0 flex items-center gap-2"
                >
                  <AcademicCapIcon className="w-4 h-4" />
                  <span>Access Your Course</span>
                </Link>
              </section>
            )}

            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#4a0609] via-[#66090D] to-[#8a0e14] p-6 sm:p-8 text-white shadow-xl">
              <div className="relative z-10 space-y-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                    Welcome back, Shiksha Bandhu 👋
                  </h1>
                  <p className="mt-1 text-sm text-red-100 font-semibold">{user.name}</p>
                </div>

                <div className="pt-2 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/15 p-4">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                      Your Unique Referral ID
                    </span>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <span className="font-mono text-2xl font-black">{user.id}</span>
                      <button
                        onClick={handleCopyId}
                        className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs rounded-xl flex items-center gap-1 transition"
                      >
                        {copiedId ? <CheckIcon className="w-4 h-4 text-emerald-800" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
                        <span>{copiedId ? "Copied!" : "Copy ID"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/15 p-4 flex flex-col justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                      Quick Share Link
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={link}
                        className="w-full bg-black/20 text-xs font-mono text-white px-3 py-1.5 rounded-xl border border-white/10 truncate focus:outline-none"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="px-3 py-1.5 bg-white text-[#66090D] hover:bg-red-50 font-extrabold text-xs rounded-xl flex items-center gap-1 shrink-0 transition"
                      >
                        {copiedLink ? "Copied!" : "Copy Link"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveShareProgram(PROGRAMS[0])}
                    className="w-full sm:w-auto px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition"
                  >
                    <ShareIcon className="w-4 h-4" />
                    Share & Earn Now
                  </button>
                </div>
              </div>
            </section>

            {/* Performance Summary Cards */}
            <section className="space-y-3">
              <h2 className="text-lg font-black text-slate-900">Your Performance</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                <StatCard label="Total Clicks" value={stats.clicks} icon={CursorArrowRaysIcon} />
                <StatCard label="Registrations" value={stats.registrations} icon={UserPlusIcon} accent="gold" />
                <StatCard label="Successful Referrals" value={stats.successfulReferrals} icon={CheckCircleIcon} accent="success" />
                <StatCard label="Total Bonus" value={formatINR(stats.totalBonus)} icon={BanknotesIcon} accent="maroon" />
              </div>
            </section>

            {/* Referral Link Box */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">Your Referral Link</h2>
                <p className="mt-1 text-xs text-slate-500 font-semibold">
                  Use your unique referral link whenever you promote Pathfinder Mock Tests. Your referrals will be automatically tracked.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Shiksha Bandhu ID
                  </span>
                  <p className="mt-1 font-mono text-2xl font-black text-[#66090D]">{user.id}</p>
                </div>

                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex flex-col justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Direct Referral Link
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={link}
                      className="w-full bg-white text-xs font-mono font-bold text-slate-700 px-3 py-2 rounded-xl border border-slate-200 truncate focus:outline-none"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-2 bg-[#66090D] text-white hover:bg-[#800b11] font-extrabold text-xs rounded-xl shrink-0 transition"
                    >
                      {copiedLink ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Promoted Programs */}
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Promote Pathfinder Mock Tests</h2>
                  <p className="text-xs text-slate-500 font-semibold">Select a program card below to share with your referral link.</p>
                </div>
                <Link
                  to="/shiksha-bandhu/mock-tests"
                  className="text-xs font-extrabold text-[#66090D] hover:underline shrink-0"
                >
                  View All Programs →
                </Link>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {PROGRAMS.slice(0, 3).map((program) => (
                  <ProgramCard
                    key={program.id}
                    program={program}
                    onShare={(p) => setActiveShareProgram(p)}
                  />
                ))}
              </div>
            </section>

            {/* Share Program Dialog */}
            {activeShareProgram && (
              <ShareProgramDialog
                program={activeShareProgram}
                referralId={user.id}
                onClose={() => setActiveShareProgram(null)}
              />
            )}
          </div>
        );
      }}
    </ShikshaBandhuLayout>
  );
};
