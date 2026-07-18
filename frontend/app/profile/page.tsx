"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Globe, MessageSquare, QrCode, Shield, Download, Clock, LogOut, RefreshCw } from "lucide-react";

interface UserData { id: number; email: string; created_at: string }
interface Scan { id: number; type: string; input: string; score: number; risk_level: string; timestamp: string }

const typeIcon = { url: Globe, message: MessageSquare, qr: QrCode };
const typeLabel = { url: "URL Scan", message: "Message Scan", qr: "QR Scan" };

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [history, setHistory] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    const token = localStorage.getItem("cyvra_token");
    if (!token) { setLoading(false); return; }
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [userRes, histRes] = await Promise.all([
        fetch("http://localhost:8000/api/auth/me", { headers }),
        fetch("http://localhost:8000/api/scans/history", { headers }),
      ]);
      if (userRes.ok) setUser(await userRes.json());
      if (histRes.ok) setHistory(await histRes.json());
    } catch {}
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("cyvra_token");
    window.location.href = "/";
  };

  const exportPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("CYVRA - Scan History Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`User: ${user?.email}`, 20, 35);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 45);
    doc.setFontSize(10);
    let y = 60;
    history.forEach((scan, i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(`${i + 1}. [${scan.type.toUpperCase()}] Score: ${scan.score} | ${scan.risk_level}`, 20, y);
      doc.text(`   ${scan.input.substring(0, 80)}`, 20, y + 7);
      doc.text(`   ${new Date(scan.timestamp).toLocaleString()}`, 20, y + 14);
      y += 22;
    });
    doc.save("cyvra-report.pdf");
  };

  const formatTime = (ts: string) => new Date(ts).toLocaleDateString([], { year: "numeric", month: "long", day: "numeric" });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="w-6 h-6 text-muted animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="max-w-md mx-auto p-6 text-center space-y-4 mt-20">
      <Shield className="w-12 h-12 text-muted mx-auto" />
      <h2 className="text-xl font-bold text-white">Sign in to view your profile</h2>
      <p className="text-muted text-sm">Create an account to save your scan history and access all features.</p>
      <div className="flex justify-center gap-3">
        <Link href="/auth/login" className="btn-primary">Sign In</Link>
        <Link href="/auth/signup" className="btn-secondary">Create Account</Link>
      </div>
    </div>
  );

  const safe = history.filter(s => s.risk_level === "Safe").length;
  const dangerous = history.filter(s => s.risk_level === "Dangerous").length;
  const suspicious = history.filter(s => s.risk_level === "Suspicious").length;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 page-enter">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-muted text-xs font-mono">
          <User className="w-3.5 h-3.5" />
          <span>profile / account</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Your Profile</h1>
      </div>

      {/* User Info */}
      <div className="glass-card p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-surface-3 border border-border flex items-center justify-center flex-shrink-0">
          <User className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold">{user.email}</p>
          <p className="text-xs text-muted mt-0.5">Member since {formatTime(user.created_at)}</p>
        </div>
        <button onClick={handleLogout} className="btn-secondary flex items-center gap-2 text-sm">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Scans", value: history.length },
          { label: "Safe", value: safe },
          { label: "Threats", value: dangerous + suspicious },
        ].map(({ label, value }) => (
          <div key={label} className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-muted mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Scan History */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-white">Scan History</p>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button onClick={exportPDF} className="btn-secondary flex items-center gap-1.5 text-xs py-1.5">
                <Download className="w-3.5 h-3.5" />
                Export PDF
              </button>
            )}
            <Clock className="w-4 h-4 text-muted" />
          </div>
        </div>

        <div className="space-y-2">
          {history.length === 0 ? (
            <p className="text-xs text-muted text-center py-8">
              No scans recorded yet. Start scanning to build your history!
            </p>
          ) : history.map((scan) => {
            const Icon = typeIcon[scan.type as keyof typeof typeIcon] || Globe;
            return (
              <div key={scan.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                <div className="w-8 h-8 rounded-lg border border-border flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{scan.input}</p>
                  <p className="text-[10px] text-muted mt-0.5">
                    {typeLabel[scan.type as keyof typeof typeLabel] || scan.type} · {new Date(scan.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-muted">{scan.score}</span>
                  <span className={
                    scan.risk_level === "Safe" ? "badge-safe" : scan.risk_level === "Suspicious" ? "badge-suspicious" : "badge-dangerous"
                  }>{scan.risk_level}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
