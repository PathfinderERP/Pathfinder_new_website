import React from "react";
import { motion } from "framer-motion";
import {
  FaShieldAlt,
  FaFileContract,
  FaLink,
  FaCookie,
  FaGavel,
  FaEnvelope,
  FaCommentAlt,
  FaExclamationTriangle,
} from "react-icons/fa";

const sections = [
  {
    id: "introduction",
    title: "Introduction",
    content: `Welcome to Pathfinder!

These terms and conditions outline the rules and regulations for the use of Pathfinder's Website, located at https://pathfinder.edu.in/.

By accessing this website, we assume you accept these terms and conditions. Do not continue to use Pathfinder if you do not agree to take all of the terms and conditions stated on this page.

The following terminology applies to these Terms and Conditions, Privacy Statement, and Disclaimer Notice and all Agreements: "Client", "You" and "Your" refer to you, the person logging on to this website and compliant to the Company's terms and conditions. "The Company", "Ourselves", "We", "Our", and "Us" refer to our Company. "Party", "Parties", or "Us", refers to both the Client and ourselves. All terms refer to the offer, acceptance, and consideration of payment necessary to undertake the process of our assistance to the Client in the most appropriate manner for the express purpose of meeting the Client's needs in respect of the provision of the Company's stated services, in accordance with and subject to the prevailing Indian law.`,
  },
  {
    id: "cookies",
    title: "Cookies",
    content: `We employ the use of cookies. By accessing Pathfinder, you agreed to use cookies in agreement with the Pathfinder Privacy Policy. Cookies help enhance website functionality and user experience. Some affiliate/advertising partners may also use cookies.`,
  },
  {
    id: "license",
    title: "License",
    content: `Unless otherwise stated, Pathfinder and/or its licensors own the intellectual property rights for all materials on Pathfinder. All rights are reserved. You may access this content for your own personal use, subject to restrictions in these terms.

You must not:
• Republish material from Pathfinder
• Sell, rent, or sub-license material from Pathfinder
• Reproduce, duplicate, or copy material from Pathfinder
• Redistribute content from Pathfinder

Parts of this website allow users to post opinions or information. Pathfinder does not filter, edit, or review Comments before posting. Comments reflect the views of the individuals who post them. Pathfinder is not liable for Comments posted on the website.`,
  },
  {
    id: "comment-guidelines",
    title: "Comment Guidelines",
    content: `You warrant and represent that:

• You have the right to post Comments and have necessary permissions.
• Comments do not violate any intellectual property rights.
• Comments are not defamatory, offensive, unlawful, or privacy-invading.
• Comments are not used for solicitation or unlawful activities.

You grant Pathfinder a non-exclusive license to use, reproduce, and edit your Comments in any form or media.`,
  },
  {
    id: "hyperlinking",
    title: "Hyperlinking to Our Content",
    content: `The following organizations may link to our Website without prior written approval:

• Government agencies
• Search engines
• News organizations
• Online directory distributors
• System-wide Accredited Businesses

Other organizations may request linking permissions by emailing us with complete details. We respond within 2–3 weeks.`,
  },
  {
    id: "iframes",
    title: "iFrames",
    content: `Without prior approval, you may not create frames around our pages that alter the website's appearance or presentation.`,
  },
  {
    id: "content-liability",
    title: "Content Liability",
    content: `We are not responsible for any content on your website. You agree to protect and defend us against all claims arising from your Website.`,
  },
  {
    id: "your-privacy",
    title: "Your Privacy",
    content: `Please read our Privacy Policy.`,
  },
  {
    id: "reservation",
    title: "Reservation of Rights",
    content: `We reserve the right to request removal of any link to our Website. By continually linking to our site, you agree to these linking terms.`,
  },
  {
    id: "removal-of-links",
    title: "Removal of Links",
    content: `If you find any link on our Website offensive, contact us. We may remove links but are not obligated to respond directly.`,
  },
  {
    id: "disclaimer",
    title: "Disclaimer",
    content: `To the maximum extent permitted by applicable law, we exclude all representations, warranties, and conditions relating to our website.

Nothing in this disclaimer will limit or exclude our or your liability for:

• Death or personal injury
• Fraud or fraudulent misrepresentation
• Any liability not permitted by law

As long as the website and services are provided free of charge, we will not be liable for any loss or damage of any nature.`,
  },
];

const SectionItem = ({ section, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="border border-gray-300 rounded-2xl overflow-hidden mb-4 bg-white shadow-sm p-5 sm:p-6"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-500/30">
          <FaShieldAlt className="text-white text-base" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-800">
          {section.title}
        </h3>
      </div>
      <div className="ml-0">
        {section.content.split("\n").map((line, i) => (
          <p
            key={i}
            className={`text-gray-700 leading-relaxed text-sm sm:text-base ${
              line.startsWith("•") ? "ml-4 mt-2" : line === "" ? "mt-3" : "mt-0"
            }`}
          >
            {line || "\u00A0"}
          </p>
        ))}
      </div>
    </motion.div>
  );
}

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white border-b border-gray-200">
        <div className="absolute inset-0 opacity-10">
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
            <FaFileContract className="text-white text-3xl" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight"
          >
            Terms &amp; Conditions
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mb-6"
          >
            Please read these terms carefully before using our website and services.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 bg-orange-100 border border-orange-300 rounded-full px-4 py-2 text-sm text-orange-700"
          >
            <span className="w-2 h-2 bg-orange-600 rounded-full animate-pulse" />
            Last updated: May 2026
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Intro Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-orange-200 rounded-2xl p-6 mb-10 flex items-start gap-4 shadow-sm"
        >
          <FaShieldAlt className="text-orange-600 text-2xl flex-shrink-0 mt-1" />
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            By accessing and using{" "}
            <strong className="text-gray-900">Pathfinder's</strong> website located at{" "}
            <a
              href="https://pathfinder.edu.in"
              className="text-orange-600 hover:text-orange-700 underline transition-colors"
            >
              pathfinder.edu.in
            </a>
            , you agree to be bound by these Terms and Conditions. If you do not agree with any
            part of these terms, please do not use our services.
          </p>
        </motion.div>

        {/* Sections */}
        <div>
          {sections.map((section, index) => (
            <SectionItem key={section.id} section={section} index={index} />
          ))}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-br from-orange-100 to-orange-50 border border-orange-200 rounded-2xl p-8 text-center shadow-sm"
        >
          <FaEnvelope className="text-orange-600 text-3xl mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Have Questions?</h3>
          <p className="text-gray-700 mb-6 text-sm sm:text-base">
            If you have any questions about our Terms and Conditions, please contact us.
          </p>
          <a
            href="mailto:support@pathfinder.edu.in"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            <FaEnvelope />
            support@pathfinder.edu.in
          </a>
        </motion.div>

        <p className="text-center text-gray-500 text-xs mt-8">
          © 2026 Pathfinder. All rights reserved. Accessible at https://pathfinder.edu.in/
        </p>
      </div>
    </div>
  );
};

export default TermsAndConditions;
