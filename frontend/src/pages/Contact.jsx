// Contact.jsx
import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ModernAbstractDesign, {
  MedicalIcon,
} from "../components/ModernAbstractDesign";
import BannerSlider, { ExcellenceCarousal } from "../components/Carousal";
import { motion, AnimatePresence } from "framer-motion";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

const Contact = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    contact_number: "",
    email: "",
    course: "",
    center_name: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [showMessage, setShowMessage] = useState(false);

  // Get API base URL from environment variables
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const handleChange = (e) => {
    const { id, value } = e.target;

    // Map frontend field names to backend field names
    const fieldMapping = {
      fname: "first_name",
      lname: "last_name",
      contactno: "contact_number",
      emailid: "email",
      course: "course",
      centername: "center_name",
      floatingTextarea2: "message",
    };

    const backendFieldName = fieldMapping[id] || id;

    setFormData((prev) => ({
      ...prev,
      [backendFieldName]: value,
    }));

    // Clear error when user starts typing
    if (errors[backendFieldName]) {
      setErrors((prev) => ({
        ...prev,
        [backendFieldName]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");
    setErrors({});
    setShowMessage(false);

    try {
      console.log("Submitting to:", `${API_BASE_URL}/api/contact/submit/`);

      const response = await fetch(`${API_BASE_URL}/api/contact/submit/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitMessage(result.message);
        setShowMessage(true);
        // Reset form
        setFormData({
          first_name: "",
          last_name: "",
          contact_number: "",
          email: "",
          course: "",
          center_name: "",
          message: "",
        });
      } else {
        // Handle field-specific errors
        if (result.field_errors) {
          setErrors(result.field_errors);
          setSubmitMessage("Please correct the errors below.");
          setShowMessage(true);
        } else {
          setSubmitMessage(
            result.error || "Something went wrong. Please try again."
          );
          setShowMessage(true);
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitMessage(
        `Network error: ${error.message}. Please check your connection and try again.`
      );
      setShowMessage(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    let timer;

    if (showMessage && submitMessage) {
      timer = setTimeout(() => {
        setShowMessage(false);
        setTimeout(() => setSubmitMessage(""), 300);
      }, 5000);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [showMessage, submitMessage]);

  const handleCloseMessage = () => {
    setShowMessage(false);
    setTimeout(() => setSubmitMessage(""), 300);
  };

  // ... rest of your JSX code remains exactly the same ...
  // The form JSX part doesn't change, only the handleSubmit function above was updated

  return (
    <section className="w-full relative min-h-screen">
      {/* Background Stack */}
      <div className="relative w-full h-auto pb-25">
        {/* Very large gradient with smooth transitions */}
        <div
          className="absolute w-full h-[1200px] sm:h-[1400px] lg:h-[2400px]"
          style={{
            background:
              "linear-gradient(to bottom, #FDE5C2 0%, #FFCFC8 17%, #FFCECE 35%, #FFEFEF 55%, #FFFFFF 100%)",
            top: "0px",
          }}
        ></div>

        <div className="relative top-[53px] sm:top-[79px] lg:top-[180px] left-0 w-full px-[18px] sm:px-[27px] lg:px-[40px]">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row justify-center items-center w-full px-4 sm:px-6 lg:px-0 z-30 mb-12 lg:mb-16">
            {/* Left Section (Title + Divider) */}
            <div className="flex flex-col lg:flex-row justify-center items-center w-full lg:w-[42%] self-end mt-2 sm:mt-3 lg:mt-4">
              <div className="flex flex-col sm:flex-col md:flex-col lg:flex-row justify-center lg:justify-end items-center w-full px-4 sm:px-6 lg:px-[26px] z-30">
                <div className="flex flex-col justify-end items-center lg:items-end w-auto gap-2 sm:gap-3">
                  {/* Animated "Contact" Text */}
                  <motion.h2
                    className="text-black text-center lg:text-right font-poppins border-none outline-none text-[28px] sm:text-[32px] md:text-[36px] lg:text-[36.5px] font-bold relative overflow-hidden"
                    initial={{ opacity: 0, y: 50, x: -30 }}
                    whileInView={{ opacity: 1, y: 0, x: 0 }}
                    viewport={{ once: false, margin: "-50px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <motion.span
                      className="block"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: false }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                    >
                      Contact
                    </motion.span>
                  </motion.h2>

                  {/* Animated "Information" Text */}
                  <motion.h2
                    className="text-center lg:text-right font-poppins mt-[-4px] sm:mt-[-6px] md:mt-[-9px] lg:mt-[-15px] relative"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: false, amount: 0.8 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="inline-block text-center lg:text-right relative">
                      <motion.div
                        className="relative inline-block"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: false, amount: 0.8, margin: "-50px" }}
                        variants={{
                          hidden: {},
                          visible: {
                            transition: { staggerChildren: 0.1 },
                          },
                        }}
                      >
                        {"Information".split("").map((char, index) => (
                          <motion.span
                            key={index}
                            className="relative inline-block text-[36px] sm:text-[44px] md:text-[50px] lg:text-[52px] font-semibold leading-[42px] sm:leading-[54px] md:leading-[58px] lg:leading-[60px] tracking-[0.04em] text-transparent [-webkit-text-stroke:1px_#000] overflow-hidden"
                            variants={{
                              hidden: {
                                opacity: 0,
                                y: 100,
                                rotateX: 90,
                                scale: 0.5,
                              },
                              visible: {
                                opacity: 1,
                                y: 0,
                                rotateX: 0,
                                scale: 1,
                                transition: {
                                  duration: 0.7,
                                  ease: "backOut",
                                },
                              },
                            }}
                            whileHover={{
                              scale: 1.3,
                              y: -8,
                              color: "#EE4600",
                              transition: { duration: 0.3 },
                            }}
                          >
                            {char}
                          </motion.span>
                        ))}
                      </motion.div>
                    </div>
                  </motion.h2>
                </div>

                {/* Divider Line — Horizontal for small/medium, vertical for large */}
                <motion.div
                  initial={{ scaleX: 0, opacity: 0 }}
                  whileInView={{ scaleX: 1, opacity: 1 }}
                  viewport={{ once: false, margin: "-50px" }}
                  transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                  className="overflow-hidden mt-0 mb-0 lg:ml-4"
                >
                  <motion.img
                    src="/images/img_rectangle_4.png"
                    alt="Divider"
                    className="
            w-[180px] sm:w-[240px] md:w-[320px] lg:w-[6px]
            h-[4px] sm:h-[5px] md:h-[6px] lg:h-[112px]
            lg:rotate-0
          "
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </div>
            </div>

            {/* Description Text */}
            <motion.div
              className="text-black text-center lg:text-left font-poppins self-center w-full lg:w-auto border-none outline-none max-w-[90%] sm:max-w-[500px] text-[15px] sm:text-[16px] md:text-[17px] lg:text-[18.3px] leading-relaxed relative mt-8 lg:mt-0"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: "-50px" }}
              transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
            >
              {[
                "Our courses include in-depth Foundation, NEET",
                "(UG), JEE Mains and Advance preparation,",
                "designed to engage students from classes 6 to 12",
                "for academic excellence.",
              ].map((line, index) => (
                <motion.div
                  key={index}
                  className="relative overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, margin: "-50px" }}
                  transition={{
                    delay: 0.9 + index * 0.2,
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                >
                  <span className="text-black relative">
                    {line.split(" ").map((word, wordIndex) => (
                      <motion.span
                        key={wordIndex}
                        initial={{ color: "#9CA3AF" }}
                        whileInView={{ color: "#000000" }}
                        viewport={{ once: false, margin: "-50px" }}
                        transition={{
                          delay: 1.2 + index * 0.2 + wordIndex * 0.1,
                          duration: 0.5,
                          ease: "easeOut",
                        }}
                        className="inline-block mr-1"
                      >
                        {word}
                      </motion.span>
                    ))}
                  </span>
                </motion.div>
              ))}

              {/* Floating Dots */}
              <motion.div
                className="absolute right-0 bottom-0 w-3 sm:w-4 h-3 sm:h-4 bg-[#EE4600] rounded-full opacity-20"
                animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.5,
                }}
              />
              <motion.div
                className="absolute left-2 top-3 w-2 sm:w-3 h-2 sm:h-3 bg-[#FF6600] rounded-full opacity-15"
                animate={{ scale: [1, 1.8, 1], opacity: [0.15, 0.3, 0.15] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2,
                }}
              />
            </motion.div>
          </div>

          {/* Main Content - All in same container */}
          <div className="container max-w-[1200px] px-[10px] mx-auto relative z-10 ">
            <div className="row flex flex-wrap">
              <div className="col-sm-12 w-full">
                {/* Combined Map, Contact Info, and Form in same white container */}
                <div className="bg-white rounded-t-[30px] p-[25px_20px] shadow-xl">
                  {/* First Row: Map + Contact Info */}
                  <div className="row align-items-center flex flex-wrap items-center mb-12">
                    {/* Map Section */}
                    <div className="col-sm-6 w-full md:w-1/2">
                      <div className="mapWrapper h-[300px] sm:h-[400px] md:h-[400px] rounded-2xl overflow-hidden shadow-lg">
                        <iframe
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3685.4954807702175!2d88.34377767428548!3d22.523104784784586!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a02776952d50aed%3A0x52523e9ddccba387!2sHead%20Office!5e0!3m2!1sen!2sin!4v1740475182595!5m2!1sen!2sin"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Pathfinder Head Office Location"
                        ></iframe>
                      </div>
                    </div>

                    {/* Contact Info Section */}
                    <div className="col-sm-6 w-full md:w-1/2 mt-6 md:mt-0 md:pl-8">
                      <div className="contactInfoWrapper space-y-6">
                        {/* Address */}
                        <motion.div
                          className="contactInfoItem flex items-start gap-4 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
                          initial={{ opacity: 0, x: 50, scale: 0.9 }}
                          whileInView={{ opacity: 1, x: 0, scale: 1 }}
                          viewport={{ once: false, margin: "-50px" }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          whileHover={{
                            y: -5,
                            scale: 1.02,
                            transition: { duration: 0.3 },
                          }}
                        >
                          <motion.div
                            className="contacticon flex-shrink-0 mt-1 bg-gradient-to-br from-[#EE4600] to-[#FF6600] p-3 rounded-full shadow-lg flex items-center justify-center"
                            initial={{ scale: 0, rotate: -180 }}
                            whileInView={{ scale: 1, rotate: 0 }}
                            viewport={{ once: false }}
                            transition={{
                              delay: 0.2,
                              duration: 0.5,
                              type: "spring",
                            }}
                            whileHover={{
                              scale: 1.1,
                              rotate: 360,
                              transition: { duration: 0.5 },
                            }}
                          >
                            <FaMapMarkerAlt className="text-white text-lg" />
                          </motion.div>
                          <motion.div
                            className="contactContent"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: false }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                          >
                            <strong className="block text-[#161616] font-bold mb-2 text-lg bg-gradient-to-r from-[#66090D] to-[#EE4600] bg-clip-text text-transparent">
                              Head Office
                            </strong>
                            <motion.p
                              id="contactAddress"
                              className="text-[#161616] text-sm leading-relaxed"
                              initial={{ opacity: 0, y: 10 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: false }}
                              transition={{ delay: 0.6, duration: 0.5 }}
                            >
                              Pathfinder Educational Centre LLP, 47 Kalidas
                              Patitundi Lane, Kalighat, Kolkata-700026
                            </motion.p>
                          </motion.div>
                        </motion.div>

                        {/* Phone */}
                        <motion.div
                          className="contactInfoItem flex items-start gap-4 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
                          initial={{ opacity: 0, x: 50, scale: 0.9 }}
                          whileInView={{ opacity: 1, x: 0, scale: 1 }}
                          viewport={{ once: false, margin: "-50px" }}
                          transition={{
                            duration: 0.6,
                            ease: "easeOut",
                            delay: 0.1,
                          }}
                          whileHover={{
                            y: -5,
                            scale: 1.02,
                            transition: { duration: 0.3 },
                          }}
                        >
                          <motion.div
                            className="contacticon flex-shrink-0 mt-1 bg-gradient-to-br from-[#EE4600] to-[#FF6600] p-3 rounded-full shadow-lg flex items-center justify-center"
                            initial={{ scale: 0, rotate: -180 }}
                            whileInView={{ scale: 1, rotate: 0 }}
                            viewport={{ once: false }}
                            transition={{
                              delay: 0.3,
                              duration: 0.5,
                              type: "spring",
                            }}
                            whileHover={{
                              scale: 1.1,
                              rotate: 360,
                              transition: { duration: 0.5 },
                            }}
                          >
                            <FaPhoneAlt className="text-white text-lg" />
                          </motion.div>
                          <motion.div
                            className="contactContent"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: false }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                          >
                            <strong className="block text-[#161616] font-bold mb-2 text-lg bg-gradient-to-r from-[#66090D] to-[#EE4600] bg-clip-text text-transparent">
                              Phone
                            </strong>
                            <motion.a
                              href="tel:+919147178886"
                              className="text-[#161616] hover:text-[#EE4600] transition-colors duration-300 group block"
                              initial={{ opacity: 0, y: 10 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: false }}
                              transition={{ delay: 0.7, duration: 0.5 }}
                              whileHover={{ scale: 1.05 }}
                            >
                              <p className="text-sm group-hover:translate-x-2 transition-transform duration-300">
                                CALL: 9147178886; Whatsapp: 9147178886
                              </p>
                            </motion.a>
                          </motion.div>
                        </motion.div>

                        {/* Email */}
                        <motion.div
                          className="contactInfoItem flex items-start gap-4 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
                          initial={{ opacity: 0, x: 50, scale: 0.9 }}
                          whileInView={{ opacity: 1, x: 0, scale: 1 }}
                          viewport={{ once: false, margin: "-50px" }}
                          transition={{
                            duration: 0.6,
                            ease: "easeOut",
                            delay: 0.2,
                          }}
                          whileHover={{
                            y: -5,
                            scale: 1.02,
                            transition: { duration: 0.3 },
                          }}
                        >
                          <motion.div
                            className="contacticon flex-shrink-0 mt-1 bg-gradient-to-br from-[#EE4600] to-[#FF6600] p-3 rounded-full shadow-lg flex items-center justify-center"
                            initial={{ scale: 0, rotate: -180 }}
                            whileInView={{ scale: 1, rotate: 0 }}
                            viewport={{ once: false }}
                            transition={{
                              delay: 0.4,
                              duration: 0.5,
                              type: "spring",
                            }}
                            whileHover={{
                              scale: 1.1,
                              rotate: 360,
                              transition: { duration: 0.5 },
                            }}
                          >
                            <FaEnvelope className="text-white text-lg" />
                          </motion.div>
                          <motion.div
                            className="contactContent"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: false }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                          >
                            <strong className="block text-[#161616] font-bold mb-2 text-lg bg-gradient-to-r from-[#66090D] to-[#EE4600] bg-clip-text text-transparent">
                              Email
                            </strong>
                            <motion.a
                              href="mailto:info@pathfinder.edu.in"
                              className="text-[#161616] hover:text-[#EE4600] transition-colors duration-300 group block"
                              initial={{ opacity: 0, y: 10 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: false }}
                              transition={{ delay: 0.8, duration: 0.5 }}
                              whileHover={{ scale: 1.05 }}
                            >
                              <p className="text-sm group-hover:translate-x-2 transition-transform duration-300">
                                pathfinderllp@pathfinder.edu.in
                              </p>
                            </motion.a>
                          </motion.div>
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* Second Row: Contact Image + Form */}
                  <div className="row flex flex-wrap items-center mt-12 pt-12 border-t border-gray-200">
                    {/* Contact Image - Only shown on desktop, positioned to the left of form */}
                    <div className="hidden md:block col-md-4 w-full md:w-1/3">
                      <motion.figure
                        className="contactImg"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, margin: "-50px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      >
                        <img
                          src="https://pathfinder.edu.in/wp-content/themes/pathfinder/images/contactdemo.png"
                          alt="Contact us"
                          className="w-full h-auto rounded-2xl"
                        />
                      </motion.figure>
                    </div>

                    {/* Contact Form - Takes full width on mobile, 2/3 on desktop */}
                    <div className="col-md-8 w-full md:w-2/3 md:pl-8">
                      <div className="contactformBody formBody talent bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 md:p-8 ">
                        <div className="talent_hldr">
                          <div className="main_hd mb-8">
                            <div className="row align-items-center g-0">
                              <div className="col-md-12 w-full">
                                <div className="hd_cont flex gap-2.5">
                                  {/* Animated "Get in" Text */}
                                  <motion.h6
                                    className="text-[#EE4600] font-semibold text-lg mb-2"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: false, margin: "-50px" }}
                                    transition={{ duration: 0.6 }}
                                  >
                                    <div className="inline-block">
                                      {"Get in".split("").map((char, index) => (
                                        <motion.span
                                          key={index}
                                          className="inline-block"
                                          initial={{ opacity: 0, y: 20 }}
                                          whileInView={{ opacity: 1, y: 0 }}
                                          viewport={{ once: false }}
                                          transition={{
                                            delay: index * 0.1,
                                            duration: 0.5,
                                          }}
                                          whileHover={{
                                            scale: 1.2,
                                            color: "#66090D",
                                            transition: { duration: 0.3 },
                                          }}
                                        >
                                          {char}
                                        </motion.span>
                                      ))}
                                    </div>
                                  </motion.h6>

                                  {/* Animated "Touch" Text */}
                                  <motion.h3
                                    className="text-4xl font-bold text-[#66090D]"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: false, margin: "-50px" }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                  >
                                    <div className="inline-block">
                                      {"Touch".split("").map((char, index) => (
                                        <motion.span
                                          key={index}
                                          className="inline-block"
                                          initial={{
                                            opacity: 0,
                                            y: 50,
                                            scale: 0.5,
                                          }}
                                          whileInView={{
                                            opacity: 1,
                                            y: 0,
                                            scale: 1,
                                          }}
                                          viewport={{ once: false }}
                                          transition={{
                                            delay: 0.4 + index * 0.1,
                                            duration: 0.6,
                                            type: "spring",
                                            stiffness: 100,
                                          }}
                                          whileHover={{
                                            scale: 1.3,
                                            color: "#EE4600",
                                            y: -5,
                                            transition: { duration: 0.3 },
                                          }}
                                        >
                                          {char}
                                        </motion.span>
                                      ))}
                                    </div>
                                  </motion.h3>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Contact Form */}
                        {/* Contact Form */}
                        <motion.form
                          className="space-y-6"
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: false, margin: "-50px" }}
                          transition={{ duration: 0.8, delay: 0.6 }}
                          onSubmit={handleSubmit}
                        >
                          <div className="row flex flex-wrap -mx-3">
                            {/* First Name */}
                            <div className="col-sm-6 w-full md:w-1/2 px-3 mb-6">
                              <motion.div
                                className="form-group relative"
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: false }}
                                transition={{ duration: 0.5, delay: 0.7 }}
                              >
                                <div className="form-floating relative">
                                  <input
                                    type="text"
                                    id="fname"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4600] focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm ${
                                      errors.first_name
                                        ? "border-red-500 ring-1 ring-red-500"
                                        : "border-gray-300"
                                    }`}
                                    placeholder=" "
                                    required
                                  />
                                  <label
                                    htmlFor="fname"
                                    className={`absolute left-4 transition-all duration-300 pointer-events-none bg-white px-2 ${
                                      formData.first_name || errors.first_name
                                        ? "top-1 text-xs"
                                        : "top-3 text-gray-500"
                                    } ${
                                      errors.first_name
                                        ? "text-red-500"
                                        : "text-[#EE4600]"
                                    }`}
                                  >
                                    First name
                                    <sup className="text-[#EE4600]">*</sup>
                                  </label>
                                </div>
                                {errors.first_name && (
                                  <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-500 text-xs mt-2 flex items-center gap-1"
                                  >
                                    <svg
                                      className="w-3 h-3"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    {errors.first_name}
                                  </motion.p>
                                )}
                              </motion.div>
                            </div>

                            {/* Last Name */}
                            <div className="col-sm-6 w-full md:w-1/2 px-3 mb-6">
                              <motion.div
                                className="form-group relative"
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: false }}
                                transition={{ duration: 0.5, delay: 0.8 }}
                              >
                                <div className="form-floating relative">
                                  <input
                                    type="text"
                                    id="lname"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4600] focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm ${
                                      errors.last_name
                                        ? "border-red-500 ring-1 ring-red-500"
                                        : "border-gray-300"
                                    }`}
                                    placeholder=" "
                                    required
                                  />
                                  <label
                                    htmlFor="lname"
                                    className={`absolute left-4 transition-all duration-300 pointer-events-none bg-white px-2 ${
                                      formData.last_name || errors.last_name
                                        ? "top-1 text-xs"
                                        : "top-3 text-gray-500"
                                    } ${
                                      errors.last_name
                                        ? "text-red-500"
                                        : "text-[#EE4600]"
                                    }`}
                                  >
                                    Last name
                                    <sup className="text-[#EE4600]">*</sup>
                                  </label>
                                </div>
                                {errors.last_name && (
                                  <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-500 text-xs mt-2 flex items-center gap-1"
                                  >
                                    <svg
                                      className="w-3 h-3"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    {errors.last_name}
                                  </motion.p>
                                )}
                              </motion.div>
                            </div>

                            {/* Contact Number */}
                            <div className="col-sm-6 w-full md:w-1/2 px-3 mb-6">
                              <motion.div
                                className="form-group relative"
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: false }}
                                transition={{ duration: 0.5, delay: 0.9 }}
                              >
                                <div className="form-floating relative">
                                  <input
                                    type="tel"
                                    id="contactno"
                                    value={formData.contact_number}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4600] focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm ${
                                      errors.contact_number
                                        ? "border-red-500 ring-1 ring-red-500"
                                        : "border-gray-300"
                                    }`}
                                    placeholder=" "
                                    required
                                  />
                                  <label
                                    htmlFor="contactno"
                                    className={`absolute left-4 transition-all duration-300 pointer-events-none bg-white px-2 ${
                                      formData.contact_number ||
                                      errors.contact_number
                                        ? "top-1 text-xs"
                                        : "top-3 text-gray-500"
                                    } ${
                                      errors.contact_number
                                        ? "text-red-500"
                                        : "text-[#EE4600]"
                                    }`}
                                  >
                                    Contact Number
                                    <sup className="text-[#EE4600]">*</sup>
                                  </label>
                                </div>
                                {errors.contact_number && (
                                  <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-500 text-xs mt-2 flex items-center gap-1"
                                  >
                                    <svg
                                      className="w-3 h-3"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    {errors.contact_number}
                                  </motion.p>
                                )}
                              </motion.div>
                            </div>

                            {/* Email */}
                            <div className="col-sm-6 w-full md:w-1/2 px-3 mb-6">
                              <motion.div
                                className="form-group relative"
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: false }}
                                transition={{ duration: 0.5, delay: 1.0 }}
                              >
                                <div className="form-floating relative">
                                  <input
                                    type="email"
                                    id="emailid"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4600] focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm ${
                                      errors.email
                                        ? "border-red-500 ring-1 ring-red-500"
                                        : "border-gray-300"
                                    }`}
                                    placeholder=" "
                                    required
                                  />
                                  <label
                                    htmlFor="emailid"
                                    className={`absolute left-4 transition-all duration-300 pointer-events-none bg-white px-2 ${
                                      formData.email || errors.email
                                        ? "top-1 text-xs"
                                        : "top-3 text-gray-500"
                                    } ${
                                      errors.email
                                        ? "text-red-500"
                                        : "text-[#EE4600]"
                                    }`}
                                  >
                                    Email<sup className="text-[#EE4600]">*</sup>
                                  </label>
                                </div>
                                {errors.email && (
                                  <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-500 text-xs mt-2 flex items-center gap-1"
                                  >
                                    <svg
                                      className="w-3 h-3"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    {errors.email}
                                  </motion.p>
                                )}
                              </motion.div>
                            </div>

                            {/* Select Course */}
                            <div className="col-sm-6 w-full md:w-1/2 px-3 mb-6">
                              <motion.div
                                className="form-group relative"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: false }}
                                transition={{ duration: 0.5, delay: 1.1 }}
                              >
                                <div className="did-floating-label-content relative">
                                  <select
                                    id="course"
                                    value={formData.course}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4600] focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm appearance-none ${
                                      errors.course
                                        ? "border-red-500 ring-1 ring-red-500"
                                        : "border-gray-300"
                                    }`}
                                    required
                                  >
                                    <option value="">Select a course</option>
                                    <option value="Engineering">
                                      Engineering
                                    </option>
                                    <option value="Foundation">
                                      Foundation
                                    </option>
                                    <option value="Medical">Medical</option>
                                    <option value="NCRP">NCRP</option>
                                  </select>
                                  <label
                                    className={`absolute left-4 transition-all duration-300 pointer-events-none bg-white px-2 ${
                                      formData.course || errors.course
                                        ? "top-1 text-xs"
                                        : "top-3 text-gray-500"
                                    } ${
                                      errors.course
                                        ? "text-red-500"
                                        : "text-[#EE4600]"
                                    }`}
                                  >
                                    Select Course
                                    <sup className="text-[#EE4600]">*</sup>
                                  </label>
                                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg
                                      className="w-4 h-4 text-gray-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                      />
                                    </svg>
                                  </div>
                                </div>
                                {errors.course && (
                                  <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-500 text-xs mt-2 flex items-center gap-1"
                                  >
                                    <svg
                                      className="w-3 h-3"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    {errors.course}
                                  </motion.p>
                                )}
                              </motion.div>
                            </div>

                            {/* Centre Name */}
                            <div className="col-sm-6 w-full md:w-1/2 px-3 mb-6">
                              <motion.div
                                className="form-group relative"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: false }}
                                transition={{ duration: 0.5, delay: 1.2 }}
                              >
                                <div className="form-floating relative">
                                  <input
                                    type="text"
                                    id="centername"
                                    value={formData.center_name}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4600] focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm ${
                                      errors.center_name
                                        ? "border-red-500 ring-1 ring-red-500"
                                        : "border-gray-300"
                                    }`}
                                    placeholder=" "
                                    required
                                  />
                                  <label
                                    htmlFor="centername"
                                    className={`absolute left-4 transition-all duration-300 pointer-events-none bg-white px-2 ${
                                      formData.center_name || errors.center_name
                                        ? "top-1 text-xs"
                                        : "top-3 text-gray-500"
                                    } ${
                                      errors.center_name
                                        ? "text-red-500"
                                        : "text-[#EE4600]"
                                    }`}
                                  >
                                    Centre Name
                                    <sup className="text-[#EE4600]">*</sup>
                                  </label>
                                </div>
                                {errors.center_name && (
                                  <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-500 text-xs mt-2 flex items-center gap-1"
                                  >
                                    <svg
                                      className="w-3 h-3"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    {errors.center_name}
                                  </motion.p>
                                )}
                              </motion.div>
                            </div>

                            {/* Message */}
                            <div className="col-sm-12 w-full px-3 mb-6">
                              <motion.div
                                className="form-group relative"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: false }}
                                transition={{ duration: 0.5, delay: 1.3 }}
                              >
                                <div className="form-floating relative">
                                  <textarea
                                    id="floatingTextarea2"
                                    rows="4"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4600] focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none ${
                                      errors.message
                                        ? "border-red-500 ring-1 ring-red-500"
                                        : "border-gray-300"
                                    }`}
                                    placeholder=" "
                                  ></textarea>
                                  <label
                                    htmlFor="floatingTextarea2"
                                    className={`absolute left-4 transition-all duration-300 pointer-events-none bg-white px-2 ${
                                      formData.message || errors.message
                                        ? "top-1 text-xs"
                                        : "top-3 text-gray-500"
                                    } ${
                                      errors.message
                                        ? "text-red-500"
                                        : "text-[#EE4600]"
                                    }`}
                                  >
                                    Message
                                  </label>
                                </div>
                                {errors.message && (
                                  <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-500 text-xs mt-2 flex items-center gap-1"
                                  >
                                    <svg
                                      className="w-3 h-3"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    {errors.message}
                                  </motion.p>
                                )}
                              </motion.div>
                            </div>
                          </div>
                          {/* Submit Button */}
                          <motion.div
                            className="row con_inf_rb flex flex-wrap items-center mt-8 mb-10"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false }}
                            transition={{ duration: 0.5, delay: 1.4 }}
                          >
                            <div className="col-sm-12 w-full">
                              <motion.button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-[#EE4600] to-[#FF6600] text-white py-4 px-8 rounded-lg font-semibold text-lg hover:shadow-xl transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-[#EE4600] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                                whileHover={
                                  !isSubmitting
                                    ? {
                                        scale: 1.02,
                                        boxShadow:
                                          "0 10px 25px -5px rgba(238, 70, 0, 0.4)",
                                      }
                                    : {}
                                }
                                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                              >
                                {isSubmitting ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <svg
                                      className="animate-spin h-5 w-5 text-white"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                    Submitting...
                                  </div>
                                ) : (
                                  "Submit"
                                )}
                              </motion.button>
                            </div>
                          </motion.div>

                          <AnimatePresence>
                            {/* Success/Error Message */}
                            {showMessage && submitMessage && (
                              <motion.div
                                initial={{ opacity: 0, y: -50, scale: 0.95 }}
                                animate={{
                                  opacity: 1,
                                  y: 0,
                                  scale: 1,
                                  transition: {
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 30,
                                  },
                                }}
                                exit={{
                                  opacity: 0,
                                  y: -50,
                                  scale: 0.95,
                                  transition: { duration: 0.2 },
                                }}
                                className={`fixed top-25 left-1/2 -translate-x-1/2 z-[1000] w-[90%] sm:w-auto p-6 rounded-2xl shadow-2xl border-l-4 backdrop-blur-sm ${
                                  submitMessage.includes("Thank you") ||
                                  submitMessage.includes("success")
                                    ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-900 border-l-green-500 shadow-green-100/50"
                                    : "bg-gradient-to-r from-red-50 to-rose-50 text-red-900 border-l-red-500 shadow-red-100/50"
                                }`}
                              >
                                {/* Close Button */}
                                <button
                                  onClick={handleCloseMessage}
                                  className={`absolute top-3 right-3 p-1 rounded-full transition-all duration-200 hover:scale-110 ${
                                    submitMessage.includes("Thank you") ||
                                    submitMessage.includes("success")
                                      ? "hover:bg-green-200/50 text-green-600"
                                      : "hover:bg-red-200/50 text-red-600"
                                  }`}
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>

                                {/* Message Content */}
                                <div className="flex items-start gap-4 pr-8">
                                  {/* Animated Icon */}
                                  <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{
                                      scale: 1,
                                      rotate: 0,
                                      transition: {
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 15,
                                        delay: 0.1,
                                      },
                                    }}
                                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                                      submitMessage.includes("Thank you") ||
                                      submitMessage.includes("success")
                                        ? "bg-green-100 text-green-600"
                                        : "bg-red-100 text-red-600"
                                    }`}
                                  >
                                    {submitMessage.includes("Thank you") ||
                                    submitMessage.includes("success") ? (
                                      <motion.svg
                                        initial={{ pathLength: 0, scale: 0 }}
                                        animate={{
                                          pathLength: 1,
                                          scale: 1,
                                          transition: {
                                            delay: 0.3,
                                            duration: 0.5,
                                            ease: "easeOut",
                                          },
                                        }}
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <motion.path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={3}
                                          d="M5 13l4 4L19 7"
                                          initial={{ pathLength: 0 }}
                                          animate={{ pathLength: 1 }}
                                          transition={{
                                            delay: 0.5,
                                            duration: 0.3,
                                          }}
                                        />
                                      </motion.svg>
                                    ) : (
                                      <motion.svg
                                        initial={{ scale: 0 }}
                                        animate={{
                                          scale: 1,
                                          transition: {
                                            delay: 0.3,
                                            type: "spring",
                                            stiffness: 200,
                                          },
                                        }}
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={3}
                                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                      </motion.svg>
                                    )}
                                  </motion.div>

                                  {/* Text Content */}
                                  <div className="flex-1 min-w-0">
                                    <motion.h3
                                      initial={{ opacity: 0, x: 10 }}
                                      animate={{
                                        opacity: 1,
                                        x: 0,
                                        transition: { delay: 0.4 },
                                      }}
                                      className="font-semibold text-lg mb-1"
                                    >
                                      {submitMessage.includes("Thank you") ||
                                      submitMessage.includes("success")
                                        ? "Success!"
                                        : "Oops!"}
                                    </motion.h3>
                                    <motion.p
                                      initial={{ opacity: 0, x: 10 }}
                                      animate={{
                                        opacity: 1,
                                        x: 0,
                                        transition: { delay: 0.5 },
                                      }}
                                      className="text-sm opacity-90 leading-relaxed"
                                    >
                                      {submitMessage}
                                    </motion.p>
                                  </div>
                                </div>

                                {/* Progress Bar for Auto-dismiss - REMOVED onAnimationComplete */}
                                <motion.div
                                  initial={{ scaleX: 0 }}
                                  animate={{
                                    scaleX: 1,
                                    transition: {
                                      duration: 5,
                                      ease: "linear",
                                    },
                                  }}
                                  className={`absolute bottom-0 left-0 h-1 rounded-full origin-left ${
                                    submitMessage.includes("Thank you") ||
                                    submitMessage.includes("success")
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{ width: "100%" }}
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                          {/*  */}
                        </motion.form>
                      </div>
                    </div>

                    {/* Contact Image - Only shown on mobile, positioned AFTER the form */}
                    <div className="md:hidden mt-16 w-full">
                      <motion.figure
                        className="contactImg"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, margin: "-50px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      >
                        <img
                          src="https://pathfinder.edu.in/wp-content/themes/pathfinder/images/contactdemo.png"
                          alt="Contact us"
                          className="w-full h-auto rounded-2xl "
                        />
                      </motion.figure>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Extra spacing at the bottom to prevent footer overlap */}
      {/* <div className=""></div> */}
    </section>
  );
};

export default Contact;
