"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Inquiry } from "@/types";
import InquiryCard from "./InquiryCard";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AGENTS = [
  {
    id: "general",
    name: "General Assistant",
    description: "General questions about operations, team, and platform",
    systemPrompt:
      "You are a general AI assistant for Industry FinTech, a financial services platform. Help the team with any question about operations, investor relations, and the platform. Be concise and professional.",
  },
  {
    id: "investor-relations",
    name: "Investor Relations",
    description: "Specialized in investor queries, K-1s, distributions",
    systemPrompt:
      "You are an Investor Relations AI specialist for Industry FinTech. You are an expert in investor communications, K-1 tax documents, capital distributions, fund performance, and investor onboarding. Answer questions with precision and professionalism.",
  },
  {
    id: "operations",
    name: "Operations",
    description: "Fund operations, compliance, and processes",
    systemPrompt:
      "You are an Operations AI specialist for Industry FinTech. You are an expert in fund operations, regulatory compliance, back-office processes, and operational workflows. Provide clear, actionable guidance.",
  },
  {
    id: "client-success",
    name: "Client Success",
    description: "Client relationships and support escalations",
    systemPrompt:
      "You are a Client Success AI specialist for Industry FinTech. You are an expert in client relationship management, support escalations, onboarding flows, and satisfaction strategies. Be empathetic and solution-oriented.",
  },
];

