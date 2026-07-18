"use client";
import { useState, useCallback } from "react";
import { QrCode, Upload, CheckCircle, AlertTriangle, XCircle, RefreshCw, Link as LinkIcon, FileImage } from "lucide-react";

interface ScanResult {
  score: number;
  risk_level: "Safe" | "Suspicious" | "Dangerous";
  content_type: "url" | "text";
  input: string;
  details: {
    ssl_status?: string;
    domain_age?: string;
    indicators?: string[];
    recommendations?: string[];
    explanation?: string;
    classification?: string;
  };
}

export default function QRScanPage() {
  const [dragging, setDragging] = useState(false);
  const [decoding, setDecoding] = useState(false);
  const [decodedContent, setDecodedContent] = useState("");
  const [decodeError, setDecodeError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const decodeQR = useCallback(async (file: File) => {
    setDecoding(true);
    setDecodeError("");
    setDecodedContent("");
    setResult(null);

    // Create object URL for preview
    const objUrl = URL.createObjectURL(file);
    setPreviewUrl(objUrl);

    try {
      // Use canvas to decode QR via jsQR
      const jsQR = (await import("jsqr")).default;
      const img = new Image();
      img.src = objUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code) {
        setDecodedContent(code.data);
        // Auto-scan
        await scanContent(code.data);
      } else {
        setDecodeError("Could not decode QR code. Ensure the image is clear and unobscured.");
      }
    } catch {
      setDecodeError("Failed to process image. Please try a different file.");
    } finally {
      setDecoding(false);
    }
  }, []);

  const scanContent = async (content: string) => {
    setScanning(true);
    try {
      const token = localStorage.getItem("cyvra_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("http://localhost:8000/api/scans/qr", {
        method: "POST",
        headers,
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw new Error("Scan failed");
      const data = await res.json();
      setResult(data);
    } catch {
      setDecodeError("Safety scan failed. Backend may be offline.");
    } finally {
      setScanning(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) decodeQR(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) decodeQR(file);
  };

  const getRiskConfig = (level: string) => {
    if (level === "Safe") return { icon: CheckCircle, badge: "badge-safe", label: "SAFE" };
    if (level === "Suspicious") return { icon: AlertTriangle, badge: "badge-suspicious", label: "SUSPICIOUS" };
    return { icon: XCircle, badge: "badge-dangerous", label: "DANGEROUS" };
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 page-enter">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-muted text-xs font-mono">
          <QrCode className="w-3.5 h-3.5" />
          <span>qr-scanner / decode-and-analyze</span>
        </div>
        <h1 className="text-2xl font-bold text-white">QR Code Scanner</h1>
        <p className="text-muted text-sm">
          Upload a QR code image to decode its content and verify if the destination is safe.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`glass-card p-10 text-center border-2 border-dashed transition-all cursor-pointer ${
          dragging ? "border-white bg-white/5" : "border-border hover:border-border-light"
        }`}
        onClick={() => document.getElementById("qr-file-input")?.click()}
      >
        <input
          id="qr-file-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {previewUrl ? (
          <div className="space-y-3">
            <img
              src={previewUrl}
              alt="QR Code"
              className="w-36 h-36 object-contain mx-auto rounded-lg border border-border"
            />
            <p className="text-xs text-muted">Click or drag to upload a new QR code</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl border border-border flex items-center justify-center mx-auto">
              {decoding ? (
                <RefreshCw className="w-8 h-8 text-white animate-spin" />
              ) : (
                <QrCode className="w-8 h-8 text-muted" />
              )}
            </div>
            <div>
              <p className="text-white font-medium">Drop your QR code image here</p>
              <p className="text-muted text-sm mt-1">or click to browse files</p>
              <p className="text-xs text-muted mt-2">Supports PNG, JPG, WEBP — Decoded securely in your browser</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-muted border border-border rounded-lg px-4 py-2 mx-auto w-fit">
              <FileImage className="w-3.5 h-3.5" />
              <span>Client-side decoding — image never leaves your device</span>
            </div>
          </div>
        )}
      </div>

      {/* Decoding status */}
      {decoding && (
        <div className="glass-card p-4 flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-white animate-spin flex-shrink-0" />
          <div>
            <p className="text-sm text-white">Decoding QR code...</p>
            <p className="text-xs text-muted">Running jsQR image analysis</p>
          </div>
        </div>
      )}

      {/* Decode error */}
      {decodeError && (
        <div className="glass-card p-4 border-l-2 border-muted">
          <p className="text-muted-light text-sm">{decodeError}</p>
        </div>
      )}

      {/* Decoded content preview */}
      {decodedContent && (
        <div className="glass-card p-4 space-y-2">
          <p className="text-xs text-muted uppercase tracking-widest">Decoded QR Content</p>
          <div className="flex items-start gap-2 bg-surface-3 rounded-lg p-3 border border-border">
            <LinkIcon className="w-4 h-4 text-muted mt-0.5 flex-shrink-0" />
            <p className="text-sm text-white font-mono break-all">{decodedContent}</p>
          </div>
        </div>
      )}

      {/* Scanning */}
      {scanning && (
        <div className="glass-card p-6 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-white mx-auto animate-spin" />
          <p className="text-white text-sm">Analyzing destination safety...</p>
        </div>
      )}

      {/* Results */}
      {result && !scanning && (
        <div className="space-y-4 animate-fade-in">
          <div className="glass-card p-6 space-y-4">
            {/* Risk header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const cfg = getRiskConfig(result.risk_level);
                  const Icon = cfg.icon;
                  return (
                    <>
                      <Icon className="w-6 h-6 text-white" />
                      <div>
                        <span className={cfg.badge}>{cfg.label}</span>
                        <p className="text-xs text-muted mt-1">
                          {result.content_type === "url" ? "URL Destination" : "Text Content"}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{result.score}</p>
                <p className="text-xs text-muted">Trust Score</p>
              </div>
            </div>

            {/* Destination details */}
            {result.details.ssl_status && (
              <div className="border-t border-border pt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted">SSL Status</p>
                  <p className="text-sm text-white mt-1">{result.details.ssl_status}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Domain Age</p>
                  <p className="text-sm text-white mt-1">{result.details.domain_age}</p>
                </div>
              </div>
            )}

            {/* Action */}
            <div className={`rounded-lg p-3 border ${
              result.risk_level === "Safe"
                ? "border-white/20 bg-white/5"
                : "border-muted/30 bg-surface-3"
            }`}>
              <p className="text-sm font-medium text-white">
                {result.risk_level === "Safe"
                  ? "✓ Safe to proceed — destination appears legitimate"
                  : result.risk_level === "Suspicious"
                  ? "⚠ Proceed with caution — verify the source before clicking"
                  : "✗ Do NOT open this link — high risk of malicious content"}
              </p>
            </div>

            {/* Indicators */}
            {result.details.indicators && result.details.indicators.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted uppercase tracking-widest">Threat Indicators</p>
                {result.details.indicators.map((ind, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-muted mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-muted-light">{ind}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
