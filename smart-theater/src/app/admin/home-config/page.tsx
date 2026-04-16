"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2, X } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { adminApi } from "@/lib/adminApi";

export default function HomeConfigManagement() {
  const { token } = useAuthStore();
  const [configs, setConfigs] = useState<any[]>([]);
  const [shows, setShows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ configType: "FEATURED", showId: "", sortOrder: "0" });

  useEffect(() => {
    if (token) {
      Promise.all([
        adminApi.getHomeConfig(token),
        adminApi.getShows(token, { page: 1, size: 100 })
      ]).then(([c, s]) => {
        setConfigs(c || []);
        setShows(s.records || []);
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [token]);

  const loadConfigs = () => {
    if (token) adminApi.getHomeConfig(token).then(c => setConfigs(c || [])).catch(() => {});
  };

  const handleAdd = async () => {
    if (!token || !form.showId) { alert("请选择演出"); return; }
    try {
      await adminApi.addHomeConfig(token, form);
      setShowModal(false);
      loadConfigs();
    } catch (err: any) { alert(err.message || "操作失败"); }
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm("确认删除？")) return;
    try {
      await adminApi.deleteHomeConfig(token, id);
      loadConfigs();
    } catch { alert("删除失败"); }
  };

  const featured = configs.filter(c => c.configType === "FEATURED");
  const upcoming = configs.filter(c => c.configType === "UPCOMING");
  const getShowTitle = (showId: number) => shows.find(s => s.id === showId)?.title || `演出#${showId}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">首页配置</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white text-sm font-medium">
          <Plus className="w-4 h-4" />添加配置
        </button>
      </div>
      {loading ? <div className="text-[var(--color-text-muted)]">加载中...</div> : (
        <div className="space-y-8">
          {[{ label: "精选演出", items: featured }, { label: "即将上演", items: upcoming }].map(({ label, items }) => (
            <div key={label}>
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">{label}</h2>
              <div className="glass rounded-xl p-4">
                {items.length === 0 && <div className="text-sm text-[var(--color-text-muted)] py-2">暂无配置</div>}
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                    <div>
                      <span className="text-sm text-[var(--color-text-primary)]">{getShowTitle(item.showId)}</span>
                      <span className="text-xs text-[var(--color-text-muted)] ml-3">排序: {item.sortOrder}</span>
                    </div>
                    <button onClick={() => handleDelete(item.id)} className="p-1 text-[var(--color-accent)] hover:bg-[var(--color-bg-elevated)] rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[var(--color-text-primary)]">添加首页配置</h2>
                <button onClick={() => setShowModal(false)} className="p-1 text-[var(--color-text-muted)]"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">类型*</label>
                  <select value={form.configType} onChange={e => setForm({...form, configType: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm">
                    <option value="FEATURED">精选演出</option><option value="UPCOMING">即将上演</option>
                  </select>
                </div>
                <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">演出*</label>
                  <select value={form.showId} onChange={e => setForm({...form, showId: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm">
                    <option value="">选择演出</option>
                    {shows.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">排序</label>
                  <input type="number" value={form.sortOrder} onChange={e => setForm({...form, sortOrder: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm" />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleAdd} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white text-sm font-medium">保存</button>
                <button onClick={() => setShowModal(false)} className="px-6 py-2 rounded-lg border border-[var(--color-border)] text-sm">取消</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
