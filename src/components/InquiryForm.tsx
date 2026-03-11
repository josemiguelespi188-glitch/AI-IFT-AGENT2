"use client";

import { useState } from "react";
import type { InquiryChannel, ProcessInquiryResponse } from "@/types";

interface InquiryFormProps {
  onResult: (result: ProcessInquiryResponse) => void;
  onError: (error: string) => void;
}

const channelLabels: Record<InquiryChannel, string> = {
  portal: "Axiskey Portal",
  email: "Email",
  zendesk: "Zendesk",
  phone: "Phone",
};

export default function InquiryForm({ onResult, onError }: InquiryFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    text: "",
    channel: "email" as InquiryChannel,
    investor_email: "",
    investor_name: "",
    subject: "",
    deal_hint: "",
    client_hint: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.text.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      onResult(data as ProcessInquiryResponse);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to process inquiry");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Channel */}
      <div className="grid grid-cols-4 gap-2">
        {(Object.keys(channelLabels) as InquiryChannel[]).map((ch) => (
          <button
            key={ch}
            type="button"
            onClick={() => setForm((f) => ({ ...f, channel: ch }))}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              form.channel === ch
                ? "bg-ift-accent text-white"
                : "bg-ift-blue/40 text-ift-light/60 hover:bg-ift-blue/70"
            }`}
          >
            {channelLabels[ch]}
          </button>
        ))}
      </div>

      {/* Investor Info */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-ift-light/60 mb-1">
            Investor Email
          </label>
          <input
            type="email"
            value={form.investor_email}
            onChange={(e) =>
              setForm((f) => ({ ...f, investor_email: e.target.value }))
            }
            placeholder="investor@email.com"
            className="w-full bg-ift-blue/30 border border-ift-blue/60 rounded-lg px-3 py-2 text-sm text-ift-light placeholder-ift-light/30 focus:outline-none focus:border-ift-accent transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ift-light/60 mb-1">
            Investor Name
          </label>
          <input
            type="text"
            value={form.investor_name}
            onChange={(e) =>
              setForm((f) => ({ ...f, investor_name: e.target.value }))
            }
            placeholder="Full name"
            className="w-full bg-ift-blue/30 border border-ift-blue/60 rounded-lg px-3 py-2 text-sm text-ift-light placeholder-ift-light/30 focus:outline-none focus:border-ift-accent transition-colors"
          />
        </div>
      </div>

      {/* Subject (for email/zendesk) */}
      {(form.channel === "email" || form.channel === "zendesk") && (
        <div>
          <label className="block text-xs font-medium text-ift-light/60 mb-1">
            Subject
          </label>
          <input
            type="text"
            value={form.subject}
            onChange={(e) =>
              setForm((f) => ({ ...f, subject: e.target.value }))
            }
            placeholder="e.g. Question about my K-1 tax document"
            className="w-full bg-ift-blue/30 border border-ift-blue/60 rounded-lg px-3 py-2 text-sm text-ift-light placeholder-ift-light/30 focus:outline-none focus:border-ift-accent transition-colors"
          />
        </div>
      )}

      {/* Hints */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-ift-light/60 mb-1">
            Client hint (optional)
          </label>
          <input
            type="text"
            value={form.client_hint}
            onChange={(e) =>
              setForm((f) => ({ ...f, client_hint: e.target.value }))
            }
            placeholder="e.g. Rastegar"
            className="w-full bg-ift-blue/30 border border-ift-blue/60 rounded-lg px-3 py-2 text-sm text-ift-light placeholder-ift-light/30 focus:outline-none focus:border-ift-accent transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ift-light/60 mb-1">
            Deal hint (optional)
          </label>
          <input
            type="text"
            value={form.deal_hint}
            onChange={(e) =>
              setForm((f) => ({ ...f, deal_hint: e.target.value }))
            }
            placeholder="e.g. Phoenix Hotel Fund II"
            className="w-full bg-ift-blue/30 border border-ift-blue/60 rounded-lg px-3 py-2 text-sm text-ift-light placeholder-ift-light/30 focus:outline-none focus:border-ift-accent transition-colors"
          />
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="block text-xs font-medium text-ift-light/60 mb-1">
          Inquiry Message <span className="text-red-400">*</span>
        </label>
        <textarea
          required
          value={form.text}
          onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
          placeholder="Enter the investor's inquiry here..."
          rows={5}
          className="w-full bg-ift-blue/30 border border-ift-blue/60 rounded-lg px-3 py-2 text-sm text-ift-light placeholder-ift-light/30 focus:outline-none focus:border-ift-accent transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !form.text.trim()}
        className={`w-full py-3 rounded-lg font-semibold text-sm transition-all ${
          loading || !form.text.trim()
            ? "bg-ift-accent/40 text-ift-light/40 cursor-not-allowed"
            : "bg-ift-accent hover:bg-blue-600 text-white shadow-lg shadow-ift-accent/20 hover:shadow-ift-accent/40"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            AI Agent Processing...
          </span>
        ) : (
          "Process with AI Agent"
        )}
      </button>
    </form>
  );
}
