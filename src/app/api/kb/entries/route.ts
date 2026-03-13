import { NextRequest, NextResponse } from "next/server";
import { entryStore, folderStore, type KBEntry, type KBEntryType } from "@/lib/kb-store";
import { upsertKBEntry, deleteKBChunks } from "@/lib/pinecone";

function buildEmbedText(
  entry: Pick<KBEntry, "type" | "content" | "question" | "answer" | "title">
): string {
  if (entry.type === "qa") {
    return `${entry.title}\n\nQuestion: ${entry.question}\n\nAnswer: ${entry.answer}`;
  }
  return `${entry.title}\n\n${entry.content}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const folderId = searchParams.get("folderId") ?? undefined;
  return NextResponse.json({ data: entryStore.list(folderId) });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { folderId, folderName, areaId, areaName, title, type, content, question, answer } = body;

  if (!folderId || !title?.trim()) {
    return NextResponse.json({ error: "folderId and title required" }, { status: 400 });
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

  entryStore.add(entry);
  folderStore.adjustCount(folderId, 1);
  return NextResponse.json({ data: entry }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, title, content, question, answer } = body;

  const entry = entryStore.find(id);
  if (!entry) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (entry.chunkIds.length > 0) {
    try {
      await deleteKBChunks(entry.chunkIds);
    } catch (err) {
      console.error("[kb/entries] delete old chunks error:", err);
    }
  }

  if (title !== undefined) entry.title = (title as string).trim();
  if (content !== undefined) entry.content = content;
  if (question !== undefined) entry.question = question;
  if (answer !== undefined) entry.answer = answer;
  entry.updated_at = new Date().toISOString();

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
  const entry = entryStore.find(id);
  if (!entry) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (entry.chunkIds.length > 0) {
    try {
      await deleteKBChunks(entry.chunkIds);
    } catch (err) {
      console.error("[kb/entries] delete chunks error:", err);
    }
  }

  entryStore.remove(id);
  folderStore.adjustCount(entry.folderId, -1);
  return NextResponse.json({ ok: true });
}
