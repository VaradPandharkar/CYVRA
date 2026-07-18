import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Chatbox from "@/components/Chatbox";

export const metadata: Metadata = {
  title: "CYVRA – Trust Before You Click",
  description:
    "CYVRA is an AI-powered Digital Trust & Threat Intelligence Platform that helps users identify phishing websites, scam messages, malicious QR codes, and online threats before they cause harm.",
  keywords: "cybersecurity, phishing detection, scam analyzer, QR scanner, threat intelligence",
  authors: [{ name: "CYVRA Security" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-foreground antialiased">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto relative">
            {/* Ambient cyber grid */}
            <div className="fixed inset-0 cyber-grid-bg opacity-40 pointer-events-none z-0" />
            <div className="relative z-10 min-h-full">
              {children}
            </div>
          </main>
        </div>
        {/* Global floating AI chatbox */}
        <Chatbox />
      </body>
    </html>
  );
}
