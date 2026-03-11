"use client";

import type { ProcessInquiryResponse } from "@/types";

const categoryLabels: Record<string, string> = {
  distributions: "Distributions",
  tax_documents: "Tax Documents",
  account_activation: "Account Activation",
  banking_changes: "Banking Changes",
  accreditation: "Accreditation",
  investment_status: "Investment Status",
  redemption_request: "Redemption Request",
  technical_portal_help: "Technical Help",
  other_unknown: "Other",
};

const statusConfig = {
  resolved: {
    label: "Resolved",
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  escalated: {
    label: "Escalated",
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    dot: "bg-amber-400",
  },
  needs_verification: {
    label: "Needs Verification",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    dot: "bg-blue-400",
  },
  duplicate: {
    label: "Duplicate",
    color: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    dot: "bg-slate-400",
  },
};

interface InquiryResultProps {
  result: ProcessInquiryResponse;
}

export default function InquiryResult({ result }: InquiryResultProps) {
  const { inquiry_id, result: r } = result;
  const statusCfg = statusConfig[r.status] ?? statusConfig.escalated;
  const confidencePct = Math.round(r.confidence_score * 100);

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${statusCfg.color}`}
          >
            <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
            {statusCfg.label}
          </span>
          <span className="text-xs text-ift-light/40">
            {categoryLabels[r.category] ?? r.category}
          </span>
        </div>
        <div className="text-right">
          <p className="text-xs text-ift-light/40">Confidence</p>
          <p
            className={`text-sm font-bold ${
              confidencePct >= 80
                ? "text-emerald-400"
                : confidencePct >= 60
                ? "text-amber-400"
                : "text-red-400"
            }`}
          >
            {confidencePct}%
          </p>
        </div>
      </div>

      {/* Inquiry ID */}
      <p className="text-xs text-ift-light/30 font-mono">ID: {inquiry_id}</p>

      {/* Meta */}
      <div className="flex gap-4 text-xs text-ift-light/50">
        {r.investor_verified && (
          <span className="flex items-center gap-1">
            <span className="text-emerald-400">✓</span> Investor verified
          </span>
        )}
        {r.client_identified && (
          <span>
            Client: <span className="text-ift-gold">{r.client_identified}</span>
          </span>
        )}
        {r.deal_identified && (
          <span>
            Deal: <span className="text-ift-light/70">{r.deal_identified}</span>
          </span>
        )}
      </div>

      {/* Response (if resolved) */}
      {r.response && (
        <div className="bg-ift-blue/20 border border-ift-accent/20 rounded-xl p-4">
          <p className="text-xs font-semibold text-ift-accent mb-3 uppercase tracking-wide">
            AI Response to Investor
          </p>
          <p className="text-sm text-ift-light/90 leading-relaxed whitespace-pre-wrap">
            {r.response}
          </p>
        </div>
      )}

      {/* Escalation Summary (if escalated) */}
      {r.escalation_summary && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
            Escalation Summary for Human Team
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {r.escalation_summary.investor_name && (
              <div>
                <p className="text-ift-light/40">Investor</p>
                <p className="text-ift-light font-medium">
                  {r.escalation_summary.investor_name}
                </p>
              </div>
            )}
            {r.escalation_summary.investor_email && (
              <div>
                <p className="text-ift-light/40">Email</p>
                <p className="text-ift-light font-medium">
                  {r.escalation_summary.investor_email}
                </p>
              </div>
            )}
            {r.escalation_summary.client && (
              <div>
                <p className="text-ift-light/40">Client</p>
                <p className="text-ift-gold font-medium">
                  {r.escalation_summary.client}
                </p>
              </div>
            )}
            {r.escalation_summary.deal && (
              <div>
                <p className="text-ift-light/40">Deal</p>
                <p className="text-ift-light font-medium">
                  {r.escalation_summary.deal}
                </p>
              </div>
            )}
            <div>
              <p className="text-ift-light/40">Priority</p>
              <p
                className={`font-semibold capitalize ${
                  r.escalation_summary.priority === "high"
                    ? "text-red-400"
                    : r.escalation_summary.priority === "medium"
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {r.escalation_summary.priority}
              </p>
            </div>
          </div>

          {r.escalation_summary.information_found && (
            <div>
              <p className="text-xs text-ift-light/40 mb-1">Info Found</p>
              <p className="text-xs text-ift-light/70">
                {r.escalation_summary.information_found}
              </p>
            </div>
          )}

          {r.escalation_summary.information_gaps && (
            <div>
              <p className="text-xs text-red-400/80 mb-1">Information Gaps</p>
              <p className="text-xs text-ift-light/70">
                {r.escalation_summary.information_gaps}
              </p>
            </div>
          )}

          {r.escalation_summary.proposed_response && (
            <div className="bg-ift-navy/40 rounded-lg p-3">
              <p className="text-xs text-ift-light/40 mb-1">Proposed Response Draft</p>
              <p className="text-xs text-ift-light/80 whitespace-pre-wrap">
                {r.escalation_summary.proposed_response}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Duplicate notice */}
      {r.status === "duplicate" && r.duplicate_inquiry_id && (
        <div className="bg-slate-500/10 border border-slate-500/20 rounded-lg p-3">
          <p className="text-xs text-slate-400">
            Duplicate of inquiry{" "}
            <span className="font-mono">{r.duplicate_inquiry_id}</span>
          </p>
        </div>
      )}
    </div>
  );
}
