import React from "react";
import { motion } from "framer-motion";
import {
  FaShieldAlt,
  FaUserSecret,
  FaLock,
  FaCookie,
  FaDatabase,
  FaShareAlt,
  FaEnvelope,
  FaEye,
  FaTrash,
  FaUserEdit,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";

const sections = [
  {
    id: "consent",
    title: "Consent",
    content: `By using our website, you hereby consent to our Privacy Policy and agree to its terms.`,
  },
  {
    id: "information-collected",
    title: "Information We Collect",
    content: `The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.

If you contact us directly, we may receive additional information about you, such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.

When you register for an Account, we may ask for your contact information, including items such as name, company name, address, email address, and telephone number.`,
  },
  {
    id: "how-we-use",
    title: "How We Use Your Information",
    content: `We use the information we collect in various ways, including to:

• Provide, operate, and maintain our website
• Improve, personalize, and expand our website
• Understand and analyze how you use our website
• Develop new products, services, features, and functionality
• Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes
• Send you emails
• Find and prevent fraud`,
  },
  {
    id: "log-files",
    title: "Log Files",
    content: `pathfinder.edu.in follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this as part of hosting services' analytics. The information collected by log files includes Internet Protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.`,
  },
  {
    id: "cookies",
    title: "Cookies and Web Beacons",
    content: `Like any other website, pathfinder.edu.in uses 'cookies'. These cookies are used to store information, including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.`,
  },
  {
    id: "google-dart",
    title: "Google DoubleClick DART Cookie",
    content: `Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to www.website.com and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – https://policies.google.com/technologies/ads`,
  },
  {
    id: "advertising-partners",
    title: "Our Advertising Partners",
    content: `Some of the advertisers on our site may use cookies and web beacons. Our advertising partners are listed below. Each of our advertising partners has its own Privacy Policy for its policies on user data. For easier access, we hyperlinked to their Privacy Policies below.

• Google - https://policies.google.com/technologies/ads

Third-party ad servers or ad networks use technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on pathfinder.edu.in, which are sent directly to users' browser. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.

Note that pathfinder.edu.in has no access to or control over these cookies that are used by third-party advertisers.`,
  },
  {
    id: "third-party-policies",
    title: "Third Party Privacy Policies",
    content: `pathfinder.edu.in's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.

You can choose to disable cookies through your individual browser options. To know more detailed information about cookie management with specific web browsers, it can be found at the browsers' respective websites.`,
  },
  {
    id: "ccpa-rights",
    title: "CCPA Privacy Rights (Do Not Sell My Personal Information)",
    content: `Under the CCPA, among other rights, California consumers have the right to:

• Request that a business that collects a consumer's personal data disclose the categories and specific pieces of personal data that a business has collected about consumers.

• Request that a business delete any personal data about the consumer that a business has collected.

• Request that a business that sells a consumer's personal data, not sell the consumer's personal data.

If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.`,
  },
  {
    id: "gdpr-rights",
    title: "GDPR Data Protection Rights",
    content: `We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:

• The right to access – You have the right to request copies of your personal data. We may charge you a small fee for this service.

• The right to rectification – You have the right to request that we correct any information you believe is inaccurate. You also have the right to request that we complete the information you believe is incomplete.

• The right to erasure – You have the right to request that we erase your personal data, under certain conditions.

• The right to restrict processing – You have the right to request that we restrict the processing of your personal data, under certain conditions.

• The right to object to processing – You have the right to object to our processing of your personal data, under certain conditions.

• The right to data portability – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.

If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.`,
  },
  {
    id: "childrens-information",
    title: "Children's Information",
    content: `Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.

pathfinder.edu.in does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.`,
  },
  {
    id: "policy-changes",
    title: "Changes to This Privacy Policy",
    content: `We may update our Privacy Policy from time to time. Thus, we advise you to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page. These changes are effective immediately, after they are posted on this page.`,
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
};

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white border-b border-gray-200">
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-10">
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
            <FaShieldAlt className="text-white text-3xl" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight"
          >
            Privacy Policy
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mb-6"
          >
            At pathfinder.edu.in, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that are collected and recorded by pathfinder.edu.in and how we use it.
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
        {/* Key highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
        >
          {[
            { icon: FaLock, title: "Secure", desc: "Your data is encrypted and protected" },
            { icon: FaUserSecret, title: "Private", desc: "We never sell your personal data" },
            { icon: FaTrash, title: "Your Control", desc: "Request deletion anytime" },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-white border border-gray-200 rounded-2xl p-5 text-center hover:border-orange-300 transition-colors duration-300 group shadow-sm"
            >
              <item.icon className="text-orange-600 text-2xl mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
              <h4 className="text-gray-900 font-semibold mb-1">{item.title}</h4>
              <p className="text-gray-600 text-xs">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Intro Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-orange-200 rounded-2xl p-6 mb-10 flex items-start gap-4 shadow-sm"
        >
          <FaShieldAlt className="text-orange-600 text-2xl flex-shrink-0 mt-1" />
          <div>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us. This Privacy Policy applies only to our online activities and is valid for visitors to our website with regard to the information that they shared and/or collected in pathfinder.edu.in. This policy is not applicable to any information collected offline or via channels other than this website.
            </p>
          </div>
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
          <h3 className="text-xl font-bold text-gray-900 mb-2">Have Questions About Our Privacy?</h3>
          <p className="text-gray-700 mb-6 text-sm sm:text-base">
            If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us.
          </p>
          <a
            href="mailto:support@pathfinder.edu.in"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            <FaEnvelope />
            support@pathfinder.edu.in
          </a>
        </motion.div>

        {/* Footer note */}
        <p className="text-center text-gray-500 text-xs mt-8">
          © 2026 Pathfinder. All rights reserved. Accessible at https://pathfinder.edu.in/
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
