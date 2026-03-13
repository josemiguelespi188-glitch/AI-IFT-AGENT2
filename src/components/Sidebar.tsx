"use client";

import { useCallback, useEffect, useState } from "react";
import type { ActiveView } from "@/app/page";
import type { ActiveKBFolder } from "@/components/KnowledgeBaseView";

interface KBFolder {
  id: string;
  parentId?: string;
  name: string;
  entry_count: number;
}

interface Props {
  activeView: ActiveView;
  setActiveView: (v: ActiveView) => void;
  activeKBFolder: ActiveKBFolder | null;
  setActiveKBFolder: (f: ActiveKBFolder | null) => void;
  unansweredCount?: number;
}

export default function Sidebar({
  activeView,
  setActiveView,
  activeKBFolder,
  setActiveKBFolder,
  unansweredCount = 4,
}: Props) {
  const [folders, setFolders] = useState<KBFolder[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Inline create states
  const [newFolderParentId, setNewFolderParentId] = useState<string | null | "root">(null);
  const [newFolderName, setNewFolderName] = useState("");

  const fetchFolders = useCallback(async () => {
    const res = await fetch("/api/kb/folders");
    const json = await res.json();
    if (json.data) setFolders(json.data);
  }, []);

  useEffect(() => { fetchFolders(); }, [fetchFolders]);

  // ── Folder management ──────────────────────────────────────────────────────

  const handleAddFolder = async (parentId?: string) => {
    if (!newFolderName.trim()) return;
    const res = await fetch("/api/kb/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newFolderName.trim(), parentId: parentId ?? undefined }),
    });
    const json = await res.json();
    if (json.data) {
      setFolders((prev) => [...prev, json.data]);
      if (parentId) setExpanded((prev) => ({ ...prev, [parentId]: true }));
    }
    setNewFolderParentId(null);
    setNewFolderName("");
  };

  const handleDeleteFolder = async (folderId: string) => {
    await fetch("/api/kb/folders", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: folderId }),
    });
    setFolders((prev) => prev.filter((f) => f.id !== folderId && f.parentId !== folderId));
    if (activeKBFolder?.folderId === folderId) setActiveKBFolder(null);
  };

  const rootFolders = folders.filter((f) => !f.parentId);
  const subFolders = (parentId: string) => folders.filter((f) => f.parentId === parentId);
  const toggleFolder = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const nav = (v: ActiveView) => {
    setActiveView(v);
    setActiveKBFolder(null);
  };

  const openFolder = (folder: KBFolder) => {
    setActiveKBFolder({ folderId: folder.id, folderName: folder.name });
    setActiveView("knowledge-base");
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <aside className="w-64 flex-shrink-0 bg-hub-sidebar flex flex-col h-screen">
      {/* Header */}
      <div className="px-5 py-5 flex items-center justify-between border-b border-hub-sidebar-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-hub-accent rounded-lg flex items-center justify-center">
              <span className="text-hub-sidebar text-xs font-bold">IFT</span>
            </div>
            <span className="text-hub-sidebar-text font-bold text-sm">
              IFT IA AGENTS
            </span>
          </div>
          <p className="text-hub-sidebar-muted text-xs mt-1 ml-10">
            AI Inquiry Platform
          </p>
        </div>
      </div>

      {/* Main nav */}
      <nav className="px-3 pt-4 space-y-0.5">
        <SidebarItem
          icon={<DashboardIcon />}
          label="Dashboard"
          active={activeView === "dashboard"}
          onClick={() => nav("dashboard")}
        />
        <SidebarItem
          icon={<HowItWorksIcon />}
          label="How It Works"
          active={activeView === "how-it-works"}
          onClick={() => nav("how-it-works")}
        />
        <SidebarItem
          icon={<AgentsIcon />}
          label="AI Agents"
          active={activeView === "ai-agents"}
          onClick={() => nav("ai-agents")}
        />
        <SidebarItem
          icon={<ChatIcon />}
          label="Inquiries"
          active={activeView === "ai-assistant"}
          onClick={() => nav("ai-assistant")}
        />
        <SidebarItem
          icon={<TicketIcon />}
          label="Unanswered Tickets"
          active={activeView === "unanswered-tickets"}
          onClick={() => nav("unanswered-tickets")}
          badge={unansweredCount > 0 ? unansweredCount : undefined}
          badgeColor="red"
        />
        <SidebarItem
          icon={<BuildingIcon />}
          label="Organization"
          active={activeView === "organization"}
          onClick={() => nav("organization")}
        />
        <SidebarItem
          icon={<PeopleIcon />}
          label="Team Members"
          active={activeView === "team-members"}
          onClick={() => nav("team-members")}
        />
        <SidebarItem
          icon={<IntegrationsIcon />}
          label="Integrations"
          active={activeView === "integrations"}
          onClick={() => nav("integrations")}
        />
      </nav>

      {/* Knowledge Base section */}
      <div className="px-3 mt-6 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-2 mb-2">
          <p className="text-hub-sidebar-muted text-[10px] font-semibold tracking-widest uppercase">
            Knowledge Base
          </p>
          <button
            onClick={() => { setNewFolderParentId("root"); setNewFolderName(""); }}
            title="New Folder"
            className="p-0.5 rounded text-hub-sidebar-muted hover:text-hub-accent transition-colors"
          >
            <PlusIcon />
          </button>
        </div>

        {/* Root folders */}
        {rootFolders.map((folder) => {
          const isExpanded = !!expanded[folder.id];
          const children = subFolders(folder.id);
          const isActive = activeKBFolder?.folderId === folder.id;

          return (
            <div key={folder.id} className="mb-0.5 group/folder">
              {/* Folder row */}
              <div className="flex items-center">
                <button
                  onClick={() => {
                    if (children.length > 0) toggleFolder(folder.id);
                    openFolder(folder);
                  }}
                  className={`flex-1 flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-hub-sidebar-active text-hub-sidebar-active-text"
                      : "text-hub-sidebar-text hover:bg-hub-sidebar-hover"
                  }`}
                >
                  {children.length > 0 ? (
                    <span
                      className="text-hub-sidebar-muted text-[10px] transition-transform duration-150 flex-shrink-0"
                      style={{ display: "inline-block", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
                      onClick={(e) => { e.stopPropagation(); toggleFolder(folder.id); }}
                    >
                      ▶
                    </span>
                  ) : (
                    <FolderIcon />
                  )}
                  <span className="flex-1 text-left font-medium text-hub-sidebar-text/80 text-sm truncate">
                    {folder.name}
                  </span>
                  {folder.entry_count > 0 && (
                    <span className="text-[10px] bg-black/30 text-hub-sidebar-muted rounded px-1.5 py-0.5 flex-shrink-0">
                      {folder.entry_count}
                    </span>
                  )}
                </button>
                {/* Add subfolder button */}
                <button
                  onClick={() => { setNewFolderParentId(folder.id); setNewFolderName(""); setExpanded((p) => ({ ...p, [folder.id]: true })); }}
                  className="opacity-0 group-hover/folder:opacity-100 p-1 rounded text-hub-sidebar-muted hover:text-hub-accent transition-all"
                  title="Add subfolder"
                >
                  <PlusIcon />
                </button>
                <button
                  onClick={() => handleDeleteFolder(folder.id)}
                  className="opacity-0 group-hover/folder:opacity-100 p-1 mr-1 rounded text-hub-sidebar-muted hover:text-red-400 transition-all"
                >
                  <XSmallIcon />
                </button>
              </div>

              {/* Subfolders */}
              {isExpanded && (
                <div className="ml-4 mt-0.5 space-y-0.5">
                  {children.map((sub) => {
                    const subActive = activeKBFolder?.folderId === sub.id;
                    return (
                      <div key={sub.id} className="flex items-center group/sub">
                        <button
                          onClick={() => openFolder(sub)}
                          className={`flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                            subActive
                              ? "bg-hub-sidebar-hover text-hub-sidebar-text font-medium"
                              : "text-hub-sidebar-muted hover:bg-hub-sidebar-hover hover:text-hub-sidebar-text"
                          }`}
                        >
                          <FolderIcon />
                          <span className="flex-1 text-left truncate">{sub.name}</span>
                          {sub.entry_count > 0 && (
                            <span className="text-[10px] bg-black/30 text-hub-sidebar-muted rounded px-1.5 py-0.5 flex-shrink-0">
                              {sub.entry_count}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteFolder(sub.id)}
                          className="opacity-0 group-hover/sub:opacity-100 p-1 mr-1 rounded text-hub-sidebar-muted hover:text-red-400 transition-all"
                        >
                          <XSmallIcon />
                        </button>
                      </div>
                    );
                  })}

                  {/* Inline new subfolder */}
                  {newFolderParentId === folder.id && (
                    <div className="px-3 py-1">
                      <input
                        autoFocus
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddFolder(folder.id);
                          if (e.key === "Escape") { setNewFolderParentId(null); setNewFolderName(""); }
                        }}
                        placeholder="Subfolder name..."
                        className="w-full bg-hub-sidebar-hover border border-hub-sidebar-border rounded px-2 py-1 text-xs text-hub-sidebar-text placeholder-hub-sidebar-muted focus:outline-none focus:border-hub-accent"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Inline new root folder */}
        {newFolderParentId === "root" && (
          <div className="mt-1 px-2">
            <input
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddFolder(undefined);
                if (e.key === "Escape") { setNewFolderParentId(null); setNewFolderName(""); }
              }}
              placeholder="Folder name..."
              className="w-full bg-hub-sidebar-hover border border-hub-sidebar-border rounded-lg px-2 py-1.5 text-xs text-hub-sidebar-text placeholder-hub-sidebar-muted focus:outline-none focus:border-hub-accent"
            />
          </div>
        )}
      </div>

      {/* Bottom */}
      <div className="px-3 pb-4 pt-2 border-t border-hub-sidebar-border">
        <SidebarItem
          icon={<SettingsIcon />}
          label="Settings"
          active={activeView === "settings"}
          onClick={() => nav("settings")}
        />
      </div>
    </aside>
  );
}

// ── SidebarItem ───────────────────────────────────────────────────────────────

function SidebarItem({
  icon,
  label,
  active,
  onClick,
  badge,
  badgeColor,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
  badgeColor?: "red" | "accent";
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? "bg-hub-sidebar-active text-hub-sidebar-active-text"
          : "text-hub-sidebar-muted hover:bg-hub-sidebar-hover hover:text-hub-sidebar-text"
      }`}
    >
      <span>{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && (
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
            badgeColor === "red"
              ? "bg-red-500 text-white"
              : "bg-hub-accent text-hub-sidebar"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function DashboardIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
    </svg>
  );
}

function HowItWorksIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  );
}

function AgentsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  );
}

function IntegrationsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function XSmallIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
