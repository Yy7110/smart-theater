"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { LayoutDashboard, Ticket, ShoppingCart, Users, Tag, Building2, Settings, MessageSquare, LogOut, Sparkles, ScanLine, Clapperboard, Search, Bell, Calendar, LayoutGrid, DollarSign, BarChart3, Star, Wrench } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";

const adminMenuItems = [
  { href: "/admin", label: "控制台", icon: LayoutDashboard, group: "概览" },
  { href: "/admin/shows", label: "演出列表", icon: Ticket, group: "演出管理" },
  { href: "/admin/venues", label: "场馆管理", icon: Building2, group: "演出管理" },
  { href: "/admin/orders", label: "订单管理", icon: ShoppingCart, group: "订单与财务" },
  { href: "/admin/users", label: "用户管理", icon: Users, group: "用户" },
  { href: "/admin/messages", label: "评论反馈", icon: MessageSquare, group: "用户" },
  { href: "/admin/categories", label: "分类管理", icon: Tag, group: "系统" },
  { href: "/admin/home-config", label: "首页配置", icon: Settings, group: "系统" },
];

const operatorMenuItems = [
  { href: "/admin/operator", label: "控制台", icon: LayoutDashboard, group: "概览" },
  { href: "/admin/operator?tab=schedules", label: "演出排期", icon: Calendar, group: "演出管理" },
  { href: "/admin/operator?tab=seats", label: "座位管理", icon: LayoutGrid, group: "演出管理" },
  { href: "/admin/operator?tab=orders", label: "票务设置", icon: DollarSign, group: "票务管理" },
  { href: "/admin/operator?tab=feedback", label: "观众反馈", icon: Star, group: "运营分析" },
];

const inspectorMenuItems = [
  { href: "/admin/inspector", label: "票据核销", icon: ScanLine, group: "检票" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoggedIn, logout, init } = useAuthStore();

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    if (pathname === "/admin/login") return;
    if (!isLoggedIn || !user) { router.push("/admin/login"); return; }
    if (!["ADMIN", "OPERATOR", "INSPECTOR"].includes(user.role)) router.push("/admin/login");
  }, [isLoggedIn, user, router, pathname]);

  if (pathname === "/admin/login") return <>{children}</>;
  if (!isLoggedIn || !user) return null;

  // Inspector uses its own full-screen layout
  if (user.role === "INSPECTOR") return <>{children}</>;

  const handleLogout = () => { logout(); router.push("/admin/login"); };

  let menuItems = user.role === "ADMIN" ? adminMenuItems : user.role === "OPERATOR" ? operatorMenuItems : inspectorMenuItems;

  // Group menu items
  const groups: Record<string, typeof menuItems> = {};
  menuItems.forEach(item => { (groups[item.group] = groups[item.group] || []).push(item); });

  const roleLabel = user.role === "ADMIN" ? "管理员" : user.role === "OPERATOR" ? "剧院经理" : "检票员";
  const avatarChar = user.role === "ADMIN" ? "管" : user.role === "OPERATOR" ? "剧" : "检";
  const avatarGradient = user.role === "ADMIN" ? "from-[var(--color-primary)] to-[var(--color-accent)]" : user.role === "OPERATOR" ? "from-[var(--color-cyan)] to-[#3B82F6]" : "from-green-500 to-green-400";

  return (
    <div className="min-h-screen bg-[var(--color-bg-deep)] flex">
      {/* Sidebar */}
      <motion.aside initial={{ x: -280 }} animate={{ x: 0 }}
        className="w-64 bg-[var(--color-bg-card)] border-r border-[var(--color-border)] flex flex-col fixed h-screen z-50">
        {/* Logo */}
        <div className="p-6 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-cyan)] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-[var(--color-text-primary)]">智慧剧院</div>
              <div className="text-xs text-[var(--color-text-muted)]">管理平台</div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {Object.entries(groups).map(([group, items]) => (
            <div key={group} className="mb-4">
              <div className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider px-3 mb-2">{group}</div>
              <div className="space-y-1">
                {items.map((item) => {
                  const [itemPath, itemQuery] = item.href.split('?');
                  const isActive = itemQuery
                    ? pathname === itemPath && new URLSearchParams(window.location.search).get('tab') === new URLSearchParams(itemQuery).get('tab')
                    : pathname === itemPath && !new URLSearchParams(window.location.search).get('tab');
                  return (
                    <Link key={item.href + item.label} href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-accent)]/10 text-[var(--color-primary-light)] border border-[var(--color-primary)]/30"
                          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
                      }`}>
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-sm text-white font-bold`}>{avatarChar}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[var(--color-text-primary)] truncate">{roleLabel}</div>
              <div className="text-xs text-[var(--color-text-muted)]">{user.username}@smart-theater.cn</div>
            </div>
            <button onClick={handleLogout} className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 ml-64">
        {/* Top Header */}
        <div className="glass sticky top-0 z-40 px-8 py-4 flex items-center justify-between border-b border-[var(--color-border)]">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              {user.role === "ADMIN" ? "管理后台" : "剧院管理后台"}
            </h2>
            <p className="text-xs text-[var(--color-text-muted)]">欢迎回来，{user.nickname || user.username}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input placeholder="搜索..." className="pl-9 pr-4 py-2 w-48 rounded-lg bg-[var(--color-bg-deep)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)]" />
            </div>
            <button className="relative p-2 rounded-lg hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--color-accent)]" />
            </button>
          </div>
        </div>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
