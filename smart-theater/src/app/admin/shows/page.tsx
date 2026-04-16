"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, Eye, EyeOff, X } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { adminApi } from "@/lib/adminApi";

export default function ShowsManagement() {
  const { token } = useAuthStore();
  const [shows, setShows] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingShow, setEditingShow] = useState<any>(null);
  const [form, setForm] = useState({
    title: "", categoryId: "", venueId: "", artist: "", description: "",
    posterUrl: "", minPrice: "", maxPrice: "", status: "DRAFT"
  });

  useEffect(() => {
    if (token) {
      Promise.all([
        adminApi.getShows(token, { page: 1, size: 50 }),
        adminApi.getCategories(token),
        adminApi.getVenues(token)
      ]).then(([showsRes, cats, vens]) => {
        setShows(showsRes.records || []);
        setCategories(cats || []);
        setVenues(vens || []);
        console.log('Categories loaded:', cats);
        console.log('Venues loaded:', vens);
      }).catch((err) => {
        console.error('Load error:', err);
      }).finally(() => setLoading(false));
    }
  }, [token]);

  const loadShows = () => {
    if (token) {
      adminApi.getShows(token, { page: 1, size: 50 })
        .then((res) => setShows(res.records || []))
        .catch(() => {});
    }
  };

  const openModal = (show?: any) => {
    if (show) {
      setEditingShow(show);
      setForm({
        title: show.title, categoryId: show.categoryId, venueId: show.venueId,
        artist: show.artist || "", description: show.description || "",
        posterUrl: show.posterUrl || "", minPrice: show.minPrice || "",
        maxPrice: show.maxPrice || "", status: show.status
      });
    } else {
      setEditingShow(null);
      setForm({ title: "", categoryId: "", venueId: "", artist: "", description: "",
        posterUrl: "", minPrice: "", maxPrice: "", status: "DRAFT" });
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!token || !form.title || !form.categoryId || !form.venueId) {
      alert("请填写必填项");
      return;
    }
    try {
      if (editingShow) {
        await adminApi.updateShow(token, editingShow.id, form);
      } else {
        await adminApi.createShow(token, form);
      }
      setShowModal(false);
      loadShows();
    } catch (err: any) {
      alert(err.message || "操作失败");
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm("确认删除？")) return;
    try {
      await adminApi.deleteShow(token, id);
      loadShows();
    } catch (err) {
      alert("删除失败");
    }
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    if (!token) return;
    const newStatus = currentStatus === "ON_SALE" ? "OFF_SHELF" : "ON_SALE";
    try {
      await adminApi.updateShowStatus(token, id, newStatus);
      setShows(shows.map(s => s.id === id ? { ...s, status: newStatus } : s));
    } catch (err) {
      alert("操作失败");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">演出管理</h1>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white text-sm font-medium">
          <Plus className="w-4 h-4" />
          新增演出
        </button>
      </div>

      {loading ? (
        <div className="text-[var(--color-text-muted)]">加载中...</div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)]">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)]">标题</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)]">分类</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)]">状态</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)]">操作</th>
              </tr>
            </thead>
            <tbody>
              {shows.map((show) => (
                <tr key={show.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)]/50">
                  <td className="px-4 py-3 text-sm text-[var(--color-text-primary)]">{show.id}</td>
                  <td className="px-4 py-3 text-sm text-[var(--color-text-primary)]">{show.title}</td>
                  <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{categories.find(c => c.id == show.categoryId)?.name || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      show.status === "ON_SALE" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                    }`}>
                      {show.status === "ON_SALE" ? "上架" : "下架"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStatus(show.id, show.status)}
                        className="p-1.5 rounded hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]"
                      >
                        {show.status === "ON_SALE" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button onClick={() => openModal(show)} className="p-1.5 rounded hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(show.id)} className="p-1.5 rounded hover:bg-[var(--color-bg-elevated)] text-[var(--color-accent)]">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[var(--color-text-primary)]">{editingShow ? "编辑演出" : "新增演出"}</h2>
                <button onClick={() => setShowModal(false)} className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">标题*</label><input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)]" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">分类*</label><select value={form.categoryId} onChange={(e) => setForm({...form, categoryId: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)]"><option value="">选择分类</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                  <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">场馆*</label><select value={form.venueId} onChange={(e) => setForm({...form, venueId: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)]"><option value="">选择场馆</option>{venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></div>
                </div>
                <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">艺术家</label><input value={form.artist} onChange={(e) => setForm({...form, artist: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)]" /></div>
                <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">描述</label><textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={3} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)]" /></div>
                <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">海报URL</label><input value={form.posterUrl} onChange={(e) => setForm({...form, posterUrl: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)]" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">最低价</label><input type="number" value={form.minPrice} onChange={(e) => setForm({...form, minPrice: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)]" /></div>
                  <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">最高价</label><input type="number" value={form.maxPrice} onChange={(e) => setForm({...form, maxPrice: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)]" /></div>
                </div>
                <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">状态</label><select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)]"><option value="DRAFT">草稿</option><option value="ON_SALE">上架</option><option value="OFF_SHELF">下架</option></select></div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleSubmit} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white text-sm font-medium">保存</button>
                <button onClick={() => setShowModal(false)} className="px-6 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)]">取消</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
