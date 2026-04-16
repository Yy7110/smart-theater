"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Clock, CheckCircle, Ticket, QrCode } from "lucide-react";
import Link from "next/link";
import { userApi } from "@/lib/userApi";
import { useAuthStore } from "@/lib/authStore";

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { token, isLoggedIn, init } = useAuthStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    if (!isLoggedIn) { router.push("/login"); return; }
    if (token) {
      userApi.getOrderDetail(token, Number(id)).then(o => {
        setOrder(o);
        if (o.status === "PENDING_PAYMENT" && o.expireTime) {
          const expire = new Date(o.expireTime).getTime();
          const now = Date.now();
          setCountdown(Math.max(0, Math.floor((expire - now) / 1000)));
        }
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [token, id, isLoggedIn, router]);

  useEffect(() => {
    if (countdown <= 0) return;
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [countdown > 0]);

  const handlePay = async () => {
    if (!token) return;
    setPaying(true);
    try {
      const updated = await userApi.payOrder(token, Number(id));
      setOrder(updated);
    } catch (err: any) { alert(err.message || "支付失败"); }
    finally { setPaying(false); }
  };

  const handleCancel = async () => {
    if (!token || !confirm("确认取消订单？")) return;
    try {
      const updated = await userApi.cancelOrder(token, Number(id));
      setOrder(updated);
    } catch (err: any) { alert(err.message || "取消失败"); }
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[var(--color-text-muted)]">加载中...</div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center text-[var(--color-text-muted)]">订单不存在</div>;

  const isPaid = order.status === "PAID";
  const isPending = order.status === "PENDING_PAYMENT";

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Status Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          {isPaid ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-green-400 mb-2">支付成功</h1>
              <p className="text-[var(--color-text-secondary)]">您的票据已生成，请妥善保管</p>
            </>
          ) : isPending ? (
            <>
              <Clock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">待支付</h1>
              {countdown > 0 && (
                <p className="text-[var(--color-accent)] text-lg font-mono">剩余支付时间 {formatTime(countdown)}</p>
              )}
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-[var(--color-text-muted)] mb-2">
                {order.status === "CANCELLED" ? "订单已取消" : order.status === "EXPIRED" ? "订单已过期" : order.status}
              </h1>
            </>
          )}
        </motion.div>

        {/* Order Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">订单信息</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">订单号</span><span className="text-[var(--color-text-primary)] font-mono">{order.orderNo}</span></div>
            <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">演出</span><span className="text-[var(--color-text-primary)]">{order.showTitle}</span></div>
            <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">场馆</span><span className="text-[var(--color-text-primary)]">{order.venue}</span></div>
            <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">场次</span><span className="text-[var(--color-text-primary)]">{order.scheduleDate} {order.scheduleTime}</span></div>
            <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">座位</span><span className="text-[var(--color-text-primary)]">{order.tickets?.map((t: any) => t.seatLabel).join("、")}</span></div>
            <div className="flex justify-between border-t border-[var(--color-border)] pt-3">
              <span className="text-[var(--color-text-muted)]">总计</span>
              <span className="text-xl font-bold text-[var(--color-accent)]">¥{order.totalAmount}</span>
            </div>
          </div>
        </motion.div>

        {/* Payment Actions */}
        {isPending && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-4 mb-6">
            <button onClick={handlePay} disabled={paying || countdown <= 0}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white font-semibold disabled:opacity-50">
              {paying ? "支付中..." : "立即支付"}
            </button>
            <button onClick={handleCancel} className="px-6 py-3 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)]">取消订单</button>
          </motion.div>
        )}

        {/* Tickets with QR codes */}
        {isPaid && order.tickets?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">电子票据</h2>
            <div className="space-y-4">
              {order.tickets.map((ticket: any) => (
                <div key={ticket.ticketNo} className="glass rounded-xl p-6">
                  <div className="flex items-start gap-6">
                    {/* QR Code */}
                    <div className="flex-shrink-0">
                      {ticket.qrCodeBase64 ? (
                        <img src={ticket.qrCodeBase64} alt="QR Code" className="w-32 h-32 rounded-lg" />
                      ) : (
                        <div className="w-32 h-32 rounded-lg bg-[var(--color-bg-elevated)] flex items-center justify-center">
                          <QrCode className="w-12 h-12 text-[var(--color-text-muted)]" />
                        </div>
                      )}
                    </div>
                    {/* Ticket Info */}
                    <div className="flex-1 space-y-2 text-sm">
                      <div className="text-xs text-[var(--color-text-muted)]">票据编号</div>
                      <div className="font-mono text-[var(--color-primary-light)] text-base">{ticket.ticketNo}</div>
                      <div className="flex gap-4">
                        <span className="text-[var(--color-text-secondary)]">{ticket.seatLabel}</span>
                        <span className="text-[var(--color-text-muted)]">{ticket.seatType}</span>
                        <span className="text-[var(--color-accent)]">¥{ticket.price}</span>
                      </div>
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                        ticket.ticketStatus === "VALID" ? "bg-green-500/20 text-green-400" :
                        ticket.ticketStatus === "VERIFIED" ? "bg-blue-500/20 text-blue-400" :
                        "bg-gray-500/20 text-gray-400"
                      }`}>
                        {ticket.ticketStatus === "VALID" ? "待使用" : ticket.ticketStatus === "VERIFIED" ? "已验证" : ticket.ticketStatus}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-center gap-4 mt-8">
          {isPaid && <Link href="/tickets" className="px-6 py-2 rounded-xl bg-[var(--color-primary)]/20 text-[var(--color-primary-light)] text-sm">查看我的票夹</Link>}
          <Link href="/shows" className="px-6 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)]">继续浏览演出</Link>
        </div>
      </div>
    </div>
  );
}
