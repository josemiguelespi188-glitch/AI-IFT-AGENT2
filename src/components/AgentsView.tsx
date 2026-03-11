"use client";

import { useState } from "react";

interface Agent {
  id: string;
  name: string;
  area: string;
  model: string;
  status: "active" | "inactive";
  systemPrompt: string;
  knowledgeSources: string[];
  channels: string[];
  totalResolved: number;
  avgConfidence: number;
}

const INITIAL_AGENTS: Agent[] = [
  {
    id: "ir",
    name: "IR Agent",
    area: "Investor Relations",
    model: "gpt-4o",
    status: "active",
    systemPrompt:
      "You are a specialist in investor relations for Industry FinTech Trust. You help investors with questions about distributions, K-1 documents, capital calls, fund performance, and investment status. Always be professional, accurate, and empathetic. If you are unsure about specific numbers or dates, acknowledge the limitation and escalate rather than guessing.",
    knowledgeSources: ["IR Docs", "Investor FAQ", "Fund Agreements"],
    channels: ["Zendesk", "Email", "Axiskey"],
    totalResolved: 891,
    avgConfidence: 87,
  },
  {
    id: "ci",
    name: "Client Info Agent",
    area: "Client Success",
    model: "gpt-4o",
    status: "active",
    systemPrompt:
      "You are a client success specialist for Industry FinTech Trust. You assist with client onboarding, portal access, account management, and relationship inquiries. Provide clear, helpful guidance and escalate complex issues to the appropriate team member.",
    knowledgeSources: ["Client Onboarding", "Portal Guide", "SLAs"],
    channels: ["Email", "Axiskey"],
    totalResolved: 342,
    avgConfidence: 82,
  },
  {
    id: "faq",
    name: "FAQ Agent",
    area: "General",
    model: "gpt-4o-mini",
    status: "active",
    systemPrompt:
      "You handle frequently asked questions about Industry FinTech Trust's services, processes, and policies. Provide concise, accurate answers drawn from the approved FAQ database. For questions outside your knowledge scope, route to the appropriate specialist agent.",
    knowledgeSources: ["General FAQ", "Platform Policies"],
    channels: ["Zendesk", "Email", "Axiskey"],
    totalResolved: 1204,
    avgConfidence: 91,
  },
  {
    id: "tmpl",
    name: "Template Agent",
    area: "Operations",
    model: "gpt-4o",
    status: "inactive",
    systemPrompt:
      "You are responsible for formatting and standardizing responses to match IFT's communication guidelines. Review draft responses and ensure they follow brand voice, compliance requirements, and formatting standards before sending.",
    knowledgeSources: ["Response Templates", "Brand Guidelines", "Compliance Rules"],
    channels: [],
    totalResolved: 0,
    avgConfidence: 0,
  },
];

const ALL_KNOWLEDGE = [
  "IR Docs",
  "Investor FAQ",
  "Fund Agreements",
  "Client Onboarding",
  "Portal Guide",
  "SLAs",
  "General FAQ",
  "Platform Policies",
  "Response Templates",
  "Brand Guidelines",
  "Compliance Rules",
  "Distribution Schedule",
  "Tax Documents",
];

const ALL_CHANNELS = ["Zendesk", "Email", "Axiskey"];
const ALL_MODELS = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "claude-sonnet-4-6"];
const ALL_AREAS = ["Investor Relations", "Client Success", "Operations", "General", "Compliance"];

