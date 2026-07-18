"use client";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Shield, AlertTriangle, CheckCircle, XCircle,
  Activity, TrendingUp, Clock, Globe, MessageSquare, QrCode, RefreshCw
} from "lucide-react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, ArcElement, Tooltip, Legend, Filler
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

interface Stats {
  global: { total_analyzed: number; safe_scans: number; suspicious_scans: number; dangerous_scans: number; accuracy: number };
  user: { total_scans: number; safe_scans: number; suspicious_scans: number; dangerous_scans: number };
  chart_timeline: { labels: string[]; data: number[] };
}

interface Alert { id: number; title: string; description: string; severity: string; timestamp: string }
interface Scan { id: number; type: string; input: string; score: number; risk_level: string; timestamp: string }

const typeIcon = { url: Globe, message: MessageSquare, qr: QrCode };

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [history, setHistory] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    const token = localStorage.getItem("cyvra_token");
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      const [statsRes, alertsRes, historyRes] = await Promise.all([
        fetch("http://localhost:8000/api/scans/stats", { headers }),
        fetch("http://localhost:8000/api/scans/alerts"),
        fetch("http://localhost:8000/api/scans/history", { headers }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (alertsRes.ok) setAlerts(await alertsRes.json());
      if (historyRes.ok) setHistory(await historyRes.json());
    } catch {}
    setLoading(false);
  };

  const lineData = stats ? {
    labels: stats.chart_timeline.labels,
    datasets: [{
      label: "Daily Scans",
      data: stats.chart_timeline.data,
      borderColor: "rgba(255,255,255,0.6)",
      backgroundColor: "rgba(255,255,255,0.05)",
      borderWidth: 1.5,
      pointRadius: 3,
      pointBackgroundColor: "#fff",
      fill: true,
      tension: 0.4,
    }],
  } : null;

  const doughnutData = stats ? {
    labels: ["Safe", "Suspicious", "Dangerous"],
    datasets: [{
      data: [stats.global.safe_scans, stats.global.suspicious_scans, stats.global.dangerous_scans],
      backgroundColor: ["rgba(255,255,255,0.15)", "rgba(150,150,150,0.15)", "rgba(80,80,80,0.25)"],
      borderColor: ["rgba(255,255,255,0.4)", "rgba(150,150,150,0.3)", "rgba(80,80,80,0.3)"],
      borderWidth: 1,
    }],
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: "#1a1a1a", borderColor: "#333", borderWidth: 1 } },
    scales: {
      x: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#666", font: { size: 11 } } },
      y: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#666", font: { size: 11 } } },
    },
  };

  const severityClass: Record<string, string> = {
    high: "severity-high",
    medium: "severity-medium",
    low: "severity-low",
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleDateString([], { month: "short", day: "numeric" }) + " " +
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 text-muted animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted text-xs font-mono">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>dashboard / threat-intelligence</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Threat Intelligence Dashboard</h1>
        </div>
        <button onClick={loadDashboard} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Global Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Analyzed", value: stats.global.total_analyzed.toLocaleString(), icon: Activity, sub: "Platform-wide" },
            { label: "Safe Scans", value: stats.global.safe_scans.toLocaleString(), icon: CheckCircle, sub: "Verified safe" },
            { label: "Dangerous Scans", value: stats.global.dangerous_scans.toLocaleString(), icon: XCircle, sub: "Threats blocked" },
            { label: "AI Accuracy", value: `${stats.global.accuracy}%`, icon: Shield, sub: "Detection rate" },
          ].map(({ label, value, icon: Icon, sub }) => (
            <div key={label} className="glass-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted">{label}</p>
                <Icon className="w-4 h-4 text-muted" />
              </div>
              <p className="stat-number text-white">{value}</p>
              <p className="text-xs text-muted">{sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts Row */}
      {stats && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 glass-card p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-white">7-Day Scan Activity</p>
              <TrendingUp className="w-4 h-4 text-muted" />
            </div>
            {lineData && <Line data={lineData} options={chartOptions as any} height={120} />}
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-white">Threat Distribution</p>
              <Activity className="w-4 h-4 text-muted" />
            </div>
            {doughnutData && (
              <Doughnut data={doughnutData} options={{
                responsive: true,
                plugins: {
                  legend: { position: "bottom", labels: { color: "#666", boxWidth: 10, font: { size: 11 } } },
                  tooltip: { backgroundColor: "#1a1a1a", borderColor: "#333", borderWidth: 1 },
                },
              }} />
            )}
          </div>
        </div>
      )}

      {/* Alerts & History */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Security Alerts */}
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white">Security Alerts</p>
            <AlertTriangle className="w-4 h-4 text-muted" />
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {alerts.length === 0 ? (
              <p className="text-xs text-muted text-center py-6">No alerts at this time</p>
            ) : alerts.map((alert) => (
              <div key={alert.id} className={`pl-3 space-y-1 ${severityClass[alert.severity] || ""}`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white font-medium">{alert.title}</p>
                  <span className="text-[10px] text-muted capitalize border border-border rounded px-1.5 py-0.5">{alert.severity}</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">{alert.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scan History */}
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white">Recent Scans</p>
            <Clock className="w-4 h-4 text-muted" />
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {history.length === 0 ? (
              <p className="text-xs text-muted text-center py-6">No scans yet. Log in and start scanning!</p>
            ) : history.slice(0, 10).map((scan) => {
              const Icon = typeIcon[scan.type as keyof typeof typeIcon] || Globe;
              return (
                <div key={scan.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <Icon className="w-4 h-4 text-muted flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white truncate">{scan.input}</p>
                    <p className="text-[10px] text-muted">{formatTime(scan.timestamp)}</p>
                  </div>
                  <span className={`text-[10px] flex-shrink-0 ${
                    scan.risk_level === "Safe" ? "badge-safe" : scan.risk_level === "Suspicious" ? "badge-suspicious" : "badge-dangerous"
                  }`}>{scan.risk_level}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Stats */}
      {stats && (stats.user.total_scans > 0) && (
        <div className="glass-card p-4">
          <p className="text-sm font-medium text-white mb-4">Your Scan Summary</p>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Total", value: stats.user.total_scans },
              { label: "Safe", value: stats.user.safe_scans },
              { label: "Suspicious", value: stats.user.suspicious_scans },
              { label: "Dangerous", value: stats.user.dangerous_scans },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs text-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
