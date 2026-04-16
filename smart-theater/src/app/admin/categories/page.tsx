"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { adminApi } from "@/lib/adminApi";

export default function CategoriesManagement() {
  const { token } = useAuthStore();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", icon: "", sortOrder: "" });

  useEffect(() => { loadCategories(); }, [token]);

  const loadCategories = () => {
    if (token) {
      adminApi.getCategories(token)
        .then(setCategories)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  };

  const openModal = (cat?: any) => {
    if (cat) {
      setEditing(cat);
      setForm({ name: cat.name, icon: cat.icon || "", sortOrder: cat.sortOrder || "" });
    } else {
      setEditing(null);
      setForm({ name: "", icon: "", sortOrder: "" });
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!token || !form.name) { alert("请填写名称"); return; }
    try {
      if (editing) {
        await adminApi.updateCategory(token, editing.id, form);
      } else {
        await adminApi.createCategory(token, form);
      }
      setShowModal(false);
      loadCategories();
    } catch (err: any) {
      alert(err.message || "操作失败");
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm("确认删除？")) return;
    try {
      await adminApi.deleteCategory(token, id);
      loadCategories();
    } catch (err) {
      alert("删除失败");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">分类管理</h1>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white text-sm font-medium">
          <Plus className="w-4 h-4" />
          新增分类
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
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)]">名称</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)]">排序</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)]">操作</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)]/50">
                  <td className="px-4 py-3 text-sm text-[var(--color-text-primary)]">{cat.id}</td>
                  <td className="px-4 py-3 text-sm text-[var(--color-text-primary)]">{cat.name}</td>
                  <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{cat.sortOrder}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openModal(cat)} className="p-1.5 rounded hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded hover:bg-[var(--color-bg-elevated)] text-[var(--color-accent)]">
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

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[var(--color-text-primary)]">{editing ? "编辑分类" : "新增分类"}</h2>
                <button onClick={() => setShowModal(false)} className="p-1 text-[var(--color-text-muted)]"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">名称*</label><input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm" /></div>
                <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">图标</label><input value={form.icon} onChange={(e) => setForm({...form, icon: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm" /></div>
                <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">排序</label><input type="number" value={form.sortOrder} onChange={(e) => setForm({...form, sortOrder: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm" /></div>
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