export default function AgentsView() {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [selectedId, setSelectedId] = useState<string | null>("ir");
  const [testMessage, setTestMessage] = useState("");
  const [testReply, setTestReply] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [saved, setSaved] = useState(false);

  const selected = agents.find((a) => a.id === selectedId) ?? null;

  const updateSelected = (patch: Partial<Agent>) => {
    setSaved(false);
    setAgents((prev) =>
      prev.map((a) => (a.id === selectedId ? { ...a, ...patch } : a))
    );
  };

  const toggleSource = (src: string) => {
    if (!selected) return;
    const next = selected.knowledgeSources.includes(src)
      ? selected.knowledgeSources.filter((s) => s !== src)
      : [...selected.knowledgeSources, src];
    updateSelected({ knowledgeSources: next });
  };

  const toggleChannel = (ch: string) => {
    if (!selected) return;
    const next = selected.channels.includes(ch)
      ? selected.channels.filter((c) => c !== ch)
      : [...selected.channels, ch];
    updateSelected({ channels: next });
  };

  const handleTest = async () => {
    if (!testMessage.trim()) return;
    setTesting(true);
    setTestReply(null);
    await new Promise((r) => setTimeout(r, 1400));
    setTestReply(
      `Based on my knowledge base, I can answer: "${testMessage.trim()}"\n\nThis is a simulated response from ${selected?.name}. In production, this calls the OpenAI API with your system prompt and retrieves relevant context from connected knowledge sources.`
    );
    setTesting(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleNewAgent = () => {
    const newId = `agent-${Date.now()}`;
    const newAgent: Agent = {
      id: newId,
      name: "New Agent",
      area: "General",
      model: "gpt-4o",
      status: "inactive",
      systemPrompt: "",
      knowledgeSources: [],
      channels: [],
      totalResolved: 0,
      avgConfidence: 0,
    };
    setAgents((prev) => [...prev, newAgent]);
    setSelectedId(newId);
  };

  return (
    <div className="flex h-full bg-hub-bg animate-fade-in overflow-hidden">
      {/* LEFT — Agent list */}
      <div className="w-64 flex-shrink-0 flex flex-col border-r border-hub-border bg-hub-card">
        <div className="px-4 py-5 border-b border-hub-border">
          <h1 className="text-hub-text text-lg font-bold">AI Agents</h1>
          <p className="text-hub-muted text-xs mt-0.5">
            Manage specialized agents
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => {
                setSelectedId(agent.id);
                setTestReply(null);
              }}
              className={`w-full text-left p-3 rounded-xl transition-all ${
                selectedId === agent.id
                  ? "bg-hub-accent/10 border border-hub-accent/50"
                  : "hover:bg-hub-bg border border-transparent"
              }`}
            >
              <div className="flex items-start justify-between">
                <p className="text-hub-text text-sm font-semibold leading-tight">
                  {agent.name}
                </p>
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${
                    agent.status === "active" ? "bg-green-400" : "bg-hub-muted"
                  }`}
                />
              </div>
              <p className="text-hub-muted text-xs mt-0.5">{agent.area}</p>
              {agent.totalResolved > 0 && (
                <p className="text-hub-muted text-[10px] mt-1">
                  {agent.totalResolved} resolved · {agent.avgConfidence}% avg
                </p>
              )}
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-hub-border">
          <button
            onClick={handleNewAgent}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-hub-border text-hub-muted hover:text-hub-accent hover:border-hub-accent text-sm transition-colors"
          >
            <span className="text-base leading-none">+</span>
            New Agent
          </button>
        </div>
      </div>

      {/* RIGHT — Editor */}
      {selected ? (
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-4xl">
            {/* Agent header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-hub-accent/20 flex items-center justify-center text-hub-accent">
                  <CpuIcon />
                </div>
                <div>
                  <input
                    value={selected.name}
                    onChange={(e) => updateSelected({ name: e.target.value })}
                    className="text-hub-text text-lg font-bold bg-transparent border-b border-transparent focus:border-hub-accent focus:outline-none"
                  />
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        selected.status === "active"
                          ? "bg-green-400"
                          : "bg-hub-muted"
                      }`}
                    />
                    <span className="text-hub-muted text-xs capitalize">
                      {selected.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    updateSelected({
                      status:
                        selected.status === "active" ? "inactive" : "active",
                    })
                  }
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    selected.status === "active"
                      ? "border-red-200 text-red-600 hover:bg-red-50"
                      : "border-green-200 text-green-600 hover:bg-green-50"
                  }`}
                >
                  {selected.status === "active" ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={handleSave}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    saved
                      ? "bg-green-500 text-white"
                      : "bg-hub-accent text-hub-sidebar hover:bg-hub-accent-dark"
                  }`}
                >
                  {saved ? "Saved" : "Save Agent"}
                </button>
              </div>
            </div>

            {/* Config grid */}
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div>
                <label className="text-hub-muted text-xs font-semibold uppercase tracking-wider block mb-1.5">
                  Area
                </label>
                <select
                  value={selected.area}
                  onChange={(e) => updateSelected({ area: e.target.value })}
                  className="w-full bg-hub-card border border-hub-border rounded-xl px-3 py-2 text-hub-text text-sm focus:outline-none focus:border-hub-accent"
                >
                  {ALL_AREAS.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-hub-muted text-xs font-semibold uppercase tracking-wider block mb-1.5">
                  Model
                </label>
                <select
                  value={selected.model}
                  onChange={(e) => updateSelected({ model: e.target.value })}
                  className="w-full bg-hub-card border border-hub-border rounded-xl px-3 py-2 text-hub-text text-sm focus:outline-none focus:border-hub-accent"
                >
                  {ALL_MODELS.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-hub-muted text-xs font-semibold uppercase tracking-wider block mb-1.5">
                  Confidence Threshold
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue={70}
                    min={0}
                    max={100}
                    className="w-full bg-hub-card border border-hub-border rounded-xl px-3 py-2 text-hub-text text-sm focus:outline-none focus:border-hub-accent"
                  />
                  <span className="text-hub-muted text-sm flex-shrink-0">%</span>
                </div>
              </div>
            </div>

            {/* System prompt */}
            <div className="mb-5">
              <label className="text-hub-muted text-xs font-semibold uppercase tracking-wider block mb-1.5">
                System Prompt
              </label>
              <textarea
                value={selected.systemPrompt}
                onChange={(e) =>
                  updateSelected({ systemPrompt: e.target.value })
                }
                rows={6}
                className="w-full bg-hub-card border border-hub-border rounded-xl px-4 py-3 text-hub-text text-sm placeholder-hub-muted focus:outline-none focus:border-hub-accent resize-none"
                placeholder="Define the agent's role, expertise, tone, and limitations..."
              />
            </div>

            <div className="grid grid-cols-2 gap-5 mb-5">
              {/* Knowledge sources */}
              <div>
                <label className="text-hub-muted text-xs font-semibold uppercase tracking-wider block mb-2">
                  Knowledge Sources
                </label>
                <div className="bg-hub-card border border-hub-border rounded-xl p-3 space-y-1.5 max-h-48 overflow-y-auto">
                  {ALL_KNOWLEDGE.map((src) => (
                    <label
                      key={src}
                      className="flex items-center gap-2.5 cursor-pointer hover:bg-hub-bg px-2 py-1.5 rounded-lg transition-colors"
                    >
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          selected.knowledgeSources.includes(src)
                            ? "bg-hub-accent border-hub-accent"
                            : "border-hub-border"
                        }`}
                        onClick={() => toggleSource(src)}
                      >
                        {selected.knowledgeSources.includes(src) && (
                          <svg
                            className="w-2.5 h-2.5 text-hub-sidebar"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        onClick={() => toggleSource(src)}
                        className="text-hub-text text-xs"
                      >
                        {src}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Connected channels */}
              <div>
                <label className="text-hub-muted text-xs font-semibold uppercase tracking-wider block mb-2">
                  Connected Channels
                </label>
                <div className="bg-hub-card border border-hub-border rounded-xl p-3 space-y-2">
                  {ALL_CHANNELS.map((ch) => (
                    <label
                      key={ch}
                      className="flex items-center gap-2.5 cursor-pointer hover:bg-hub-bg px-2 py-2 rounded-lg transition-colors"
                    >
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          selected.channels.includes(ch)
                            ? "bg-hub-accent border-hub-accent"
                            : "border-hub-border"
                        }`}
                        onClick={() => toggleChannel(ch)}
                      >
                        {selected.channels.includes(ch) && (
                          <svg
                            className="w-2.5 h-2.5 text-hub-sidebar"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        onClick={() => toggleChannel(ch)}
                        className="text-hub-text text-sm flex items-center gap-1.5"
                      >
                        <span className="text-hub-muted">
                          {ch === "Zendesk" && <TicketIcon />}
                          {ch === "Email" && <MailIcon />}
                          {ch === "Axiskey" && <KeyIcon />}
                        </span>
                        {ch}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Stats */}
                {selected.totalResolved > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="bg-hub-bg rounded-xl p-3 text-center">
                      <p className="text-hub-text text-lg font-bold">
                        {selected.totalResolved}
                      </p>
                      <p className="text-hub-muted text-[10px]">
                        Total resolved
                      </p>
                    </div>
                    <div className="bg-hub-bg rounded-xl p-3 text-center">
                      <p className="text-hub-text text-lg font-bold">
                        {selected.avgConfidence}%
                      </p>
                      <p className="text-hub-muted text-[10px]">
                        Avg confidence
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Test agent */}
            <div className="bg-hub-card border border-hub-border rounded-2xl p-5">
              <p className="text-hub-text font-semibold text-sm mb-3">
                Test Agent
              </p>
              <div className="flex gap-2">
                <input
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleTest();
                  }}
                  placeholder="Type a test message to see how this agent responds..."
                  className="flex-1 bg-hub-bg border border-hub-border rounded-xl px-4 py-2.5 text-hub-text text-sm placeholder-hub-muted focus:outline-none focus:border-hub-accent"
                />
                <button
                  onClick={handleTest}
                  disabled={!testMessage.trim() || testing}
                  className="px-5 py-2.5 rounded-xl bg-hub-text text-hub-bg text-sm font-semibold disabled:opacity-40 hover:bg-hub-text/90 transition-colors flex-shrink-0"
                >
                  {testing ? "..." : "▶ Test"}
                </button>
              </div>

              {testReply && (
                <div className="mt-3 bg-hub-bg rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 bg-hub-accent rounded-full flex items-center justify-center text-[10px] font-bold text-hub-sidebar">
                      AI
                    </span>
                    <span className="text-hub-muted text-xs">{selected.name}</span>
                  </div>
                  <p className="text-hub-text text-sm leading-relaxed whitespace-pre-line">
                    {testReply}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-hub-muted">
          <div className="text-center">
            <div className="flex justify-center mb-3 opacity-30"><CpuIconLg /></div>
            <p className="text-sm font-medium">Select an agent to configure</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function CpuIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M9 3H7a2 2 0 00-2 2v2M9 3h6M9 3v2m6-2h2a2 2 0 012 2v2m0 0h-2m2 0v6m0 0h-2m2 0v2a2 2 0 01-2 2h-2m0 0H9m6 0v2m-6-2H7a2 2 0 01-2-2v-2m0 0H3m2 0V9M3 9h2M3 9V7m6 12v2m0-2H9m6 0h-6" />
    </svg>
  );
}

function CpuIconLg() {
  return (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
        d="M9 3H7a2 2 0 00-2 2v2M9 3h6M9 3v2m6-2h2a2 2 0 012 2v2m0 0h-2m2 0v6m0 0h-2m2 0v2a2 2 0 01-2 2h-2m0 0H9m6 0v2m-6-2H7a2 2 0 01-2-2v-2m0 0H3m2 0V9M3 9h2M3 9V7m6 12v2m0-2H9m6 0h-6" />
    </svg>
  );
}

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
