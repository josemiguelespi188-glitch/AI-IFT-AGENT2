// Shared in-memory stores for the KB API routes.
// Route files can only export HTTP handlers — all shared state lives here.

// ── Folders ───────────────────────────────────────────────────────────────────

export interface KBFolder {
  id: string;
  parentId?: string;  // undefined = top-level folder; set = subfolder
  name: string;
  entry_count: number;
  created_at: string;
}

const folders: KBFolder[] = [
  { id: "folder-sops", name: "SOPs", entry_count: 0, created_at: new Date().toISOString() },
  { id: "folder-templates", name: "Templates", entry_count: 0, created_at: new Date().toISOString() },
  { id: "folder-processes", name: "Processes", entry_count: 0, created_at: new Date().toISOString() },
  { id: "folder-onboarding", name: "Onboarding", entry_count: 0, created_at: new Date().toISOString() },
];

export const folderStore = {
  list: (parentId?: string | null) => {
    if (parentId === null) return folders.filter((f) => !f.parentId); // root only
    if (parentId !== undefined) return folders.filter((f) => f.parentId === parentId);
    return folders; // all
  },
  add: (folder: KBFolder) => folders.push(folder),
  find: (id: string) => folders.find((f) => f.id === id),
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
