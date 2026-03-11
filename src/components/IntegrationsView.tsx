"use client";

import { useState } from "react";

interface RoutingRule {
  id: string;
  channel: string;
  condition: string;
  agent: string;
  escalateBelow: number;
}

const INITIAL_RULES: RoutingRule[] = [
  { id: "r1", channel: "Zendesk", condition: 'keyword contains "distribution"', agent: "IR Agent", escalateBelow: 70 },
  { id: "r2", channel: "Email", condition: "from domain contains investor", agent: "IR Agent", escalateBelow: 70 },
  { id: "r3", channel: "Axiskey", condition: "ALL inquiries", agent: "IR Agent", escalateBelow: 70 },
  { id: "r4", channel: "Any", condition: 'keyword contains "K-1" OR "tax"', agent: "IR Agent", escalateBelow: 75 },
];

type EditingChannel = "zendesk" | "email" | "axiskey" | null;

export default function IntegrationsView() {
  const [n8nWebhook] = useState("https://n8n.company.com/webhook/ift-abc123");
  const [n8nActive] = useState(true);
  const [rules, setRules] = useState<RoutingRule[]>(INITIAL_RULES);
  const [editingChannel, setEditingChannel] = useState<EditingChannel>(null);
  const [webhookCopied, setWebhookCopied] = useState(false);

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(n8nWebhook).catch(() => {});
    setWebhookCopied(true);
    setTimeout(() => setWebhookCopied(false), 2000);
  };

  const removeRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const addRule = () => {
    const newRule: RoutingRule = {
      id: `r${Date.now()}`,
      channel: "Any",
      condition: "ALL inquiries",
      agent: "IR Agent",
      escalateBelow: 70,
    };
    setRules((prev) => [...prev, newRule]);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-hub-bg p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-hub-text text-2xl font-bold">Integrations</h1>
        <p className="text-hub-muted text-sm mt-0.5">
          Connect platforms and configure inquiry routing
        </p>
      </div>

      {/* n8n Automation */}
      <section className="mb-8">
        <h2 className="text-hub-muted text-xs font-semibold uppercase tracking-widest mb-3">
          Automation
        </h2>
        <div className="bg-hub-card rounded-2xl border border-hub-border p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EA4B71]/10 flex items-center justify-center text-[#EA4B71]">
                <ZapIcon />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-hub-text font-semibold text-sm">n8n Webhook</p>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      n8nActive
                        ? "bg-green-100 text-green-700"
                        : "bg-hub-bg text-hub-muted"
                    }`}
                  >
                    {n8nActive ? "● ACTIVE" : "● INACTIVE"}
                  </span>
                </div>
                <p className="text-hub-muted text-xs mt-0.5">
                  Receives all incoming inquiries and routes them to the correct AI agent
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-lg border border-hub-border text-hub-muted text-xs hover:text-hub-text hover:border-hub-text transition-colors">
                View Logs
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-hub-accent text-hub-sidebar text-xs font-semibold hover:bg-hub-accent-dark transition-colors">
                Configure
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 bg-hub-bg rounded-xl px-4 py-2.5">
            <code className="text-hub-text text-xs flex-1 truncate">{n8nWebhook}</code>
            <button
              onClick={handleCopyWebhook}
              className={`text-xs font-medium px-3 py-1 rounded-lg transition-colors flex-shrink-0 ${
                webhookCopied
                  ? "bg-green-100 text-green-700"
                  : "bg-hub-card border border-hub-border text-hub-muted hover:text-hub-text"
              }`}
            >
              {webhookCopied ? "✓ Copied" : "Copy"}
            </button>
          </div>

          <div className="mt-3 flex items-center gap-4 text-xs text-hub-muted">
            <span>Last triggered: <span className="text-hub-text">2 min ago</span></span>
            <span>·</span>
            <span>Total triggers: <span className="text-hub-text">1,247</span></span>
            <span>·</span>
            <span>Success rate: <span className="text-green-600 font-medium">99.8%</span></span>
          </div>
        </div>
      </section>

      {/* Channels */}
      <section className="mb-8">
        <h2 className="text-hub-muted text-xs font-semibold uppercase tracking-widest mb-3">
          Connected Channels
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Zendesk */}
          <ChannelCard
            icon={<TicketIcon />}
            name="Zendesk"
            status="active"
            detail="ift.zendesk.com"
            sub="Trigger: new ticket"
            agent="IR Agent"
            color="bg-[#17494D]/10 text-[#17494D]"
            onEdit={() => setEditingChannel("zendesk")}
          />
          {/* Email */}
          <ChannelCard
            icon={<MailIcon />}
            name="Email"
            status="active"
            detail="investor@ift.com"
            sub="Filter: investor@..."
            agent="IR Agent"
            color="bg-blue-50 text-blue-600"
            onEdit={() => setEditingChannel("email")}
          />
          {/* Axiskey */}
          <ChannelCard
            icon={<KeyIcon />}
            name="Axiskey"
            status="active"
            detail="Portal inquiries"
            sub="API: ●●●●●●●●"
            agent="IR Agent"
            color="bg-indigo-50 text-indigo-600"
            onEdit={() => setEditingChannel("axiskey")}
          />
          {/* Add more */}
          <button className="rounded-2xl border-2 border-dashed border-hub-border flex flex-col items-center justify-center gap-2 p-6 hover:border-hub-accent hover:bg-hub-accent/5 transition-all group min-h-[140px]">
            <span className="text-hub-muted group-hover:text-hub-accent group-hover:scale-110 transition-all"><PlusCircleIcon /></span>
            <p className="text-hub-muted text-xs font-medium group-hover:text-hub-accent transition-colors">
              Add Channel
            </p>
            <p className="text-hub-muted text-[10px] text-center leading-tight">
              Slack · WhatsApp · SMS · Custom webhook
            </p>
          </button>
        </div>
      </section>

      {/* Routing Rules */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-hub-muted text-xs font-semibold uppercase tracking-widest">
            Routing Rules
          </h2>
          <button
            onClick={addRule}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-hub-accent text-hub-sidebar text-xs font-semibold hover:bg-hub-accent-dark transition-colors"
          >
            <span className="text-base leading-none">+</span>
            Add Rule
          </button>
        </div>

        <div className="bg-hub-card rounded-2xl border border-hub-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hub-border bg-hub-bg">
                <th className="text-left px-5 py-3 text-hub-muted text-[10px] font-semibold uppercase tracking-wider">
                  Channel
                </th>
                <th className="text-left px-5 py-3 text-hub-muted text-[10px] font-semibold uppercase tracking-wider">
                  Condition
                </th>
                <th className="text-left px-5 py-3 text-hub-muted text-[10px] font-semibold uppercase tracking-wider">
                  Assign to Agent
                </th>
                <th className="text-left px-5 py-3 text-hub-muted text-[10px] font-semibold uppercase tracking-wider">
                  Escalate if &lt;
                </th>
                <th className="w-12 px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {rules.map((rule, idx) => (
                <tr
                  key={rule.id}
                  className={`border-b border-hub-border last:border-0 ${
                    idx % 2 === 0 ? "" : "bg-hub-bg/40"
                  }`}
                >
                  <td className="px-5 py-3">
                    <span className="text-hub-text text-xs font-medium flex items-center gap-1.5">
                      <span className="text-hub-muted">
                        {rule.channel === "Zendesk" && <TicketIcon />}
                        {rule.channel === "Email" && <MailIcon />}
                        {rule.channel === "Axiskey" && <KeyIcon />}
                        {rule.channel === "Any" && <ShuffleIcon />}
                      </span>
                      {rule.channel}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <code className="text-hub-muted text-xs bg-hub-bg px-2 py-0.5 rounded">
                      {rule.condition}
                    </code>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-hub-text text-xs">{rule.agent}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-amber-600 text-xs font-bold bg-amber-100 px-2 py-0.5 rounded-full">
                      {rule.escalateBelow}%
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => removeRule(rule.id)}
                      className="p-1 rounded text-hub-muted hover:text-red-500 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-hub-muted text-xs mt-2">
          Rules are evaluated top to bottom. First match wins. Inquiries below the confidence threshold are sent to Unanswered Tickets.
        </p>
      </section>

      {/* Channel edit modal */}
      {editingChannel && (
        <ChannelEditModal
          channel={editingChannel}
          onClose={() => setEditingChannel(null)}
        />
      )}
    </div>
  );
}

function ChannelCard({
  icon,
  name,
  status,
  detail,
  sub,
  agent,
  color,
  onEdit,
}: {
  icon: React.ReactNode;
  name: string;
  status: "active" | "inactive";
  detail: string;
  sub: string;
  agent: string;
  color: string;
  onEdit: () => void;
}) {
  return (
    <div className="bg-hub-card rounded-2xl border border-hub-border p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          {icon}
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-hub-bg text-hub-muted"
          }`}
        >
          {status === "active" ? "● ON" : "○ OFF"}
        </span>
      </div>
      <div>
        <p className="text-hub-text font-semibold text-sm">{name}</p>
        <p className="text-hub-muted text-xs mt-0.5">{detail}</p>
        <p className="text-hub-muted text-xs">{sub}</p>
        <p className="text-hub-text text-xs mt-1.5">
          <span className="text-hub-muted">Agent: </span>
          {agent}
        </p>
      </div>
      <button
        onClick={onEdit}
        className="w-full py-1.5 rounded-xl border border-hub-border text-hub-muted text-xs hover:text-hub-text hover:border-hub-text transition-colors"
      >
        Edit
      </button>
    </div>
  );
}

