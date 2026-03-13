"use client";

// ── Constants ─────────────────────────────────────────────────────────────────

const SPECIALIST_AGENTS = [
  {
    id: "A1",
    name: "Investor Identity",
    purpose: "Identifies the investor. Extracts name, email, entity, and account number — then matches against investor records.",
    color: "blue",
  },
  {
    id: "A2",
    name: "Client & Fund",
    purpose: "Identifies the client, sponsor, fund, deal, and offering. Surfaces deal-specific terms and distribution rules.",
    color: "indigo",
  },
  {
    id: "A3",
    name: "FAQ & Similar Cases",
    purpose: "Checks if the same or a similar inquiry was already resolved across all channels. Surfaces prior approved answers.",
    color: "violet",
  },
  {
    id: "A4",
    name: "Knowledge Retrieval",
    purpose: "Retrieves relevant content from documents, FAQs, policies, portal instructions, and prior approved responses.",
    color: "cyan",
  },
  {
    id: "A5",
    name: "Response Policy",
    purpose: "Determines if the inquiry can be answered safely. Checks compliance rules and flags any escalation requirements.",
    color: "teal",
  },
  {
    id: "A6",
    name: "Channel Formatting",
    purpose: "Converts the approved answer into the proper format — Zendesk reply, email, or AxisKey portal message.",
    color: "emerald",
  },
];

const CONFIDENCE_CRITERIA = [
  "Information completeness",
  "Agent agreement",
  "Data verification",
  "Compliance clearance",
];

const LEARNING_STEPS = [
  { label: "Human Correction", icon: <PencilSmIcon /> },
  { label: "Learning Agent", icon: <BrainSmIcon /> },
  { label: "Extracts Patterns", icon: <SearchSmIcon /> },
  { label: "Updates Knowledge", icon: <DatabaseSmIcon /> },
  { label: "Better Responses", icon: <TrendingIcon /> },
];

const LOG_TAGS = [
  "Source channel",
  "Investor name",
  "Client & fund",
  "Inquiry category",
  "AI confidence score",
  "Auto-sent or reviewed",
  "Response status",
  "AI-only or human-assisted",
];

// ── Main Component ────────────────────────────────────────────────────────────

