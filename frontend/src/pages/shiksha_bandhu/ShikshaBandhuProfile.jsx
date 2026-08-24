import React from "react";
import { ShikshaBandhuLayout } from "./components/ShikshaBandhuLayout";

export const ShikshaBandhuProfile = () => {
  return (
    <ShikshaBandhuLayout>
      {(user) => {
        const rows = [
          { label: "Full Name", value: user.name },
          { label: "Shiksha Bandhu ID", value: user.id },
          { label: "Mobile Number", value: user.mobile },
          { label: "Email Address", value: user.email },
          { label: "Account Status", value: user.status ? "Active Partner" : "Inactive" },
          { label: "Joining Date", value: user.joinedOn },
        ];

        return (
          <div className="max-w-xl mx-auto space-y-6 pb-12">
            <div>
              <h1 className="text-2xl font-black text-[#66090D]">My Partner Profile</h1>
              <p className="mt-1 text-xs text-slate-500 font-semibold">
                Your registered Shiksha Bandhu account details and credentials.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                <div className="w-14 h-14 rounded-full bg-[#66090D] text-amber-300 font-black text-xl flex items-center justify-center border-2 border-amber-400 shadow">
                  {user.name ? user.name.charAt(0) : "S"}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{user.name}</h3>
                  <span className="text-xs font-mono font-black text-[#66090D] bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">
                    ID: {user.id}
                  </span>
                </div>
              </div>

              <dl className="divide-y divide-slate-100 text-xs font-semibold">
                {rows.map((row) => (
                  <div key={row.label} className="py-3 flex items-center justify-between gap-4">
                    <dt className="text-slate-500">{row.label}</dt>
                    <dd className="text-slate-900 font-bold text-right font-mono">{row.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => alert("Profile editing request sent to Pathfinder Admin.")}
                  className="py-3 bg-[#66090D] hover:bg-[#800b11] text-white font-extrabold text-xs rounded-xl uppercase tracking-wider transition shadow-sm"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => alert("Password reset link sent to your registered phone number.")}
                  className="py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-extrabold text-xs rounded-xl uppercase tracking-wider transition"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        );
      }}
    </ShikshaBandhuLayout>
  );
};
