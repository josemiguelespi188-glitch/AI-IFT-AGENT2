"use client";

import { useEffect, useState } from "react";
import type { DocFolder } from "@/types";
import type { ActiveView } from "@/app/page";

interface Props {
  activeView: ActiveView;
  setActiveView: (v: ActiveView) => void;
  activeFolder: { folderId: string; department: string } | null;
  setActiveFolder: (f: { folderId: string; department: string } | null) => void;
}

const DEPARTMENTS = ["Investor Relations", "Operations", "Client Success"];

const AVATAR_COLORS: Record<string, string> = {
  purple: "bg-purple-500",
  teal: "bg-teal-500",
  blue: "bg-blue-500",
  orange: "bg-orange-500",
  pink: "bg-pink-500",
  cyan: "bg-cyan-500",
  indigo: "bg-indigo-500",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Sidebar({ activeView, setActiveView, activeFolder, setActiveFolder }: Props) {
  const [folders, setFolders] = useState<DocFolder[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ "Investor Relations": true });
  const [newFolderDept, setNewFolderDept] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");

  const fetchFolders = async () => {
    const res = await fetch("/api/documents?type=folders");
    const json = await res.json();
    if (json.data) setFolders(json.data);
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const toggleDept = (dept: string) => {
    setExpanded((prev) => ({ ...prev, [dept]: !prev[dept] }));
  };

  const handleAddFolder = async (dept: string) => {
    if (!newFolderName.trim()) return;
    await fetch("/api/documents?type=folder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newFolderName.trim(), department: dept }),
    });
    setNewFolderDept(null);
    setNewFolderName("");
    fetchFolders();
  };

  const foldersByDept = (dept: string) => folders.filter((f) => f.department === dept);

  return (
    <aside className="w-64 flex-shrink-0 bg-hub-sidebar flex flex-col h-screen border-r border-hub-border">
      {/* Header */}
      <div className="px-5 py-5 flex items-center justify-between border-b border-hub-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-hub-accent rounded flex items-center justify-center">
              <span className="text-hub-sidebar text-xs font-bold">✦</span>
            </div>
            <span className="text-hub-text font-bold text-base">IFT</span>
          </div>
          <p className="text-hub-muted text-xs mt-0.5 ml-8">Knowledge Hub</p>
        </div>
        <button className="text-hub-muted hover:text-hub-text transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="px-3 pt-4 space-y-0.5">
        <NavItem
          icon={<ChatIcon />}
          label="AI Assistant"
          active={activeView === "ai-assistant"}
          onClick={() => { setActiveView("ai-assistant"); setActiveFolder(null); }}
        />
        <NavItem
          icon={<BuildingIcon />}
          label="Organization"
          active={activeView === "organization"}
          onClick={() => { setActiveView("organization"); setActiveFolder(null); }}
        />
        <NavItem
          icon={<PeopleIcon />}
          label="Team Members"
          active={activeView === "team-members"}
          onClick={() => { setActiveView("team-members"); setActiveFolder(null); }}
        />
      </nav>

      {/* Departments */}
      <div className="px-3 mt-6 flex-1 overflow-y-auto">
        <p className="text-hub-muted text-[10px] font-semibold tracking-widest px-2 mb-2 uppercase">
          Departments
        </p>

        {DEPARTMENTS.map((dept) => (
          <div key={dept} className="mb-1">
            {/* Department row */}
            <button
              onClick={() => toggleDept(dept)}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-hub-text hover:bg-hub-hover transition-colors text-sm"
            >
              <span className="text-hub-muted transition-transform duration-150"
                style={{ display: "inline-block", transform: expanded[dept] ? "rotate(90deg)" : "rotate(0deg)" }}>
                ▶
              </span>
              <BuildingIconSm />
              <span className="flex-1 text-left font-medium text-hub-text/80">{dept}</span>
            </button>

            {/* Folders */}
            {expanded[dept] && (
              <div className="ml-4 mt-0.5 space-y-0.5">
                {foldersByDept(dept).map((folder) => {
                  const isActive = activeFolder?.folderId === folder.id;
                  return (
                    <button
                      key={folder.id}
                      onClick={() => {
                        setActiveFolder({ folderId: folder.id, department: dept });
                        setActiveView("documents");
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-hub-hover text-hub-text"
                          : "text-hub-muted hover:bg-hub-hover hover:text-hub-text"
                      }`}
                    >
                      <FolderIcon />
                      <span className="flex-1 text-left">{folder.name}</span>
                      {folder.document_count > 0 && (
                        <span className="text-[10px] bg-hub-card text-hub-muted rounded px-1.5 py-0.5">
                          {folder.document_count}
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Add folder inline */}
                {newFolderDept === dept ? (
                  <div className="px-3 py-1">
                    <input
                      autoFocus
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddFolder(dept);
                        if (e.key === "Escape") { setNewFolderDept(null); setNewFolderName(""); }
                      }}
                      placeholder="Folder name..."
                      className="w-full bg-hub-card border border-hub-border rounded px-2 py-1 text-xs text-hub-text placeholder-hub-muted focus:outline-none focus:border-hub-accent"
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setNewFolderDept(dept)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-hub-muted hover:text-hub-accent transition-colors"
                  >
                    <span className="text-base leading-none">+</span>
                    <span>New Folder</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="px-3 pb-4 pt-2 border-t border-hub-border mt-2">
        <NavItem
          icon={<SettingsIcon />}
          label="Settings"
          active={activeView === "settings"}
          onClick={() => { setActiveView("settings"); setActiveFolder(null); }}
        />
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active, onClick }: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? "bg-hub-accent text-hub-sidebar"
          : "text-hub-muted hover:bg-hub-hover hover:text-hub-text"
      }`}
    >
      <span className={active ? "text-hub-sidebar" : "text-hub-muted"}>{icon}</span>
      {label}
    </button>
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

function BuildingIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function BuildingIconSm() {
  return (
    <svg className="w-3.5 h-3.5 text-hub-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

function SettingsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
