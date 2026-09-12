import React from "react";
import { motion } from "framer-motion";
import {
  FaMoneyBillWave,
  FaShieldAlt,
  FaUserCheck,
  FaEnvelope,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
  FaBan,
} from "react-icons/fa";

const sections = [
  {
    id: "overview",
    title: "Refund Policy Overview & Effective Date",
    icon: FaInfoCircle,
    content: `This Refund Policy governs all fee payments, registrations, course enrollments, and transactions made with Pathfinder Educational Institute ("Pathfinder") via website (https://pathfinder.edu.in/), mobile apps, or offline centers.

• Effective Date: September 12, 2026
• General Standard: All fees paid towards courses, test series, study materials, and admission registrations are non-refundable, except under explicit management approval or technical error.`,
  },
  {
    id: "refund-terms",
    title: "Refund Guidelines & Terms",
    icon: FaBan,
    content: `1. Standard Non-Refundable Policy
Once a student has enrolled in a course or purchased study packages/mock tests, fees paid are non-refundable. Registration fees and processing charges are strictly non-refundable under all circumstances.

2. Management Discretion & Exceptional Cases
Refund requests are considered solely at the discretion of the Pathfinder Management Team. Exceptional circumstances (such as severe documented medical conditions or mandatory family relocation) may be reviewed on a case-by-case basis.

3. Refund Approval & Verification Process
• Written Application: Students or parents must submit a formal refund request along with valid supporting documents and original payment receipts to support@pathfinder.edu.in or at the respective Pathfinder center.
• Review Period: Management reviews requests within 14 working days of receiving complete documentation.
• Decision Finality: Approval or rejection of refund applications rests exclusively with the Pathfinder Management Team and is final.`,
  },
  {
    id: "duplicate-payments",
    title: "Duplicate Payments & Technical Issues",
    icon: FaCheckCircle,
    content: `• Duplicate Transactions: If a payment is charged multiple times due to a payment gateway error or technical fault during online checkout, the excess amount will be refunded in full after reconciliation.
• Processing Time: Verified duplicate payment refunds will be processed back to the original payment method (bank account / card / UPI) within 7–10 working days.`,
  },
  {
    id: "course-transfer-alternative",
    title: "Course Transfer / Adjustment Alternative",
    icon: FaUserCheck,
    content: `If a refund request is not eligible under standard policy, Pathfinder may, at its sole discretion, offer the student the option to:
• Transfer the enrollment to another available batch or stream.
• Convert the paid amount into credit towards another course or test series offered by Pathfinder.`,
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

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white border-b border-gray-200">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-orange-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-orange-400 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-500/20"
          >
            <FaMoneyBillWave className="text-white text-3xl" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight"
          >
            Refund Policy
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mb-6"
          >
            Important information and guidelines regarding fee refunds and payment processing at Pathfinder.
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
          className="bg-white border border-orange-300 rounded-2xl p-6 sm:p-8 mb-10 shadow-sm flex items-start gap-4"
        >
          <FaShieldAlt className="text-orange-600 text-3xl flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              Management Review & Case-by-Case Evaluation
            </h3>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              Pathfinder maintains a non-refundable fee structure for course enrollments. Exceptional refund requests are evaluated strictly on a case-by-case basis and require explicit management approval.
            </p>
          </div>
        </motion.div>

        {/* Policy Sections */}
        <div>
          {sections.map((section, index) => (
            <SectionItem key={section.id} section={section} index={index} />
          ))}
        </div>

        {/* Contact Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-8 text-center shadow-sm"
        >
          <FaEnvelope className="text-orange-600 text-3xl mx-auto mb-4" />
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Have Questions About Refund Policies?
          </h3>
          <p className="text-gray-700 mb-6 text-sm sm:text-base max-w-xl mx-auto">
            If you have questions regarding payment transactions or refund evaluations, please reach out to our team.
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

export default RefundPolicy;
