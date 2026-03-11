"use client";

import { useState } from "react";

type Channel = "all" | "zendesk" | "email" | "axiskey";

interface Ticket {
  id: string;
  ticketRef: string;
  channel: "zendesk" | "email" | "axiskey";
  from: string;
  email: string;
  subject: string;
  message: string;
  agent: string;
  confidence: number;
  timeAgo: string;
  missingInfo: string;
  suggestedResponse: string;
}

const MOCK_TICKETS: Ticket[] = [
  {
    id: "1",
    ticketRef: "Ticket #4901",
    channel: "zendesk",
    from: "Sarah Chen",
    email: "sarah@email.com",
    subject: "Waterfall structure Fund III question",
    message:
      "I need clarification about the waterfall structure in Fund III and how it affects my preferred return. I've been an investor since 2021 and want to understand the exact tier percentages and when I can expect the next distribution based on current fund performance.",
    agent: "IR Agent",
    confidence: 43,
    timeAgo: "2h ago",
    missingInfo: "Fund III waterfall tier percentages not found in knowledge base",
    suggestedResponse:
      "Hi Sarah,\n\nThank you for your inquiry about the Fund III waterfall structure. Based on our general fund documents, a preferred return is distributed to LPs before any carried interest is allocated.\n\nHowever, I was unable to confirm the exact tier percentages specific to Fund III. A member of our team will follow up with the precise details shortly.\n\nBest regards,\nIFT Investor Relations",
  },
  {
    id: "2",
    ticketRef: "Email #0382",
    channel: "email",
    from: "Mark Rossi",
    email: "mrossi@fund.com",
    subject: "Capital call date and wire instructions",
    message:
      "Can you confirm the exact date of the next capital call and the required wire transfer instructions? I want to make sure I have everything ready in advance. Also, what is the penalty if I miss the deadline?",
    agent: "IR Agent",
    confidence: 61,
    timeAgo: "4h ago",
    missingInfo: "Next capital call date not scheduled yet in system; wire instructions not in knowledge base",
    suggestedResponse:
      "Hi Mark,\n\nThank you for reaching out. We appreciate your proactive approach to the upcoming capital call.\n\nRegarding the wire transfer instructions, these are typically sent via secure email 10 business days before the call date. Unfortunately, I don't have the confirmed date for the next capital call at this moment.\n\nI'm escalating this to our operations team who will provide you with the exact date and wire instructions directly.\n\nBest regards,\nIFT Operations",
  },
  {
    id: "3",
    ticketRef: "AX-2291",
    channel: "axiskey",
    from: "Jennifer Walsh",
    email: "jwalsh@investors.net",
    subject: "K-1 document discrepancy",
    message:
      "The K-1 document I received shows a different amount than what I calculated based on my investment percentage. Can you explain how the allocation was calculated for tax year 2024? The discrepancy is approximately $3,200.",
    agent: "IR Agent",
    confidence: 38,
    timeAgo: "6h ago",
    missingInfo: "Specific investor allocation data for 2024 not accessible; K-1 calculation methodology not in knowledge base",
    suggestedResponse:
      "Hi Jennifer,\n\nThank you for flagging this discrepancy. K-1 allocations are calculated based on your ownership percentage multiplied by the fund's net income or loss for the tax year, adjusted for any special allocations outlined in the operating agreement.\n\nA $3,200 discrepancy warrants a detailed review of your allocation ledger. Our tax team will review your specific K-1 and respond within 2 business days.\n\nBest regards,\nIFT Tax & Compliance",
  },
  {
    id: "4",
    ticketRef: "Ticket #4923",
    channel: "zendesk",
    from: "Robert Kim",
    email: "rkim@capital.com",
    subject: "Redemption request process",
    message:
      "I would like to submit a redemption request for my position in Fund II. What is the process, timeline, and are there any early redemption penalties currently in effect?",
    agent: "IR Agent",
    confidence: 55,
    timeAgo: "1d ago",
    missingInfo: "Current redemption window status and Fund II specific penalties not confirmed in system",
    suggestedResponse:
      "Hi Robert,\n\nThank you for your redemption inquiry. Our standard redemption process requires a 60-day written notice, and redemptions are processed at the end of each quarter.\n\nHowever, the specific terms for Fund II, including any current early redemption penalties, require confirmation from our fund administrator. Our team will contact you within 24 hours with the exact details and next steps.\n\nBest regards,\nIFT Investor Relations",
  },
];

