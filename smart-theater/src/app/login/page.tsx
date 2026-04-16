"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Eye, EyeOff, Smartphone, QrCode, User, Lock, ArrowLeft, MessageSquare } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/authStore";

type LoginTab = "password" | "sms" | "qrcode";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [activeTab, setActiveTab] = useState<LoginTab>("password");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Password login form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // SMS login form (UI only)
  const [phone, setPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [smsSent, setSmsSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("请输入用户名和密码");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await authApi.login(username, password);
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
      router.push("/");
    } catch (err: any) {
      setError(err.message || "登录失败，请检查用户名和密码");
    } finally {
      setLoading(false);
    }
  };

  const handleSmsSend = () => {
    if (!phone.trim() || phone.length !== 11) {
      setError("请输入正确的手机号");
      return;
    }
    setSmsSent(true);
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setSmsSent(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const tabs = [
    { key: "password" as LoginTab, label: "密码登录", icon: Lock },
    { key: "sms" as LoginTab, label: "短信登录", icon: Smartphone },
    { key: "qrcode" as LoginTab, label: "扫码登录", icon: QrCode },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      {/* Background effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-glow-purple)] rounded-full blur-[128px] opacity-30" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-glow-pink)] rounded-full blur-[128px] opacity-20" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>

        {/* Card */}
        <div className="glass rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">
              <span className="gradient-text">智慧</span>
              <span className="text-[var(--color-text-primary)]">大剧院</span>
            </span>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[var(--color-border)] mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setError("");
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab.key
                    ? "text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="login-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-sm text-[var(--color-accent)]"
            >
              {error}
            </motion.div>
          )}

          {/* Password Login */}
          {activeTab === "password" && (
            <motion.form
              key="password"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={handlePasswordLogin}
              className="space-y-4"
            >
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
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white font-semibold hover:shadow-lg hover:shadow-[var(--color-glow-purple)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  "登 录"
                )}
              </button>
            </motion.form>
          )}

          {/* SMS Login (UI only) */}
          {activeTab === "sms" && (
            <motion.div
              key="sms"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">手机号</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                    placeholder="请输入手机号"
                    className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">验证码</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                    <input
                      type="text"
                      value={smsCode}
                      onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="请输入验证码"
                      className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleSmsSend}
                    disabled={smsSent}
                    className="px-4 py-3 rounded-xl border border-[var(--color-primary)] text-sm text-[var(--color-primary-light)] hover:bg-[var(--color-primary)]/10 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {smsSent ? `${countdown}s` : "获取验证码"}
                  </button>
                </div>
              </div>
              <button
                onClick={() => setError("短信登录功能暂未开放，请使用密码登录")}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white font-semibold hover:shadow-lg hover:shadow-[var(--color-glow-purple)] transition-all duration-300"
              >
                登 录
              </button>
            </motion.div>
          )}

          {/* QR Code Login (UI only) */}
          {activeTab === "qrcode" && (
            <motion.div
              key="qrcode"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center py-6"
            >
              <div className="w-48 h-48 rounded-2xl bg-white p-3 mb-4">
                <div className="w-full h-full rounded-xl bg-[var(--color-bg-deep)] flex items-center justify-center relative overflow-hidden">
                  {/* Fake QR code pattern */}
                  <div className="grid grid-cols-9 gap-0.5 p-2">
                    {Array.from({ length: 81 }).map((_, i) => {
                      const row = Math.floor(i / 9);
                      const col = i % 9;
                      const isCorner = (row < 3 && col < 3) || (row < 3 && col > 5) || (row > 5 && col < 3);
                      const isRandom = Math.sin(i * 7.3 + 2.1) > 0;
                      return (
                        <div
                          key={i}
                          className={`w-3.5 h-3.5 rounded-[1px] ${
                            isCorner || isRandom ? "bg-[var(--color-bg-deep)]" : "bg-transparent"
                          }`}
                          style={{
                            background: isCorner
                              ? "var(--color-bg-deep)"
                              : isRandom
                              ? "var(--color-bg-deep)"
                              : "transparent",
                          }}
                        />
                      );
                    })}
                  </div>
                  {/* Center logo */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-1">打开智慧大剧院App</p>
              <p className="text-xs text-[var(--color-text-muted)]">扫描二维码登录</p>
              <button
                onClick={() => setError("扫码登录功能暂未开放，请使用密码登录")}
                className="mt-4 text-xs text-[var(--color-primary-light)] hover:underline"
              >
                二维码已失效？点击刷新
              </button>
            </motion.div>
          )}

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--color-text-muted)]">
              还没有账号？{" "}
              <Link href="/register" className="text-[var(--color-primary-light)] hover:underline">
                立即注册
              </Link>
            </p>
          </div>
        </div>

        {/* Staff login link */}
        <div className="mt-6 text-center">
          <Link
            href="/admin/login"
            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
          >
            工作人员入口 →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
