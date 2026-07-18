"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Globe, Shield, AlertTriangle, CheckCircle, XCircle,
  Search, Clock, Lock, Copy, ExternalLink, RefreshCw
} from "lucide-react";

interface ScanResult {
  score: number;
  risk_level: "Safe" | "Suspicious" | "Dangerous";
  ssl_status: string;
  domain_age: string;
  indicators: string[];
  recommendations: string[];
  domain: string;
  url: string;
}

function ScoreArc({ score }: { score: number }) {
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const pct = score / 100;
  const dash = pct * circ;
  const color = score >= 80 ? "#ffffff" : score >= 50 ? "#888888" : "#444444";

  return (
    <svg width="140" height="140" className="mx-auto">
      <circle cx="70" cy="70" r={radius} fill="none" stroke="#1a1a1a" strokeWidth="10" />
      <circle
        cx="70" cy="70" r={radius} fill="none"
        stroke={color} strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        className="score-ring transition-all duration-1000"
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
      <text x="70" y="65" textAnchor="middle" className="text-3xl font-bold fill-white" fontSize="28" fontWeight="800">
        {score}
      </text>
      <text x="70" y="84" textAnchor="middle" fill="#666" fontSize="11" fontFamily="Inter">
        Trust Score
      </text>
    </svg>
  );
}

function URLScanInner() {
  const searchParams = useSearchParams();
  const [url, setUrl] = useState(searchParams.get("url") || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const initial = searchParams.get("url");
    if (initial) {
      setUrl(initial);
      runScan(initial);
    }
  }, []);

  const runScan = async (targetUrl?: string) => {
    const scanUrl = targetUrl || url;
    if (!scanUrl.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const token = localStorage.getItem("cyvra_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("http://localhost:8000/api/scans/url", {
        method: "POST",
        headers,
        body: JSON.stringify({ url: scanUrl }),
      });

      if (!res.ok) throw new Error("Scan failed");
      const data = await res.json();
      setResult(data.details);
    } catch {
      setError("Could not complete scan. Ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskConfig = (level: string) => {
    if (level === "Safe") return { icon: CheckCircle, badgeClass: "badge-safe", label: "SAFE" };
    if (level === "Suspicious") return { icon: AlertTriangle, badgeClass: "badge-suspicious", label: "SUSPICIOUS" };
    return { icon: XCircle, badgeClass: "badge-dangerous", label: "DANGEROUS" };
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 page-enter">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-muted text-xs font-mono">
          <Globe className="w-3.5 h-3.5" />
          <span>url-scanner / analyze</span>
        </div>
        <h1 className="text-2xl font-bold text-white">URL Phishing Detector</h1>
        <p className="text-muted text-sm">
          Enter any URL to perform an AI-powered security analysis with trust scoring.
        </p>
      </div>

      {/* Input */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runScan()}
              placeholder="https://example.com or paste any URL..."
              className="cyber-input pl-10"
            />
          </div>
          <button
            onClick={() => runScan()}
            disabled={loading || !url.trim()}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? "Scanning..." : "Analyze"}
          </button>
        </div>

        {/* Quick examples */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted">Try:</span>
          {["https://google.com", "http://paypal-update-alert.xyz", "https://github.com"].map((ex) => (
            <button
              key={ex}
              onClick={() => { setUrl(ex); runScan(ex); }}
              className="text-xs text-muted-light hover:text-white border border-border rounded px-2 py-0.5 hover:border-border-light transition-all font-mono"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="glass-card p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full border border-border mx-auto flex items-center justify-center animate-pulse">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-white font-medium">Analyzing URL...</p>
            <p className="text-muted text-sm mt-1">Checking SSL, domain age, phishing indicators</p>
          </div>
          <div className="flex justify-center gap-2">
            {["Resolving domain", "Checking SSL", "Scanning indicators", "Computing trust score"].map((s) => (
              <span key={s} className="text-xs text-muted border border-border rounded px-2 py-0.5 scan-pulse">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass-card p-4 border-l-2 border-muted">
          <p className="text-muted-light text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-4 animate-fade-in">
          {/* Score + Risk */}
          <div className="glass-card p-6 flex flex-col md:flex-row items-center gap-6">
            <ScoreArc score={result.score} />
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                {(() => {
                  const { icon: Icon, badgeClass, label } = getRiskConfig(result.risk_level);
                  return (
                    <>
                      <Icon className="w-5 h-5 text-white" />
                      <span className={badgeClass}>{label}</span>
                    </>
                  );
                })()}
              </div>
              <div>
                <p className="text-white font-semibold text-lg">{result.domain}</p>
                <p className="text-muted text-xs font-mono mt-0.5 truncate max-w-sm">{result.url}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCopy} className="btn-secondary text-xs flex items-center gap-1.5 py-1.5">
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? "Copied!" : "Copy URL"}
                </button>
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs flex items-center gap-1.5 py-1.5">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Visit (with caution)
                </a>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-4 space-y-3">
              <p className="text-xs text-muted tracking-widest uppercase font-medium">Security Details</p>
              <div className="space-y-2.5">
                <div className="flex items-start gap-3">
                  <Lock className="w-4 h-4 text-muted mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted">SSL Certificate</p>
                    <p className="text-sm text-white">{result.ssl_status}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-muted mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted">Domain Age</p>
                    <p className="text-sm text-white">{result.domain_age}</p>
                  </div>
                </div>
              </div>
            </div>

            {result.indicators.length > 0 && (
              <div className="glass-card p-4 space-y-3">
                <p className="text-xs text-muted tracking-widest uppercase font-medium">Threat Indicators</p>
                <ul className="space-y-2">
                  {result.indicators.map((ind, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-muted mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-muted-light">{ind}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="glass-card p-4 space-y-3">
              <p className="text-xs text-muted tracking-widest uppercase font-medium">Recommendations</p>
              <ul className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-light">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function URLScanPage() {
  return (
    <Suspense fallback={<div className="p-6 text-muted">Loading...</div>}>
      <URLScanInner />
    </Suspense>
  );
}
