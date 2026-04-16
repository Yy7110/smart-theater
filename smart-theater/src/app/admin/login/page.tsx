"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Eye, EyeOff, User, Lock, Shield, Clapperboard, ScanLine, ArrowLeft } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/authStore";
import Link from "next/link";

const roleOptions = [
  { key: "ADMIN", label: "系统管理员", icon: Shield, desc: "全系统管理权限" },
  { key: "OPERATOR", label: "剧院运营", icon: Clapperboard, desc: "演出管理与运营" },
  { key: "INSPECTOR", label: "检票人员", icon: ScanLine, desc: "票据核销与验证" },
];

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState("ADMIN");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("请输入用户名和密码");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await authApi.login(username, password);
      // Verify role matches
      const allowedRoles = ["ADMIN", "OPERATOR", "INSPECTOR"];
      if (!allowedRoles.includes(result.role)) {
        setError("该账号无后台管理权限");
        setLoading(false);
        return;
      }
      login(
        {
          userId: result.userId,
          username: result.username,
          nickname: result.nickname,
          role: result.role,
          avatar: result.avatar,
        },
        result.accessToken
      );
      // Route by role
      if (result.role === "INSPECTOR") {
        router.push("/admin/inspector");
      } else if (result.role === "OPERATOR") {
        router.push("/admin/operator");
      } else {
        router.push("/admin");
      }
    } catch (err: any) {
      setError(err.message || "登录失败，请检查用户名和密码");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-[var(--color-glow-purple)] rounded-full blur-[128px] opacity-20" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-[var(--color-glow-cyan)] rounded-full blur-[128px] opacity-15" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 shadow-2xl">
          {/* Back to Home */}
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary-light)] transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>

          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-cyan)] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">
              <span className="gradient-text">智慧剧院</span>
              <span className="text-[var(--color-text-primary)]"> 管理平台</span>
            </span>
          </div>
          <p className="text-center text-sm text-[var(--color-text-muted)] mb-6">工作人员登录</p>

          {/* Role selector */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {roleOptions.map((role) => (
              <button
                key={role.key}
                onClick={() => setSelectedRole(role.key)}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all duration-200 ${
                  selectedRole === role.key
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                    : "border-[var(--color-border)] hover:border-[var(--color-border)]/80"
                }`}
              >
                <role.icon className={`w-5 h-5 ${selectedRole === role.key ? "text-[var(--color-primary-light)]" : "text-[var(--color-text-muted)]"}`} />
                <span className={`text-xs font-medium ${selectedRole === role.key ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"}`}>
                  {role.label}
                </span>
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-sm text-[var(--color-accent)]"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">用户名</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full pl-10 pr-10 py-3 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-cyan)] text-white font-semibold hover:shadow-lg hover:shadow-[var(--color-glow-purple)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  登录中...
                </span>
              ) : (
                "登录管理平台"
              )}
            </button>
          </form>

          {/* Hint */}
          <div className="mt-6 p-3 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              <span className="text-[var(--color-primary-light)] font-medium">提示：</span>
              管理员(root/123456) · 运营(theater/123456) · 检票(check/123456)
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
