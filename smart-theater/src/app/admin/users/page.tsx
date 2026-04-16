"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Ban, CheckCircle, Plus, Edit, X, Trash2 } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { adminApi } from "@/lib/adminApi";

export default function UsersManagement() {
  const { token } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ username: "", password: "", nickname: "", phone: "", email: "", role: "AUDIENCE" });

  useEffect(() => { loadUsers(); }, [token]);

  const loadUsers = () => {
    if (token) {
      adminApi.getUsers(token, { page: 1, size: 50 })
        .then((res) => setUsers(res.records || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  };

  const openModal = (user?: any) => {
    if (user) {
      setEditing(user);
      setForm({ username: user.username, password: "", nickname: user.nickname || "", phone: user.phone || "", email: user.email || "", role: user.role });
    } else {
      setEditing(null);
      setForm({ username: "", password: "", nickname: "", phone: "", email: "", role: "AUDIENCE" });
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!token || !form.username || (!editing && !form.password)) {
      alert("请填写必填项");
      return;
    }
    try {
      if (editing) {
        const updateData: any = { nickname: form.nickname, phone: form.phone, email: form.email, role: form.role };
        if (form.password) updateData.password = form.password;
        await adminApi.updateUser(token, editing.id, updateData);
      } else {
        await adminApi.createUser(token, form);
      }
      setShowModal(false);
      loadUsers();
    } catch (err: any) {
      alert(err.message || "操作失败");
    }
  };

  const toggleStatus = async (id: number, currentStatus: number) => {
    if (!token) return;
    const newStatus = currentStatus === 1 ? 0 : 1;
    try {
      await adminApi.updateUserStatus(token, id, newStatus);
      setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
    } catch (err) {
      alert("操作失败");
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm("确认删除该用户？")) return;
    try {
      await adminApi.deleteUser(token, id);
      loadUsers();
    } catch (err) {
      alert("删除失败");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">用户管理</h1>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white text-sm font-medium">
          <Plus className="w-4 h-4" />
          新增用户
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
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)]">用户名</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)]">昵称</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)]">角色</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)]">状态</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)]">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)]/50">
                  <td className="px-4 py-3 text-sm text-[var(--color-text-primary)]">{user.id}</td>
                  <td className="px-4 py-3 text-sm text-[var(--color-text-primary)]">{user.username}</td>
                  <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{user.nickname}</td>
                  <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{user.role}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.status === 1 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}>
                      {user.status === 1 ? "启用" : "禁用"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(user.id, user.status)}
                      className="p-1.5 rounded hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]"
                      title={user.status === 1 ? "禁用" : "启用"}
                    >
                      {user.status === 1 ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                    <button onClick={() => openModal(user)} className="p-1.5 rounded hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] ml-2">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(user.id)} className="p-1.5 rounded hover:bg-[var(--color-bg-elevated)] text-[var(--color-accent)] ml-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
                <h2 className="text-lg font-bold text-[var(--color-text-primary)]">{editing ? "编辑用户" : "新增用户"}</h2>
                <button onClick={() => setShowModal(false)} className="p-1 text-[var(--color-text-muted)]"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">用户名*</label><input value={form.username} onChange={(e) => setForm({...form, username: e.target.value})} disabled={!!editing} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm disabled:opacity-50" /></div>
                <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">密码{!editing && "*"}</label><input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} placeholder={editing ? "留空则不修改" : ""} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm" /></div>
                <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">昵称</label><input value={form.nickname} onChange={(e) => setForm({...form, nickname: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm" /></div>
                <div><label className="block text-sm text-[var(--color-text-secondary)] mb-1">角色</label><select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm"><option value="AUDIENCE">观众</option><option value="OPERATOR">运营人员</option><option value="INSPECTOR">检票员</option><option value="ADMIN">管理员</option></select></div>
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
