"use client";

import Link from "next/link";
import { Sparkles, Mail, MapPin, Phone } from "lucide-react";

const footerLinks = [
  {
    title: "演出",
    links: [
      { label: "全部演出", href: "/shows" },
      { label: "演唱会", href: "/shows?cat=演唱会" },
      { label: "话剧歌剧", href: "/shows?cat=话剧歌剧" },
      { label: "音乐会", href: "/shows?cat=音乐会" },
    ],
  },
  {
    title: "关于",
    links: [
      { label: "剧院介绍", href: "/venue" },
      { label: "演出日历", href: "/schedule" },
      { label: "关于我们", href: "/about" },
      { label: "联系我们", href: "/contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-[var(--color-border)] bg-[var(--color-bg-deep)]">
      {/* Gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                <span className="gradient-text">智慧</span>大剧院
              </span>
            </Link>
            <p className="text-[var(--color-text-secondary)] max-w-sm mb-6 text-sm leading-relaxed">
              以科技赋能艺术，以创新点亮舞台。智慧大剧院致力于为观众带来最前沿的视听体验，
              让每一场演出都成为难忘的记忆。
            </p>
            <div className="flex flex-col gap-2 text-sm text-[var(--color-text-muted)]">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> 北京市朝阳区艺术中心路1号
              </span>
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> 400-888-9999
              </span>
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> info@smart-theater.cn
              </span>
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">
                {group.title}
              </h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary-light)] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-[var(--color-border)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--color-text-muted)]">
            &copy; 2026 智慧大剧院. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["微信", "微博", "抖音", "小红书"].map((name) => (
              <span
                key={name}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary-light)] cursor-pointer transition-colors"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
