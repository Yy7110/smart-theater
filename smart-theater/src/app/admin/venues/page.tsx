"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { adminApi } from "@/lib/adminApi";

export default function VenuesManagement() {
  const { token } = useAuthStore();
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", city: "", address: "", description: "", phone: "", totalSeats: "" });

  useEffect(() => { loadVenues(); }, [token]);

  const loadVenues = () => {
    if (token) adminApi.getVenues(token).then(setVenues).catch(() => {}).finally(() => setLoading(false));
  };

  const openModal = (venue?: any) => {
    if (venue) {
      setEditing(venue);
      setForm({ name: venue.name || "", city: venue.city || "", address: venue.address || "", description: venue.description || "", phone: venue.phone || "", totalSeats: venue.totalSeats || "" });
    } else {
      setEditing(null);
      setForm({ name: "", city: "", address: "", description: "", phone: "", totalSeats: "" });
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!token || !form.name || !form.city) { alert("请填写必填项"); return; }
    try {
      if (editing) {
        await adminApi.updateVenue(token, editing.id, form);
      } else {
        await adminApi.createVenue(token, form);
      }
      setShowModal(false);
      loadVenues();
    } catch (err: any) { alert(err.message || "操作失败"); }
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm("确认删除该场馆？")) return;
    try {
      await adminApi.deleteVenue(token, id);
      loadVenues();
    } catch { alert("删除失败"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">场馆管理</h1>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white text-sm font-medium">
          <Plus className="w-4 h-4" />新增场馆
        </button>
      </div>
      {loading ? <div className="text-[var(--color-text-muted)]">加载中...</div> : (
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)]">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)]">名称</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)]">城市</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)]">地址</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)]">座位数</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)]">操作</th>
              </tr>
            </thead>
            <tbody>
              {venues.map((v) => (
                <tr key={v.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)]/50">
                  <td className="px-4 py-3 text-sm text-[var(--color-text-primary)]">{v.id}</td>
                  <td className="px-4 py-3 text-sm text-[var(--color-text-primary)]">{v.name}</td>
                  <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{v.city}</td>
                  <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{v.address}</td>
                  <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{v.totalSeats}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openModal(v)} className="p-1.5 rounded hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(v.id)} className="p-1.5 rounded hover:bg-[var(--color-bg-elevated)] text-[var(--color-accent)]"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass rounded-xl p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[var(--color-text-primary)]">{editing ? "编辑场馆" : "新增场馆"}</h2>
                <button onClick={() => setShowModal(false)} className="p-1 text-[var(--color-text-muted)]"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">名称*</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">城市*</label><input value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm" /></div>
                  <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">座位数</label><input type="number" value={form.totalSeats} onChange={e => setForm({...form, totalSeats: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm" /></div>
                </div>
                <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">地址</label><input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm" /></div>
                <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">电话</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm" /></div>
                <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">描述</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm" /></div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleSubmit} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white text-sm font-medium">保存</button>
                <button onClick={() => setShowModal(false)} className="px-6 py-2 rounded-lg border border-[var(--color-border)] text-sm">取消</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
