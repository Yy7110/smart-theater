"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Ticket, QrCode, ChevronDown, ChevronUp } from "lucide-react";
import { userApi } from "@/lib/userApi";
import { useAuthStore } from "@/lib/authStore";

export default function TicketsPage() {
  const router = useRouter();
  const { token, isLoggedIn, init } = useAuthStore();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    if (!isLoggedIn) { router.push("/login"); return; }
    if (token) {
      userApi.getTickets(token).then(setTickets).catch(() => {}).finally(() => setLoading(false));
    }
  }, [token, isLoggedIn, router]);

  const statusMap: Record<string, { label: string; cls: string }> = {
    VALID: { label: "待使用", cls: "bg-green-500/20 text-green-400" },
    VERIFIED: { label: "已验证", cls: "bg-blue-500/20 text-blue-400" },
    EXPIRED: { label: "已过期", cls: "bg-gray-500/20 text-gray-400" },
    REFUNDED: { label: "已退款", cls: "bg-red-500/20 text-red-400" },
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-8">
          <Ticket className="w-6 h-6 text-[var(--color-primary-light)]" />
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">我的票夹</h1>
        </motion.div>

        {loading ? <div className="text-[var(--color-text-muted)]">加载中...</div> : tickets.length === 0 ? (
          <div className="text-center py-16">
            <Ticket className="w-16 h-16 text-[var(--color-text-muted)] mx-auto mb-4 opacity-30" />
            <p className="text-[var(--color-text-muted)]">暂无票据</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket, i) => {
              const st = statusMap[ticket.ticketStatus] || { label: ticket.ticketStatus, cls: "bg-gray-500/20 text-gray-400" };
              const isExpanded = expanded === ticket.ticketNo;
              return (
                <motion.div key={ticket.ticketNo} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="glass rounded-xl overflow-hidden">
                  <button onClick={() => setExpanded(isExpanded ? null : ticket.ticketNo)} className="w-full p-5 flex items-center gap-4 text-left">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{ticket.showTitle}</div>
                      <div className="text-xs text-[var(--color-text-muted)] mt-1">{ticket.scheduleDate} {ticket.scheduleTime} · {ticket.seatLabel}</div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${st.cls}`}>{st.label}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-[var(--color-text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />}
                  </button>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="px-5 pb-5 border-t border-[var(--color-border)]">
                      <div className="flex items-start gap-6 pt-4">
                        {ticket.qrCodeBase64 ? (
                          <img src={ticket.qrCodeBase64} alt="QR" className="w-40 h-40 rounded-lg flex-shrink-0" />
                        ) : (
                          <div className="w-40 h-40 rounded-lg bg-[var(--color-bg-elevated)] flex items-center justify-center flex-shrink-0">
                            <QrCode className="w-12 h-12 text-[var(--color-text-muted)]" />
                          </div>
                        )}
                        <div className="space-y-2 text-sm">
                          <div><span className="text-[var(--color-text-muted)]">票据编号</span><div className="font-mono text-[var(--color-primary-light)]">{ticket.ticketNo}</div></div>
                          <div><span className="text-[var(--color-text-muted)]">场馆</span><div className="text-[var(--color-text-primary)]">{ticket.venue}</div></div>
                          <div><span className="text-[var(--color-text-muted)]">座位</span><div className="text-[var(--color-text-primary)]">{ticket.seatLabel} ({ticket.seatType})</div></div>
                          <div><span className="text-[var(--color-text-muted)]">票价</span><div className="text-[var(--color-accent)]">¥{ticket.price}</div></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
