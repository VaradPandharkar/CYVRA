"use client";
import { useState, useEffect, useRef } from "react";
import { Shield, Send, X, Minus, ChevronUp, Terminal, Zap } from "lucide-react";

interface Message {
  id: number;
  sender: "user" | "assistant";
  message: string;
  timestamp: string;
}

const SUGGESTIONS = [
  "Is this website safe?",
  "How do phishing attacks work?",
  "What should I do if I clicked a malicious link?",
  "How can I protect my account?",
];

const COMMANDS = ["/scan-url", "/scan-message", "/scan-qr", "/threat-report", "/help"];

export default function Chatbox() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      sender: "assistant",
      message:
        "Hello! I'm CYVRA AI Security Assistant. I can analyze URLs, messages, and QR codes for threats. Type `/help` to see all commands.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, minimized]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    const userMsg: Message = {
      id: Date.now(),
      sender: "user",
      message: msg,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setShowCommands(false);

    try {
      const token = localStorage.getItem("cyvra_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("http://localhost:8000/api/chat/message", {
        method: "POST",
        headers,
        body: JSON.stringify({ message: msg }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: Message = {
          id: Date.now() + 1,
          sender: "assistant",
          message: data.assistant_message.message,
          timestamp: data.assistant_message.timestamp,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error("API error");
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "assistant",
          message:
            "I'm having trouble connecting to the CYVRA backend. Please make sure the API server is running on port 8000.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (ts: string) => {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderMessage = (msg: string) => {
    // Bold **text** formatting
    const parts = msg.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-200 animate-glow-pulse"
          title="Open AI Security Assistant"
        >
          <Shield className="w-6 h-6" strokeWidth={2.5} />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div
          className={`fixed bottom-6 right-6 z-50 w-[380px] rounded-2xl border border-border-light shadow-2xl transition-all duration-300 ${
            minimized ? "h-14" : "h-[550px]"
          } flex flex-col overflow-hidden`}
          style={{ background: "#0a0a0a" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <Shield className="w-4 h-4 text-black" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-semibold">CYVRA AI Assistant</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-xs text-muted">Online</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMinimized(!minimized)}
                className="p-1.5 text-muted hover:text-white transition-colors rounded"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-muted hover:text-white transition-colors rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {/* Suggestions (only at start) */}
                {messages.length === 1 && (
                  <div className="space-y-2 mb-3">
                    <p className="text-xs text-muted px-1">Quick questions:</p>
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="w-full text-left text-xs text-muted-light bg-surface-2 border border-border rounded-lg px-3 py-2 hover:border-border-light hover:text-white transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={
                        msg.sender === "user" ? "chat-bubble-user" : "chat-bubble-ai"
                      }
                    >
                      <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
                        {renderMessage(msg.message)}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted mt-1 px-1">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-start">
                    <div className="chat-bubble-ai">
                      <div className="flex items-center gap-1">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-muted dot-bounce"
                            style={{ animationDelay: `${i * 0.2}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Commands Autocomplete */}
              {showCommands && input.startsWith("/") && (
                <div className="mx-3 mb-1 bg-surface-2 border border-border rounded-lg overflow-hidden">
                  {COMMANDS.filter((c) => c.startsWith(input)).map((cmd) => (
                    <button
                      key={cmd}
                      onClick={() => {
                        setInput(cmd + " ");
                        setShowCommands(false);
                        inputRef.current?.focus();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-mono text-accent-dim hover:bg-surface-3 hover:text-white transition-colors"
                    >
                      <Terminal className="w-3 h-3 inline mr-2" />
                      {cmd}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-border flex gap-2 items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setShowCommands(e.target.value.startsWith("/"));
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything or type /command..."
                  className="flex-1 bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-white placeholder-muted focus:outline-none focus:border-border-light transition-colors font-mono"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-black hover:bg-accent-dim transition-all disabled:opacity-30 flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
