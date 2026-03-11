import { NextRequest, NextResponse } from "next/server";
import type { DocFolder, Document } from "@/types";

// In-memory store
let folders: DocFolder[] = [
  { id: "f1", name: "SOPs", department: "Investor Relations", document_count: 0 },
  { id: "f2", name: "Templates", department: "Investor Relations", document_count: 0 },
  { id: "f3", name: "Processes", department: "Operations", document_count: 0 },
  { id: "f4", name: "Onboarding", department: "Client Success", document_count: 0 },
];

let documents: Document[] = [];

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

  // Return documents
  let filtered = documents;
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
      department: body.department,
      document_count: 0,
    };
    folders.push(folder);
    return NextResponse.json({ data: folder }, { status: 201 });
  }

  // Add document
  const body = await req.json();
  const folder = folders.find((f) => f.id === body.folder_id);
  const doc: Document = {
    id: `d${Date.now()}`,
    name: body.name,
    folder_id: body.folder_id,
    folder_name: folder?.name ?? "",
    department: folder?.department ?? body.department ?? "",
    size: body.size ?? 0,
    type: body.type ?? "application/octet-stream",
    uploaded_at: new Date().toISOString(),
    uploaded_by: body.uploaded_by,
  };
  documents.push(doc);
  updateCounts();
  return NextResponse.json({ data: doc }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type");

  if (type === "folder") {
    folders = folders.filter((f) => f.id !== id);
    documents = documents.filter((d) => d.folder_id !== id);
  } else {
    documents = documents.filter((d) => d.id !== id);
  }
  updateCounts();
  return NextResponse.json({ message: "Deleted" });
}