export default function ChatView() {
  const [activeTab, setActiveTab] = useState<"chat" | "inquiries">("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const fetchInquiries = useCallback(async () => {
    setLoadingInquiries(true);
    try {
      const res = await fetch("/api/inquiries?limit=50");
      const json = await res.json();
      if (json.data) setInquiries(json.data);
    } finally {
      setLoadingInquiries(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "inquiries") fetchInquiries();
  }, [activeTab, fetchInquiries]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          systemPrompt: selectedAgent.systemPrompt,
        }),
      });
      const json = await res.json();
      if (json.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: json.reply }]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error getting response. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-8 pt-8 pb-0 flex-shrink-0">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-hub-text text-2xl font-bold">AI Assistant</h1>
            <p className="text-hub-muted text-sm mt-1">
              Chat with specialized AI agents or review incoming inquiries
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-hub-accent animate-pulse" />
            <span className="text-xs text-hub-muted">Live</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-hub-card border border-hub-border rounded-lg p-1 w-fit shadow-sm">
          {(["chat", "inquiries"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? "bg-hub-accent text-hub-sidebar-active-text"
                  : "text-hub-muted hover:text-hub-text"
              }`}
            >
              {tab === "chat" ? "Chat" : "Inquiries"}
            </button>
          ))}
        </div>
      </div>

      {/* ── CHAT TAB ─────────────────────────────────────────────── */}
      {activeTab === "chat" && (
        <div className="flex flex-1 gap-0 min-h-0 px-8 py-5">
          {/* Agent selector panel */}
          <div className="w-56 flex-shrink-0 pr-4">
            <p className="text-hub-muted text-[10px] font-semibold tracking-widest uppercase mb-2 px-1">
              Select Agent
            </p>
            <div className="space-y-1">
              {AGENTS.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => {
                    setSelectedAgent(agent);
                    setMessages([]);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all ${
                    selectedAgent.id === agent.id
                      ? "bg-hub-accent/10 border-hub-accent text-hub-text"
                      : "bg-hub-card border-hub-border text-hub-muted hover:border-hub-accent/40 hover:text-hub-text"
                  }`}
                >
                  <p
                    className={`text-sm font-semibold ${
                      selectedAgent.id === agent.id
                        ? "text-hub-text"
                        : "text-hub-text/70"
                    }`}
                  >
                    {agent.name}
                  </p>
                  <p className="text-[11px] text-hub-muted mt-0.5 leading-tight">
                    {agent.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Chat panel */}
          <div className="flex-1 flex flex-col bg-hub-card border border-hub-border rounded-2xl shadow-sm min-h-0 overflow-hidden">
            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-hub-border flex-shrink-0">
              <div className="w-8 h-8 bg-hub-accent rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-hub-sidebar-active-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                </svg>
              </div>
              <div>
                <p className="text-hub-text text-sm font-semibold">{selectedAgent.name}</p>
                <p className="text-hub-muted text-xs">{selectedAgent.description}</p>
              </div>
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="ml-auto text-xs text-hub-muted hover:text-hub-text transition-colors px-2 py-1 rounded border border-hub-border hover:border-hub-accent/40"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {messages.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div className="w-14 h-14 bg-hub-bg border border-hub-border rounded-2xl flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-hub-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-hub-text font-semibold text-sm mb-1">
                    Start a conversation
                  </p>
                  <p className="text-hub-muted text-xs max-w-xs">
                    Ask the <span className="font-medium">{selectedAgent.name}</span> agent anything about{" "}
                    {selectedAgent.description.toLowerCase()}.
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                      msg.role === "user"
                        ? "bg-hub-sidebar text-hub-sidebar-text"
                        : "bg-hub-accent text-hub-sidebar-active-text"
                    }`}
                  >
                    {msg.role === "user" ? "U" : "AI"}
                  </div>
                  {/* Bubble */}
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-hub-sidebar text-hub-sidebar-text rounded-tr-sm"
                        : "bg-hub-bg border border-hub-border text-hub-text rounded-tl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-hub-accent flex-shrink-0 flex items-center justify-center text-xs font-bold text-hub-sidebar-active-text">
                    AI
                  </div>
                  <div className="bg-hub-bg border border-hub-border rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-hub-muted animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-hub-muted animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-hub-muted animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div className="px-5 py-4 border-t border-hub-border flex-shrink-0">
              <div className="flex gap-3 items-end">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask the ${selectedAgent.name} agent…`}
                  rows={1}
                  className="flex-1 resize-none bg-hub-bg border border-hub-border rounded-xl px-4 py-2.5 text-hub-text text-sm placeholder-hub-muted focus:outline-none focus:border-hub-accent transition-colors leading-relaxed overflow-hidden"
                  style={{ minHeight: "44px", maxHeight: "160px" }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 flex-shrink-0 bg-hub-accent hover:bg-hub-accent-dark disabled:opacity-40 disabled:cursor-not-allowed text-hub-sidebar-active-text rounded-xl flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              <p className="text-hub-muted text-[10px] mt-1.5 text-center">
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── INQUIRIES TAB ─────────────────────────────────────────── */}
      {activeTab === "inquiries" && (
        <div className="flex-1 overflow-auto px-8 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-hub-text font-semibold text-base">Incoming Inquiries</h2>
              <p className="text-hub-muted text-xs mt-0.5">
                Received from connected platforms via n8n
              </p>
            </div>
            <button
              onClick={fetchInquiries}
              disabled={loadingInquiries}
              className="text-xs text-hub-accent-dark hover:text-hub-accent disabled:opacity-50 font-medium transition-colors flex items-center gap-1.5"
            >
              <svg className={`w-3.5 h-3.5 ${loadingInquiries ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loadingInquiries ? "Refreshing…" : "Refresh"}
            </button>
          </div>

          {loadingInquiries && inquiries.length === 0 ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-hub-card rounded-xl h-20 animate-pulse border border-hub-border" />
              ))}
            </div>
          ) : inquiries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-14 h-14 bg-hub-card border border-hub-border rounded-2xl flex items-center justify-center mb-4 text-2xl shadow-sm">
                📭
              </div>
              <p className="text-hub-text font-semibold text-sm mb-1">No inquiries yet</p>
              <p className="text-hub-muted text-xs max-w-xs">
                Inquiries from your connected platforms will appear here automatically.
              </p>
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
  );
}
