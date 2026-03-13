import { NextRequest, NextResponse } from "next/server";
import type { DocFolder, Document } from "@/types";
import { upsertKBEntry, deleteKBChunks } from "@/lib/pinecone";

// In-memory store
let folders: DocFolder[] = [
  { id: "f1", name: "SOPs", department: "General", document_count: 0 },
  { id: "f2", name: "Templates", department: "General", document_count: 0 },
  { id: "f3", name: "Processes", department: "General", document_count: 0 },
  { id: "f4", name: "Onboarding", department: "General", document_count: 0 },
];

// Extended document with chunk tracking
interface StoredDocument extends Document {
  chunkIds: string[];
  synced: boolean;
}

let documents: StoredDocument[] = [];

function updateCounts() {
  folders.forEach((f) => {
    f.document_count = documents.filter((d) => d.folder_id === f.id).length;
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const folderId = searchParams.get("folder_id");
  const department = searchParams.get("department");

  if (type === "folders") {
    const filtered = department
      ? folders.filter((f) => f.department === department)
      : folders;
    return NextResponse.json({ data: filtered });
  }

  let filtered: StoredDocument[] = documents;
  if (folderId) filtered = filtered.filter((d) => d.folder_id === folderId);
  if (department) filtered = filtered.filter((d) => d.department === department);
  return NextResponse.json({ data: filtered });
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  if (type === "folder") {
    const body = await req.json();
    const folder: DocFolder = {
      id: `f${Date.now()}`,
      name: body.name,
      department: body.department ?? "General",
      document_count: 0,
    };
    folders.push(folder);
    return NextResponse.json({ data: folder }, { status: 201 });
  }

  // Add document
  const body = await req.json();
  const folder = folders.find((f) => f.id === body.folder_id);
  const docId = `d${Date.now()}`;

  const doc: StoredDocument = {
    id: docId,
    name: body.name,
    folder_id: body.folder_id,
    folder_name: folder?.name ?? "",
    department: folder?.department ?? body.department ?? "",
    size: body.size ?? 0,
    type: body.type ?? "application/octet-stream",
    uploaded_at: new Date().toISOString(),
    uploaded_by: body.uploaded_by ?? "user",
    chunkIds: [],
    synced: false,
  };

  // Vectorize to Pinecone if text content is provided
  if (body.content && typeof body.content === "string" && body.content.trim()) {
    try {
      const chunkIds = await upsertKBEntry({
        entryId: docId,
        text: body.content,
        area: folder?.name ?? "Documents",
        folder: folder?.name ?? "Documents",
        title: body.name,
      });
      doc.chunkIds = chunkIds;
      doc.synced = true;
    } catch (err) {
      console.error("[documents] Pinecone vectorize error:", err);
    }
  }

  documents.push(doc);
  updateCounts();
  return NextResponse.json({ data: doc }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type");

  if (type === "folder") {
    // Delete Pinecone chunks for all docs in folder
    const folderDocs = documents.filter((d) => d.folder_id === id && d.chunkIds.length > 0);
    for (const doc of folderDocs) {
      try { await deleteKBChunks(doc.chunkIds); } catch {}
    }
    folders = folders.filter((f) => f.id !== id);
    documents = documents.filter((d) => d.folder_id !== id);
  } else {
    const doc = documents.find((d) => d.id === id);
    if (doc?.chunkIds.length) {
      try { await deleteKBChunks(doc.chunkIds); } catch {}
    }
    documents = documents.filter((d) => d.id !== id);
  }
  updateCounts();
  return NextResponse.json({ message: "Deleted" });
}
