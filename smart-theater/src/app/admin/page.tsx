"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Users, Ticket, DollarSign, BarChart3, Eye } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { adminApi } from "@/lib/adminApi";

const statusMap: Record<string, { label: string; cls: string }> = {
  PAID: { label: "已支付", cls: "bg-green-500/20 text-green-400" },
  PENDING_PAYMENT: { label: "待支付", cls: "bg-yellow-500/20 text-yellow-400" },
  CANCELLED: { label: "已取消", cls: "bg-gray-500/20 text-gray-400" },
  REFUNDED: { label: "已退款", cls: "bg-red-500/20 text-red-400" },
  EXPIRED: { label: "已过期", cls: "bg-gray-500/20 text-gray-400" },
};

export default function AdminDashboard() {
  const { token } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [shows, setShows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      Promise.all([
        adminApi.getStats(token),
        adminApi.getOrders(token, { page: 1, size: 5 }),
        adminApi.getShows(token, { page: 1, size: 4 })
      ]).then(([s, o, sh]) => {
        setStats(s);
        setOrders(o.records || []);
        setShows(sh.records || []);
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [token]);

  const cards = [
    { label: "今日销售额", value: `¥${stats?.totalRevenue || 0}`, trend: "+12.5%", up: true, icon: DollarSign, gradient: "from-[var(--color-primary)] to-[var(--color-accent)]", pct: 72 },
    { label: "今日出票", value: `${stats?.totalOrders || 0} 张`, trend: "+8.2%", up: true, icon: Ticket, gradient: "from-[var(--color-cyan)] to-[#3B82F6]", pct: 64 },
    { label: "新增用户", value: `${stats?.totalUsers || 0} 人`, trend: "+5.4%", up: true, icon: Users, gradient: "from-[#10B981] to-[#34D399]", pct: 45 },
    { label: "上座率", value: "87.3%", trend: "-2.1%", up: false, icon: BarChart3, gradient: "from-[#F59E0B] to-[#FBBF24]", pct: 87 },
  ];

  const weekDays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  const barData = [65, 45, 80, 55, 90, 70, 85];

  if (loading) return <div className="text-[var(--color-text-muted)] p-8">加载中...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">控制台</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="stat-card" style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)", borderRadius: "1rem", padding: "1.5rem" }}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <span className={`flex items-center gap-1 text-xs font-medium ${card.up ? "text-green-400" : "text-[var(--color-accent)]"}`}>
                {card.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {card.trend}
              </span>
            </div>
            <div className="text-sm text-[var(--color-text-muted)] mb-1">{card.label}</div>
            <div className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">{card.value}</div>
            <div className="h-2 rounded-full" style={{ background: "var(--color-bg-elevated)" }}>
              <div className="h-full rounded-full bg-gradient-to-r opacity-80" style={{ width: `${card.pct}%`, background: `linear-gradient(to right, var(--color-primary), var(--color-accent))` }} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sales Trend */}
        <div className="lg:col-span-2 glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">销售趋势</h2>
            <div className="flex gap-2">
              {["本周", "本月", "全年"].map((t, i) => (
                <button key={t} className={`px-3 py-1 text-xs rounded-lg ${i === 0 ? "bg-[var(--color-primary)]/20 text-[var(--color-primary-light)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-3 h-48">
            {barData.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="w-full rounded-t-lg bg-gradient-to-t from-[var(--color-primary)] to-[var(--color-primary-light)] opacity-80 hover:opacity-100 transition-opacity" />
                <span className="text-xs text-[var(--color-text-muted)]">{weekDays[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Shows */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">热门演出</h2>
          <div className="space-y-4">
            {shows.map((show, i) => (
              <div key={show.id} className="flex items-center gap-3">
                <div className="w-10 h-14 rounded-lg bg-gradient-to-br from-[var(--color-primary)]/30 to-[var(--color-accent)]/30 flex items-center justify-center text-xs font-bold text-[var(--color-primary-light)]">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--color-text-primary)] truncate">{show.title}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{show.artist || '未知艺术家'}</div>
                </div>
                <div className="text-sm font-semibold text-[var(--color-accent)]">¥{show.minPrice || 0}</div>
              </div>
            ))}
            {shows.length === 0 && <div className="text-sm text-[var(--color-text-muted)]">暂无演出数据</div>}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">最近订单</h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">共 {stats?.totalOrders || 0} 条订单记录</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]">导出</button>
            <button className="px-3 py-1.5 text-xs rounded-lg bg-[var(--color-primary)]/20 text-[var(--color-primary-light)]">查看全部</button>
          </div>
        </div>
        <table className="w-full">
          <thead className="border-t border-b border-[var(--color-border)]" style={{ background: "var(--color-bg-elevated)" }}>
            <tr>
              {["订单号", "用户", "金额", "状态", "下单时间", "操作"].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const st = statusMap[order.status] || { label: order.status, cls: "bg-gray-500/20 text-gray-400" };
              return (
                <tr key={order.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)]/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-[var(--color-primary-light)]">#{order.orderNo?.slice(-10)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-cyan)] flex items-center justify-center text-xs text-white font-bold">U</div>
                      <span className="text-sm text-[var(--color-text-primary)]">用户{order.userId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-[var(--color-text-primary)]">¥{order.totalAmount}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${st.cls}`}>{st.label}</span></td>
                  <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">{order.createTime?.slice(0, 16)}</td>
                  <td className="px-6 py-4"><button className="text-xs text-[var(--color-primary-light)] hover:underline flex items-center gap-1"><Eye className="w-3 h-3" />详情</button></td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-[var(--color-text-muted)]">暂无订单数据</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
