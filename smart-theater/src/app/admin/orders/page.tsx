"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, X } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { adminApi } from "@/lib/adminApi";

export default function OrdersManagement() {
  const { token } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    if (token) {
      adminApi.getOrders(token, { page: 1, size: 50 })
        .then((res) => setOrders(res.records || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [token]);

  const viewOrder = async (order: any) => {
    if (!token) return;
    try {
      const detail = await adminApi.getOrder(token, order.id);
      setSelectedOrder(detail);
    } catch (err) {
      alert("加载失败");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">订单管理</h1>
      {loading ? (
        <div className="text-[var(--color-text-muted)]">加载中...</div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)]">订单号</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)]">用户</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)]">金额</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)]">状态</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)]">时间</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)]">操作</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)]/50">
                  <td className="px-4 py-3 text-sm text-[var(--color-text-primary)]">{order.orderNo}</td>
                  <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">用户#{order.userId}</td>
                  <td className="px-4 py-3 text-sm text-[var(--color-accent)]">¥{order.totalAmount}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === "PAID" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--color-text-muted)]">{order.createTime}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => viewOrder(order)} className="p-1.5 rounded hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass rounded-xl p-6 w-full max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[var(--color-text-primary)]">订单详情</h2>
                <button onClick={() => setSelectedOrder(null)} className="p-1 text-[var(--color-text-muted)]"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">订单号:</span><span className="text-[var(--color-text-primary)]">{selectedOrder.orderNo}</span></div>
                <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">用户:</span><span className="text-[var(--color-text-primary)]">用户#{selectedOrder.userId}</span></div>
                <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">金额:</span><span className="text-[var(--color-accent)]">¥{selectedOrder.totalAmount}</span></div>
                <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">状态:</span><span className="text-[var(--color-text-primary)]">{selectedOrder.status}</span></div>
                <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">创建时间:</span><span className="text-[var(--color-text-primary)]">{selectedOrder.createTime}</span></div>
                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                    <div className="text-[var(--color-text-secondary)] mb-2">票据列表:</div>
                    {selectedOrder.items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                        <span className="text-[var(--color-text-primary)]">{item.seatLabel}</span>
                        <span className="text-[var(--color-text-secondary)]">¥{item.price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
