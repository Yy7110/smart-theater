"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { Search, Calendar, MapPin } from "lucide-react";
import GlowCard from "@/components/ui/GlowCard";
import { apiRequest } from "@/lib/api";

export default function ShowsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [shows, setShows] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    Promise.all([
      apiRequest<any[]>('/api/public/categories'),
      apiRequest<any>('/api/public/shows?page=1&size=100')
    ]).then(([cats, showsRes]) => {
      setCategories([{ id: 'all', name: '全部', icon: '🎭' }, ...cats.map((c: any) => ({ id: c.name, name: c.name, icon: c.icon }))]);
      setShows(showsRes.records || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = shows.filter((show) => {
    const matchCat = activeCategory === "all" || show.category === activeCategory;
    const matchSearch = !searchQuery || show.title.toLowerCase().includes(searchQuery.toLowerCase()) || show.artist?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-[var(--color-primary-light)] mb-2 block">
            All Shows
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            全部<span className="gradient-text">演出</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] max-w-lg mx-auto">
            探索我们精心策划的演出季，找到属于你的那场艺术盛宴
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-xl mx-auto mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索演出、艺术家..."
              className="w-full pl-12 pr-4 py-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)]/50 focus:shadow-lg focus:shadow-[var(--color-glow-purple)] transition-all duration-300"
            />
          </div>
        </motion.div>

        {/* Category filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === cat.id
                  ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white shadow-lg shadow-[var(--color-glow-purple)]"
                  : "bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 hover:text-[var(--color-text-primary)]"
              }`}
            >
              <span className="mr-1.5">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-20 text-[var(--color-text-muted)]">加载中...</div>
          ) : filtered.map((show, i) => (
            <motion.div
              key={show.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              layout
            >
              <Link href={`/show/${show.id}`}>
                <GlowCard className="group h-full">
                  <div className="relative h-56 overflow-hidden" data-heart-cursor>
                    {show.image ? (
                      <motion.img
                        src={show.image}
                        alt={show.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-[var(--color-bg-elevated)] flex items-center justify-center text-[var(--color-text-muted)] text-4xl">🎭</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-card)] via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-medium rounded-full backdrop-blur-sm ${
                          show.status === "热销中"
                            ? "bg-[var(--color-accent)]/20 text-[var(--color-accent-light)] border border-[var(--color-accent)]/30"
                            : show.status === "已售罄"
                            ? "bg-[var(--color-text-muted)]/20 text-[var(--color-text-muted)]"
                            : show.status === "展出中"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-[var(--color-cyan)]/20 text-[var(--color-cyan-light)] border border-[var(--color-cyan)]/30"
                        }`}
                      >
                        {show.status}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex flex-wrap gap-1.5">
                        {show.tags?.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-[10px] rounded-full bg-white/10 text-white/70 backdrop-blur-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-[var(--color-primary-light)] font-medium mb-1">
                      {show.category}
                    </div>
                    <h3 className="text-base font-semibold mb-1 group-hover:text-[var(--color-primary-light)] transition-colors line-clamp-1">
                      {show.title}
                    </h3>
                    {show.artist && (
                      <p className="text-sm text-[var(--color-accent-light)] mb-2">
                        {show.artist}
                      </p>
                    )}
                    <p className="text-xs text-[var(--color-text-secondary)] mb-3 line-clamp-2">
                      {show.description}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {show.date || '待定'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {show.city || show.venue || '待定'}
                      </span>
                      <span className="font-bold text-[var(--color-accent)] text-xs">
                        {show.price || '待定'}
                      </span>
                    </div>
                  </div>
                </GlowCard>
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-[var(--color-text-muted)]">
            <p className="text-xl mb-2">没有找到相关演出</p>
            <p className="text-sm">试试其他搜索关键词或分类</p>
          </div>
        )}
      </div>
    </div>
  );
}
