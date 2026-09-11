import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Bookmark,
  Sun,
} from 'lucide-react';
import {
  getCurrentIndiaTime,
  getCurrentIndiaDate,
  getFestivalsForMonth,
  getFestivalsForDate,
  FestivalRecord,
  IndiaTimeInfo,
  IndiaDateInfo,
} from '../services/IndiaTimeAndFestivalService';

interface MyraaCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskMyraa?: (prompt: string) => void;
}

export const MyraaCalendarModal: React.FC<MyraaCalendarModalProps> = ({
  isOpen,
  onClose,
  onAskMyraa,
}) => {
  // Live IST Time & Date
  const [istTime, setIstTime] = useState<IndiaTimeInfo>(() => getCurrentIndiaTime());
  const [istDate, setIstDate] = useState<IndiaDateInfo>(() => getCurrentIndiaDate());

  // Browsed Year & Month (1-12)
  const [viewYear, setViewYear] = useState<number>(() => getCurrentIndiaDate().year);
  const [viewMonth, setViewMonth] = useState<number>(() => getCurrentIndiaDate().month);

  // Selected date on calendar (1-31)
  const [selectedDay, setSelectedDay] = useState<number>(() => getCurrentIndiaDate().day);

  // Update live clock every second while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const timer = window.setInterval(() => {
      setIstTime(getCurrentIndiaTime());
      setIstDate(getCurrentIndiaDate());
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Reset to current month on open
  useEffect(() => {
    if (isOpen) {
      const today = getCurrentIndiaDate();
      setViewYear(today.year);
      setViewMonth(today.month);
      setSelectedDay(today.day);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Month navigation
  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
    setSelectedDay(1);
  };

  const handleJumpToToday = () => {
    const today = getCurrentIndiaDate();
    setViewYear(today.year);
    setViewMonth(today.month);
    setSelectedDay(today.day);
  };

  // Month Names
  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const MONTH_NAMES_TELUGU = [
    'జనవరి', 'ఫిబ్రవరి', 'మార్చి', 'ఏప్రిల్', 'మే', 'జూన్',
    'జూలై', 'ఆగస్టు', 'సెప్టెంబర్', 'అక్టోబర్', 'నవంబర్', 'డిసెంబర్'
  ];
  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate calendar grid days
  // First day of month (0 = Sunday, 1 = Monday, ...)
  const firstDayOfMonth = new Date(viewYear, viewMonth - 1, 1).getDay();
  // Total days in month
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();

  // Festivals in current viewed month
  const monthFestivals = getFestivalsForMonth(viewYear, viewMonth);

  // Festivals on currently selected day
  const selectedDayFestivals: FestivalRecord[] = getFestivalsForDate(viewYear, viewMonth, selectedDay);

  const isBrowsingCurrentMonth =
    viewYear === istDate.year && viewMonth === istDate.month;

  return (
    <AnimatePresence>
      <div
        id="myraa-calendar-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          id="myraa-calendar-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-slate-950/95 border border-cyan-500/25 rounded-3xl shadow-[0_15px_60px_rgba(0,0,0,0.85)] flex flex-col max-h-[90vh] overflow-hidden text-slate-100"
        >
          {/* 1. Modal Header with IST Live Clock */}
          <div className="px-5 pt-4 pb-3 border-b border-slate-800/80 flex items-start justify-between bg-slate-900/40">
            <div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm sm:text-base font-semibold tracking-wide text-slate-100">
                  Indian Calendar & Festivals
                </h2>
              </div>

              {/* Real-time Indian Standard Time indicator */}
              <div className="flex items-center gap-2 mt-1 font-mono text-[11px] text-slate-300">
                <span className="flex items-center gap-1 text-cyan-300">
                  <Clock className="w-3 h-3 text-cyan-400 animate-pulse" />
                  <span className="font-semibold">{istTime.formatted12WithSec}</span>
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">IST (Asia/Kolkata)</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{istDate.dayOfWeek}</span>
              </div>
            </div>

            <button
              id="myraa-calendar-close-btn"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
              aria-label="Close Calendar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 2. Scrollable Body: Calendar Controls, Grid & Festival Details */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-xs scrollbar-thin scrollbar-thumb-slate-800">
            {/* Month & Year Navigation Bar */}
            <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800/80">
              <div className="flex items-center gap-2">
                <button
                  id="calendar-prev-month-btn"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-semibold text-slate-100">
                    {MONTH_NAMES[viewMonth - 1]} {viewYear}
                  </span>
                  <span className="text-[10px] text-cyan-400/75 font-mono">
                    {MONTH_NAMES_TELUGU[viewMonth - 1]}
                  </span>
                </div>

                <button
                  id="calendar-next-month-btn"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Jump to Today button */}
              <button
                id="calendar-jump-today-btn"
                onClick={handleJumpToToday}
                disabled={isBrowsingCurrentMonth && selectedDay === istDate.day}
                className={`px-3 py-1 rounded-xl text-[11px] font-mono border transition-all cursor-pointer ${
                  isBrowsingCurrentMonth && selectedDay === istDate.day
                    ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300 opacity-60 cursor-default'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                Today ({istDate.day} {istDate.monthName.slice(0, 3)})
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-slate-900/40 p-3 rounded-2xl border border-slate-800/80">
              {/* Weekday Labels */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                {WEEKDAYS.map((wd, i) => (
                  <span
                    key={wd}
                    className={`text-[10px] font-mono uppercase tracking-wider ${
                      i === 0 ? 'text-rose-400/80' : 'text-slate-400'
                    }`}
                  >
                    {wd}
                  </span>
                ))}
              </div>

              {/* Month Day Cells */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {/* Empty cells before 1st of month */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-8 sm:h-9" />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const isCurrentDay = isBrowsingCurrentMonth && dayNum === istDate.day;
                  const isSelected = dayNum === selectedDay;

                  // Check if day has festival
                  const dayFests = monthFestivals.filter((f) => f.day === dayNum);
                  const hasFestival = dayFests.length > 0;

                  return (
                    <button
                      key={`day-${dayNum}`}
                      id={`calendar-day-${dayNum}`}
                      onClick={() => setSelectedDay(dayNum)}
                      className={`h-8 sm:h-9 rounded-xl flex flex-col items-center justify-center relative transition-all cursor-pointer text-xs font-medium ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                          : isCurrentDay
                          ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40'
                          : 'hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <span className={`${isCurrentDay ? 'font-bold' : ''}`}>
                        {dayNum}
                      </span>

                      {/* Festival Indicator Dot */}
                      {hasFestival && (
                        <span
                          title={dayFests.map((f) => f.festival.name).join(', ')}
                          className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.8)]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Date Information & Festival Details */}
            <div className="bg-slate-900/50 p-3.5 rounded-2xl border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-slate-100 text-xs sm:text-sm">
                    {selectedDay} {MONTH_NAMES[viewMonth - 1]} {viewYear}
                  </span>
                  {isBrowsingCurrentMonth && selectedDay === istDate.day && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                      TODAY
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(viewYear, viewMonth - 1, selectedDay).toLocaleDateString('en-US', { weekday: 'long' })}
                </span>
              </div>

              {selectedDayFestivals.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {selectedDayFestivals.map((fest) => {
                    const dateDetails = fest.datesByYear[viewYear];
                    return (
                      <div
                        key={fest.id}
                        className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200/90 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span className="font-semibold text-slate-100 text-xs">
                              {fest.name}
                            </span>
                            <span className="text-[11px] text-amber-300 font-mono">
                              ({fest.teluguName})
                            </span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            {fest.category}
                          </span>
                        </div>

                        {dateDetails?.tithi && (
                          <div className="text-[11px] text-slate-300 font-mono">
                            <span className="text-amber-400/80">Tithi:</span> {dateDetails.tithi}
                          </div>
                        )}

                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {fest.significance}
                        </p>
                        <p className="text-[11px] text-amber-200/80 leading-relaxed font-sans">
                          {fest.significanceTelugu}
                        </p>

                        {onAskMyraa && (
                          <button
                            onClick={() => {
                              onAskMyraa(`When is ${fest.name} and what is its significance?`);
                              onClose();
                            }}
                            className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-200 text-[10px] font-mono transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            Ask MYRAA about {fest.name}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 py-1 flex items-center justify-between">
                  <span>No major festivals recorded for this date.</span>
                  {/* Clean foundation for future personal event notes as requested */}
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                    <Bookmark className="w-3 h-3 text-slate-600" />
                    Regular Day
                  </span>
                </div>
              )}
            </div>

            {/* List of All Festivals in Current Viewed Month */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase block">
                Festivals in {MONTH_NAMES[viewMonth - 1]} ({monthFestivals.length})
              </span>

              {monthFestivals.length > 0 ? (
                <div className="grid grid-cols-1 gap-1.5">
                  {monthFestivals.map((item) => (
                    <button
                      key={item.festival.id}
                      onClick={() => setSelectedDay(item.day)}
                      className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between transition-colors cursor-pointer ${
                        selectedDay === item.day
                          ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200'
                          : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-bold flex items-center justify-center">
                          {item.day}
                        </span>
                        <div>
                          <div className="font-medium text-xs text-slate-100 flex items-center gap-1.5">
                            <span>{item.festival.name}</span>
                            <span className="text-[10px] text-cyan-300/80 font-mono">
                              ({item.festival.teluguName})
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {item.dayOfWeek}{item.tithi ? ` • ${item.tithi}` : ''}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-slate-400">
                        {item.dateString}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 italic p-2 bg-slate-900/30 rounded-xl">
                  No major festival dates in {MONTH_NAMES[viewMonth - 1]} {viewYear}.
                </p>
              )}
            </div>
          </div>

          {/* 3. Modal Footer */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400 font-mono">
              India Standard Time • UTC +05:30
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
