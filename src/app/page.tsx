"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TeamMembersView from "@/components/TeamMembersView";
import ChatView from "@/components/ChatView";
import DashboardView from "@/components/DashboardView";
import UnansweredTicketsView from "@/components/UnansweredTicketsView";
import AgentsView from "@/components/AgentsView";
import IntegrationsView from "@/components/IntegrationsView";
import KnowledgeBaseView from "@/components/KnowledgeBaseView";
import HowItWorksView from "@/components/HowItWorksView";
import type { ActiveKBFolder } from "@/components/KnowledgeBaseView";

export type ActiveView =
  | "dashboard"
  | "how-it-works"
  | "ai-agents"
  | "ai-assistant"
  | "unanswered-tickets"
  | "team-members"
  | "knowledge-base"
  | "organization"
  | "integrations"
  | "settings";

export default function HomePage() {
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  const [activeKBFolder, setActiveKBFolder] = useState<ActiveKBFolder | null>(null);

  return (
    <div className="flex h-screen bg-hub-bg overflow-hidden">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        activeKBFolder={activeKBFolder}
        setActiveKBFolder={setActiveKBFolder}
        unansweredCount={4}
      />

      <div className="flex-1 overflow-auto flex flex-col min-h-0">
        {activeView === "dashboard" && <DashboardView />}

        {activeView === "how-it-works" && <HowItWorksView />}

        {activeView === "ai-agents" && <AgentsView />}

        {activeView === "ai-assistant" && <ChatView />}

        {activeView === "unanswered-tickets" && <UnansweredTicketsView />}

        {activeView === "team-members" && <TeamMembersView />}

        {activeView === "knowledge-base" && activeKBFolder && (
          <KnowledgeBaseView folder={activeKBFolder} />
        )}

        {activeView === "organization" && (
          <div className="p-8 animate-fade-in">
            <h1 className="text-hub-text text-2xl font-bold mb-2">Organization</h1>
            <p className="text-hub-muted text-sm">Organization overview coming soon.</p>
          </div>
        )}

        {activeView === "integrations" && <IntegrationsView />}

        {activeView === "settings" && (
          <div className="p-8 animate-fade-in">
            <h1 className="text-hub-text text-2xl font-bold mb-2">Settings</h1>
            <p className="text-hub-muted text-sm">Settings coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