function ChannelEditModal({
  channel,
  onClose,
}: {
  channel: EditingChannel;
  onClose: () => void;
}) {
  const labels: Record<string, { name: string; icon: React.ReactNode }> = {
    zendesk: { name: "Zendesk", icon: <TicketIcon /> },
    email: { name: "Email", icon: <MailIcon /> },
    axiskey: { name: "Axiskey", icon: <KeyIcon /> },
  };
  const ch = channel ? labels[channel] : null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-hub-card rounded-2xl border border-hub-border shadow-2xl p-6 w-[460px] animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-hub-muted">{ch?.icon}</span>
            <h2 className="text-hub-text font-bold text-lg">
              {ch?.name} Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-hub-bg text-hub-muted transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {channel === "zendesk" && (
            <>
              <Field label="Subdomain" placeholder="yourcompany.zendesk.com" defaultValue="ift.zendesk.com" />
              <Field label="API Token" placeholder="••••••••••••••••" defaultValue="zk_live_•••••••••" type="password" />
              <Field label="Trigger event" placeholder="new_ticket" defaultValue="new_ticket" />
            </>
          )}
          {channel === "email" && (
            <>
              <Field label="Email address" placeholder="investor@yourcompany.com" defaultValue="investor@ift.com" />
              <Field label="IMAP/SMTP host" placeholder="imap.gmail.com" defaultValue="imap.gmail.com" />
              <Field label="Subject filter (optional)" placeholder='e.g. "Investor"' defaultValue="" />
            </>
          )}
          {channel === "axiskey" && (
            <>
              <Field label="API Key" placeholder="ax_••••••••••••••••" defaultValue="ax_live_•••••••••" type="password" />
              <Field label="Webhook URL (Axiskey → IFT)" placeholder="https://..." defaultValue="https://n8n.ift.com/webhook/axiskey" />
            </>
          )}

          <div>
            <label className="text-hub-muted text-xs font-semibold uppercase tracking-wider block mb-1.5">
              Assign to Agent
            </label>
            <select className="w-full bg-hub-bg border border-hub-border rounded-xl px-3 py-2 text-hub-text text-sm focus:outline-none focus:border-hub-accent">
              <option>IR Agent</option>
              <option>Client Info Agent</option>
              <option>FAQ Agent</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-hub-border text-hub-muted text-sm hover:text-hub-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-hub-accent text-hub-sidebar font-semibold text-sm hover:bg-hub-accent-dark transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  defaultValue,
  type = "text",
}: {
  label: string;
  placeholder: string;
  defaultValue: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-hub-muted text-xs font-semibold uppercase tracking-wider block mb-1.5">
        {label}
      </label>
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full bg-hub-bg border border-hub-border rounded-xl px-3 py-2 text-hub-text text-sm placeholder-hub-muted focus:outline-none focus:border-hub-accent"
      />
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function ZapIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  );
}

function ShuffleIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M4 5h13M4 12h13M4 19h13M17 5l3 3-3 3M17 12l3 3-3 3" />
    </svg>
  );
}

function PlusCircleIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