export default function UnansweredTicketsView() {
  const [activeChannel, setActiveChannel] = useState<Channel>("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [addedInfo, setAddedInfo] = useState("");
  const [regenerated, setRegenerated] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const filtered =
    activeChannel === "all"
      ? MOCK_TICKETS
      : MOCK_TICKETS.filter((t) => t.channel === activeChannel);

  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setAddedInfo("");
    setRegenerated(null);
    setSent(false);
  };

  const handleRegenerate = async () => {
    if (!addedInfo.trim()) return;
    setRegenerating(true);
    await new Promise((r) => setTimeout(r, 1500));
    const improved =
      selectedTicket!.suggestedResponse.replace(
        "I was unable to confirm",
        "Based on the additional information provided"
      ) +
      "\n\n[Updated with: " +
      addedInfo.trim() +
      "]";
    setRegenerated(improved);
    setRegenerating(false);
  };

  const handleSend = async () => {
    setSending(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
  };

  const channelIcon = (ch: Ticket["channel"]) =>
    ch === "zendesk" ? <TicketIcon /> : ch === "email" ? <MailIcon /> : <KeyIcon />;

  const channelLabel = (ch: Ticket["channel"]) =>
    ch === "zendesk" ? "Zendesk" : ch === "email" ? "Email" : "Axiskey";

  const confColor = (c: number) =>
    c >= 70 ? "text-green-600 bg-green-100" : c >= 50 ? "text-amber-600 bg-amber-100" : "text-red-600 bg-red-100";

  return (
    <div className="flex h-full bg-hub-bg animate-fade-in">
      {/* LEFT — Ticket list */}
      <div
        className={`flex flex-col border-r border-hub-border ${
          selectedTicket ? "w-96 flex-shrink-0" : "flex-1"
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-hub-border bg-hub-card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-hub-text text-xl font-bold">
                Unanswered Tickets
              </h1>
              <p className="text-hub-muted text-xs mt-0.5">
                AI confidence &lt; 70% — requires human input
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold">
              {MOCK_TICKETS.length} pending
            </span>
          </div>

          {/* Channel filter */}
          <div className="flex gap-1.5">
            {(["all", "zendesk", "email", "axiskey"] as Channel[]).map((ch) => (
              <button
                key={ch}
                onClick={() => setActiveChannel(ch)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  activeChannel === ch
                    ? "bg-hub-accent text-hub-sidebar"
                    : "bg-hub-bg text-hub-muted hover:text-hub-text border border-hub-border"
                }`}
              >
                {ch === "all" ? "All" : (
                  <span className="flex items-center gap-1.5">
                    {ch === "zendesk" && <TicketIcon />}
                    {ch === "email" && <MailIcon />}
                    {ch === "axiskey" && <KeyIcon />}
                    {ch === "zendesk" ? "Zendesk" : ch === "email" ? "Email" : "Axiskey"}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Ticket list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => handleSelectTicket(ticket)}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                selectedTicket?.id === ticket.id
                  ? "border-hub-accent bg-hub-accent/5 shadow-sm"
                  : "border-hub-border bg-hub-card hover:border-hub-accent/40 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-hub-muted">{channelIcon(ticket.channel)}</span>
                  <span className="text-hub-muted text-xs">
                    {channelLabel(ticket.channel)} · {ticket.ticketRef}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${confColor(
                    ticket.confidence
                  )}`}
                >
                  {ticket.confidence}%
                </span>
              </div>
              <p className="text-hub-text text-sm font-semibold leading-tight mb-1">
                {ticket.from}
              </p>
              <p className="text-hub-muted text-xs mb-2">{ticket.email}</p>
              <p className="text-hub-text text-xs line-clamp-2 leading-relaxed">
                {ticket.message}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-hub-muted text-[10px]">
                  {ticket.agent} · {ticket.timeAgo}
                </span>
                <span className="text-[10px] text-red-500 font-medium">
                  ● PENDING
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT — Detail panel */}
      {selectedTicket ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Detail header */}
          <div className="px-6 py-4 border-b border-hub-border bg-hub-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-lg hover:bg-hub-hover transition-colors"
              >
                <svg className="w-4 h-4 text-hub-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-hub-muted">{channelIcon(selectedTicket.channel)}</span>
                  <span className="text-hub-text font-semibold text-sm">
                    {selectedTicket.ticketRef}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${confColor(
                      selectedTicket.confidence
                    )}`}
                  >
                    Confidence: {selectedTicket.confidence}%
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-semibold">
                    PENDING
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detail body */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 divide-x divide-hub-border min-h-full">
              {/* LEFT — Original inquiry */}
              <div className="p-6 space-y-4">
                <h3 className="text-hub-text font-semibold text-sm">
                  Original Inquiry
                </h3>

                {/* Sender info */}
                <div className="bg-hub-bg rounded-xl p-4 space-y-2 text-sm">
                  <Row label="From" value={selectedTicket.from} />
                  <Row label="Email" value={selectedTicket.email} />
                  <Row label="Via" value={`${channelLabel(selectedTicket.channel)} · ${selectedTicket.ticketRef}`} />
                  <Row label="Agent" value={selectedTicket.agent} />
                  <Row label="Received" value={selectedTicket.timeAgo} />
                </div>

                {/* Subject */}
                <div>
                  <p className="text-hub-muted text-xs font-semibold uppercase tracking-wider mb-1">
                    Subject
                  </p>
                  <p className="text-hub-text text-sm font-medium">
                    {selectedTicket.subject}
                  </p>
                </div>

                {/* Message */}
                <div>
                  <p className="text-hub-muted text-xs font-semibold uppercase tracking-wider mb-1">
                    Message
                  </p>
                  <div className="bg-hub-bg rounded-xl p-4 text-hub-text text-sm leading-relaxed">
                    {selectedTicket.message}
                  </div>
                </div>

                {/* Missing info alert */}
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-amber-500 mt-0.5 flex-shrink-0"><AlertIcon /></span>
                  <div>
                    <p className="text-amber-800 text-xs font-semibold">
                      Missing Information
                    </p>
                    <p className="text-amber-700 text-xs mt-0.5">
                      {selectedTicket.missingInfo}
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT — AI response + editor */}
              <div className="p-6 space-y-4">
                <h3 className="text-hub-text font-semibold text-sm">
                  AI Suggested Response
                </h3>

                {/* Suggested response */}
                <div className="bg-hub-bg rounded-xl p-4 text-hub-text text-sm leading-relaxed whitespace-pre-line border border-hub-border">
                  {selectedTicket.suggestedResponse}
                </div>

                {/* Add info section */}
                <div>
                  <p className="text-hub-muted text-xs font-semibold uppercase tracking-wider mb-2">
                    Add Missing Information
                  </p>
                  <textarea
                    value={addedInfo}
                    onChange={(e) => setAddedInfo(e.target.value)}
                    placeholder="Paste or type the missing information here. The AI will use this to regenerate a more accurate response..."
                    rows={4}
                    className="w-full bg-hub-card border border-hub-border rounded-xl px-4 py-3 text-hub-text text-sm placeholder-hub-muted focus:outline-none focus:border-hub-accent resize-none"
                  />
                  <button
                    onClick={handleRegenerate}
                    disabled={!addedInfo.trim() || regenerating}
                    className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-hub-accent text-hub-sidebar font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-hub-accent-dark transition-colors"
                  >
                    {regenerating ? (
                      <>
                        <span className="w-4 h-4 border-2 border-hub-sidebar/30 border-t-hub-sidebar rounded-full animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>↻ Regenerate Response</>
                    )}
                  </button>
                </div>

                {/* Regenerated response */}
                {regenerated && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <p className="text-hub-text font-semibold text-sm">
                        Regenerated Response
                      </p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">
                        94% confidence
                      </span>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-hub-text text-sm leading-relaxed whitespace-pre-line">
                      {regenerated}
                    </div>

                    {sent ? (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200">
                        <span className="text-green-500"><CheckCircleIcon /></span>
                        <p className="text-green-700 text-sm font-semibold">
                          Sent via {channelLabel(selectedTicket.channel)}
                        </p>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setRegenerated(null)}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-hub-border text-hub-muted text-sm hover:text-hub-text hover:border-hub-text transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={handleSend}
                          disabled={sending}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-hub-text text-hub-bg font-semibold text-sm hover:bg-hub-text/90 transition-colors disabled:opacity-60"
                        >
                          {sending ? (
                            <>
                              <span className="w-4 h-4 border-2 border-hub-bg/30 border-t-hub-bg rounded-full animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              Send via {channelLabel(selectedTicket.channel)} →
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-hub-muted">
          <div className="text-center">
            <div className="flex justify-center mb-3 opacity-30"><InboxEmptyIcon /></div>
            <p className="text-sm font-medium">Select a ticket to review</p>
            <p className="text-xs mt-1">
              Add missing info and regenerate the AI response
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-hub-muted text-xs w-14 flex-shrink-0 pt-0.5">
        {label}:
      </span>
      <span className="text-hub-text text-xs">{value}</span>
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

function AlertIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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

function InboxEmptyIcon() {
  return (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  );
}
