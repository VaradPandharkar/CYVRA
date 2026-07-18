"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield, Globe, MessageSquare, QrCode, LayoutDashboard,
  User, Chrome, Bell, Settings, Menu, X, LogOut,
  ChevronRight, Activity, Zap
} from "lucide-react";

const navLinks = [
  { href: "/", label: "Home", icon: Zap },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/url-scan", label: "URL Scanner", icon: Globe },
  { href: "/message-scan", label: "Message Scan", icon: MessageSquare },
  { href: "/qr-scan", label: "QR Scanner", icon: QrCode },
  { href: "/extension", label: "Extension", icon: Chrome },
];

const bottomLinks = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/auth/login", label: "Login", icon: Activity },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("cyvra_token");
    if (token) {
      fetch("http://localhost:8000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.email) setUser(data);
        })
        .catch(() => {});
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("cyvra_token");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <aside
      className={`flex flex-col h-screen bg-surface border-r border-border transition-all duration-300 ${
        collapsed ? "w-16" : "w-56"
      } flex-shrink-0 relative z-20`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-black" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <span className="font-bold text-white tracking-wider text-sm">CYVRA</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-muted hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-xs text-muted px-2 pb-2 font-medium tracking-widest uppercase">
            Tools
          </p>
        )}
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-link ${isActive ? "active" : ""} ${
                collapsed ? "justify-center px-2" : ""
              }`}
              title={collapsed ? label : ""}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-4 border-t border-border space-y-1">
        {user ? (
          <>
            {!collapsed && (
              <div className="px-2 py-2 mb-2">
                <p className="text-xs text-muted truncate">{user.email}</p>
              </div>
            )}
            <Link
              href="/profile"
              className={`sidebar-link ${pathname === "/profile" ? "active" : ""} ${
                collapsed ? "justify-center px-2" : ""
              }`}
            >
              <User className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>Profile</span>}
            </Link>
            <button
              onClick={handleLogout}
              className={`sidebar-link w-full text-left ${
                collapsed ? "justify-center px-2" : ""
              }`}
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>Logout</span>}
            </button>
          </>
        ) : (
          <>
            <Link
              href="/auth/login"
              className={`sidebar-link ${pathname === "/auth/login" ? "active" : ""} ${
                collapsed ? "justify-center px-2" : ""
              }`}
            >
              <Activity className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>Login</span>}
            </Link>
            <Link
              href="/auth/signup"
              className={`sidebar-link ${pathname === "/auth/signup" ? "active" : ""} ${
                collapsed ? "justify-center px-2" : ""
              }`}
            >
              <User className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>Sign Up</span>}
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}
