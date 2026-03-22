import React, { useEffect, useState } from 'react';

// Seat counter config
const SEAT_START = 2564;
const DECREASE_PER_DAY = 3;
// Launch date — the day count starts from (set to today: 2026-03-22)
const LAUNCH_DATE = new Date('2026-03-22T00:00:00+05:30');

const getSeatsLeft = () => {
  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysSinceLaunch = Math.floor((now - LAUNCH_DATE) / msPerDay);
  const totalDecrease = (daysSinceLaunch * DECREASE_PER_DAY);
  // Cycle: when seats hit 0, restart from SEAT_START
  const cycleLength = Math.ceil(SEAT_START / DECREASE_PER_DAY); // days per full cycle
  const dayInCycle = daysSinceLaunch % cycleLength;
  return Math.max(SEAT_START - dayInCycle * DECREASE_PER_DAY, DECREASE_PER_DAY);
};

const Ribbon = () => {
  const INITIAL_SECONDS = 172800 - (7 * 60 + 27);
  const [timeLeft, setTimeLeft] = useState(INITIAL_SECONDS);
  const [seatsLeft, setSeatsLeft] = useState(getSeatsLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) return INITIAL_SECONDS;
        return prev - 1;
      });
    }, 1000);

    // Refresh seat count at midnight
    const seatRefresh = setInterval(() => {
      setSeatsLeft(getSeatsLeft());
    }, 60 * 1000); // check every minute (catches midnight)

    return () => {
      clearInterval(timer);
      clearInterval(seatRefresh);
    };
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 py-2.5 px-4 text-white text-center shadow-lg relative z-[60] font-sans sticky top-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
        {/* Invisible spacer to perfectly center the middle text on large screens */}
        <div className="hidden lg:block lg:w-40" />

        {/* Center content */}
        <div className="flex flex-row flex-wrap items-center justify-center gap-x-2.5 gap-y-1 font-bold tracking-tight text-[10.5px] sm:text-[13px] flex-1">
          <span className="flex items-center gap-1 uppercase tracking-wider">
            <span className="text-xs sm:text-sm">⌛</span> 
            <span className="hidden sm:inline">Limited Launch Window</span>
          </span>
          
          <span className="hidden sm:inline opacity-50">•</span>
          
          <span className="tabular-nums">Ends in {formatTime(timeLeft)}</span>
          
          <span className="opacity-50">•</span>
          
          <span className="font-black underline decoration-white/30 underline-offset-2 sm:underline-offset-4">
            <span className="hidden sm:inline">Only </span>{seatsLeft.toLocaleString('en-IN')} seats left<span className="hidden sm:inline"> at launch pricing</span>
          </span>

          {/* Mobile-only inline link */}
          <span className="sm:hidden opacity-50">•</span>
          <a
            href="https://pathfinder.edu.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="sm:hidden flex items-center gap-1 text-white font-black hover:text-white/80 transition-colors whitespace-nowrap"
          >
            Main Site ↗
          </a>
        </div>

        {/* Desktop-only right-aligned link */}
        <a
          href="https://pathfinder.edu.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex lg:w-40 justify-end items-center gap-1 text-white font-black text-[13px] hover:text-white/80 transition-colors whitespace-nowrap tracking-wide"
        >
          Visit our Website ↗
        </a>
      </div>
    </div>
  );
};

export default Ribbon;
