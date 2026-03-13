-- ── KB Folders table ────────────────────────────────────────────────────────
-- Run this in the Supabase SQL Editor before using the Knowledge Base folders.

CREATE TABLE IF NOT EXISTS kb_folders (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id  UUID REFERENCES kb_folders(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  entry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: allow all operations via service-role key used by the API
ALTER TABLE kb_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_service_role" ON kb_folders
  FOR ALL USING (true) WITH CHECK (true);

-- Seed default folders (idempotent – safe to re-run)
INSERT INTO kb_folders (name) VALUES
  ('SOPs'),
  ('Templates'),
  ('Processes'),
  ('Onboarding')
ON CONFLICT DO NOTHING;
