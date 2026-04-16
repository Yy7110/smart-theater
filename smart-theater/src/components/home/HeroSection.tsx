"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";

const ParticleField = dynamic(
  () => import("@/components/three/ParticleField"),
  { ssr: false }
);

const titles = ["智慧大剧院", "SMART THEATER"];

export default function HeroSection() {
  const [titleIndex, setTitleIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const fullText = titles[titleIndex];
    let idx = 0;
    setDisplayText("");
    setIsTyping(true);

    const typeInterval = setInterval(() => {
      if (idx <= fullText.length) {
        setDisplayText(fullText.slice(0, idx));
        idx++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        setTimeout(() => {
          setTitleIndex((prev) => (prev + 1) % titles.length);
        }, 3000);
      }
    }, 120);

    return () => clearInterval(typeInterval);
  }, [titleIndex]);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* 3D Particle Background */}
      <ParticleField className="z-0" />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-deep)]/60 via-transparent to-[var(--color-bg-deep)] z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/10 via-transparent to-[var(--color-accent)]/10 z-[1]" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="inline-block px-4 py-1.5 text-xs font-medium tracking-[0.2em] uppercase text-[var(--color-primary-light)] border border-[var(--color-primary)]/30 rounded-full mb-8 backdrop-blur-sm">
            以科技赋能艺术 · 以创新点亮舞台
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight"
        >
          <span className="gradient-text">{displayText}</span>
          <span
            className={`inline-block w-1 h-[0.8em] ml-1 align-middle bg-[var(--color-primary-light)] ${
              isTyping ? "animate-pulse" : "opacity-0"
            }`}
          />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          汇聚全球顶级演出，沉浸式科技体验，
          <br className="hidden md:block" />
          让每一次观演都成为一场穿越时空的艺术之旅
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex items-center justify-center gap-4"
        >
          <a
            href="/shows"
            className="relative inline-flex items-center px-8 py-3.5 text-sm font-semibold text-white rounded-full overflow-hidden group"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]" />
            <span className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ boxShadow: "0 0 40px var(--color-glow-purple)" }} />
            <span className="relative">探索演出</span>
          </a>
          <a
            href="/venue"
            className="inline-flex items-center px-8 py-3.5 text-sm font-semibold text-[var(--color-text-primary)] rounded-full border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5 transition-all duration-300"
          >
            了解剧院
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-[var(--color-text-muted)] tracking-widest uppercase">
          向下滚动
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-[var(--color-text-muted)]" />
        </motion.div>
      </motion.div>
    </section>
  );
}
