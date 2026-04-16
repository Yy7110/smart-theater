"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import GlowCard from "@/components/ui/GlowCard";
import { getFeaturedShows } from "@/data/shows";

export default function FeaturedShows() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const featured = getFeaturedShows();

  return (
    <section ref={ref} className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-[var(--color-primary-light)] mb-2 block">
              Featured Shows
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)]">
              精选<span className="gradient-text">演出</span>
            </h2>
          </div>
          <Link
            href="/shows"
            className="hidden md:flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary-light)] transition-colors group"
          >
            查看全部
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((show, i) => (
            <motion.div
              key={show.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <Link href={`/show/${show.id}`}>
                <GlowCard className="group h-full">
                  {/* Image */}
                  <div
                    className="relative h-64 overflow-hidden"
                    data-heart-cursor
                  >
                    <motion.img
                      src={show.image}
                      alt={show.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-card)] via-transparent to-transparent" />
                    {/* Status badge */}
                    <div className="absolute top-4 left-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${
                          show.status === "热销中"
                            ? "bg-[var(--color-accent)]/20 text-[var(--color-accent-light)] border border-[var(--color-accent)]/30"
                            : show.status === "已售罄"
                            ? "bg-[var(--color-text-muted)]/20 text-[var(--color-text-muted)] border border-[var(--color-text-muted)]/30"
                            : "bg-[var(--color-cyan)]/20 text-[var(--color-cyan-light)] border border-[var(--color-cyan)]/30"
                        }`}
                      >
                        {show.status}
                      </span>
                    </div>
                    {/* Category */}
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary-light)] border border-[var(--color-primary)]/30 backdrop-blur-sm">
                        {show.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2 group-hover:text-[var(--color-primary-light)] transition-colors line-clamp-1">
                      {show.title}
                    </h3>
                    {show.artist && (
                      <p className="text-sm text-[var(--color-primary-light)] mb-2">
                        {show.artist}
                      </p>
                    )}
                    <p className="text-sm text-[var(--color-text-secondary)] mb-4 line-clamp-2">
                      {show.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {show.date.split(" ")[0]}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {show.city}
                      </span>
                      <span className="font-semibold text-[var(--color-accent)]">
                        {show.price}
                      </span>
                    </div>
                  </div>
                </GlowCard>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile view all */}
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/shows"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-primary-light)]"
          >
            查看全部演出 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
