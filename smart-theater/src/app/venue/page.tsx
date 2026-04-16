"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  Volume2,
  Wifi,
  Monitor,
  Armchair,
  Sparkles,
  Theater,
  Music,
  Users,
} from "lucide-react";
import GlowCard from "@/components/ui/GlowCard";

const facilities = [
  {
    icon: Theater,
    title: "主剧场",
    desc: "2000座国际标准歌剧院，配备全球顶级声学系统",
    color: "var(--color-primary)",
  },
  {
    icon: Music,
    title: "音乐厅",
    desc: "800座专业音乐厅，为交响乐和室内乐量身定制",
    color: "var(--color-accent)",
  },
  {
    icon: Monitor,
    title: "多功能厅",
    desc: "400座灵活空间，支持话剧、舞蹈、实验剧等多种演出形式",
    color: "var(--color-cyan)",
  },
  {
    icon: Sparkles,
    title: "沉浸式剧场",
    desc: "360度全景投影空间，打造身临其境的观演体验",
    color: "var(--color-primary-light)",
  },
  {
    icon: Volume2,
    title: "杜比全景声",
    desc: "全球领先的Dolby Atmos音频系统，声临其境",
    color: "var(--color-accent-light)",
  },
  {
    icon: Wifi,
    title: "5G智慧网络",
    desc: "全覆盖5G网络，支持AR导览和实时互动",
    color: "var(--color-cyan-light)",
  },
  {
    icon: Armchair,
    title: "VIP贵宾厅",
    desc: "独立入场通道、专属休息室及定制化观演服务",
    color: "var(--color-primary)",
  },
  {
    icon: Users,
    title: "艺术教育中心",
    desc: "面向公众的艺术教育空间，大师班与工作坊常年开放",
    color: "var(--color-accent)",
  },
];

const milestones = [
  { year: "2020", event: "智慧大剧院奠基仪式" },
  { year: "2022", event: "主体建筑封顶，声学系统安装完成" },
  { year: "2023", event: "正式开幕，首演季启动" },
  { year: "2024", event: "年度演出突破800场，观众超300万人次" },
  { year: "2025", event: "荣获\"亚太最佳智慧剧院\"称号" },
  { year: "2026", event: "全新沉浸式剧场投入运营" },
];

export default function VenuePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const facilitiesRef = useRef<HTMLDivElement>(null);
  const milestonesRef = useRef<HTMLDivElement>(null);
  const isInView1 = useInView(facilitiesRef, { once: true, margin: "-100px" });
  const isInView2 = useInView(milestonesRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div ref={heroRef} className="relative h-[80vh] overflow-hidden flex items-center justify-center">
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="absolute inset-0"
        >
          <img
            src="https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1600&q=80"
            alt="Theater"
            className="w-full h-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-deep)] via-[var(--color-bg-deep)]/60 to-[var(--color-bg-deep)]/30" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10 text-center px-6"
        >
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-[var(--color-primary-light)] mb-4 block">
            Our Venue
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            探索<span className="gradient-text">剧院</span>
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            一座融合顶级声学设计与前沿科技的现代化智慧剧院，
            为艺术创造无限可能
          </p>
        </motion.div>
      </div>

      {/* Stats bar */}
      <div className="relative -mt-16 z-10 max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { label: "建筑面积", value: "85,000m²" },
            { label: "剧场数量", value: "4个" },
            { label: "总座位数", value: "3,600席" },
            { label: "停车位", value: "1,200个" },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold gradient-text">{item.value}</div>
              <div className="text-xs text-[var(--color-text-muted)] mt-1">{item.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Facilities */}
      <section ref={facilitiesRef} className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView1 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-[var(--color-cyan-light)] mb-2 block">
              Facilities
            </span>
            <h2 className="text-3xl md:text-4xl font-bold">
              剧院<span className="gradient-text">设施</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView1 ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <GlowCard className="p-6 h-full group" glowColor={f.color}>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `${f.color}20` }}
                  >
                    <f.icon className="w-6 h-6" style={{ color: f.color }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    {f.desc}
                  </p>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section ref={milestonesRef} className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-primary)]/5 to-transparent" />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView2 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-[var(--color-accent-light)] mb-2 block">
              Milestones
            </span>
            <h2 className="text-3xl md:text-4xl font-bold">
              发展<span className="gradient-text">历程</span>
            </h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-accent)]" />

            {milestones.map((m, i) => (
              <motion.div
                key={m.year}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                animate={isInView2 ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className={`relative flex items-center mb-10 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className="absolute left-8 md:left-1/2 w-4 h-4 -translate-x-2 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] z-10 shadow-lg shadow-[var(--color-glow-purple)]" />

                <div
                  className={`ml-16 md:ml-0 md:w-[calc(50%-2rem)] glass rounded-xl p-5 ${
                    i % 2 === 0 ? "md:mr-auto md:text-right" : "md:ml-auto md:text-left"
                  }`}
                >
                  <span className="text-2xl font-bold gradient-text">{m.year}</span>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                    {m.event}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
