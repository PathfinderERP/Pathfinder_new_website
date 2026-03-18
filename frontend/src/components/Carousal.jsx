import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import { getImageUrl } from "../utils/imageUtils";
import { FadeInImage } from "./common/OptimizedImage";

export const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const descriptions = [
    // 1
    {
      name: "Adrita Sarkar",
      exam: " Madhyamik 2025",
      desc: "AIR Rank:",
      rank: "1",
      img: getImageUrl("images/homepagecarousal_images/Adrita Sarkar.webp"),
      scaleClass: "scale-[1.25]",
    },
    // 2
    {
      name: "Devdutta Majhi",
      exam: "JEE 2025",
      desc: "AIR Rank:",
      rank: "1",
      img: getImageUrl("images/homepagecarousal_images/devdutta majhi.webp"),
      scaleClass: "scale-100",
    },
    // 3   rupayan pal all achivement .png cool
    {
      name: "Rupayan Pal",
      exam: "NEET 2025",
      desc: "AIR Rank:",
      rank: "20",
      img: getImageUrl("images/homepagecarousal_images/rupayan pal.webp"),
      scaleClass: "scale-100",
    },
    // 4 Adrita Mahata
    {
      name: "Adrita Mahata",
      exam: "ICSE 2025",
      desc: "Score:99.8%",
      rank: "AIR 2",
      img: getImageUrl("images/homepagecarousal_images/Adrita Mahata.webp"),
      scaleClass: "scale-125",
    },
    // 5 Chandrachur Sen
    {
      name: "Chandrachur Sen",
      exam: "Madhyamika 2024",
      desc: "AIR Rank:",
      rank: "1",
      img: getImageUrl("images/homepagecarousal_images/Chandrachur Sen.webp"),
      scaleClass: "scale-[1.05]",
    },
    // 6 Pranami halder
    {
      name: "Pranami halder",
      exam: "CBSE 2025",
      desc: "Score:",
      rank: "99.2%",
      img: getImageUrl("images/homepagecarousal_images/Pranami halder.webp"),
      scaleClass: "scale-[1.15]",
    },
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    pauseOnHover: true,
    beforeChange: (current, next) => setCurrentSlide(next),
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: true,
          centerPadding: "40px",
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: true,
          centerPadding: "30px",
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: true,
          centerPadding: "20px",
        },
      },
    ],
    appendDots: (dots) => (
      <div className="hero-carousel-container">
        <ul className="flex justify-center items-center gap-3 m-0 p-0 list-none mt-4">
          {dots}
        </ul>
      </div>
    ),
    customPaging: (i) => (
      <button className="relative group">
        <span className="sr-only">Go to slide {i + 1}</span>
        <div className="w-6 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${i === currentSlide
              ? "bg-[#66090D] w-full"
              : "bg-orange-200 w-2 group-hover:w-4 group-hover:bg-orange-300"
              }`}
          />
        </div>
      </button>
    ),
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 -mt-4 sm:mt-0">
      {/* Mobile Header - Positioned higher */}
      <div className="text-center mb-2 block md:hidden">
        <h3 className="text-lg font-bold text-slate-800 mb-0">Top Achievers</h3>
        <p className="text-xs text-slate-600 mt-1">Student success stories</p>
      </div>

      <Slider {...sliderSettings}>
        {descriptions.map((item, index) => (
          <motion.div
            key={item.name}
            className="px-2 sm:px-3"
            whileHover={{ scale: 1.02, y: 3 }}
            transition={{ duration: 0.3 }}
          >
            {/* Compact card optimized for mobile */}
            <div className="relative w-full h-[260px] sm:h-[320px] md:h-[340px] rounded-2xl sm:rounded-3xl overflow-hidden group cursor-pointer shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-red-50 group-hover:from-orange-100 group-hover:to-red-100 transition-all duration-500" />

              {/* Border Glow Effect */}
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
              <div className="absolute inset-[1px] rounded-2xl sm:rounded-3xl bg-white" />

              {/* Content with tight spacing for mobile */}
              {/* Content with tight spacing for mobile */}
              <div className="relative h-full flex flex-col p-3 sm:p-4 md:p-5">
                {/* Student Image - Larger height for mobile */}
                <div className="flex justify-center mb-1 flex-shrink-0">
                  <div className="relative">
                    <div className="w-20 h-28 sm:w-24 sm:h-28 md:w-28 md:h-32 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-4 border-white shadow-md sm:shadow-lg bg-white">
                      <FadeInImage
                        src={item.img}
                        alt={item.name}
                        className={`w-full h-full object-contain ${item.scaleClass || 'scale-110'}`}
                        priority={true} // High priority for Hero section
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                      <span className="text-white text-[10px] sm:text-xs font-bold">
                        #{index + 1}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Student Info - Very compact for mobile */}
                <div className="text-center mb-1 flex-1">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-800 mb-0 leading-tight">
                    {item.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                    {item.exam}
                  </p>
                </div>

                {/* Rank/Score Display - Tight spacing */}
                <div className="mt-auto flex-shrink-0">
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl text-center shadow-md">
                    <p className="text-[10px] sm:text-xs font-semibold opacity-90 mb-0.5">
                      {item.desc}
                    </p>
                    <p className="text-sm sm:text-base font-bold leading-none">
                      {item.rank}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </Slider>

      {/* Mobile Navigation Help Text - Compact */}
      {/* <div className="text-center mt-2 block md:hidden">
        <p className="text-[10px] text-slate-500">Swipe for more →</p>
      </div> */}
    </div>
  );
};
