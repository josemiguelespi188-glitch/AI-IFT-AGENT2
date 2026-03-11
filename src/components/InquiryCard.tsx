"use client";

import type { Inquiry } from "@/types";

const categoryColors: Record<string, string> = {
  distributions: "bg-blue-500/20 text-blue-300",
  tax_documents: "bg-purple-500/20 text-purple-300",
  account_activation: "bg-cyan-500/20 text-cyan-300",
  banking_changes: "bg-red-500/20 text-red-300",
  accreditation: "bg-orange-500/20 text-orange-300",
  investment_status: "bg-ift-gold/20 text-ift-gold",
  redemption_request: "bg-pink-500/20 text-pink-300",
  technical_portal_help: "bg-teal-500/20 text-teal-300",
  other_unknown: "bg-slate-500/20 text-slate-400",
};

const statusDot: Record<string, string> = {
  pending: "bg-yellow-400 animate-pulse",
  processing: "bg-blue-400 animate-pulse",
  resolved: "bg-emerald-400",
  escalated: "bg-amber-400",
  duplicate: "bg-slate-500",
};

const categoryLabels: Record<string, string> = {
  distributions: "Distributions",
  tax_documents: "Tax Docs",
  account_activation: "Activation",
  banking_changes: "Banking",
  accreditation: "Accreditation",
  investment_status: "Inv. Status",
  redemption_request: "Redemption",
  technical_portal_help: "Tech Help",
  other_unknown: "Other",
};

const channelIcons: Record<string, string> = {
  portal: "⬡",
  email: "✉",
  zendesk: "Z",
  phone: "☎",
};

interface InquiryCardProps {
  inquiry: Inquiry & { investors?: { name: string; email: string }; clients?: { name: string }; deals?: { name: string } };
  onClick?: () => void;
}

export default function InquiryCard({ inquiry, onClick }: InquiryCardProps) {
  const confidencePct = inquiry.confidence_score
    ? Math.round(inquiry.confidence_score * 100)
    : null;
  const timeAgo = formatTimeAgo(inquiry.created_at);

  return (
    <div
      onClick={onClick}
      className={`bg-ift-blue/20 border border-ift-blue/30 rounded-xl p-4 transition-all hover:border-ift-accent/40 hover:bg-ift-blue/30 ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs text-ift-light/40">
              {channelIcons[inquiry.channel]} {inquiry.channel}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                categoryColors[inquiry.category] ?? "bg-slate-500/20 text-slate-400"
              }`}
            >
              {categoryLabels[inquiry.category] ?? inquiry.category}
            </span>
            {inquiry.clients && (
              <span className="text-xs text-ift-gold/80">
                {inquiry.clients.name}
              </span>
            )}
          </div>

          {/* Investor */}
          <p className="text-sm font-medium text-ift-light truncate">
            {inquiry.investor_name ??
              inquiry.investors?.name ??
              inquiry.investor_email ??
              "Unknown investor"}
          </p>

          {/* Preview */}
          <p className="text-xs text-ift-light/50 mt-1 line-clamp-2">
            {inquiry.original_text}
          </p>
        </div>

        {/* Right side */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                statusDot[inquiry.status] ?? "bg-slate-400"
              }`}
            />
            <span className="text-xs text-ift-light/60 capitalize">
              {inquiry.status}
            </span>
          </div>

          {confidencePct !== null && (
            <span
              className={`text-xs font-semibold ${
                confidencePct >= 80
                  ? "text-emerald-400"
                  : confidencePct >= 60
                  ? "text-amber-400"
                  : "text-red-400"
              }`}
            >
              {confidencePct}%
            </span>
          )}

          <span className="text-xs text-ift-light/30">{timeAgo}</span>
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
