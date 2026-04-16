"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
  CheckCircle,
} from "lucide-react";
import GlowCard from "@/components/ui/GlowCard";

const contactInfo = [
  {
    icon: MapPin,
    title: "地址",
    content: "北京市朝阳区艺术中心路1号\n智慧大剧院",
    color: "var(--color-primary)",
  },
  {
    icon: Phone,
    title: "电话",
    content: "票务热线：400-888-9999\n商务合作：010-8888-6666",
    color: "var(--color-accent)",
  },
  {
    icon: Mail,
    title: "邮箱",
    content: "票务咨询：tickets@smart-theater.cn\n商务合作：biz@smart-theater.cn",
    color: "var(--color-cyan)",
  },
  {
    icon: Clock,
    title: "营业时间",
    content: "售票窗口：09:00 - 20:00\n演出日延长至散场后30分钟",
    color: "var(--color-primary-light)",
  },
];

export default function ContactPage() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("http://localhost:8070/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }).then(r => r.json());
      setSubmitted(true);
      setTimeout(() => { setSubmitted(false); setFormData({ name: "", email: "", subject: "", message: "" }); }, 3000);
    } catch {
      alert("发送失败，请稍后重试");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-[var(--color-primary-light)] mb-2 block">
            Contact Us
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            联系<span className="gradient-text">我们</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] max-w-lg mx-auto">
            无论是票务咨询、商务合作还是媒体采访，
            我们期待与您建立联系
          </p>
        </motion.div>

        {/* Contact cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
        >
          {contactInfo.map((info, i) => (
            <motion.div
              key={info.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
            >
              <GlowCard className="p-5 h-full" glowColor={info.color}>
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: `${info.color}20` }}
                >
                  <info.icon className="w-5 h-5" style={{ color: info.color }} />
                </div>
                <h3 className="font-semibold mb-2">{info.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-line leading-relaxed">
                  {info.content}
                </p>
              </GlowCard>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="glass rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[var(--color-primary-light)]" />
                发送消息
              </h2>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">发送成功！</h3>
                  <p className="text-[var(--color-text-secondary)]">
                    我们会尽快回复您的消息
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">
                        姓名 *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)]/50 focus:shadow-lg focus:shadow-[var(--color-glow-purple)]/20 transition-all duration-300"
                        placeholder="您的姓名"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">
                        邮箱 *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)]/50 focus:shadow-lg focus:shadow-[var(--color-glow-purple)]/20 transition-all duration-300"
                        placeholder="you@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">
                      主题
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)]/50 focus:shadow-lg focus:shadow-[var(--color-glow-purple)]/20 transition-all duration-300"
                      placeholder="咨询主题"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">
                      消息 *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-xl text-sm resize-none focus:outline-none focus:border-[var(--color-primary)]/50 focus:shadow-lg focus:shadow-[var(--color-glow-purple)]/20 transition-all duration-300"
                      placeholder="请详细描述您的需求..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white font-semibold hover:shadow-lg hover:shadow-[var(--color-glow-purple)] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    发送消息
                  </button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Map placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="glass rounded-2xl overflow-hidden h-full min-h-[400px] relative">
              {/* Decorative map */}
              <div className="absolute inset-0 bg-[var(--color-bg-deep)]">
                {/* Grid lines */}
                <svg className="w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-primary)" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Location marker */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center shadow-lg shadow-[var(--color-glow-purple)]">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                  </motion.div>
                  <div className="mt-3 glass rounded-lg px-4 py-2 text-center">
                    <p className="text-sm font-semibold">智慧大剧院</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      北京市朝阳区艺术中心路1号
                    </p>
                  </div>

                  {/* Pulse rings */}
                  {[1, 2, 3].map((ring) => (
                    <motion.div
                      key={ring}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-primary)]"
                      initial={{ width: 20, height: 20, opacity: 0.6 }}
                      animate={{
                        width: [20, 120 * ring],
                        height: [20, 120 * ring],
                        opacity: [0.6, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: ring * 0.8,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                </div>

                {/* Decorative dots */}
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-[var(--color-primary)]/30"
                    style={{
                      left: `${10 + ((i * 37 + 13) % 80)}%`,
                      top: `${10 + ((i * 53 + 7) % 80)}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
