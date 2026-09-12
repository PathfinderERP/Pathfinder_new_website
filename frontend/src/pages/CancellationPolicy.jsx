import React from "react";
import { motion } from "framer-motion";
import {
  FaTimesCircle,
  FaShieldAlt,
  FaExchangeAlt,
  FaEnvelope,
  FaFileAlt,
  FaExclamationCircle,
  FaInfoCircle,
  FaUserCheck,
} from "react-icons/fa";

const sections = [
  {
    id: "overview",
    title: "Overview & Effective Date",
    icon: FaInfoCircle,
    content: `This Cancellation Policy governs all course enrollments, program admissions, fee payments, and subscriptions made at Pathfinder Educational Institute ("Pathfinder", "We", "Us", or "Our") via our official website (https://pathfinder.edu.in/), offline centers, or authorized representatives.

• Effective Date: September 12, 2026
• Scope: Applies to all offline classroom courses, online digital programs, mock test series, and student registration fees.`,
  },
  {
    id: "cancellation-terms",
    title: "Cancellation Terms & Guidelines",
    icon: FaTimesCircle,
    content: `1. Request Submission
Students or parents wishing to cancel an enrollment must submit a formal written request via email to support@pathfinder.edu.in or submit an application at their respective Pathfinder center along with valid admission receipts and proof of identity.

2. No Automated / Direct Refunds Upon Cancellation
Please note that course cancellation does not automatically entitle the student to a monetary refund. All cancellations are evaluated strictly under our management review process.

3. Course Switch / Transfer Facility
In lieu of cancellation, students may request to transfer or switch their enrollment from one course or batch to another (e.g., from an offline classroom program to an online program, or to a different batch / center), subject to:
• Management Approval: Decisions are made on a case-by-case basis.
• Seat Availability: Subject to batch capacity at the target center or program.
• Fee Adjustment: Difference in course fees (if any) must be settled prior to transfer confirmation.

4. Registration & Admission Fees
Initial registration fees, processing charges, and study material kit costs are strictly non-refundable and non-cancellable once materials or digital portal access have been dispatched or granted.`,
  },
  {
    id: "management-discretion",
    title: "Management Discretion & Approval",
    icon: FaUserCheck,
    content: `All requests for course cancellation, batch transfer, or exceptional fee adjustments are subject to final approval by the Pathfinder Management Team.

• Case-by-Case Evaluation: Management evaluates each request individually taking into consideration medical emergencies, relocation, or exceptional circumstances supported by valid documentation.
• Final Decision: The decision of the Pathfinder Management shall be final and binding on all parties.`,
  },
  {
    id: "exceptions",
    title: "Special Considerations & Exceptions",
    icon: FaExclamationCircle,
    content: `• Duplicate Payments: If a student is charged twice for the same transaction due to a technical error, the extra payment will be reconciled and credited back after verification.
• Program Discontinuation: In the rare event that Pathfinder cancels or discontinues a program prior to commencement without providing an alternate batch, appropriate management adjustments or solutions will be offered.`,
  },
];

const SectionItem = ({ section, index }) => {
  const IconComponent = section.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="border border-gray-200 rounded-2xl overflow-hidden mb-6 bg-white shadow-sm p-6 sm:p-8 hover:border-orange-300 transition-colors duration-300"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-500/20">
          <IconComponent className="text-white text-xl" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">
          {section.title}
        </h3>
      </div>
      <div className="space-y-3">
        {section.content.split("\n").map((line, i) => (
          <p
            key={i}
            className={`text-gray-700 leading-relaxed text-sm sm:text-base ${
              line.startsWith("•") || line.match(/^\d\./)
                ? "font-medium text-gray-800 ml-2"
                : line === ""
                ? "h-2"
                : ""
            }`}
          >
            {line}
          </p>
        ))}
      </div>
    </motion.div>
  );
};

const CancellationPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white border-b border-gray-200">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-orange-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-56 h-56 bg-orange-400 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-500/20"
          >
            <FaTimesCircle className="text-white text-3xl" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight"
          >
            Cancellation Policy
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mb-6"
          >
            Clear terms and guidelines regarding course cancellations, transfers, and adjustments at Pathfinder.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 bg-orange-100 border border-orange-300 rounded-full px-4 py-2 text-sm font-semibold text-orange-800"
          >
            <span className="w-2.5 h-2.5 bg-orange-600 rounded-full animate-pulse" />
            Effective Date: September 12, 2026
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Highlight Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl p-6 sm:p-8 mb-10 shadow-lg shadow-orange-500/15 flex items-start gap-4"
        >
          <FaExchangeAlt className="text-3xl flex-shrink-0 mt-1 opacity-90" />
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-2">
              Course Switch & Batch Transfer Options
            </h3>
            <p className="text-orange-50 text-sm sm:text-base leading-relaxed">
              While monetary refunds are not provided upon cancellation, students may request to transfer their enrollment to another batch or course under management approval and seat availability.
            </p>
          </div>
        </motion.div>

        {/* Policy Sections */}
        <div>
          {sections.map((section, index) => (
            <SectionItem key={section.id} section={section} index={index} />
          ))}
        </div>

        {/* Contact / Help Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-8 text-center shadow-sm"
        >
          <FaEnvelope className="text-orange-600 text-3xl mx-auto mb-4" />
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Need Help with Cancellation or Transfer?
          </h3>
          <p className="text-gray-700 mb-6 text-sm sm:text-base max-w-xl mx-auto">
            Our support team is available to assist you with batch transfer requests and enrollment inquiries.
          </p>
          <a
            href="mailto:support@pathfinder.edu.in"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold text-sm sm:text-base hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            <FaEnvelope />
            support@pathfinder.edu.in
          </a>
        </motion.div>

        <p className="text-center text-gray-500 text-xs mt-8">
          © 2026 Pathfinder Educational Institute. All rights reserved. Accessible at https://pathfinder.edu.in/
        </p>
      </div>
    </div>
  );
};

export default CancellationPolicy;
