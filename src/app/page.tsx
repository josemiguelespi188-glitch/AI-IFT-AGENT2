"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import TeamMembersView from "@/components/TeamMembersView";
import DocumentsView from "@/components/DocumentsView";
import InquiryForm from "@/components/InquiryForm";
import InquiryResult from "@/components/InquiryResult";
import InquiryCard from "@/components/InquiryCard";
import StatsBar from "@/components/StatsBar";
import type { Inquiry, ProcessInquiryResponse } from "@/types";

export type ActiveView =
  | "ai-assistant"
  | "team-members"
  | "documents"
  | "organization"
  | "settings";

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
  const [activeView, setActiveView] = useState<ActiveView>("ai-assistant");
  const [activeFolder, setActiveFolder] = useState<{
    folderId: string;
    department: string;
  } | null>(null);

  // AI Assistant state
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
    fetchHistory();
  }

  function handleError(e: string) {
    setError(e);
    setResult(null);
  }

  return (
    <div className="flex h-screen bg-hub-bg overflow-hidden">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        activeFolder={activeFolder}
        setActiveFolder={setActiveFolder}
      />

      <div className="flex-1 overflow-auto">
        {/* ── Team Members ─────────────────────────────────────── */}
        {activeView === "team-members" && <TeamMembersView />}

        {/* ── Documents ────────────────────────────────────────── */}
        {activeView === "documents" && activeFolder && (
          <DocumentsView folder={activeFolder} />
        )}

        {/* ── Organization placeholder ─────────────────────────── */}
        {activeView === "organization" && (
          <div className="p-8 animate-fade-in">
            <h1 className="text-hub-text text-2xl font-bold mb-2">Organization</h1>
            <p className="text-hub-muted text-sm">
              Organization overview coming soon.
            </p>
          </div>
        )}

        {/* ── Settings placeholder ──────────────────────────────── */}
        {activeView === "settings" && (
          <div className="p-8 animate-fade-in">
            <h1 className="text-hub-text text-2xl font-bold mb-2">Settings</h1>
            <p className="text-hub-muted text-sm">Settings coming soon.</p>
          </div>
        )}

        {/* ── AI Assistant ──────────────────────────────────────── */}
        {activeView === "ai-assistant" && (
          <div className="p-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-hub-text text-2xl font-bold">AI Assistant</h1>
                <p className="text-hub-muted text-sm mt-1">
                  Axiskey Platform · Powered by Claude Opus 4.6
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-hub-accent animate-pulse" />
                <span className="text-xs text-hub-muted">Live</span>
              </div>
            </div>

            {/* Stats */}
            <div className="mb-6">
              <StatsBar stats={stats} />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-hub-card border border-hub-border rounded-lg p-1 mb-6 self-start w-fit shadow-sm">
              {(["process", "history"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
                    activeTab === tab
                      ? "bg-hub-accent text-hub-sidebar-active-text"
                      : "text-hub-muted hover:text-hub-text"
                  }`}
                >
                  {tab === "process" ? "Process Inquiry" : "History"}
                </button>
              ))}
            </div>

            {/* Process Tab */}
            {activeTab === "process" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-hub-card border border-hub-border rounded-2xl p-6 shadow-sm">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-hub-text">
                      New Investor Inquiry
                    </h2>
                    <p className="text-sm text-hub-muted mt-1">
                      Submit an inquiry from any channel and the AI agent will
                      classify, search the knowledge base, and respond or escalate.
                    </p>
                  </div>
                  <InquiryForm onResult={handleResult} onError={handleError} />
                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                </div>

                <div className="bg-hub-card border border-hub-border rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-hub-text mb-6">
                    AI Agent Response
                  </h2>
                  {result ? (
                    <InquiryResult result={result} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <div className="w-16 h-16 bg-hub-bg rounded-2xl flex items-center justify-center mb-4 border border-hub-border">
                        <span className="text-3xl">🤖</span>
                      </div>
                      <p className="text-hub-muted text-sm">
                        Submit an inquiry to see the AI agent&apos;s response
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-hub-text">
                    Inquiry History
                  </h2>
                  <button
                    onClick={fetchHistory}
                    disabled={loadingHistory}
                    className="text-xs text-hub-accent-dark hover:text-hub-accent transition-colors disabled:opacity-50 font-medium"
                  >
                    {loadingHistory ? "Refreshing..." : "↻ Refresh"}
                  </button>
                </div>

                {loadingHistory && inquiries.length === 0 ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-hub-card rounded-xl h-20 animate-pulse border border-hub-border"
                      />
                    ))}
                  </div>
                ) : inquiries.length === 0 ? (
                  <div className="text-center py-16 text-hub-muted">
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
          </div>
        )}
      </div>
    </div>
  );
}
