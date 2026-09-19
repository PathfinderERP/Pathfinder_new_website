import React from "react";
import StudentSidebar from "../../components/DigitalPart/StudentSidebar";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

const Chats = () => {
    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row p-4 lg:p-6 gap-6 font-sans text-slate-900 pt-28 md:pt-32 pb-16 max-w-7xl mx-auto">
            <StudentSidebar />
            <main className="flex-1 flex flex-col gap-6 max-w-full overflow-hidden">
                <header className="mb-4">
                    <h1 className="text-3xl font-bold text-slate-900">Student Chats</h1>
                    <p className="text-slate-500">Connect with your peers and instructors</p>
                </header>

                <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[400px] text-center">
                    <div className="bg-orange-50 p-6 rounded-full mb-6">
                        <ChatBubbleLeftRightIcon className="h-16 w-16 text-orange-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">No Active Conversations</h2>
                    <p className="text-slate-500 max-w-md">
                        Your chat rooms will appear here once the academic session begins.
                        Get ready to collaborate with your classmates!
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Chats;
