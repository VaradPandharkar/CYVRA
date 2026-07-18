"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield, Globe, MessageSquare, QrCode, Zap,
  ArrowRight, CheckCircle, AlertTriangle, XCircle,
  Activity, Lock, Eye, ChevronRight, Star
} from "lucide-react";

const threatTickers = [
  "🔴 New phishing campaign targeting PayPal users detected",
  "🟡 Suspicious QR codes spotted in public spaces — exercise caution",
  "🔴 Banking trojan spreading via SMS links in 12 countries",
  "🟡 Lookalike domain 'g00gle-login.xyz' flagged by CYVRA AI",
  "🟢 CYVRA blocked 1,284 phishing attempts in the last 24 hours",
  "🔴 Credential harvester campaign targeting Microsoft 365 accounts",
];

const features = [
  {
    icon: Globe,
    title: "URL Phishing Detector",
    description: "AI-powered analysis of any URL with trust scoring, SSL inspection, and domain age verification.",
    href: "/url-scan",
    badge: "Live",
  },
  {
    icon: MessageSquare,
    title: "Scam Message Analyzer",
    description: "Classify SMS, emails and messages as Safe, Spam, Phishing, or Fraud with keyword highlighting.",
    href: "/message-scan",
    badge: "Live",
  },
  {
    icon: QrCode,
    title: "QR Code Scanner",
    description: "Upload QR images for client-side decoding and instant safety verification of the destination.",
    href: "/qr-scan",
    badge: "Live",
  },
  {
    icon: Activity,
    title: "Threat Intelligence",
    description: "Real-time dashboard with charts, global stats, security alerts, and your scan history.",
    href: "/dashboard",
    badge: "Live",
  },
  {
    icon: Shield,
    title: "AI Security Assistant",
    description: "Personal cybersecurity chatbot with smart commands like /scan-url and /threat-report.",
    href: "/dashboard",
    badge: "Live",
  },
  {
    icon: Lock,
    title: "Browser Extension",
    description: "Real-time threat warnings, automatic phishing detection, and one-click reporting.",
    href: "/extension",
    badge: "Preview",
  },
];

const stats = [
  { value: "14,382+", label: "Threats Analyzed" },
  { value: "99.4%", label: "Detection Accuracy" },
  { value: "2,028", label: "Attacks Blocked" },
  { value: "Real-time", label: "AI Intelligence" },
];

export default function LandingPage() {
  const [tickerIndex, setTickerIndex] = useState(0);
  const [scanInput, setScanInput] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((i) => (i + 1) % threatTickers.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (scanInput.trim()) {
      window.location.href = `/url-scan?url=${encodeURIComponent(scanInput.trim())}`;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center overflow-hidden">
        {/* Background glow */}
        <div className="hero-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

        {/* Status badge */}
        <div className="flex items-center gap-2 bg-surface-2 border border-border-light rounded-full px-4 py-1.5 mb-8 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-xs text-muted-light font-medium tracking-wider">
            AI Threat Intelligence — Active
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-white mb-4 animate-slide-up leading-none">
          CYVRA
        </h1>
        <p className="text-xl md:text-2xl text-muted-light font-light tracking-widest mb-6 animate-slide-up">
          Trust Before You Click.
        </p>
        <p className="max-w-2xl text-muted text-base md:text-lg leading-relaxed mb-10 animate-fade-in">
          CYVRA is an AI-powered Digital Trust & Threat Intelligence Platform that helps
          users identify phishing websites, scam messages, malicious QR codes, and online
          threats before they cause harm.
        </p>

        {/* Quick Scan Input */}
        <form
          onSubmit={handleQuickScan}
          className="w-full max-w-xl flex gap-2 mb-8 animate-fade-in"
        >
          <input
            type="text"
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            placeholder="Enter a URL to scan instantly..."
            className="cyber-input flex-1"
          />
          <button type="submit" className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <Zap className="w-4 h-4" />
            Scan Now
          </button>
        </form>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-16 animate-fade-in">
          <Link href="/url-scan" className="btn-primary flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Analyze Threat
          </Link>
          <Link href="/qr-scan" className="btn-secondary flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            Scan QR
          </Link>
          <Link href="/auth/signup" className="btn-secondary flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            Get Started
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-3xl animate-fade-in">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-muted mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Threat Ticker */}
      <div className="border-y border-border bg-surface-2 py-3 overflow-hidden">
        <div className="ticker-wrap">
          <div className="ticker-content text-xs text-muted font-mono tracking-wide">
            {threatTickers.map((t, i) => (
              <span key={i} className="mx-12">{t}</span>
            ))}
            {threatTickers.map((t, i) => (
              <span key={`dup-${i}`} className="mx-12">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs text-muted tracking-widest uppercase mb-3">Platform Features</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Complete Threat Protection Suite
          </h2>
          <p className="text-muted mt-4 max-w-lg mx-auto">
            Every tool you need to identify and neutralize digital threats before they reach you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, description, href, badge }) => (
            <Link key={title} href={href} className="glass-card p-6 group block">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center group-hover:border-border-light transition-colors">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] font-mono text-muted border border-border rounded px-2 py-0.5">
                  {badge}
                </span>
              </div>
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-muted text-sm leading-relaxed">{description}</p>
              <div className="flex items-center gap-1 mt-4 text-xs text-muted-light group-hover:text-white transition-colors">
                <span>Open tool</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Security Principles */}
      <section className="border-t border-border px-6 py-24 bg-surface">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              icon: CheckCircle,
              title: "Instant Analysis",
              desc: "Real-time AI scans complete in milliseconds, not minutes.",
            },
            {
              icon: Eye,
              title: "Privacy First",
              desc: "No personal data stored. Scans are encrypted and anonymous by default.",
            },
            {
              icon: Star,
              title: "Always Learning",
              desc: "Our threat database grows with every scan, making CYVRA smarter over time.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center space-y-3">
              <Icon className="w-8 h-8 text-white mx-auto opacity-80" />
              <h3 className="text-white font-semibold">{title}</h3>
              <p className="text-muted text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="px-6 py-20 text-center border-t border-border">
        <p className="text-xs text-muted tracking-widest uppercase mb-4">Vision</p>
        <blockquote className="text-2xl md:text-3xl font-light text-white max-w-2xl mx-auto leading-relaxed mb-8">
          "To build the world's most trusted AI-powered digital trust platform."
        </blockquote>
        <Link href="/auth/signup" className="btn-primary inline-flex items-center gap-2">
          Start Protecting Yourself
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
