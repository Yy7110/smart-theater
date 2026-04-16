"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import GlowCard from "@/components/ui/GlowCard";
import { Award, Target, Eye, Heart } from "lucide-react";

const timeline = [
  {
    year: "2020",
    title: "梦想启航",
    desc: "智慧大剧院项目正式立项，集结全球顶尖建筑师与声学专家，开启打造未来剧院的征程。",
  },
  {
    year: "2021",
    title: "科技赋能",
    desc: "引入AI智能管理系统，建立5G+AR观演技术实验室，将前沿科技融入剧院每个角落。",
  },
  {
    year: "2022",
    title: "匠心呈现",
    desc: "主体建筑落成，全球首个Dolby Atmos沉浸式剧场空间调试完成，开始试运营。",
  },
  {
    year: "2023",
    title: "盛大开幕",
    desc: "智慧大剧院正式对公众开放，首演季汇聚30余场世界级演出，引发业界广泛关注。",
  },
  {
    year: "2024",
    title: "荣耀绽放",
    desc: "年度演出突破800场，累计观众超过300万人次，获评'亚太最具创新力文化场馆'。",
  },
  {
    year: "2025",
    title: "引领未来",
    desc: "全新沉浸式数字剧场启用，元宇宙观演平台上线，开创线上线下融合的新观演时代。",
  },
];

const team = [
  {
    name: "张明远",
    role: "艺术总监",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    desc: "前国家话剧院副院长，30年舞台艺术经验",
  },
  {
    name: "李雅琴",
    role: "技术总监",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b2ab?w=400&q=80",
    desc: "MIT媒体实验室访问学者，沉浸式技术专家",
  },
  {
    name: "王思远",
    role: "运营总监",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
    desc: "前大麦网高级总监，深耕票务行业15年",
  },
  {
    name: "陈芷若",
    role: "市场总监",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
    desc: "知名文化品牌策划人，多次获得金投赏金奖",
  },
];

const values = [
  { icon: Target, title: "使命", desc: "让每个人都能便捷地享受世界级的艺术演出体验" },
  { icon: Eye, title: "愿景", desc: "成为全球智慧剧院标杆，引领科技与艺术的融合创新" },
  { icon: Heart, title: "价值观", desc: "以观众为中心，以品质为基石，以创新为驱动" },
  { icon: Award, title: "承诺", desc: "每一场演出都经过严格甄选，确保世界级的艺术水准" },
];

export default function AboutPage() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);
  const isInView1 = useInView(timelineRef, { once: true, margin: "-100px" });
  const isInView2 = useInView(teamRef, { once: true, margin: "-100px" });
  const isInView3 = useInView(valuesRef, { once: true, margin: "-100px" });

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero */}
      <div className="px-6 text-center mb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-[var(--color-primary-light)] mb-2 block">
            About Us
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            关于<span className="gradient-text">我们</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed">
            智慧大剧院诞生于对艺术的热爱与对科技的信仰。
            我们相信，当最先进的技术遇见最纯粹的艺术，
            便能创造出超越时空的感动。
          </p>
        </motion.div>
      </div>

      {/* Values */}
      <section ref={valuesRef} className="px-6 mb-24">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView3 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <GlowCard className="p-6 text-center h-full">
                <v.icon className="w-8 h-8 mx-auto mb-4 text-[var(--color-primary-light)]" />
                <h3 className="text-lg font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">{v.desc}</p>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section ref={timelineRef} className="px-6 py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-primary)]/5 to-transparent" />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView1 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-[var(--color-accent-light)] mb-2 block">
              Our Story
            </span>
            <h2 className="text-3xl md:text-4xl font-bold">
              品牌<span className="gradient-text">故事</span>
            </h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-cyan)]" />

            {timeline.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                animate={isInView1 ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative flex items-start mb-12 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className="absolute left-8 md:left-1/2 w-4 h-4 -translate-x-2 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] z-10 shadow-lg shadow-[var(--color-glow-purple)] mt-1" />

                <div
                  className={`ml-16 md:ml-0 md:w-[calc(50%-2rem)] glass rounded-xl p-5 ${
                    i % 2 === 0 ? "md:mr-auto" : "md:ml-auto"
                  }`}
                >
                  <span className="text-2xl font-bold gradient-text">{item.year}</span>
                  <h3 className="text-lg font-semibold mt-1 mb-2">{item.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section ref={teamRef} className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView2 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-[var(--color-cyan-light)] mb-2 block">
              Our Team
            </span>
            <h2 className="text-3xl md:text-4xl font-bold">
              核心<span className="gradient-text">团队</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView2 ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <GlowCard className="overflow-hidden group">
                  <div className="h-56 overflow-hidden" data-heart-cursor>
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-sm text-[var(--color-primary-light)] mb-2">
                      {member.role}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {member.desc}
                    </p>
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-8">
            合作<span className="gradient-text">伙伴</span>
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center">
            {[
              "国家大剧院",
              "中国爱乐乐团",
              "上海交响乐团",
              "北京人民艺术剧院",
              "中央芭蕾舞团",
              "大麦网",
            ].map((name) => (
              <motion.div
                key={name}
                whileHover={{ scale: 1.05 }}
                className="glass rounded-xl p-4 text-center"
              >
                <span className="text-xs text-[var(--color-text-muted)] font-medium">
                  {name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
