"use client";

import { useState, useEffect, useCallback } from "react";
import InquiryForm from "@/components/InquiryForm";
import InquiryResult from "@/components/InquiryResult";
import InquiryCard from "@/components/InquiryCard";
import StatsBar from "@/components/StatsBar";
import type { Inquiry, ProcessInquiryResponse } from "@/types";

interface Stats {
  total: number;
  pending: number;
  processing: number;
  resolved: number;
  escalated: number;
  today: number;
  byCategory: Record<string, number>;
  byChannel: Record<string, number>;
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"process" | "history">("process");
  const [result, setResult] = useState<ProcessInquiryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const [inquiriesRes, statsRes] = await Promise.all([
        fetch("/api/inquiries?limit=30"),
        fetch("/api/inquiries?stats=true"),
      ]);
      const inquiriesData = await inquiriesRes.json();
      const statsData = await statsRes.json();
      if (inquiriesData.data) setInquiries(inquiriesData.data);
      if (statsData.data) setStats(statsData.data);
    } catch {
      // silent
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  function handleResult(r: ProcessInquiryResponse) {
    setResult(r);
    setError(null);
    // Refresh stats and history
    fetchHistory();
  }

  function handleError(e: string) {
    setError(e);
    setResult(null);
  }

  return (
    <div className="min-h-screen bg-ift-navy">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <header className="border-b border-ift-blue/40 bg-ift-navy/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-ift-accent rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">IFT</span>
                </div>
                <div>
                  <h1 className="text-white font-bold text-base leading-tight">
                    Industry FinTech
                  </h1>
                  <p className="text-ift-light/40 text-xs">
                    AI Investor Relations Agent
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden md:block h-8 w-px bg-ift-blue/60" />

              {/* Platform badge */}
              <div className="hidden md:flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-ift-light/50">
                  Axiskey Platform · Powered by Claude Opus 4.6
                </span>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex items-center gap-1 bg-ift-blue/30 rounded-lg p-1">
              {(["process", "history"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
                    activeTab === tab
                      ? "bg-ift-accent text-white"
                      : "text-ift-light/60 hover:text-ift-light"
                  }`}
                >
                  {tab === "process" ? "Process Inquiry" : "History"}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* ─── Main ────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="mb-8">
          <StatsBar stats={stats} />
        </div>

        {/* Process Tab */}
        {activeTab === "process" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Form */}
            <div className="bg-ift-blue/10 border border-ift-blue/30 rounded-2xl p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-ift-light">
                  New Investor Inquiry
                </h2>
                <p className="text-sm text-ift-light/50 mt-1">
                  Submit an inquiry from any channel and the AI agent will
                  classify, search the knowledge base, and respond or escalate.
                </p>
              </div>

              <InquiryForm onResult={handleResult} onError={handleError} />

              {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
            </div>

            {/* Right: Result */}
            <div className="bg-ift-blue/10 border border-ift-blue/30 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-ift-light mb-6">
                AI Agent Response
              </h2>

              {result ? (
                <InquiryResult result={result} />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-16 h-16 bg-ift-blue/40 rounded-2xl flex items-center justify-center mb-4">
                    <span className="text-3xl">🤖</span>
                  </div>
                  <p className="text-ift-light/40 text-sm">
                    Submit an inquiry to see the AI agent&apos;s response
                  </p>
                  <p className="text-ift-light/25 text-xs mt-2">
                    The agent will classify, search knowledge, and decide to
                    resolve or escalate
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-ift-light">
                Inquiry History
              </h2>
              <button
                onClick={fetchHistory}
                disabled={loadingHistory}
                className="text-xs text-ift-accent hover:text-blue-400 transition-colors disabled:opacity-50"
              >
                {loadingHistory ? "Refreshing..." : "↻ Refresh"}
              </button>
            </div>

            {loadingHistory && inquiries.length === 0 ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-ift-blue/20 rounded-xl h-20 animate-pulse"
                  />
                ))}
              </div>
            ) : inquiries.length === 0 ? (
              <div className="text-center py-16 text-ift-light/40">
                <p className="text-4xl mb-4">📭</p>
                <p>No inquiries yet. Process your first inquiry!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {inquiries.map((inquiry) => (
                  <InquiryCard key={inquiry.id} inquiry={inquiry} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <footer className="mt-16 border-t border-ift-blue/30 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-ift-light/30">
              © {new Date().getFullYear()} Industry FinTech. All rights
              reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-ift-light/30">
              <span>Axiskey Platform</span>
              <span>·</span>
              <span>Supabase + Pinecone + Claude Opus 4.6</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
