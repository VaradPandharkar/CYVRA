"use client";
import { Shield, Chrome, Zap, Bell, Flag, Lock, Eye, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

const features = [
  { icon: Shield, title: "Real-time Threat Warnings", desc: "Instantly warns you before visiting any suspicious or phishing-classified website." },
  { icon: Zap, title: "Automatic Phishing Detection", desc: "CYVRA AI runs in the background, scanning every page you visit without slowing your browser." },
  { icon: Bell, title: "Smart Notifications", desc: "Non-intrusive alerts appear only when a genuine threat is detected." },
  { icon: Flag, title: "One-Click Reporting", desc: "Found a scam? Report it to our global threat database with one click from your toolbar." },
  { icon: Lock, title: "HTTPS Enforcement", desc: "Automatically upgrades HTTP connections to HTTPS where supported." },
  { icon: Eye, title: "Link Preview", desc: "Hover over any link to see a safety preview before clicking." },
];

const stats = [
  { value: "2.1M+", label: "Sites Protected" },
  { value: "< 5ms", label: "Scan Time" },
  { value: "0%", label: "False Positives" },
];

export default function ExtensionPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10 page-enter">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-muted text-xs font-mono">
          <Chrome className="w-3.5 h-3.5" />
          <span>extension / browser-security</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Browser Safety Extension</h1>
        <p className="text-muted text-sm">
          Get real-time protection directly in your browser with the CYVRA extension.
        </p>
      </div>

      {/* Hero Banner */}
      <div className="glass-card p-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full border border-border opacity-20" />
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full border border-border opacity-20" />

        <div className="relative flex flex-col md:flex-row items-center gap-8">
          {/* Extension mockup */}
          <div className="flex-shrink-0 w-64 bg-surface-3 rounded-xl border border-border-light overflow-hidden shadow-glow-md">
            {/* Browser bar mockup */}
            <div className="bg-surface-2 border-b border-border px-3 py-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-border" />
                <div className="w-2.5 h-2.5 rounded-full bg-border" />
                <div className="w-2.5 h-2.5 rounded-full bg-border" />
              </div>
              <div className="flex-1 bg-surface rounded px-2 py-0.5">
                <p className="text-[9px] text-muted font-mono">https://suspicious-site.xyz</p>
              </div>
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>

            {/* Popup mockup */}
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                  <Shield className="w-4 h-4 text-black" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">CYVRA</p>
                  <p className="text-[9px] text-muted">Security Active</p>
                </div>
              </div>

              <div className="bg-surface-2 rounded-lg p-3 border border-border space-y-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  <p className="text-[10px] text-white font-medium">⚠ THREAT DETECTED</p>
                </div>
                <p className="text-[9px] text-muted leading-relaxed">
                  This domain was registered 3 days ago and contains phishing keywords.
                </p>
                <div className="flex gap-1.5">
                  <button className="flex-1 bg-white text-black text-[9px] rounded px-2 py-1 font-semibold">Go Back</button>
                  <button className="flex-1 bg-surface border border-border text-[9px] rounded px-2 py-1 text-muted">Proceed</button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1">
                {[
                  { label: "Score", value: "18/100" },
                  { label: "SSL", value: "✗ Invalid" },
                  { label: "Age", value: "3 days" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-surface rounded p-1.5 text-center">
                    <p className="text-[8px] text-muted">{label}</p>
                    <p className="text-[9px] text-white font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 bg-surface-3 border border-border rounded-full px-3 py-1">
              <span className="text-xs text-muted">Coming Soon</span>
            </div>
            <h2 className="text-2xl font-bold text-white leading-tight">
              Real-time protection,<br />built into your browser
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              The CYVRA browser extension silently monitors every URL you visit,
              scanning for phishing patterns, suspicious domains, and malicious redirects
              before you even land on the page.
            </p>
            <div className="flex gap-3">
              <button className="btn-primary flex items-center gap-2 opacity-60 cursor-not-allowed" disabled>
                <Chrome className="w-4 h-4" />
                Add to Chrome
              </button>
              <button className="btn-secondary flex items-center gap-2 opacity-60 cursor-not-allowed" disabled>
                Add to Firefox
              </button>
            </div>
            <p className="text-xs text-muted">Notify me when available →</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ value, label }) => (
          <div key={label} className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-muted mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Extension Features</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card p-4 flex gap-3">
              <div className="w-9 h-9 rounded-lg border border-border flex items-center justify-center flex-shrink-0">
                <Icon className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{title}</p>
                <p className="text-xs text-muted mt-1 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Use web tools instead */}
      <div className="glass-card p-6 text-center space-y-4 border border-border-light">
        <CheckCircle className="w-8 h-8 text-white mx-auto" />
        <div>
          <p className="text-white font-medium">Can't wait for the extension?</p>
          <p className="text-muted text-sm mt-1">Use our powerful web-based tools to scan any URL, message, or QR code right now.</p>
        </div>
        <div className="flex justify-center gap-3">
          <Link href="/url-scan" className="btn-primary flex items-center gap-2">
            Scan a URL <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/dashboard" className="btn-secondary">View Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
