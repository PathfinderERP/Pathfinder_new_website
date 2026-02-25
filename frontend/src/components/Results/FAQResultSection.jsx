import React, { useState } from 'react';

const faqData = {
    "All India": {
        title: "All India Entrance Programs",
        faqs: [
            {
                question: "When should I start preparing for JEE/NEET?",
                answer: "Ideally, students should start their JEE/NEET preparation from Class 11. However, students with strong foundation from Class 9-10 have a significant advantage. We offer comprehensive 2-year programs starting from Class 11 and intensive 1-year crash courses for Class 12 students."
            },
            {
                question: "What is the difference between JEE Main and JEE Advanced preparation?",
                answer: "JEE Main focuses on NCERT concepts with moderate difficulty, while JEE Advanced requires deeper understanding and problem-solving skills. Our program covers both, with specialized practice for JEE Advanced for students who qualify JEE Main."
            },
            {
                question: "Do you provide study material for NEET/JEE preparation?",
                answer: "Yes, we provide comprehensive study material including concept booklets, practice problems, previous year question papers, test series, and online resources. All materials are designed by our expert faculty aligned with the latest exam patterns."
            },
            {
                question: "How many mock tests are conducted?",
                answer: "We conduct regular weekly tests, monthly full-length mock tests, and grand mock tests before the actual exam. Students get access to 50+ full-length tests for JEE and 40+ for NEET throughout the program, with detailed performance analysis."
            }
        ]
    },
    "Boards": {
        title: "Board Exam Programs",
        faqs: [
            {
                question: "Which boards do you cover in your program?",
                answer: "We provide comprehensive preparation for CBSE, ICSE, and major State Boards including West Bengal Board, Maharashtra Board, and UP Board. Our curriculum is designed to cover all syllabus patterns while maintaining high standards."
            },
            {
                question: "How do you ensure 95%+ scores in board exams?",
                answer: "Our proven methodology includes in-depth concept clarity, rigorous practice, regular assessments, board-pattern question practice, answer writing techniques, and time management strategies. We also conduct board exam simulations to build confidence."
            },
            {
                question: "When should students join for Class 10/12 board preparation?",
                answer: "For Class 10 boards, joining at the start of Class 10 is ideal, though we accept students throughout the year with customized catch-up plans. For Class 12, we recommend starting from Class 11 itself for comprehensive preparation."
            },
            {
                question: "Do you provide previous year question papers and sample papers?",
                answer: "Yes, we provide an extensive collection of previous 10 years' board question papers, CBSE sample papers, marking schemes, and board-specific practice materials. Students also get access to our exclusive question bank with 1000+ board-pattern questions."
            }
        ]
    },
    "Foundation": {
        title: "the Foundation Program",
        faqs: [
            {
                question: "What is the ideal time to join the Foundation Program?",
                answer: "The ideal time is starting from Class 8. However, students can also join in Class 9 or 10. Starting early gives students more time to grasp fundamental concepts and develop a competitive mindset."
            },
            {
                question: "Will this program affect my school studies?",
                answer: "Not at all. Our program is designed to complement school studies. In fact, it helps students perform better in school exams as we cover the syllabus in greater depth and clarity."
            },
            {
                question: "Are there scholarship opportunities available?",
                answer: "Yes, we conduct a scholarship test (Pathfinder Talent Search Exam) annually. Meritorious students can avail up to 100% scholarship on tuition fees based on their performance."
            },
            {
                question: "What is the mode of classes?",
                answer: "We offer both Offline (Classroom) and Online (Live Interactive) modes. You can choose the mode that best suits your convenience. We also have hybrid options available at select centers."
            }
        ]
    }
};

export default function FAQResultSection({ category }) {
    const data = faqData[category] || faqData["All India"];
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <section className="py-20 bg-[#FFF5F5] relative transition-all duration-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-30">
                <div className="text-left mb-12 ml-4">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                        Frequently Asked <span className="text-[#FF8A50]">Questions</span>
                    </h2>
                </div>

                <div className="space-y-6">
                    {data.faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`bg-white rounded-[32px] transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-5px_rgba(0,0,0,0.08)] border-none overflow-hidden`}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                                className="w-full px-8 py-7 md:py-9 text-left flex justify-between items-center focus:outline-none group"
                            >
                                <span className={`font-medium text-lg md:text-xl text-slate-800 pr-8`}>
                                    {faq.question}
                                </span>
                                <span className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 bg-[#F8F0F0] text-slate-400 ${openIndex === index ? 'rotate-180 bg-orange-50 text-[#FF8A50]' : 'group-hover:bg-[#F0E8E8]'}`}>
                                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </button>
                            <div
                                className={`transition-all duration-500 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                <div className="px-8 pb-8">
                                    <p className="text-slate-600 leading-relaxed text-base md:text-lg pt-2 border-t border-slate-50 uppercase tracking-tight opacity-90">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
