import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { upsertKBEntry, deleteKBChunks } from "@/lib/pinecone";
import type { KBEntryType } from "@/lib/kb-store";

function db() {
  return createServerClient();
}

function buildEmbedText(entry: {
  type: KBEntryType;
  content: string;
  question: string;
  answer: string;
  title: string;
}): string {
  if (entry.type === "qa") {
    return `${entry.title}\n\nQuestion: ${entry.question}\n\nAnswer: ${entry.answer}`;
  }
  return `${entry.title}\n\n${entry.content}`;
}

async function adjustFolderCount(folderId: string, delta: number) {
  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/kb/folders`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: folderId, delta }),
      }
    );
  } catch {
    // non-critical — entry_count is cosmetic
  }
}

// ── GET /api/kb/entries?folderId=xxx ─────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const folderId = searchParams.get("folderId");

  try {
    let query = db()
      .from("kb_entries")
      .select("*")
      .order("created_at", { ascending: true });

    if (folderId) query = query.eq("folder_id", folderId);

    const { data, error } = await query;

    if (error) {
      const isMissing =
        (error as { code?: string }).code === "42P01" ||
        error.message?.toLowerCase().includes("does not exist");
      if (isMissing) {
        return NextResponse.json({ data: [], setup_required: true });
      }
      throw error;
    }

    // Map snake_case DB columns → camelCase expected by the frontend
    const entries = (data ?? []).map(mapRow);
    return NextResponse.json({ data: entries });
  } catch (err) {
    console.error("[kb/entries] GET error:", err);
    return NextResponse.json({ data: [] });
  }
}

// ── POST /api/kb/entries ─────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { folderId, folderName, title, type, content, question, answer } = body;

  if (!folderId || !title?.trim()) {
    return NextResponse.json(
      { error: "folderId and title required" },
      { status: 400 }
    );
  }

  const id = `entry-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();
  const entryType = (type ?? "note") as KBEntryType;

  const partialEntry = {
    type: entryType,
    content: content ?? "",
    question: question ?? "",
    answer: answer ?? "",
    title: (title as string).trim(),
  };

  let chunkIds: string[] = [];
  let synced = false;
  let syncError: string | null = null;

  try {
    chunkIds = await upsertKBEntry({
      entryId: id,
      text: buildEmbedText(partialEntry),
      area: folderName ?? folderId,
      folder: folderName ?? folderId,
      title: partialEntry.title,
      namespace: folderId,
    });
    synced = true;
  } catch (err) {
    syncError = err instanceof Error ? err.message : String(err);
    console.error("[kb/entries] vectorize error:", syncError);
  }

  const row = {
    id,
    folder_id: folderId,
    folder_name: folderName ?? "",
    title: partialEntry.title,
    type: partialEntry.type,
    content: partialEntry.content,
    question: partialEntry.question,
    answer: partialEntry.answer,
    chunk_ids: chunkIds,
    synced,
    chunk_count: chunkIds.length,
    sync_error: syncError,
    created_at: now,
    updated_at: now,
  };

  const { data: inserted, error: dbErr } = await db()
    .from("kb_entries")
    .insert(row)
    .select()
    .single();

  if (dbErr) {
    console.error("[kb/entries] DB insert error:", dbErr);
    // Return the entry anyway (caller can still use it in memory)
    return NextResponse.json({ data: mapRow(row), sync_error: syncError }, { status: 201 });
  }

  adjustFolderCount(folderId, 1);
  return NextResponse.json({ data: mapRow(inserted), sync_error: syncError }, { status: 201 });
}

