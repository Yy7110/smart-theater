"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { publicApi, userApi } from "@/lib/userApi";
import { useAuthStore } from "@/lib/authStore";

export default function TicketSelectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const scheduleId = Number(searchParams.get("schedule"));
  const { token, isLoggedIn, init } = useAuthStore();

  const [schedule, setSchedule] = useState<any>(null);
  const [show, setShow] = useState<any>(null);
  const [selectedPrice, setSelectedPrice] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    if (!isLoggedIn) router.push("/login");
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (!scheduleId) return;
    publicApi.getShowDetail(Number(id)).then((showData) => {
      setShow(showData);
      const sched = showData?.schedules?.find((s: any) => s.id === scheduleId);
      setSchedule(sched || null);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id, scheduleId]);

  const prices = schedule?.prices || [];
  const totalPrice = selectedPrice ? selectedPrice.price * quantity : 0;

  const handleSubmit = async () => {
    if (!token || !selectedPrice) return;
    setSubmitting(true);
    try {
      const order = await userApi.createOrder(token, scheduleId, {
        priceId: selectedPrice.id,
        seatType: selectedPrice.seatType,
        price: selectedPrice.price,
        quantity,
      });
      router.push(`/order/${order.id}`);
    } catch (err: any) {
      alert(err.message || "下单失败");
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[var(--color-text-muted)]">加载中...</div>;

  const weekDay = schedule?.showDate ? ["周日","周一","周二","周三","周四","周五","周六"][new Date(schedule.showDate).getDay()] : "";

  return (
    <div className="min-h-screen pt-20 pb-40">
      {/* Header Banner */}
      <div className="relative bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] px-6 py-8">
        <Link href={`/show/${id}`} className="absolute top-4 left-4 text-white/80 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="max-w-3xl mx-auto pt-4">
          <h1 className="text-xl md:text-2xl font-bold text-white mb-2">{show?.title}</h1>
          <p className="text-sm text-white/70">{show?.venueName || show?.venue}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 -mt-4">
        <div className="glass rounded-2xl p-6">
          {/* Schedule */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">场次</h2>
              <span className="text-xs text-[var(--color-text-muted)]">场次时间均为演出当地时间</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-[var(--color-primary)] bg-[var(--color-primary)]/5">
              <span className="text-sm font-semibold text-[var(--color-primary-light)]">
                {schedule?.showDate} {weekDay} {schedule?.showTime?.slice(0, 5)}
              </span>
              {schedule?.availableTickets != null && schedule.availableTickets > 0 && (
                <span className="px-2 py-0.5 text-[10px] rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary-light)]">
                  {schedule.availableTickets > 100 ? "预售" : `余${schedule.availableTickets}`}
                </span>
              )}
            </div>
          </div>

          {/* Price Tiers */}
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">票档</h2>
            {prices.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">暂无票档信息</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {prices.map((p: any, i: number) => {
                  const isSelected = selectedPrice?.seatType === p.seatType && selectedPrice?.price === p.price;
                  const soldOut = p.available === 0;
                  return (
                    <motion.button key={i} whileTap={!soldOut ? { scale: 0.97 } : {}}
                      onClick={() => !soldOut && setSelectedPrice(p)}
                      disabled={soldOut}
                      className={`px-5 py-3 rounded-xl border-2 text-left transition-all min-w-[120px] ${
                        isSelected
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                          : soldOut
                          ? "border-[var(--color-border)] opacity-50 cursor-not-allowed"
                          : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
                      }`}>
                      <span className={`text-base font-semibold ${isSelected ? "text-[var(--color-primary-light)]" : "text-[var(--color-text-primary)]"}`}>
                        {p.price}元
                      </span>
                      {soldOut && (
                        <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]">缺货登记</span>
                      )}
                      {p.seatType && (
                        <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{p.seatType}</div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto px-6 py-4 space-y-3">
          {/* Quantity */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-[var(--color-text-primary)]">数量</span>
              <p className="text-xs text-[var(--color-text-muted)]">每笔订单限购6张，按付款顺序配票</p>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}
                className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] disabled:opacity-30">
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-lg font-semibold text-[var(--color-text-primary)] w-8 text-center">{quantity}张</span>
              <button onClick={() => setQuantity(Math.min(6, quantity + 1))} disabled={quantity >= 6}
                className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] disabled:opacity-30">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          {/* Price + Submit */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-[var(--color-text-primary)]">¥{totalPrice}</span>
              <span className="text-xs text-[var(--color-text-muted)] ml-1">价格明细</span>
            </div>
            <button onClick={handleSubmit} disabled={!selectedPrice || submitting}
              className="px-10 py-3 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white font-semibold text-base disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-[var(--color-glow-purple)]">
              {submitting ? "提交中..." : "确定"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
