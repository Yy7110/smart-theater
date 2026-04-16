"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Clapperboard, TrendingUp, Plus, Edit, Trash2, Eye, EyeOff, X, Calendar, LayoutGrid, Users, Star, Clock, MessageSquare, Ticket, Send } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { operatorApi } from "@/lib/adminApi";

type Tab = "dashboard" | "schedules" | "seats" | "orders" | "feedback";
const tabs: { key: Tab; label: string; icon: any }[] = [
  { key: "dashboard", label: "控制台", icon: LayoutGrid },
  { key: "schedules", label: "演出排期", icon: Calendar },
  { key: "seats", label: "座位管理", icon: Users },
  { key: "orders", label: "票务设置", icon: Ticket },
  { key: "feedback", label: "观众反馈", icon: MessageSquare },
];

export default function OperatorDashboard() {
  const { token } = useAuthStore();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(tabParam || "dashboard");
  const [shows, setShows] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [seatMaps, setSeatMaps] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingShow, setEditingShow] = useState<any>(null);
  const [form, setForm] = useState({ title: "", categoryId: "", venueId: "", artist: "", description: "", posterUrl: "", minPrice: "", maxPrice: "", status: "DRAFT" });
  const [scheduleModal, setScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ showId: "", showDate: "", showTime: "", endTime: "" });
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [replyModal, setReplyModal] = useState<any>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    if (tabParam && tabs.some(t => t.key === tabParam)) setActiveTab(tabParam);
  }, [tabParam]);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      operatorApi.getMyShows(token, { page: 1, size: 20 }),
      operatorApi.getStats(token),
      operatorApi.getCategories(token).catch(() => []),
      operatorApi.getVenues(token).catch(() => []),
      operatorApi.getSchedules(token).catch(() => []),
      operatorApi.getSeatMaps(token).catch(() => []),
      operatorApi.getOrders(token).catch(() => []),
      operatorApi.getMessages(token).catch(() => []),
    ]).then(([showsRes, statsRes, cats, vens, scheds, seats, ords, msgs]) => {
      setShows(showsRes.records || showsRes || []);
      setStats(statsRes);
      setCategories(cats || []);
      setVenues(vens || []);
      setSchedules(scheds || []);
      setSeatMaps(seats || []);
      setOrders(ords || []);
      setMessages(msgs || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  const loadShows = () => { if (token) operatorApi.getMyShows(token, { page: 1, size: 20 }).then((res) => setShows(res.records || res || [])).catch(() => {}); };
  const loadSchedules = () => { if (token) operatorApi.getSchedules(token).then(setSchedules).catch(() => {}); };
  const loadMessages = () => { if (token) operatorApi.getMessages(token).then(setMessages).catch(() => {}); };
  const loadOrders = () => { if (token) operatorApi.getOrders(token).then(setOrders).catch(() => {}); };

  const openModal = (show?: any) => {
    if (show) { setEditingShow(show); setForm({ title: show.title, categoryId: show.categoryId, venueId: show.venueId, artist: show.artist || "", description: show.description || "", posterUrl: show.posterUrl || "", minPrice: show.minPrice || "", maxPrice: show.maxPrice || "", status: show.status }); }
    else { setEditingShow(null); setForm({ title: "", categoryId: "", venueId: "", artist: "", description: "", posterUrl: "", minPrice: "", maxPrice: "", status: "DRAFT" }); }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!token || !form.title || !form.categoryId || !form.venueId) { alert("请填写必填项"); return; }
    try {
      if (editingShow) await operatorApi.updateShow(token, editingShow.id, form);
      else await operatorApi.createShow(token, form);
      setShowModal(false); loadShows();
    } catch (err: any) { alert(err.message || "操作失败"); }
  };

  const handleDelete = async (id: number) => { if (!token || !confirm("确认删除？")) return; try { await operatorApi.deleteShow(token, id); loadShows(); } catch { alert("删除失败"); } };
  const toggleStatus = async (id: number, s: string) => { if (!token) return; const ns = s === "ON_SALE" ? "OFF_SHELF" : "ON_SALE"; try { await operatorApi.updateShowStatus(token, id, ns); setShows(shows.map(x => x.id === id ? { ...x, status: ns } : x)); } catch { alert("操作失败"); } };

  const openScheduleModal = (schedule?: any) => {
    if (schedule) { setEditingSchedule(schedule); setScheduleForm({ showId: schedule.showId, showDate: schedule.showDate, showTime: schedule.showTime || "", endTime: schedule.endTime || "" }); }
    else { setEditingSchedule(null); setScheduleForm({ showId: "", showDate: "", showTime: "", endTime: "" }); }
    setScheduleModal(true);
  };
  const handleScheduleSubmit = async () => {
    if (!token || !scheduleForm.showId || !scheduleForm.showDate || !scheduleForm.showTime) { alert("请填写必填项"); return; }
    try {
      if (editingSchedule) await operatorApi.updateSchedule(token, editingSchedule.id, scheduleForm);
      else await operatorApi.createSchedule(token, Number(scheduleForm.showId), scheduleForm);
      setScheduleModal(false); loadSchedules();
    } catch (err: any) { alert(err.message || "操作失败"); }
  };
  const handleScheduleDelete = async (id: number) => { if (!token || !confirm("确认删除此排期？")) return; try { await operatorApi.deleteSchedule(token, id); loadSchedules(); } catch { alert("删除失败"); } };

  const handleReply = async () => {
    if (!token || !replyModal || !replyText.trim()) return;
    try { await operatorApi.replyMessage(token, replyModal.id, replyText); setReplyModal(null); setReplyText(""); loadMessages(); } catch { alert("回复失败"); }
  };

  if (loading) return <div className="text-[var(--color-text-muted)] p-8">加载中...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">剧院控制台</h1>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-[var(--color-border)] pb-3 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.key ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]"}`}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      {/* ===== 控制台 Tab ===== */}
      {activeTab === "dashboard" && (<>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "演出总数", value: `${stats?.totalShows || shows.length}场`, trend: `${stats?.totalSchedules || 0}个排期`, icon: Clapperboard, color: "primary" },
            { label: "总营收", value: `¥${stats?.totalRevenue || 0}`, trend: `${orders.length}笔订单`, icon: TrendingUp, color: "accent" },
            { label: "总销量", value: `${stats?.totalSales || 0}张`, trend: `${messages.length}条反馈`, icon: Users, color: "cyan" },
            { label: "观众满意度", value: messages.length > 0 ? `${(messages.reduce((s: number, m: any) => s + (m.rating || 0), 0) / messages.length).toFixed(1)}/5.0` : "暂无", trend: "来自观众评分", icon: Star, color: "primary" },
          ].map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-[var(--color-${card.color})]/10 flex items-center justify-center`}>
                  <card.icon className={`w-6 h-6 text-[var(--color-${card.color})]`} />
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">{card.trend}</span>
              </div>
              <div className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">{card.value}</div>
              <div className="text-sm text-[var(--color-text-muted)]">{card.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Recent Schedules + Recent Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="glass rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">近期排期</h2>
            {schedules.length === 0 ? <p className="text-sm text-[var(--color-text-muted)]">暂无排期数据</p> : (
              <div className="space-y-3">
                {schedules.slice(0, 5).map((s: any) => (
                  <div key={s.id} className="flex items-center gap-4 p-3 rounded-xl border border-[var(--color-border)]">
                    <div className="text-center">
                      <div className="text-sm font-bold text-[var(--color-text-primary)]">{s.showTime?.slice(0, 5)}</div>
                      <Clock className="w-3 h-3 text-[var(--color-text-muted)] mx-auto mt-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[var(--color-text-primary)] truncate">{s.showTitle || `排期#${s.id}`}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">{s.showDate} · 余票 {s.availableTickets ?? "N/A"}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="glass rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">最新反馈</h2>
            {messages.length === 0 ? <p className="text-sm text-[var(--color-text-muted)]">暂无反馈</p> : (
              <div className="space-y-3">
                {messages.slice(0, 5).map((msg: any) => (
                  <div key={msg.id} className="p-3 rounded-xl border border-[var(--color-border)]">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-cyan)] flex items-center justify-center text-[10px] text-white font-bold">{(msg.name || "?")[0]}</div>
                      <span className="text-sm font-medium text-[var(--color-text-primary)]">{msg.name}</span>
                      {msg.rating && <span className="text-xs text-yellow-400 ml-auto">{"★".repeat(msg.rating)}</span>}
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">{msg.message}</p>
                    {msg.reply && <p className="text-xs text-green-400 mt-1">已回复</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Shows Table */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">我的演出</h2>
            <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white text-sm font-medium"><Plus className="w-4 h-4" />创建演出</button>
          </div>
          <table className="w-full">
            <thead className="bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)]">
              <tr>
                {["标题", "分类", "状态", "销量", "操作"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)]">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {shows.map((show) => (
                <tr key={show.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)]/50">
                  <td className="px-4 py-3 text-sm text-[var(--color-text-primary)]">{show.title}</td>
                  <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{categories.find(c => c.id == show.categoryId)?.name || '-'}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded-full ${show.status === "ON_SALE" ? "bg-green-500/20 text-green-400" : show.status === "DRAFT" ? "bg-blue-500/20 text-blue-400" : "bg-gray-500/20 text-gray-400"}`}>{show.status === "ON_SALE" ? "上架" : show.status === "DRAFT" ? "草稿" : "下架"}</span></td>
                  <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{show.soldTickets || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleStatus(show.id, show.status)} className="p-1.5 rounded hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]" title={show.status === "ON_SALE" ? "下架" : "上架"}>{show.status === "ON_SALE" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                      <button onClick={() => openModal(show)} className="p-1.5 rounded hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(show.id)} className="p-1.5 rounded hover:bg-[var(--color-bg-elevated)] text-[var(--color-accent)]"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>)}

      {/* ===== 演出排期 Tab ===== */}
      {activeTab === "schedules" && (
        <div className="glass rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">演出排期管理</h2>
            <button onClick={() => openScheduleModal()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white text-sm font-medium"><Plus className="w-4 h-4" />新建排期</button>
          </div>
          {schedules.length === 0 ? <p className="px-6 pb-6 text-sm text-[var(--color-text-muted)]">暂无排期</p> : (
            <table className="w-full">
              <thead className="bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)]">
                <tr>{["演出", "日期", "时间", "余票", "操作"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)]">{h}</th>)}</tr>
              </thead>
              <tbody>
                {schedules.map((s: any) => (
                  <tr key={s.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)]/50">
                    <td className="px-4 py-3 text-sm text-[var(--color-text-primary)]">{s.showTitle || `演出#${s.showId}`}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{s.showDate}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{s.showTime?.slice(0, 5)}{s.endTime ? ` - ${s.endTime.slice(0, 5)}` : ""}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{s.availableTickets ?? "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openScheduleModal(s)} className="p-1.5 rounded hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleScheduleDelete(s.id)} className="p-1.5 rounded hover:bg-[var(--color-bg-elevated)] text-[var(--color-accent)]"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ===== 座位管理 Tab ===== */}
      {activeTab === "seats" && (
        <div>
          {seatMaps.length === 0 ? <div className="glass rounded-xl p-8 text-center text-[var(--color-text-muted)]">暂无座位图数据</div> : (
            <div className="space-y-6">
              {seatMaps.map((venue: any, vi: number) => (
                <div key={vi} className="glass rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">{venue.venueName || `场馆#${vi + 1}`}</h2>
                  <div className="flex gap-3 mb-4 text-xs text-[var(--color-text-muted)]">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[var(--color-bg-elevated)]" />可售</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-500" />已售</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-yellow-500" />预留</span>
                  </div>
                  {venue.rows?.map((row: any) => (
                    <div key={row.rowNum} className="flex items-center gap-1 mb-1">
                      <span className="w-8 text-xs text-[var(--color-text-muted)] text-right mr-2">{row.rowNum}排</span>
                      <div className="flex gap-0.5">
                        {row.seats?.map((seat: any) => (
                          <div key={seat.seatId || seat.colNum} title={`${seat.seatLabel || ""} ${seat.seatType || ""}`}
                            className={`w-5 h-5 rounded-sm ${seat.status === "SOLD" ? "bg-green-500" : seat.status === "LOCKED" || seat.status === "RESERVED" ? "bg-yellow-500" : "bg-[var(--color-bg-elevated)]"}`} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== 票务设置 Tab ===== */}
      {activeTab === "orders" && (
        <div className="glass rounded-xl overflow-hidden">
          <div className="p-6 pb-4">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">订单列表</h2>
          </div>
          {orders.length === 0 ? <p className="px-6 pb-6 text-sm text-[var(--color-text-muted)]">暂无订单</p> : (
            <table className="w-full">
              <thead className="bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)]">
                <tr>{["订单号", "演出", "金额", "状态", "时间"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)]">{h}</th>)}</tr>
              </thead>
              <tbody>
                {orders.map((o: any) => (
                  <tr key={o.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)]/50">
                    <td className="px-4 py-3 text-sm font-mono text-[var(--color-primary-light)]">{o.orderNo}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text-primary)]">{o.showTitle || "-"}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-accent)]">¥{o.totalAmount}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded-full ${o.status === "PAID" ? "bg-green-500/20 text-green-400" : o.status === "PENDING_PAYMENT" ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-500/20 text-gray-400"}`}>{o.status === "PAID" ? "已支付" : o.status === "PENDING_PAYMENT" ? "待支付" : o.status === "CANCELLED" ? "已取消" : o.status}</span></td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text-muted)]">{o.createTime || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ===== 观众反馈 Tab ===== */}
      {activeTab === "feedback" && (
        <div className="space-y-4">
          {messages.length === 0 ? <div className="glass rounded-xl p-8 text-center text-[var(--color-text-muted)]">暂无反馈</div> : messages.map((msg: any) => (
            <div key={msg.id} className="glass rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-cyan)] flex items-center justify-center text-sm text-white font-bold">{(msg.name || "?")[0]}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-[var(--color-text-primary)]">{msg.name}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{msg.email} · {msg.subject}</div>
                </div>
                {msg.rating && <div className="text-sm">{Array.from({ length: 5 }, (_, j) => <span key={j} className={j < msg.rating ? "text-yellow-400" : "text-[var(--color-text-muted)]"}>★</span>)}</div>}
                <span className={`px-2 py-1 text-xs rounded-full ${msg.isRead ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}`}>{msg.isRead ? "已读" : "未读"}</span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-3">{msg.message}</p>
              {msg.reply ? (
                <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                  <p className="text-xs text-green-400 mb-1">已回复：</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">{msg.reply}</p>
                </div>
              ) : (
                <button onClick={() => { setReplyModal(msg); setReplyText(""); }} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary-light)]"><Send className="w-3 h-3" />回复</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Show Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[var(--color-text-primary)]">{editingShow ? "编辑演出" : "创建演出"}</h2>
                <button onClick={() => setShowModal(false)} className="p-1 text-[var(--color-text-muted)]"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">标题*</label><input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">分类*</label><select value={form.categoryId} onChange={(e) => setForm({...form, categoryId: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm"><option value="">选择分类</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                  <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">场馆*</label><select value={form.venueId} onChange={(e) => setForm({...form, venueId: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm"><option value="">选择场馆</option>{venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></div>
                </div>
                <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">艺术家</label><input value={form.artist} onChange={(e) => setForm({...form, artist: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm" /></div>
                <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">描述</label><textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={3} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm" /></div>
                <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">海报URL</label><input value={form.posterUrl} onChange={(e) => setForm({...form, posterUrl: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">最低价</label><input type="number" value={form.minPrice} onChange={(e) => setForm({...form, minPrice: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm" /></div>
                  <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">最高价</label><input type="number" value={form.maxPrice} onChange={(e) => setForm({...form, maxPrice: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm" /></div>
                </div>
                <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">状态</label><select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} disabled={!editingShow} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm disabled:opacity-50"><option value="DRAFT">草稿</option><option value="ON_SALE">上架</option><option value="OFF_SHELF">下架</option></select></div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleSubmit} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white text-sm font-medium">保存</button>
                <button onClick={() => setShowModal(false)} className="px-6 py-2 rounded-lg border border-[var(--color-border)] text-sm">取消</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Schedule Modal */}
      <AnimatePresence>
        {scheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[var(--color-text-primary)]">{editingSchedule ? "编辑排期" : "新建排期"}</h2>
                <button onClick={() => setScheduleModal(false)} className="p-1 text-[var(--color-text-muted)]"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">演出*</label>
                  <select value={scheduleForm.showId} onChange={e => setScheduleForm({...scheduleForm, showId: e.target.value})} disabled={!!editingSchedule} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm disabled:opacity-50">
                    <option value="">选择演出</option>{shows.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">日期*</label><input type="date" value={scheduleForm.showDate} onChange={e => setScheduleForm({...scheduleForm, showDate: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">开始时间*</label><input type="time" value={scheduleForm.showTime} onChange={e => setScheduleForm({...scheduleForm, showTime: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm" /></div>
                  <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">结束时间</label><input type="time" value={scheduleForm.endTime} onChange={e => setScheduleForm({...scheduleForm, endTime: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm" /></div>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleScheduleSubmit} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white text-sm font-medium">保存</button>
                <button onClick={() => setScheduleModal(false)} className="px-6 py-2 rounded-lg border border-[var(--color-border)] text-sm">取消</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reply Modal */}
      <AnimatePresence>
        {replyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[var(--color-text-primary)]">回复反馈</h2>
                <button onClick={() => setReplyModal(null)} className="p-1 text-[var(--color-text-muted)]"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-3 rounded-lg bg-[var(--color-bg-elevated)] mb-4">
                <p className="text-xs text-[var(--color-text-muted)] mb-1">{replyModal.name} · {replyModal.subject}</p>
                <p className="text-sm text-[var(--color-text-secondary)]">{replyModal.message}</p>
              </div>
              <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={3} placeholder="输入回复内容..." className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm mb-4" />
              <div className="flex gap-3">
                <button onClick={handleReply} disabled={!replyText.trim()} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white text-sm font-medium disabled:opacity-50">发送回复</button>
                <button onClick={() => setReplyModal(null)} className="px-6 py-2 rounded-lg border border-[var(--color-border)] text-sm">取消</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
