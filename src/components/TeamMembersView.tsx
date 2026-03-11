"use client";

import { useEffect, useState } from "react";
import type { TeamMember } from "@/types";
import AddMemberModal from "./AddMemberModal";

const COLOR_CLASSES: Record<string, string> = {
  purple: "bg-purple-500",
  teal: "bg-teal-500",
  blue: "bg-blue-500",
  orange: "bg-orange-400",
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

export default function TeamMembersView() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState<TeamMember | undefined>(undefined);

  const fetchMembers = async () => {
    setLoading(true);
    const res = await fetch("/api/team");
    const json = await res.json();
    if (json.data) setMembers(json.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this team member?")) return;
    await fetch(`/api/team?id=${id}`, { method: "DELETE" });
    fetchMembers();
  };

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.position.toLowerCase().includes(q) ||
      m.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-hub-text text-2xl font-bold">Team Members</h1>
          <p className="text-hub-muted text-sm mt-1">
            {members.length} {members.length === 1 ? "member" : "members"} across all departments
          </p>
        </div>
        <button
          onClick={() => { setEditMember(undefined); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-hub-accent text-hub-sidebar-active-text rounded-lg font-semibold text-sm hover:bg-hub-accent-dark transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Invite Member
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hub-muted"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, position, or department..."
          className="w-full bg-hub-card border border-hub-border rounded-xl pl-10 pr-4 py-3 text-hub-text text-sm placeholder-hub-muted focus:outline-none focus:border-hub-accent shadow-sm"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-hub-card rounded-2xl h-64 animate-pulse border border-hub-border shadow-sm" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-hub-card rounded-2xl flex items-center justify-center mb-4 border border-hub-border shadow-sm">
            <svg className="w-8 h-8 text-hub-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-hub-muted text-sm">
            {search ? "No members match your search." : "No team members yet. Invite your first member!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onEdit={() => { setEditMember(member); setShowModal(true); }}
              onDelete={() => handleDelete(member.id)}
            />
          ))}
        </div>
      )}

      {showModal && (
        <AddMemberModal
          member={editMember}
          onClose={() => setShowModal(false)}
          onSaved={fetchMembers}
        />
      )}
    </div>
  );
}

function MemberCard({
  member,
  onEdit,
  onDelete,
}: {
  member: TeamMember;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const colorClass = COLOR_CLASSES[member.color] ?? "bg-blue-500";

  return (
    <div className="bg-hub-card border border-hub-border rounded-2xl p-5 flex flex-col gap-4 hover:shadow-md transition-shadow animate-fade-in shadow-sm">
      {/* Top row */}
      <div className="flex items-start gap-3">
        <div className={`w-11 h-11 rounded-full ${colorClass} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
          {initials(member.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-hub-text font-semibold text-sm truncate">{member.name}</p>
          <p className="text-hub-muted text-xs truncate">{member.position}</p>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 text-hub-muted hover:text-hub-text transition-colors rounded"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-hub-muted hover:text-hub-red transition-colors rounded"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Department badge */}
      <span className="self-start text-xs font-semibold bg-hub-accent/20 text-hub-accent-dark border border-hub-accent/30 px-2.5 py-1 rounded-full">
        {member.department}
      </span>

      {/* Responsibilities */}
      {member.responsibilities.length > 0 && (
        <div>
          <p className="text-hub-muted text-[10px] font-semibold tracking-widest uppercase mb-2">
            Responsibilities
          </p>
          <ul className="space-y-1">
            {member.responsibilities.map((r, i) => (
              <li key={i} className="flex items-center gap-2 text-hub-text/80 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-hub-accent flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Contact */}
      {member.email && (
        <a
          href={`mailto:${member.email}`}
          className="flex items-center justify-center gap-2 mt-auto pt-3 border-t border-hub-border text-hub-muted hover:text-hub-text transition-colors text-xs"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Contact
        </a>
      )}
    </div>
  );
}
