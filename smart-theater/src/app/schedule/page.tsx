"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Calendar as CalIcon } from "lucide-react";
import { shows } from "@/data/shows";
import Link from "next/link";

const MONTHS = [
  "一月", "二月", "三月", "四月", "五月", "六月",
  "七月", "八月", "九月", "十月", "十一月", "十二月",
];
const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function SchedulePage() {
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(3); // April (0-indexed)
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null);
  };

  // Get shows for a specific day
  const getShowsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return shows.filter((s) => s.date.includes(dateStr));
  };

  const selectedShows = selectedDay ? getShowsForDay(selectedDay) : [];

  return (
    <div className="min-h-screen pt-24 pb-16 px-6" ref={ref}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-[var(--color-primary-light)] mb-2 block">
            Schedule
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            演出<span className="gradient-text">日历</span>
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            查看每月精彩演出安排，提前锁定心仪场次
          </p>
        </motion.div>

        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass rounded-2xl p-6 md:p-8"
        >
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-[var(--color-bg-elevated)] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <AnimatePresence mode="wait">
              <motion.h2
                key={`${currentYear}-${currentMonth}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="text-2xl font-bold"
              >
                {currentYear}年 {MONTHS[currentMonth]}
              </motion.h2>
            </AnimatePresence>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-[var(--color-bg-elevated)] transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="text-center text-xs font-medium text-[var(--color-text-muted)] py-2"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayShows = getShowsForDay(day);
              const hasShows = dayShows.length > 0;
              const isSelected = selectedDay === day;

              return (
                <motion.button
                  key={day}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all duration-200 relative ${
                    isSelected
                      ? "bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] text-white shadow-lg shadow-[var(--color-glow-purple)]"
                      : hasShows
                      ? "bg-[var(--color-bg-elevated)] hover:bg-[var(--color-primary)]/10 text-[var(--color-text-primary)] border border-[var(--color-primary)]/20"
                      : "hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]"
                  }`}
                >
                  <span className="font-medium">{day}</span>
                  {hasShows && (
                    <div className="flex gap-0.5 mt-1">
                      {dayShows.slice(0, 3).map((_, j) => (
                        <div
                          key={j}
                          className={`w-1 h-1 rounded-full ${
                            isSelected
                              ? "bg-white"
                              : "bg-[var(--color-primary)]"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Selected day shows */}
        <AnimatePresence>
          {selectedDay && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 overflow-hidden"
            >
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CalIcon className="w-5 h-5 text-[var(--color-primary-light)]" />
                    {currentMonth + 1}月{selectedDay}日 演出
                  </h3>
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="p-1 rounded-lg hover:bg-[var(--color-bg-elevated)]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {selectedShows.length > 0 ? (
                  <div className="space-y-3">
                    {selectedShows.map((show) => (
                      <Link
                        key={show.id}
                        href={`/show/${show.id}`}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--color-bg-elevated)] transition-colors group"
                      >
                        {show.image ? (
                          <img
                            src={show.image}
                            alt={show.title}
                            className="w-16 h-16 rounded-lg object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-[var(--color-bg-elevated)] flex items-center justify-center text-[var(--color-text-muted)]">🎭</div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium group-hover:text-[var(--color-primary-light)] transition-colors">
                            {show.title}
                          </h4>
                          <p className="text-xs text-[var(--color-text-muted)]">
                            {show.venue} · {show.price}
                          </p>
                        </div>
                        <span className="text-xs text-[var(--color-accent)] font-medium">
                          {show.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-[var(--color-text-muted)] py-8">
                    当日暂无演出安排
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
            有演出
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]" />
            已选中
          </span>
        </div>
      </div>
    </div>
  );
}
