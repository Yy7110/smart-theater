"use client";

import { useEffect, useState } from "react";
import { Mail, CheckCircle, Send } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { adminApi } from "@/lib/adminApi";

export default function MessagesManagement() {
  const { token } = useAuthStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    if (token) {
      adminApi.getMessages(token, { page: 1, size: 50 })
        .then((res) => setMessages(res.records || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [token]);

  const markRead = async (id: number) => {
    if (!token) return;
    try {
      await adminApi.markMessageRead(token, id);
      setMessages(messages.map(m => m.id === id ? { ...m, isRead: 1 } : m));
    } catch { alert("操作失败"); }
  };

  const handleReply = async (id: number) => {
    if (!token || !replyText.trim()) return;
    try {
      await adminApi.replyMessage(token, id, replyText);
      setMessages(messages.map(m => m.id === id ? { ...m, reply: replyText, isRead: 1 } : m));
      setReplyingId(null);
      setReplyText("");
    } catch { alert("回复失败"); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">留言管理</h1>
      {loading ? <div className="text-[var(--color-text-muted)]">加载中...</div> : (
        <div className="space-y-4">
          {messages.length === 0 && <div className="text-sm text-[var(--color-text-muted)]">暂无留言</div>}
          {messages.map((msg) => (
            <div key={msg.id} className="glass rounded-xl p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[var(--color-primary-light)]" />
                  <div>
                    <div className="text-sm font-medium text-[var(--color-text-primary)]">{msg.name}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">{msg.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {msg.isRead !== 1 && (
                    <button onClick={() => markRead(msg.id)} className="flex items-center gap-1 px-2 py-1 text-xs text-[var(--color-primary-light)] hover:bg-[var(--color-primary)]/10 rounded">
                      <CheckCircle className="w-3 h-3" />标记已读
                    </button>
                  )}
                  {!msg.reply && (
                    <button onClick={() => { setReplyingId(msg.id); setReplyText(""); }} className="flex items-center gap-1 px-2 py-1 text-xs text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/10 rounded">
                      <Send className="w-3 h-3" />回复
                    </button>
                  )}
                </div>
              </div>
              {msg.subject && <div className="text-sm font-medium text-[var(--color-text-primary)] mb-2">{msg.subject}</div>}
              <div className="text-sm text-[var(--color-text-secondary)]">{msg.message}</div>
              {msg.reply && (
                <div className="mt-3 p-3 rounded-lg bg-[var(--color-bg-elevated)] border-l-2 border-[var(--color-primary)]">
                  <div className="text-xs text-[var(--color-text-muted)] mb-1">回复:</div>
                  <div className="text-sm text-[var(--color-text-primary)]">{msg.reply}</div>
                </div>
              )}
              {replyingId === msg.id && (
                <div className="mt-3 flex gap-2">
                  <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="输入回复内容..." className="flex-1 px-3 py-2 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)]" onKeyDown={e => e.key === "Enter" && handleReply(msg.id)} />
                  <button onClick={() => handleReply(msg.id)} className="px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white text-sm">发送</button>
                  <button onClick={() => setReplyingId(null)} className="px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)]">取消</button>
                </div>
              )}
              <div className="text-xs text-[var(--color-text-muted)] mt-3">{msg.createTime}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
