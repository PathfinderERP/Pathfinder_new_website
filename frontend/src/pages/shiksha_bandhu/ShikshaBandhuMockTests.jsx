import React, { useState } from "react";
import { ShikshaBandhuLayout } from "./components/ShikshaBandhuLayout";
import { ProgramCard } from "./components/ProgramCard";
import { ShareProgramDialog } from "./components/ShareProgramDialog";
import { PROGRAMS } from "./ShikshaBandhuData";

export const ShikshaBandhuMockTests = () => {
  const [activeShareProgram, setActiveShareProgram] = useState(null);

  return (
    <ShikshaBandhuLayout>
      {(user) => (
        <div className="space-y-6 pb-12">
          <div>
            <h1 className="text-2xl font-black text-[#66090D]">Promote Pathfinder Mock Tests</h1>
            <p className="mt-1 text-xs text-slate-500 font-semibold">
              Pick a program and share it with your referral link. Every click & lead is automatically attributed to partner ID <strong className="font-mono text-slate-900">{user.id}</strong>.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PROGRAMS.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                onShare={(p) => setActiveShareProgram(p)}
              />
            ))}
          </div>

          {activeShareProgram && (
            <ShareProgramDialog
              program={activeShareProgram}
              referralId={user.id}
              onClose={() => setActiveShareProgram(null)}
            />
          )}
        </div>
      )}
    </ShikshaBandhuLayout>
  );
};
