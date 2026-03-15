-- ── KB Entries table ─────────────────────────────────────────────────────────
-- Persists knowledge base entries so they survive server restarts.
-- Run this in the Supabase SQL Editor after 002_kb_folders.sql.

CREATE TABLE IF NOT EXISTS kb_entries (
  id           TEXT PRIMARY KEY,
  folder_id    TEXT NOT NULL,
  folder_name  TEXT NOT NULL DEFAULT '',
  title        TEXT NOT NULL,
  type         TEXT NOT NULL DEFAULT 'note',  -- 'note' | 'qa'
  content      TEXT NOT NULL DEFAULT '',
  question     TEXT NOT NULL DEFAULT '',
  answer       TEXT NOT NULL DEFAULT '',
  chunk_ids    TEXT[] NOT NULL DEFAULT '{}',
  synced       BOOLEAN NOT NULL DEFAULT FALSE,
  chunk_count  INTEGER NOT NULL DEFAULT 0,
  sync_error   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by folder
CREATE INDEX IF NOT EXISTS kb_entries_folder_id_idx ON kb_entries (folder_id);

-- RLS: allow all operations via service-role key used by the API
ALTER TABLE kb_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_service_role" ON kb_entries
  FOR ALL USING (true) WITH CHECK (true);
