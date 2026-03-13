"use client";

import { useState } from "react";

const MOCK_METRICS = {
  total: 142,
  autoSent: 118,
  needsReview: 24,
  avgConfidence: 87.4,
  avgResponseTime: 1.8,
  topAgent: "IR Agent",
  channels: [
    { name: "Zendesk", count: 89, resolved: 81, pct: 91 },
    { name: "Email", count: 38, resolved: 30, pct: 79 },
    { name: "Axiskey", count: 15, resolved: 11, pct: 73 },
  ],
  confidenceBands: [
    { label: "90–100%", count: 68, color: "#c8d432", auto: true },
    { label: "70–89%", count: 50, color: "#86d432", auto: true },
    { label: "50–69%", count: 18, color: "#f59e0b", auto: false },
    { label: "<50%", count: 6, color: "#ef4444", auto: false },
  ],
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function DashboardView() {
  const [timeRange, setTimeRange] = useState("Today");
  const maxBand = Math.max(...MOCK_METRICS.confidenceBands.map((b) => b.count));

  return (
    <div className="flex-1 overflow-y-auto bg-hub-bg p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-hub-text text-2xl font-bold">Dashboard</h1>
          <p className="text-hub-muted text-sm mt-0.5">
            System overview and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          {["Today", "7 days", "30 days"].map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                timeRange === r
                  ? "bg-hub-accent text-hub-sidebar font-semibold"
                  : "bg-hub-card text-hub-muted hover:text-hub-text border border-hub-border"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ── METRICS ROW ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <MetricCard label="Total Inquiries" value={MOCK_METRICS.total.toString()} icon={<InboxIcon />} sub={timeRange} />
        <MetricCard label="Auto-sent" value={`${MOCK_METRICS.autoSent}`} sub={`${Math.round((MOCK_METRICS.autoSent / MOCK_METRICS.total) * 100)}% of total`} icon={<CheckCircleIcon />} accent />
        <MetricCard label="Needs Review" value={`${MOCK_METRICS.needsReview}`} sub={`${Math.round((MOCK_METRICS.needsReview / MOCK_METRICS.total) * 100)}% of total`} icon={<AlertIcon />} warn />
        <MetricCard label="Avg Confidence" value={`${MOCK_METRICS.avgConfidence}%`} sub="across all agents" icon={<ShieldCheckIcon />} />
        <MetricCard label="Avg Response" value={`${MOCK_METRICS.avgResponseTime}s`} sub="processing time" icon={<ZapIcon />} />
        <MetricCard label="Top Agent" value={MOCK_METRICS.topAgent} sub="most active today" icon={<CpuIcon />} />
      </div>

      {/* ── BOTTOM ROW ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confidence distribution */}
        <div className="bg-hub-card rounded-2xl border border-hub-border p-6">
          <h3 className="text-hub-text font-semibold text-sm mb-4">Confidence Distribution</h3>
          <div className="space-y-3">
            {MOCK_METRICS.confidenceBands.map((band) => (
              <div key={band.label} className="flex items-center gap-3">
                <span className="text-hub-text text-xs w-16 flex-shrink-0">{band.label}</span>
                <div className="flex-1 bg-hub-bg rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full rounded-full flex items-center px-2 transition-all duration-500"
                    style={{ width: `${(band.count / maxBand) * 100}%`, backgroundColor: band.color }}
                  >
                    <span className="text-[11px] font-bold text-hub-sidebar whitespace-nowrap">{band.count}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${band.auto ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  {band.auto ? "Auto" : "Queue"}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-hub-border flex items-center gap-4 text-xs text-hub-muted">
            <span><span className="font-semibold text-green-600">{MOCK_METRICS.autoSent}</span> auto-sent</span>
            <span>·</span>
            <span><span className="font-semibold text-amber-600">{MOCK_METRICS.needsReview}</span> in review queue</span>
            <span>·</span>
            <span className="font-semibold text-hub-text">70% threshold</span>
          </div>
        </div>

        {/* Per channel */}
        <div className="bg-hub-card rounded-2xl border border-hub-border p-6">
          <h3 className="text-hub-text font-semibold text-sm mb-4">Per Channel</h3>
          <div className="space-y-4">
            {MOCK_METRICS.channels.map((ch) => (
              <div key={ch.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-hub-text text-sm font-medium flex items-center gap-1.5">
                    <span className="text-hub-muted">
                      {ch.name === "Zendesk" && <TicketIcon />}
                      {ch.name === "Email" && <MailIcon />}
                      {ch.name === "Axiskey" && <KeyIcon />}
                    </span>
                    {ch.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-hub-muted text-xs">{ch.count} inquiries</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ch.pct >= 85 ? "bg-green-100 text-green-700" : ch.pct >= 75 ? "bg-amber-100 text-amber-700" : "bg-orange-100 text-orange-700"}`}>
                      {ch.pct}% auto
                    </span>
                  </div>
                </div>
                <div className="w-full bg-hub-bg rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ width: `${ch.pct}%`, backgroundColor: ch.pct >= 85 ? "#c8d432" : ch.pct >= 75 ? "#f59e0b" : "#f97316" }}
                  />
                </div>
                <p className="text-hub-muted text-[10px] mt-1">{ch.resolved} resolved · {ch.count - ch.resolved} in queue</p>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-hub-border flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-soft" />
            <span className="text-hub-muted text-xs">Live — updates every 30s</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  icon,
  accent,
  warn,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${accent ? "bg-hub-accent/10 border-hub-accent/30" : warn ? "bg-amber-50 border-amber-200" : "bg-hub-card border-hub-border"}`}>
      <div className={`mb-2 ${accent ? "text-hub-accent-dark" : warn ? "text-amber-500" : "text-hub-muted"}`}>
        {icon}
      </div>
      <p className="text-hub-text text-xl font-bold leading-tight">{value}</p>
      <p className="text-hub-text text-xs font-medium mt-0.5">{label}</p>
      {sub && <p className="text-hub-muted text-[10px] mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function TicketIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  );
}

function CpuIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M9 3H7a2 2 0 00-2 2v2M9 3h6M9 3v2m6-2h2a2 2 0 012 2v2m0 0h-2m2 0v6m0 0h-2m2 0v2a2 2 0 01-2 2h-2m0 0H9m6 0v2m-6-2H7a2 2 0 01-2-2v-2m0 0H3m2 0V9M3 9h2M3 9V7m6 12v2m0-2H9m6 0h-6" />
    </svg>
  );
}
