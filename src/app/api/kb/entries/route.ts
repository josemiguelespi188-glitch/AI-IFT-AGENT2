import { NextRequest, NextResponse } from "next/server";
import { upsertKBEntry, deleteKBChunks } from "@/lib/pinecone";
import { adjustFolderCount } from "../folders/route";

export type KBEntryType = "note" | "qa";

export interface KBEntry {
  id: string;
  folderId: string;
  folderName: string;
  areaId: string;
  areaName: string;
  title: string;
  type: KBEntryType;
  // note type
  content: string;
  // qa type
  question: string;
  answer: string;
  // Pinecone state
  chunkIds: string[];
  synced: boolean;
  chunk_count: number;
  created_at: string;
  updated_at: string;
}

const store: KBEntry[] = [];

export function getEntriesByFolder(folderId: string): KBEntry[] {
  return store.filter((e) => e.folderId === folderId);
}

// Build text to vectorize based on entry type
function buildEmbedText(entry: Pick<KBEntry, "type" | "content" | "question" | "answer" | "title">): string {
  if (entry.type === "qa") {
    return `${entry.title}\n\nQuestion: ${entry.question}\n\nAnswer: ${entry.answer}`;
  }
  return `${entry.title}\n\n${entry.content}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const folderId = searchParams.get("folderId");
  const data = folderId ? store.filter((e) => e.folderId === folderId) : store;
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { folderId, folderName, areaId, areaName, title, type, content, question, answer } = body;

  if (!folderId || !title?.trim()) {
    return NextResponse.json({ error: "folderId and title required" }, { status: 400 });
  }

  const id = `entry-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();

  const partialEntry = {
    type: (type ?? "note") as KBEntryType,
    content: content ?? "",
    question: question ?? "",
    answer: answer ?? "",
    title: title.trim(),
  };

  let chunkIds: string[] = [];
  let synced = false;

  try {
    chunkIds = await upsertKBEntry({
      entryId: id,
      text: buildEmbedText(partialEntry),
      area: areaName,
      folder: folderName,
      title: partialEntry.title,
    });
    synced = true;
  } catch (err) {
    console.error("[kb/entries] vectorize error:", err);
  }

  const entry: KBEntry = {
    id,
    folderId,
    folderName,
    areaId,
    areaName,
    title: partialEntry.title,
    type: partialEntry.type,
    content: partialEntry.content,
    question: partialEntry.question,
    answer: partialEntry.answer,
    chunkIds,
    synced,
    chunk_count: chunkIds.length,
    created_at: now,
    updated_at: now,
  };

  store.push(entry);
  adjustFolderCount(folderId, 1);
  return NextResponse.json({ data: entry }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, title, content, question, answer } = body;

  const entry = store.find((e) => e.id === id);
  if (!entry) return NextResponse.json({ error: "not found" }, { status: 404 });

  // Remove old Pinecone chunks
  if (entry.chunkIds.length > 0) {
    try {
      await deleteKBChunks(entry.chunkIds);
    } catch (err) {
      console.error("[kb/entries] delete old chunks error:", err);
    }
  }

  // Merge updates into entry first
  if (title !== undefined) entry.title = title.trim();
  if (content !== undefined) entry.content = content;
  if (question !== undefined) entry.question = question;
  if (answer !== undefined) entry.answer = answer;
  entry.updated_at = new Date().toISOString();

  // Re-vectorize
  let newChunkIds: string[] = [];
  let synced = false;
  try {
    newChunkIds = await upsertKBEntry({
      entryId: id,
      text: buildEmbedText(entry),
      area: entry.areaName,
      folder: entry.folderName,
      title: entry.title,
    });
    synced = true;
  } catch (err) {
    console.error("[kb/entries] re-vectorize error:", err);
  }

  entry.chunkIds = newChunkIds;
  entry.synced = synced;
  entry.chunk_count = newChunkIds.length;

  return NextResponse.json({ data: entry });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const idx = store.findIndex((e) => e.id === id);
  if (idx === -1) return NextResponse.json({ error: "not found" }, { status: 404 });

  const entry = store[idx];
  if (entry.chunkIds.length > 0) {
    try {
      await deleteKBChunks(entry.chunkIds);
    } catch (err) {
      console.error("[kb/entries] delete chunks error:", err);
    }
  }

  store.splice(idx, 1);
  adjustFolderCount(entry.folderId, -1);
  return NextResponse.json({ ok: true });
}