// ── PUT /api/kb/entries (edit content, re-vectorize) ─────────────────────────

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, title, content, question, answer } = body;

  const { data: existing, error: fetchErr } = await db()
    .from("kb_entries")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchErr || !existing) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  // Delete old chunks
  if ((existing.chunk_ids as string[]).length > 0) {
    try {
      await deleteKBChunks(existing.chunk_ids as string[], existing.folder_id as string);
    } catch (err) {
      console.error("[kb/entries] delete old chunks error:", err);
    }
  }

  const updated = {
    ...existing,
    title: title !== undefined ? (title as string).trim() : existing.title,
    content: content !== undefined ? content : existing.content,
    question: question !== undefined ? question : existing.question,
    answer: answer !== undefined ? answer : existing.answer,
    updated_at: new Date().toISOString(),
  };

  let newChunkIds: string[] = [];
  let synced = false;
  let syncError: string | null = null;

  try {
    newChunkIds = await upsertKBEntry({
      entryId: id,
      text: buildEmbedText(updated),
      area: updated.folder_name as string,
      folder: updated.folder_name as string,
      title: updated.title as string,
      namespace: updated.folder_id as string,
    });
    synced = true;
  } catch (err) {
    syncError = err instanceof Error ? err.message : String(err);
    console.error("[kb/entries] re-vectorize error:", syncError);
  }

  const patch = {
    title: updated.title,
    content: updated.content,
    question: updated.question,
    answer: updated.answer,
    chunk_ids: newChunkIds,
    synced,
    chunk_count: newChunkIds.length,
    sync_error: syncError,
    updated_at: updated.updated_at,
  };

  const { data: saved } = await db()
    .from("kb_entries")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  return NextResponse.json({ data: mapRow(saved ?? { ...updated, ...patch }), sync_error: syncError });
}

// ── PATCH /api/kb/entries (retry Pinecone sync for an existing entry) ─────────

export async function PATCH(req: NextRequest) {
  const { id } = await req.json();

  const { data: existing, error: fetchErr } = await db()
    .from("kb_entries")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchErr || !existing) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  // Delete stale chunks first (if any)
  if ((existing.chunk_ids as string[]).length > 0) {
    try {
      await deleteKBChunks(existing.chunk_ids as string[], existing.folder_id as string);
    } catch {
      // best-effort
    }
  }

  let newChunkIds: string[] = [];
  let synced = false;
  let syncError: string | null = null;

  try {
    newChunkIds = await upsertKBEntry({
      entryId: id,
      text: buildEmbedText(existing as Parameters<typeof buildEmbedText>[0]),
      area: existing.folder_name as string,
      folder: existing.folder_name as string,
      title: existing.title as string,
      namespace: existing.folder_id as string,
    });
    synced = true;
  } catch (err) {
    syncError = err instanceof Error ? err.message : String(err);
    console.error("[kb/entries] retry sync error:", syncError);
  }

  const patch = {
    chunk_ids: newChunkIds,
    synced,
    chunk_count: newChunkIds.length,
    sync_error: syncError,
    updated_at: new Date().toISOString(),
  };

  const { data: saved } = await db()
    .from("kb_entries")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  return NextResponse.json({ data: mapRow(saved ?? { ...existing, ...patch }), sync_error: syncError });
}

// ── DELETE /api/kb/entries ───────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  const { data: existing } = await db()
    .from("kb_entries")
    .select("chunk_ids, folder_id")
    .eq("id", id)
    .single();

  if (existing && (existing.chunk_ids as string[]).length > 0) {
    try {
      await deleteKBChunks(existing.chunk_ids as string[], existing.folder_id as string);
    } catch (err) {
      console.error("[kb/entries] delete chunks error:", err);
    }
  }

  const { error } = await db().from("kb_entries").delete().eq("id", id);
  if (error) {
    console.error("[kb/entries] DB delete error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }

  if (existing) adjustFolderCount(existing.folder_id as string, -1);
  return NextResponse.json({ ok: true });
}

// ── helpers ───────────────────────────────────────────────────────────────────

function mapRow(row: Record<string, unknown>) {
  return {
    id: row.id,
    folderId: row.folder_id,
    folderName: row.folder_name,
    title: row.title,
    type: row.type,
    content: row.content,
    question: row.question,
    answer: row.answer,
    chunkIds: row.chunk_ids ?? [],
    synced: row.synced ?? false,
    chunk_count: row.chunk_count ?? 0,
    sync_error: row.sync_error ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
