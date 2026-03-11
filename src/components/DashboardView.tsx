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

const FLOW_AGENTS = [
  { id: "ir", label: "Investor Info", icon: "💼", color: "#c8d432" },
  { id: "ci", label: "Client Info", icon: "👤", color: "#86d432" },
  { id: "faq", label: "FAQ Agent", icon: "❓", color: "#4ade80" },
  { id: "tmpl", label: "Template Format", icon: "📝", color: "#34d399" },
];

const FLOW_INPUTS = [
  { label: "Zendesk", icon: "🎫", color: "#17494D" },
  { label: "Email", icon: "📧", color: "#1E5FD8" },
  { label: "Axiskey", icon: "🏛️", color: "#6366f1" },
];

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

      {/* ── FLOWMAP ─────────────────────────────────────── */}
      <div className="bg-hub-card rounded-2xl border border-hub-border p-6 mb-6">
        <h2 className="text-hub-text font-semibold text-sm mb-6">
          How It Works
        </h2>

        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-2">
          {/* INPUTS */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <p className="text-hub-muted text-[10px] font-semibold tracking-widest uppercase mb-1 text-center">
              Inputs
            </p>
            {FLOW_INPUTS.map((inp) => (
              <div
                key={inp.label}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-hub-border bg-hub-bg text-hub-text text-xs font-medium w-28"
              >
                <span>{inp.icon}</span>
                {inp.label}
              </div>
            ))}
          </div>

          {/* Arrow 1 */}
          <FlowArrow />

          {/* ROUTING */}
          <div className="flex flex-col items-center flex-shrink-0">
            <p className="text-hub-muted text-[10px] font-semibold tracking-widest uppercase mb-1">
              Routing
            </p>
            <div className="px-4 py-5 rounded-2xl border-2 border-hub-accent bg-hub-accent/10 text-center w-28">
              <div className="text-xl mb-1">⚡</div>
              <p className="text-hub-text text-xs font-semibold">
                n8n Router
              </p>
              <p className="text-hub-muted text-[10px]">rules engine</p>
            </div>
          </div>

          {/* Arrow 2 */}
          <FlowArrow />

          {/* AI AGENTS */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <p className="text-hub-muted text-[10px] font-semibold tracking-widest uppercase mb-1 text-center">
              AI Agents
            </p>
            {FLOW_AGENTS.map((ag) => (
              <div
                key={ag.id}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-hub-border bg-hub-bg text-hub-text text-xs font-medium w-36"
                style={{ borderLeftColor: ag.color, borderLeftWidth: 3 }}
              >
                <span>{ag.icon}</span>
                {ag.label}
              </div>
            ))}
          </div>

          {/* Arrow 3 */}
          <FlowArrow />

          {/* CONFIDENCE CHECK */}
          <div className="flex flex-col items-center flex-shrink-0">
            <p className="text-hub-muted text-[10px] font-semibold tracking-widest uppercase mb-1">
              Check
            </p>
            <div className="px-4 py-4 rounded-2xl border-2 border-amber-400 bg-amber-50 text-center w-32">
              <div className="text-xl mb-1">🎯</div>
              <p className="text-hub-text text-xs font-semibold">
                Confidence
              </p>
              <p className="text-amber-600 text-[11px] font-bold">≥ 70%?</p>
            </div>
          </div>

          {/* Arrow 4 */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[10px] text-green-600 font-bold">YES</span>
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <div className="w-px h-6 bg-hub-border" />
            <div className="flex flex-col items-center gap-0.5">
              <svg className="w-5 h-5 text-red-400 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="text-[10px] text-red-500 font-bold">NO</span>
            </div>
          </div>

          {/* OUTPUTS */}
          <div className="flex flex-col gap-3 flex-shrink-0">
            <p className="text-hub-muted text-[10px] font-semibold tracking-widest uppercase mb-1 text-center">
              Output
            </p>
            {/* Auto-send */}
            <div className="px-3 py-3 rounded-2xl border-2 border-green-400 bg-green-50 text-center w-36">
              <div className="text-lg mb-0.5">✅</div>
              <p className="text-hub-text text-xs font-semibold">Auto-send</p>
              <p className="text-hub-muted text-[10px]">via n8n → channel</p>
            </div>
            {/* Queue */}
            <div className="px-3 py-3 rounded-2xl border-2 border-red-300 bg-red-50 text-center w-36">
              <div className="text-lg mb-0.5">⚠️</div>
              <p className="text-hub-text text-xs font-semibold">Review Queue</p>
              <p className="text-hub-muted text-[10px]">human + AI assist</p>
            </div>
          </div>
        </div>

        {/* Response path */}
        <div className="mt-4 pt-4 border-t border-hub-border flex items-center gap-2 text-xs text-hub-muted">
          <span className="text-green-600 font-semibold">✓ Auto-sent:</span>
          <span>Response flows back through n8n to the original channel (Zendesk ticket reply / email / Axiskey portal message)</span>
        </div>
      </div>

      {/* ── METRICS ROW ─────────────────────────────────── */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <MetricCard
          label="Total Inquiries"
          value={MOCK_METRICS.total.toString()}
          icon="📥"
          sub={timeRange}
        />
        <MetricCard
          label="Auto-sent"
          value={`${MOCK_METRICS.autoSent}`}
          sub={`${Math.round((MOCK_METRICS.autoSent / MOCK_METRICS.total) * 100)}% of total`}
          icon="✅"
          accent
        />
        <MetricCard
          label="Needs Review"
          value={`${MOCK_METRICS.needsReview}`}
          sub={`${Math.round((MOCK_METRICS.needsReview / MOCK_METRICS.total) * 100)}% of total`}
          icon="⚠️"
          warn
        />
        <MetricCard
          label="Avg Confidence"
          value={`${MOCK_METRICS.avgConfidence}%`}
          sub="across all agents"
          icon="🎯"
        />
        <MetricCard
          label="Avg Response"
          value={`${MOCK_METRICS.avgResponseTime}s`}
          sub="processing time"
          icon="⚡"
        />
        <MetricCard
          label="Top Agent"
          value={MOCK_METRICS.topAgent}
          sub="most active today"
          icon="🤖"
        />
      </div>

      {/* ── BOTTOM ROW ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confidence distribution */}
        <div className="bg-hub-card rounded-2xl border border-hub-border p-6">
          <h3 className="text-hub-text font-semibold text-sm mb-4">
            Confidence Distribution
          </h3>
          <div className="space-y-3">
            {MOCK_METRICS.confidenceBands.map((band) => (
              <div key={band.label} className="flex items-center gap-3">
                <span className="text-hub-text text-xs w-16 flex-shrink-0">
                  {band.label}
                </span>
                <div className="flex-1 bg-hub-bg rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full rounded-full flex items-center px-2 transition-all duration-500"
                    style={{
                      width: `${(band.count / maxBand) * 100}%`,
                      backgroundColor: band.color,
                    }}
                  >
                    <span className="text-[11px] font-bold text-hub-sidebar whitespace-nowrap">
                      {band.count}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    band.auto
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {band.auto ? "✓ Auto" : "⚠ Queue"}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-hub-border flex items-center gap-4 text-xs text-hub-muted">
            <span>
              <span className="font-semibold text-green-600">{MOCK_METRICS.autoSent}</span> auto-sent
            </span>
            <span>·</span>
            <span>
              <span className="font-semibold text-red-500">{MOCK_METRICS.needsReview}</span> in review queue
            </span>
            <span>·</span>
            <span className="font-semibold text-hub-text">70% threshold</span>
          </div>
        </div>

        {/* Per channel */}
        <div className="bg-hub-card rounded-2xl border border-hub-border p-6">
          <h3 className="text-hub-text font-semibold text-sm mb-4">
            Per Channel
          </h3>
          <div className="space-y-4">
            {MOCK_METRICS.channels.map((ch) => (
              <div key={ch.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-hub-text text-sm font-medium">
                    {ch.name === "Zendesk" && "🎫 "}
                    {ch.name === "Email" && "📧 "}
                    {ch.name === "Axiskey" && "🏛️ "}
                    {ch.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-hub-muted text-xs">
                      {ch.count} inquiries
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        ch.pct >= 85
                          ? "bg-green-100 text-green-700"
                          : ch.pct >= 75
                          ? "bg-amber-100 text-amber-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {ch.pct}% auto
                    </span>
                  </div>
                </div>
                <div className="w-full bg-hub-bg rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${ch.pct}%`,
                      backgroundColor:
                        ch.pct >= 85
                          ? "#c8d432"
                          : ch.pct >= 75
                          ? "#f59e0b"
                          : "#f97316",
                    }}
                  />
                </div>
                <p className="text-hub-muted text-[10px] mt-1">
                  {ch.resolved} resolved · {ch.count - ch.resolved} in queue
                </p>
              </div>
            ))}
          </div>

          {/* Live indicator */}
          <div className="mt-5 pt-4 border-t border-hub-border flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-soft" />
            <span className="text-hub-muted text-xs">
              Live — updates every 30s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowArrow() {
  return (
    <svg
      className="w-6 h-6 text-hub-muted flex-shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 7l5 5m0 0l-5 5m5-5H6"
      />
    </svg>
  );
}

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
  icon: string;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        accent
          ? "bg-hub-accent/10 border-hub-accent/30"
          : warn
          ? "bg-red-50 border-red-200"
          : "bg-hub-card border-hub-border"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-hub-text text-xl font-bold leading-tight">{value}</p>
      <p className="text-hub-text text-xs font-medium mt-0.5">{label}</p>
      {sub && <p className="text-hub-muted text-[10px] mt-0.5">{sub}</p>}
    </div>
  );
}
