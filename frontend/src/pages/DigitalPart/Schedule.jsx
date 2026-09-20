import React from "react";
import StudentSidebar from "../../components/DigitalPart/StudentSidebar";
import { ClockIcon } from "@heroicons/react/24/outline";

const Schedule = () => {
    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row p-4 lg:p-6 gap-6 font-sans text-slate-900 pt-16 sm:pt-20 lg:pt-36 xl:pt-40 pb-16 max-w-7xl mx-auto">
            <StudentSidebar />
            <main className="flex-1 flex flex-col gap-6 max-w-full overflow-hidden">
                <header className="mb-4">
                    <h1 className="text-3xl font-bold text-slate-900">Class Schedule</h1>
                    <p className="text-slate-500">View your weekly timetable and batch timings</p>
                </header>

                <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[400px] text-center">
                    <div className="bg-slate-50 p-6 rounded-full mb-6">
                        <ClockIcon className="h-16 w-16 text-slate-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Schedule Not Released</h2>
                    <p className="text-slate-500 max-w-md">
                        The updated schedule for your assigned batch is not available yet.
                        Please contact your center for the preliminary timetable.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Schedule;
