// Shared in-memory stores for the KB API routes.
// Route files can only export HTTP handlers — all shared state lives here.

// ── Areas ─────────────────────────────────────────────────────────────────────

export interface KBArea {
  id: string;
  name: string;
  created_at: string;
}

const areas: KBArea[] = [
  { id: "investor-relations", name: "Investor Relations", created_at: new Date().toISOString() },
  { id: "operations", name: "Operations", created_at: new Date().toISOString() },
  { id: "client-success", name: "Client Success", created_at: new Date().toISOString() },
];

export const areaStore = {
  list: () => areas,
  add: (area: KBArea) => areas.push(area),
  remove: (id: string) => {
    const idx = areas.findIndex((a) => a.id === id);
    if (idx !== -1) areas.splice(idx, 1);
    return idx !== -1;
  },
};

// ── Folders ───────────────────────────────────────────────────────────────────

export interface KBFolder {
  id: string;
  areaId: string;
  areaName: string;
  name: string;
  entry_count: number;
  created_at: string;
}

const folders: KBFolder[] = [
  { id: "folder-sops", areaId: "investor-relations", areaName: "Investor Relations", name: "SOPs", entry_count: 0, created_at: new Date().toISOString() },
  { id: "folder-templates", areaId: "investor-relations", areaName: "Investor Relations", name: "Templates", entry_count: 0, created_at: new Date().toISOString() },
  { id: "folder-processes", areaId: "operations", areaName: "Operations", name: "Processes", entry_count: 0, created_at: new Date().toISOString() },
  { id: "folder-onboarding", areaId: "client-success", areaName: "Client Success", name: "Onboarding", entry_count: 0, created_at: new Date().toISOString() },
];

export const folderStore = {
  list: (areaId?: string) =>
    areaId ? folders.filter((f) => f.areaId === areaId) : folders,
  add: (folder: KBFolder) => folders.push(folder),
  remove: (id: string) => {
    const idx = folders.findIndex((f) => f.id === id);
    if (idx !== -1) folders.splice(idx, 1);
    return idx !== -1;
  },
  adjustCount: (folderId: string, delta: number) => {
    const f = folders.find((f) => f.id === folderId);
    if (f) f.entry_count = Math.max(0, f.entry_count + delta);
  },
};

// ── Entries ───────────────────────────────────────────────────────────────────

export type KBEntryType = "note" | "qa";

export interface KBEntry {
  id: string;
  folderId: string;
  folderName: string;
  areaId: string;
  areaName: string;
  title: string;
  type: KBEntryType;
  content: string;
  question: string;
  answer: string;
  chunkIds: string[];
  synced: boolean;
  chunk_count: number;
  created_at: string;
  updated_at: string;
}

const entries: KBEntry[] = [];

export const entryStore = {
  list: (folderId?: string) =>
    folderId ? entries.filter((e) => e.folderId === folderId) : entries,
  add: (entry: KBEntry) => entries.push(entry),
  find: (id: string) => entries.find((e) => e.id === id),
  remove: (id: string) => {
    const idx = entries.findIndex((e) => e.id === id);
    if (idx !== -1) entries.splice(idx, 1);
    return idx !== -1;
  },
};
