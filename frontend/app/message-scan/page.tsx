"use client";
import { useState } from "react";
import { MessageSquare, AlertTriangle, CheckCircle, XCircle, Send, RefreshCw, Tag } from "lucide-react";

interface MessageResult {
  classification: "Safe" | "Spam" | "Phishing" | "Fraud";
  risk_level: "Safe" | "Suspicious" | "Dangerous";
  score: number;
  keywords: string[];
  explanation: string;
  indicators: string[];
}

const SAMPLES = {
  phishing: "URGENT: Your Chase bank account has been suspended due to suspicious activity. Verify your account now at https://chase-security-update.xyz to avoid permanent closure.",
  fraud: "CONGRATULATIONS! You've been selected as our lucky winner! Claim your $10,000 prize NOW! Click here to verify your details and receive your cash reward immediately.",
  spam: "LIMITED TIME OFFER! Get 80% off on all products today only! Visit our store and save big. Text STOP to unsubscribe.",
  safe: "Hi Sarah, just confirming our meeting tomorrow at 2 PM. Let me know if you need to reschedule. Thanks!",
};

function HighlightedText({ text, keywords }: { text: string; keywords: string[] }) {
  if (!keywords.length) return <p className="text-sm text-muted-light whitespace-pre-wrap">{text}</p>;

  const escaped = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);

  return (
    <p className="text-sm text-muted-light whitespace-pre-wrap leading-relaxed">
      {parts.map((part, i) => {
        const isKeyword = keywords.some((k) => k.toLowerCase() === part.toLowerCase());
        return isKeyword ? (
          <mark key={i} className="keyword-highlight not-italic">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </p>
  );
}

export default function MessageScanPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MessageResult | null>(null);
  const [error, setError] = useState("");

  const runScan = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const token = localStorage.getItem("cyvra_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("http://localhost:8000/api/scans/message", {
        method: "POST",
        headers,
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("Scan failed");
      const data = await res.json();
      setResult(data.details);
    } catch {
      setError("Scan failed. Make sure the backend is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const classificationConfig = {
    Safe: { icon: CheckCircle, badgeClass: "badge-safe", desc: "No threat indicators detected." },
    Spam: { icon: AlertTriangle, badgeClass: "badge-suspicious", desc: "Unsolicited bulk content detected." },
    Phishing: { icon: XCircle, badgeClass: "badge-dangerous", desc: "Credential harvesting attempt detected." },
    Fraud: { icon: XCircle, badgeClass: "badge-dangerous", desc: "Financial fraud attempt detected." },
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 page-enter">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-muted text-xs font-mono">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>message-scanner / analyze</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Scam Message Analyzer</h1>
        <p className="text-muted text-sm">
          Paste any SMS, email, or message to detect phishing, fraud, or spam attempts.
        </p>
      </div>

      {/* Input */}
      <div className="glass-card p-4 space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste an SMS, email, or suspicious message here..."
          rows={5}
          className="cyber-input resize-none"
        />

        {/* Sample messages */}
        <div className="space-y-2">
          <p className="text-xs text-muted">Try a sample:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(SAMPLES).map(([label, sample]) => (
              <button
                key={label}
                onClick={() => setText(sample)}
                className="text-xs text-muted-light border border-border rounded px-2 py-1 hover:border-border-light hover:text-white transition-all capitalize"
              >
                {label} example
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">{text.length} characters</span>
          <button
            onClick={runScan}
            disabled={loading || !text.trim()}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {loading ? "Analyzing..." : "Analyze Message"}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="glass-card p-6 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-white mx-auto animate-spin" />
          <p className="text-white text-sm">Running threat analysis...</p>
          <p className="text-muted text-xs">Scanning for keywords, links, urgency patterns...</p>
        </div>
      )}

      {error && (
        <div className="glass-card p-4 border-l-2 border-muted">
          <p className="text-muted-light text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-4 animate-fade-in">
          {/* Classification Card */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const cfg = classificationConfig[result.classification];
                  const Icon = cfg.icon;
                  return (
                    <>
                      <Icon className="w-6 h-6 text-white" />
                      <div>
                        <span className={cfg.badgeClass}>{result.classification.toUpperCase()}</span>
                        <p className="text-xs text-muted mt-1">{cfg.desc}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{result.score}</p>
                <p className="text-xs text-muted">Trust Index</p>
              </div>
            </div>

            {/* Explanation */}
            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted mb-2 uppercase tracking-widest">AI Analysis</p>
              <p className="text-sm text-muted-light leading-relaxed">{result.explanation}</p>
            </div>

            {/* Indicators */}
            {result.indicators.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted uppercase tracking-widest">Risk Markers</p>
                {result.indicators.map((ind, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-muted mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-muted-light">{ind}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Highlighted Text */}
          <div className="glass-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted" />
              <p className="text-xs text-muted uppercase tracking-widest font-medium">
                Message Analysis ({result.keywords.length} suspicious term{result.keywords.length !== 1 ? "s" : ""} found)
              </p>
            </div>

            {result.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {result.keywords.slice(0, 10).map((kw) => (
                  <span key={kw} className="keyword-highlight text-xs">{kw}</span>
                ))}
              </div>
            )}

            <div className="bg-surface-3 rounded-lg p-4 border border-border">
              <HighlightedText text={text} keywords={result.keywords} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
