"use client";

import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Ticket, Tag, Clock } from "lucide-react";
import { publicApi } from "@/lib/userApi";
import { useAuthStore } from "@/lib/authStore";

export default function ShowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isLoggedIn, user } = useAuthStore();
  const [show, setShow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);

  useEffect(() => {
    publicApi.getShowDetail(Number(id))
      .then(setShow)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleBuy = () => {
    if (!selectedSchedule) { alert("请先选择场次"); return; }
    if (!isLoggedIn || !user) { router.push("/login"); return; }
    router.push(`/show/${id}/seats?schedule=${selectedSchedule.id}`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[var(--color-text-muted)]">加载中...</div>;
  if (!show) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">演出不存在</h1>
        <Link href="/shows" className="text-[var(--color-primary-light)] hover:underline">返回演出列表</Link>
      </div>
    </div>
  );

  const schedules = show.schedules || [];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-[50vh] overflow-hidden">
        {show.image && <img src={show.image} alt={show.title} className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-deep)] via-[var(--color-bg-deep)]/60 to-transparent" />
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="absolute top-24 left-6 z-10">
          <Link href="/shows" className="flex items-center gap-2 px-4 py-2 glass rounded-full text-sm text-[var(--color-text-secondary)] hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />返回列表
          </Link>
        </motion.div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary-light)] border border-[var(--color-primary)]/30">{show.category}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-2">{show.title}</h1>
              {show.artist && <p className="text-xl text-[var(--color-primary-light)] font-medium">{show.artist}</p>}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">演出介绍</h2>
            <p className="text-[var(--color-text-secondary)] leading-relaxed mb-8">{show.description}</p>

            {show.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {show.tags.map((tag: string) => (
                  <span key={tag} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                    <Tag className="w-3 h-3" />{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Schedule selector */}
            {schedules.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">选择场次</h3>
                <div className="space-y-3">
                  {schedules.map((s: any) => {
                    const isSelected = selectedSchedule?.id === s.id;
                    const available = s.availableTickets > 0;
                    return (
                      <button key={s.id} disabled={!available}
                        onClick={() => setSelectedSchedule(s)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                          isSelected ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10" :
                          available ? "border-[var(--color-border)] hover:border-[var(--color-primary)]/50" :
                          "border-[var(--color-border)] opacity-50 cursor-not-allowed"
                        }`}>
                        <div className="flex items-center gap-4">
                          <Calendar className="w-5 h-5 text-[var(--color-primary-light)]" />
                          <div className="text-left">
                            <div className="text-sm font-medium text-[var(--color-text-primary)]">{s.showDate} {s.showTime?.slice(0,5)}</div>
                            {s.endTime && <div className="text-xs text-[var(--color-text-muted)]">至 {s.endTime.slice(0,5)}</div>}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-[var(--color-text-secondary)]">
                            {available ? `余票 ${s.availableTickets}` : "已售罄"}
                          </div>
                          {s.prices?.length > 0 && (
                            <div className="text-xs text-[var(--color-accent)]">
                              ¥{Math.min(...s.prices.map((p: any) => p.price))} - ¥{Math.max(...s.prices.map((p: any) => p.price))}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="glass rounded-2xl p-6 sticky top-24">
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-5 h-5 text-[var(--color-primary-light)]" />
                  <div>
                    <div className="text-[var(--color-text-muted)] text-xs">演出场馆</div>
                    <div className="font-medium">{show.venueName || show.venue}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Ticket className="w-5 h-5 text-[var(--color-accent)]" />
                  <div>
                    <div className="text-[var(--color-text-muted)] text-xs">票价范围</div>
                    <div className="font-semibold text-[var(--color-accent)]">{show.price}</div>
                  </div>
                </div>
                {selectedSchedule && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-5 h-5 text-[var(--color-cyan)]" />
                    <div>
                      <div className="text-[var(--color-text-muted)] text-xs">已选场次</div>
                      <div className="font-medium">{selectedSchedule.showDate} {selectedSchedule.showTime?.slice(0,5)}</div>
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t border-[var(--color-border)] pt-6">
                <button onClick={handleBuy}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white font-semibold hover:shadow-lg hover:shadow-[var(--color-glow-purple)] transition-all duration-300 flex items-center justify-center gap-2">
                  <Ticket className="w-4 h-4" />
                  {selectedSchedule ? "选择票档" : "请先选择场次"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
