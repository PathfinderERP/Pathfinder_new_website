import React from "react";
import StudentSidebar from "../../components/DigitalPart/StudentSidebar";
import { IdentificationIcon } from "@heroicons/react/24/outline";

const PortalRegistration = () => {
    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row p-4 lg:p-6 gap-6 font-sans text-slate-900 pt-40 lg:pt-36 pb-12 sm:pb-16 2xl:max-w-7xl 2xl:mx-auto 2xl:shadow-2xl 2xl:rounded-[60px] 2xl:my-8 2xl:border 2xl:border-slate-100">
            <StudentSidebar />
            <main className="flex-1 flex flex-col gap-6 max-w-full overflow-hidden">
                <header className="mb-4">
                    <h1 className="text-3xl font-bold text-slate-900">Registration Details</h1>
                    <p className="text-slate-500">View your official enrollment information</p>
                </header>

                <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[400px] text-center">
                    <div className="bg-blue-50 p-6 rounded-full mb-6">
                        <IdentificationIcon className="h-16 w-16 text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Enrollment Verified</h2>
                    <p className="text-slate-500 max-w-md">
                        Your student registration is complete and verified.
                        You can download your digital ID card and enrollment certificate from here once the session starts.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default PortalRegistration;
