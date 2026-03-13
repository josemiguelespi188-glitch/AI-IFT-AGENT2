// Shared in-memory store for KB entries (folders are persisted in Supabase).
// Route files can only export HTTP handlers — all shared state lives here.

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
