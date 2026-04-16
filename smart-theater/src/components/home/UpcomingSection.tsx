"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import { getUpcomingShows } from "@/data/shows";

export default function UpcomingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const upcoming = getUpcomingShows();

  return (
    <section ref={ref} className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-[var(--color-cyan-light)] mb-2 block">
            Coming Soon
          </span>
          <h2 className="text-3xl md:text-4xl font-bold">
            即将<span className="gradient-text">上演</span>
          </h2>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Center line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-cyan)]" />

          {upcoming.map((show, i) => (
            <motion.div
              key={show.id}
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className={`relative flex items-center mb-12 ${
                i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              } flex-row`}
            >
              {/* Dot */}
              <div className="absolute left-4 md:left-1/2 w-3 h-3 -translate-x-1.5 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] z-10 shadow-lg shadow-[var(--color-glow-purple)]" />

              {/* Card */}
              <div
                className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${
                  i % 2 === 0 ? "md:mr-auto md:pr-8" : "md:ml-auto md:pl-8"
                }`}
              >
                <Link href={`/show/${show.id}`}>
                  <div className="group glass rounded-xl overflow-hidden hover:border-[var(--color-primary)]/30 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row">
                      <div
                        className="sm:w-40 h-40 sm:h-auto overflow-hidden flex-shrink-0"
                        data-heart-cursor
                      >
                        <img
                          src={show.image}
                          alt={show.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4 flex-1">
                        <span className="text-xs text-[var(--color-cyan-light)] font-medium">
                          {show.category}
                        </span>
                        <h3 className="text-base font-semibold mt-1 mb-2 group-hover:text-[var(--color-primary-light)] transition-colors line-clamp-1">
                          {show.title}
                        </h3>
                        <div className="space-y-1 text-xs text-[var(--color-text-muted)]">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {show.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {show.venue}
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-sm font-semibold text-[var(--color-accent)]">
                            {show.price}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-[var(--color-primary-light)] group-hover:gap-2 transition-all">
                            了解详情 <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
