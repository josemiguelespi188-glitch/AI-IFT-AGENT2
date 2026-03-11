"use client";

import { useState } from "react";
import type { TeamMember } from "@/types";

const DEPARTMENTS = ["Investor Relations", "Operations", "Client Success"];
const COLORS = ["purple", "teal", "blue", "orange", "pink", "cyan", "indigo"];
const COLOR_CLASSES: Record<string, string> = {
  purple: "bg-purple-500",
  teal: "bg-teal-500",
  blue: "bg-blue-500",
  orange: "bg-orange-400",
  pink: "bg-pink-500",
  cyan: "bg-cyan-500",
  indigo: "bg-indigo-500",
};

interface Props {
  member?: TeamMember;
  onClose: () => void;
  onSaved: () => void;
}

export default function AddMemberModal({ member, onClose, onSaved }: Props) {
  const [name, setName] = useState(member?.name ?? "");
  const [position, setPosition] = useState(member?.position ?? "");
  const [department, setDepartment] = useState(member?.department ?? DEPARTMENTS[0]);
  const [email, setEmail] = useState(member?.email ?? "");
  const [color, setColor] = useState(member?.color ?? "purple");
  const [responsibilities, setResponsibilities] = useState<string[]>(
    member?.responsibilities ?? [""]
  );
  const [saving, setSaving] = useState(false);

  const updateResp = (idx: number, val: string) =>
    setResponsibilities((prev) => prev.map((r, i) => (i === idx ? val : r)));
  const addResp = () => setResponsibilities((prev) => [...prev, ""]);
  const removeResp = (idx: number) =>
    setResponsibilities((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !position.trim()) return;
    setSaving(true);
    const body = {
      id: member?.id,
      name: name.trim(),
      position: position.trim(),
      department,
      email: email.trim(),
      color,
      responsibilities: responsibilities.filter((r) => r.trim()),
    };
    if (member) {
      await fetch("/api/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    setSaving(false);
    onSaved();
    onClose();
  };

  const inputClass =
    "mt-1 w-full bg-hub-bg border border-hub-border rounded-lg px-3 py-2 text-hub-text text-sm placeholder-hub-muted focus:outline-none focus:border-hub-accent";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-hub-card border border-hub-border rounded-2xl w-full max-w-md mx-4 shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between px-6 py-5 border-b border-hub-border">
          <h2 className="text-hub-text font-semibold text-base">
            {member ? "Edit Member" : "Invite Member"}
          </h2>
          <button onClick={onClose} className="text-hub-muted hover:text-hub-text transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Avatar color picker */}
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full ${COLOR_CLASSES[color]} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}
            >
              {name
                ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                : "?"}
            </div>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full ${COLOR_CLASSES[c]} transition-transform ${
                    color === c ? "ring-2 ring-hub-accent scale-110" : "opacity-50 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-hub-muted text-xs font-semibold uppercase tracking-wide">Full Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} placeholder="e.g. Jane Smith" />
          </div>

          <div>
            <label className="text-hub-muted text-xs font-semibold uppercase tracking-wide">Position *</label>
            <input value={position} onChange={(e) => setPosition(e.target.value)} required className={inputClass} placeholder="e.g. Operations Associate" />
          </div>

          <div>
            <label className="text-hub-muted text-xs font-semibold uppercase tracking-wide">Department</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} className={inputClass}>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-hub-muted text-xs font-semibold uppercase tracking-wide">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="name@company.com" />
          </div>

          <div>
            <label className="text-hub-muted text-xs font-semibold uppercase tracking-wide">Responsibilities</label>
            <div className="mt-1 space-y-2">
              {responsibilities.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={r}
                    onChange={(e) => updateResp(i, e.target.value)}
                    className="flex-1 bg-hub-bg border border-hub-border rounded-lg px-3 py-1.5 text-hub-text text-sm placeholder-hub-muted focus:outline-none focus:border-hub-accent"
                    placeholder={`Responsibility ${i + 1}`}
                  />
                  {responsibilities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeResp(i)}
                      className="text-hub-muted hover:text-hub-red transition-colors px-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addResp} className="text-hub-accent-dark text-xs hover:underline font-medium">
                + Add responsibility
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-hub-border text-hub-muted hover:text-hub-text hover:bg-hub-hover transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 rounded-lg bg-hub-accent text-hub-sidebar-active-text font-semibold hover:bg-hub-accent-dark transition-colors text-sm disabled:opacity-50"
            >
              {saving ? "Saving..." : member ? "Save Changes" : "Invite Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
