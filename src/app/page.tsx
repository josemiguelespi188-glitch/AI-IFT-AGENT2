"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TeamMembersView from "@/components/TeamMembersView";
import DocumentsView from "@/components/DocumentsView";
import ChatView from "@/components/ChatView";

export type ActiveView =
  | "ai-assistant"
  | "team-members"
  | "documents"
  | "organization"
  | "settings";

export default function HomePage() {
  const [activeView, setActiveView] = useState<ActiveView>("ai-assistant");
  const [activeFolder, setActiveFolder] = useState<{
    folderId: string;
    department: string;
  } | null>(null);

  return (
    <div className="flex h-screen bg-hub-bg overflow-hidden">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        activeFolder={activeFolder}
        setActiveFolder={setActiveFolder}
      />

      <div className="flex-1 overflow-auto flex flex-col min-h-0">
        {activeView === "ai-assistant" && <ChatView />}

        {activeView === "team-members" && <TeamMembersView />}

        {activeView === "documents" && activeFolder && (
          <DocumentsView folder={activeFolder} />
        )}

        {activeView === "organization" && (
          <div className="p-8 animate-fade-in">
            <h1 className="text-hub-text text-2xl font-bold mb-2">Organization</h1>
            <p className="text-hub-muted text-sm">Organization overview coming soon.</p>
          </div>
        )}

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
