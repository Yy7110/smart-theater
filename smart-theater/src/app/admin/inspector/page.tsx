"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Keyboard, Camera, CheckCircle, XCircle, AlertTriangle, LogOut, Delete } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { inspectorApi } from "@/lib/adminApi";
import { useRouter } from "next/navigation";

type ResultType = "success" | "error" | "warning" | null;

export default function InspectorPage() {
  const { token, user, logout } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"scan" | "input">("scan");
  const [ticketNo, setTicketNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultType, setResultType] = useState<ResultType>(null);
  const [resultData, setResultData] = useState<any>(null);
  const [recentRecords, setRecentRecords] = useState<any[]>([]);

  const doVerify = async (no: string) => {
    if (!token || !no.trim()) return;
    setLoading(true);
    try {
      const res = await inspectorApi.verifyTicket(token, no.trim());
      if (res.result === "ALREADY_VERIFIED") {
        setResultType("warning");
        setResultData(res);
      } else {
        setResultType("success");
        setResultData(res);
      }
      setRecentRecords(prev => [{ ticketNo: no.trim(), show: res.showTitle || "演出", time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }), success: true }, ...prev].slice(0, 5));
    } catch (err: any) {
      setResultType("error");
      setResultData({ message: err.message || "该门票无效或已过期" });
    } finally {
      setLoading(false);
    }
  };

  const simulateScan = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); doVerify("T20260410001"); }, 1500);
  };

  const handleCheck = () => { if (ticketNo.trim()) doVerify(ticketNo); };
  const addNumber = (n: string) => setTicketNo(prev => prev.length < 32 ? prev + n : prev);
  const resetCheck = () => { setResultType(null); setResultData(null); setTicketNo(""); };
  const handleLogout = () => { logout(); router.push("/admin/login"); };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bg-deep)" }}>
      {/* Header */}
      <div className="glass px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-cyan)] flex items-center justify-center text-xs text-white font-bold">智</div>
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">智慧大剧院</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--color-text-muted)]">检票员：{user?.nickname || user?.username}</span>
          <button onClick={handleLogout} className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"><LogOut className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-4 py-6 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {resultType ? (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full">
              {resultType === "success" && (
                <div className="glass rounded-2xl p-6 border border-green-500/30 bg-green-500/5">
                  <div className="flex flex-col items-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-3"><CheckCircle className="w-8 h-8 text-green-400" /></div>
                    <h2 className="text-xl font-bold text-green-400">检票成功</h2>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">欢迎观演，祝您观演愉快！</p>
                  </div>
                  <div className="space-y-3 mb-6">
                    {[
                      { label: "票号", value: resultData?.ticketNo || ticketNo },
                      { label: "演出", value: resultData?.showTitle || "星空下的旋律" },
                      { label: "场次", value: resultData?.scheduleTime || "2026.04.15 19:30" },
                      { label: "座位", value: resultData?.seatLabel || "1楼 A区 12排 08座" },
                    ].map(r => (
                      <div key={r.label} className="flex justify-between py-2 border-b border-[var(--color-border)]">
                        <span className="text-xs text-[var(--color-text-muted)]">{r.label}</span>
                        <span className="text-sm font-medium text-[var(--color-text-primary)]">{r.value}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={resetCheck} className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-400 text-white font-semibold">继续检票</button>
                </div>
              )}
              {resultType === "error" && (
                <div className="glass rounded-2xl p-6 border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5">
                  <div className="flex flex-col items-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center mb-3"><XCircle className="w-8 h-8 text-[var(--color-accent)]" /></div>
                    <h2 className="text-xl font-bold text-[var(--color-accent)]">检票失败</h2>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">{resultData?.message || "该门票无效或已过期"}</p>
                  </div>
                  <button onClick={resetCheck} className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-light)] text-white font-semibold">重新尝试</button>
                </div>
              )}
              {resultType === "warning" && (
                <div className="glass rounded-2xl p-6 border border-yellow-500/30 bg-yellow-500/5">
                  <div className="flex flex-col items-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mb-3"><AlertTriangle className="w-8 h-8 text-yellow-400" /></div>
                    <h2 className="text-xl font-bold text-yellow-400">重复检票</h2>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">该门票已于 {resultData?.verifyTime || "19:15"} 检票入场</p>
                  </div>
                  <div className="space-y-3 mb-6">
                    {[
                      { label: "票号", value: resultData?.ticketNo || ticketNo },
                      { label: "入场时间", value: resultData?.verifyTime || "2026.04.15 19:15:32" },
                      { label: "检票口", value: resultData?.gate || "A口" },
                    ].map(r => (
                      <div key={r.label} className="flex justify-between py-2 border-b border-[var(--color-border)]">
                        <span className="text-xs text-[var(--color-text-muted)]">{r.label}</span>
                        <span className="text-sm font-medium text-[var(--color-text-primary)]">{r.value}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={resetCheck} className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-400 text-white font-semibold">继续检票</button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="tabs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
              {/* Tab Switcher */}
              <div className="flex gap-2 mb-6">
                <button onClick={() => setActiveTab("scan")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === "scan" ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-cyan)] text-white" : "glass text-[var(--color-text-secondary)]"}`}><QrCode className="w-4 h-4" />扫码检票</button>
                <button onClick={() => setActiveTab("input")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === "input" ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-cyan)] text-white" : "glass text-[var(--color-text-secondary)]"}`}><Keyboard className="w-4 h-4" />输入检票</button>
              </div>

              {activeTab === "scan" ? (
                <div className="flex flex-col items-center">
                  <p className="text-sm text-[var(--color-text-muted)] mb-4">请将门票二维码放入框内扫描</p>
                  <div className="relative w-[280px] h-[280px] rounded-2xl overflow-hidden mb-6" style={{ background: "var(--color-bg-card)", border: "2px solid var(--color-border)" }}>
                    {[["top-0 left-0", "border-t-2 border-l-2 rounded-tl-2xl"], ["top-0 right-0", "border-t-2 border-r-2 rounded-tr-2xl"], ["bottom-0 left-0", "border-b-2 border-l-2 rounded-bl-2xl"], ["bottom-0 right-0", "border-b-2 border-r-2 rounded-br-2xl"]].map(([pos, cls], i) => (
                      <div key={i} className={`absolute ${pos} w-8 h-8 ${cls} border-[var(--color-primary)]`} />
                    ))}
                    <motion.div animate={{ y: [0, 260, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center"><QrCode className="w-16 h-16 text-[var(--color-text-muted)] opacity-30" /></div>
                    {loading && <div className="absolute inset-0 flex items-center justify-center bg-black/50"><div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" /></div>}
                  </div>
                  <button onClick={simulateScan} disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-cyan)] text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"><Camera className="w-5 h-5" />开启相机扫描</button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-[var(--color-text-muted)] mb-4 text-center">请输入订单号或票号</p>
                  <input value={ticketNo} onChange={(e) => setTicketNo(e.target.value.slice(0, 32))} className="w-full px-4 py-4 mb-4 text-center text-xl font-mono tracking-widest rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-primary)]" placeholder="输入票号" />
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {["1","2","3","4","5","6","7","8","9"].map(n => (
                      <button key={n} onClick={() => addNumber(n)} className="py-4 rounded-xl text-lg font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors" style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}>{n}</button>
                    ))}
                    <button onClick={() => setTicketNo("")} className="py-4 rounded-xl text-sm font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors" style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}>清除</button>
                    <button onClick={() => addNumber("0")} className="py-4 rounded-xl text-lg font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors" style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}>0</button>
                    <button onClick={() => setTicketNo(prev => prev.slice(0, -1))} className="py-4 rounded-xl text-sm font-semibold text-yellow-400 hover:bg-yellow-500/10 transition-colors flex items-center justify-center" style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}><Delete className="w-5 h-5" /></button>
                  </div>
                  <button onClick={handleCheck} disabled={!ticketNo.trim() || loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-cyan)] text-white font-semibold disabled:opacity-50">{loading ? "验证中..." : "确认检票"}</button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {recentRecords.length > 0 && !resultType && (
          <div className="w-full mt-6 glass rounded-xl p-4">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">最近检票记录</h3>
            <div className="space-y-2">
              {recentRecords.map((r, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="text-xs font-mono text-[var(--color-primary-light)]">{r.ticketNo}</span>
                  <span className="text-xs text-[var(--color-text-muted)] flex-1 truncate">{r.show}</span>
                  <span className="text-xs text-[var(--color-text-muted)]">{r.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