export default function HowItWorksView() {
  return (
    <div className="flex-1 overflow-y-auto bg-hub-bg p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-hub-text text-2xl font-bold">How It Works</h1>
          <p className="text-hub-muted text-sm mt-0.5">
            End-to-end architecture of the AI inquiry management system
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {["Multi-channel", "Multi-agent", "Confidence-based", "Human-in-the-loop", "Always learning"].map((tag) => (
            <span key={tag} className="text-[10px] text-hub-muted bg-hub-card border border-hub-border px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Workflow Diagram */}
      <div className="bg-hub-card rounded-2xl border border-hub-border p-6 mb-6">
        <WorkflowDiagram />
      </div>

      {/* Flow stages */}
      <div className="bg-hub-card rounded-2xl border border-hub-border p-6">
        <div className="space-y-3">

          {/* Stage 1: Inquiry Channels */}
          <FlowStage number={1} label="Inquiry Channels" description="Investor inquiries arrive from three integrated channels">
            <div className="grid grid-cols-3 gap-3">
              <ChannelCard icon={<TicketIcon />} name="Zendesk" detail="Support ticket reply" dot="bg-[#17494D]" />
              <ChannelCard icon={<MailIcon />} name="Email" detail="Investor inbox" dot="bg-blue-500" />
              <ChannelCard icon={<KeyIcon />} name="AxisKey" detail="Portal inquiry" dot="bg-indigo-500" />
            </div>
          </FlowStage>

          <FlowConnector label="Routed to" />

          {/* Stage 2: Master AI Agent */}
          <FlowStage number={2} label="Master AI Agent" description="Central orchestrator — receives every inquiry and delegates to specialist agents">
            <div className="bg-gradient-to-r from-hub-accent/10 via-hub-accent/5 to-transparent border border-hub-accent/25 rounded-xl p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-hub-accent/20 flex items-center justify-center text-hub-accent flex-shrink-0">
                  <BrainIcon />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-hub-text font-bold text-sm">n8n Orchestration Engine</p>
                    <span className="text-[10px] bg-hub-accent/15 text-hub-accent-dark border border-hub-accent/20 px-2 py-0.5 rounded-full font-semibold">
                      Central Intelligence
                    </span>
                  </div>
                  <p className="text-hub-muted text-xs leading-relaxed">
                    The Master AI Agent is the first to receive every inquiry. It extracts context, classifies the intent, identifies the investor and fund, and delegates to all specialist agents simultaneously.
                  </p>
                  <div className="flex gap-1.5 mt-2.5 flex-wrap">
                    {["Receives inquiry", "Classifies intent", "Extracts context", "Identifies investor", "Delegates to agents"].map((step) => (
                      <span key={step} className="text-[10px] bg-hub-accent/10 text-hub-accent-dark border border-hub-accent/20 px-2 py-0.5 rounded-full font-medium">
                        {step}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FlowStage>

          <FlowConnector label="Delegates in parallel to" />

          {/* Stage 3: Specialist Agents */}
          <FlowStage number={3} label="Specialist Agents" description="Six AI agents work in parallel — each focused on one dimension of the inquiry">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {SPECIALIST_AGENTS.map((agent) => (
                <AgentCard key={agent.id} {...agent} />
              ))}
            </div>
            <p className="text-hub-muted text-[10px] mt-2 text-center">
              All six agents run simultaneously — outputs are aggregated before the confidence decision
            </p>
          </FlowStage>

          <FlowConnector label="All agent outputs aggregated by" />

          {/* Stage 4: Confidence & Decision */}
          <FlowStage number={4} label="Confidence & Decision Layer" description="Evaluates completeness, agent agreement, data quality, and compliance before routing">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-hub-muted">0%</span>
                  <span className="text-xs font-bold text-amber-700">70% Auto-send Threshold</span>
                  <span className="text-xs text-hub-muted">100%</span>
                </div>
                <div className="relative h-4 bg-hub-bg rounded-full overflow-hidden border border-hub-border">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-amber-400 to-green-400 rounded-full" />
                  <div className="absolute top-0 bottom-0 left-[70%] w-0.5 bg-hub-text/60" />
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {CONFIDENCE_CRITERIA.map((c) => (
                  <div key={c} className="flex items-center gap-1.5 text-xs text-hub-text">
                    <span className="text-amber-500 flex-shrink-0"><CheckSmIcon /></span>
                    {c}
                  </div>
                ))}
              </div>
            </div>
          </FlowStage>

          {/* Stage 5: Split paths */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                  5a
                </div>
                <span className="text-hub-text font-semibold text-sm">Auto-Send</span>
                <span className="text-[10px] text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full font-semibold">
                  ≥ 70% confidence
                </span>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
                <OutputRow icon={<CheckCircleSmIcon color="green" />} text="Response sent via n8n to source channel" />
                <OutputRow icon={<CheckCircleSmIcon color="green" />} text="Inquiry logged with full metadata" />
                <OutputRow icon={<CheckCircleSmIcon color="green" />} text="Dashboard metrics updated in real time" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                  5b
                </div>
                <span className="text-hub-text font-semibold text-sm">Human Review Queue</span>
                <span className="text-[10px] text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
                  &lt; 70% confidence
                </span>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                <OutputRow icon={<AlertSmIcon />} text="Flagged as low-confidence inside the platform" />
                <OutputRow icon={<AlertSmIcon />} text="Human operator reviews the AI draft response" />
                <OutputRow icon={<AlertSmIcon />} text="Can edit, enrich, or regenerate the answer" />
              </div>
            </div>
          </div>

          <FlowConnector label="Reviewed answers feed into" />

          {/* Stage 6: Learning Loop */}
          <FlowStage number={6} label="Learning Loop" description="Human corrections continuously improve the system's knowledge and future confidence scores">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {LEARNING_STEPS.map((step, i) => (
                  <>
                    <div key={step.label} className="flex flex-col items-center gap-1 px-3 py-2 bg-white border border-purple-200 rounded-xl min-w-[90px]">
                      <span className="text-purple-500">{step.icon}</span>
                      <span className="text-[10px] font-semibold text-hub-text text-center leading-tight">{step.label}</span>
                    </div>
                    {i < LEARNING_STEPS.length - 1 && (
                      <svg key={`arrow-${i}`} className="w-4 h-4 text-purple-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    )}
                  </>
                ))}
              </div>
              <p className="text-purple-700 text-[10px] text-center mt-2.5">
                New rules, FAQ patterns, and fund-specific instructions are extracted and injected back into the agent knowledge bases
              </p>
            </div>
          </FlowStage>

          {/* Stage 7: Platform Logging */}
          <div className="flex items-start gap-3 p-4 bg-hub-bg rounded-xl border border-hub-border">
            <div className="w-6 h-6 rounded-full bg-hub-text flex items-center justify-center text-hub-bg text-[10px] font-bold flex-shrink-0 mt-0.5">
              7
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-hub-text font-semibold text-sm">Platform Logging</p>
                <span className="text-[10px] text-hub-muted bg-hub-card border border-hub-border px-2 py-0.5 rounded-full">
                  Every inquiry · Always
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {LOG_TAGS.map((tag) => (
                  <span key={tag} className="text-[10px] bg-hub-card border border-hub-border px-2 py-0.5 rounded-full text-hub-muted">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Workflow Diagram ───────────────────────────────────────────────────────────

function WorkflowDiagram() {
  return (
    <div className="rounded-xl border border-hub-border bg-hub-bg/60 p-4">
      <p className="text-hub-muted text-[10px] font-semibold uppercase tracking-wider mb-3">Architecture Diagram</p>
      <div className="overflow-x-auto">
        <svg
          viewBox="0 0 920 480"
          width="100%"
          style={{ minWidth: 640, display: "block" }}
          xmlns="http://www.w3.org/2000/svg"
          fontFamily="inherit"
        >
          <defs>
            <marker id="arr-neutral" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#94a3b8" />
            </marker>
            <marker id="arr-green" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#22c55e" />
            </marker>
            <marker id="arr-amber" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#f59e0b" />
            </marker>
            <marker id="arr-purple" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#a855f7" />
            </marker>
          </defs>

          {/* Inputs → Master */}
          <line x1="180" y1="68" x2="430" y2="68" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arr-neutral)" />
          <line x1="180" y1="108" x2="270" y2="108" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="270" y1="108" x2="270" y2="68" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="180" y1="148" x2="270" y2="148" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="270" y1="148" x2="270" y2="68" stroke="#94a3b8" strokeWidth="1.5" />

          {/* Master → Agents */}
          <line x1="530" y1="68" x2="530" y2="95" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="530" y1="95" x2="120" y2="95" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
          <line x1="120" y1="95" x2="120" y2="200" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
          {[155, 305, 455, 605, 755, 905].map((x) => (
            <line key={x} x1="120" y1="200" x2={x} y2="215" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arr-neutral)" />
          ))}

          {/* Agents → Confidence */}
          {[155, 305, 455, 605, 755, 905].map((x) => (
            <line key={x} x1={x} y1="272" x2="530" y2="300" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" markerEnd="url(#arr-neutral)" />
          ))}

          {/* Confidence → Auto-send */}
          <line x1="430" y1="336" x2="225" y2="336" stroke="#22c55e" strokeWidth="1.5" />
          <line x1="225" y1="336" x2="225" y2="362" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#arr-green)" />

          {/* Confidence → Review Queue */}
          <line x1="630" y1="336" x2="775" y2="336" stroke="#f59e0b" strokeWidth="1.5" />
          <line x1="775" y1="336" x2="775" y2="362" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#arr-amber)" />

          {/* Review Queue → Learning Loop */}
          <line x1="775" y1="418" x2="775" y2="438" stroke="#a855f7" strokeWidth="1.5" />
          <line x1="775" y1="438" x2="530" y2="438" stroke="#a855f7" strokeWidth="1.5" markerEnd="url(#arr-purple)" />

          {/* Learning Loop feedback */}
          <line x1="430" y1="418" x2="40" y2="418" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="5 3" />
          <line x1="40" y1="418" x2="40" y2="230" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="5 3" />
          <line x1="40" y1="230" x2="100" y2="230" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="5 3" markerEnd="url(#arr-purple)" />

          <line x1="530" y1="460" x2="530" y2="470" stroke="#94a3b8" strokeWidth="1" />

          {/* Input nodes */}
          <rect x="20" y="50" width="160" height="36" rx="8" fill="#f0fdf4" stroke="#86efac" strokeWidth="1.5" />
          <text x="100" y="64" textAnchor="middle" fontSize="9" fontWeight="700" fill="#166534">Zendesk</text>
          <text x="100" y="78" textAnchor="middle" fontSize="8" fill="#4ade80">Support tickets</text>

          <rect x="20" y="90" width="160" height="36" rx="8" fill="#eff6ff" stroke="#93c5fd" strokeWidth="1.5" />
          <text x="100" y="104" textAnchor="middle" fontSize="9" fontWeight="700" fill="#1e40af">Email</text>
          <text x="100" y="118" textAnchor="middle" fontSize="8" fill="#60a5fa">Investor inbox</text>

          <rect x="20" y="130" width="160" height="36" rx="8" fill="#eef2ff" stroke="#a5b4fc" strokeWidth="1.5" />
          <text x="100" y="144" textAnchor="middle" fontSize="9" fontWeight="700" fill="#3730a3">AxisKey</text>
          <text x="100" y="158" textAnchor="middle" fontSize="8" fill="#818cf8">Portal inquiry</text>

          {/* Master AI Agent */}
          <rect x="430" y="42" width="200" height="52" rx="10" fill="#ecfccb" stroke="#a3e635" strokeWidth="2" />
          <text x="530" y="62" textAnchor="middle" fontSize="10" fontWeight="800" fill="#365314">Master AI Agent</text>
          <text x="530" y="76" textAnchor="middle" fontSize="8" fill="#4d7c0f">n8n Orchestration Engine</text>
          <text x="530" y="88" textAnchor="middle" fontSize="7.5" fill="#84cc16">Classifies · Extracts · Delegates</text>

          {/* Specialist Agents */}
          {[
            { x: 80, label: "A1", name: "Investor\nIdentity", fill: "#eff6ff", stroke: "#93c5fd", text: "#1d4ed8" },
            { x: 230, label: "A2", name: "Client\n& Fund", fill: "#eef2ff", stroke: "#a5b4fc", text: "#4338ca" },
            { x: 380, label: "A3", name: "FAQ &\nCases", fill: "#f5f3ff", stroke: "#c4b5fd", text: "#6d28d9" },
            { x: 530, label: "A4", name: "Knowledge\nRetrieval", fill: "#ecfeff", stroke: "#67e8f9", text: "#0e7490" },
            { x: 680, label: "A5", name: "Response\nPolicy", fill: "#f0fdfa", stroke: "#6ee7b7", text: "#065f46" },
            { x: 830, label: "A6", name: "Channel\nFormat", fill: "#f0fdf4", stroke: "#86efac", text: "#166534" },
          ].map(({ x, label, name, fill, stroke, text }) => {
            const lines = name.split("\n");
            return (
              <g key={label}>
                <rect x={x - 65} y="215" width="130" height="57" rx="8" fill={fill} stroke={stroke} strokeWidth="1.5" />
                <text x={x} y="231" textAnchor="middle" fontSize="8" fontWeight="700" fill={text} opacity="0.6">{label}</text>
                <text x={x} y="244" textAnchor="middle" fontSize="9" fontWeight="700" fill="#1e293b">{lines[0]}</text>
                {lines[1] && <text x={x} y="257" textAnchor="middle" fontSize="9" fontWeight="700" fill="#1e293b">{lines[1]}</text>}
              </g>
            );
          })}

          {/* Confidence & Decision Layer */}
          <rect x="380" y="300" width="300" height="36" rx="8" fill="#fef3c7" stroke="#fcd34d" strokeWidth="1.5" />
          <text x="530" y="316" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#92400e">Confidence & Decision Layer</text>
          <text x="530" y="329" textAnchor="middle" fontSize="7.5" fill="#b45309">70% threshold · 4 criteria evaluated</text>

          {/* Auto-send */}
          <rect x="115" y="362" width="220" height="56" rx="8" fill="#f0fdf4" stroke="#86efac" strokeWidth="1.5" />
          <text x="225" y="381" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#166534">Auto-Send</text>
          <text x="225" y="394" textAnchor="middle" fontSize="8" fill="#16a34a">≥ 70% confidence</text>
          <text x="225" y="407" textAnchor="middle" fontSize="7.5" fill="#4ade80">Response sent via n8n</text>

          {/* Human Review Queue */}
          <rect x="665" y="362" width="220" height="56" rx="8" fill="#fefce8" stroke="#fde047" strokeWidth="1.5" />
          <text x="775" y="381" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#854d0e">Human Review Queue</text>
          <text x="775" y="394" textAnchor="middle" fontSize="8" fill="#ca8a04">&lt; 70% confidence</text>
          <text x="775" y="407" textAnchor="middle" fontSize="7.5" fill="#facc15">Operator reviews AI draft</text>

          {/* Learning Loop */}
          <rect x="430" y="418" width="200" height="36" rx="8" fill="#faf5ff" stroke="#d8b4fe" strokeWidth="1.5" />
          <text x="530" y="434" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#6b21a8">Learning Loop</text>
          <text x="530" y="447" textAnchor="middle" fontSize="7.5" fill="#a855f7">Patterns extracted · KB updated</text>

          {/* Platform Logging */}
          <rect x="20" y="460" width="880" height="16" rx="4" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1" />
          <text x="460" y="472" textAnchor="middle" fontSize="7.5" fill="#64748b" fontWeight="600">
            Platform Logging — every inquiry · always · source · investor · fund · confidence score · outcome
          </text>

          <text x="40" y="340" textAnchor="middle" fontSize="7.5" fill="#a855f7" fontWeight="600" transform="rotate(-90 40 340)">Feedback loop</text>
        </svg>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FlowStage({
  number,
  label,
  description,
  children,
}: {
  number: number;
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-hub-border bg-hub-bg/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-hub-text flex items-center justify-center text-hub-bg text-[10px] font-bold flex-shrink-0">
          {number}
        </div>
        <span className="text-hub-text font-semibold text-sm">{label}</span>
        <span className="text-hub-muted text-xs hidden sm:inline">— {description}</span>
      </div>
      {children}
    </div>
  );
}

function FlowConnector({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-1">
      <div className="w-px h-5 bg-hub-border" />
      <svg className="w-4 h-4 text-hub-muted -mt-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

function ChannelCard({
  icon,
  name,
  detail,
  dot,
}: {
  icon: React.ReactNode;
  name: string;
  detail: string;
  dot: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-hub-border bg-hub-card">
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
      <span className="text-hub-muted flex-shrink-0">{icon}</span>
      <div>
        <p className="text-hub-text text-xs font-semibold">{name}</p>
        <p className="text-hub-muted text-[10px]">{detail}</p>
      </div>
    </div>
  );
}

const AGENT_COLORS: Record<string, string> = {
  blue: "bg-blue-50 border-blue-200 text-blue-600",
  indigo: "bg-indigo-50 border-indigo-200 text-indigo-600",
  violet: "bg-violet-50 border-violet-200 text-violet-600",
  cyan: "bg-cyan-50 border-cyan-200 text-cyan-600",
  teal: "bg-teal-50 border-teal-200 text-teal-600",
  emerald: "bg-emerald-50 border-emerald-200 text-emerald-600",
};

function AgentCard({
  id,
  name,
  purpose,
  color,
}: {
  id: string;
  name: string;
  purpose: string;
  color: string;
}) {
  const cls = AGENT_COLORS[color] ?? AGENT_COLORS.blue;
  return (
    <div className={`rounded-xl border p-3 ${cls}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[10px] font-bold opacity-60">{id}</span>
        <p className="text-hub-text text-xs font-semibold leading-tight">{name}</p>
      </div>
      <p className="text-hub-muted text-[10px] leading-relaxed">{purpose}</p>
    </div>
  );
}

function OutputRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="flex-shrink-0 mt-0.5">{icon}</span>
      <span className="text-hub-text text-xs">{text}</span>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function BrainIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
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

function CheckSmIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CheckCircleSmIcon({ color }: { color: string }) {
  return (
    <svg className={`w-3.5 h-3.5 text-${color}-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function AlertSmIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function PencilSmIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function BrainSmIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

function SearchSmIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function DatabaseSmIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
    </svg>
  );
}

function TrendingIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}
