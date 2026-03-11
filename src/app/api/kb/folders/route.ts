import { NextRequest, NextResponse } from "next/server";

export interface KBFolder {
  id: string;
  areaId: string;
  areaName: string;
  name: string;
  entry_count: number;
  created_at: string;
}

const store: KBFolder[] = [
  { id: "folder-sops", areaId: "investor-relations", areaName: "Investor Relations", name: "SOPs", entry_count: 0, created_at: new Date().toISOString() },
  { id: "folder-templates", areaId: "investor-relations", areaName: "Investor Relations", name: "Templates", entry_count: 0, created_at: new Date().toISOString() },
  { id: "folder-processes", areaId: "operations", areaName: "Operations", name: "Processes", entry_count: 0, created_at: new Date().toISOString() },
  { id: "folder-onboarding", areaId: "client-success", areaName: "Client Success", name: "Onboarding", entry_count: 0, created_at: new Date().toISOString() },
];

export function adjustFolderCount(folderId: string, delta: number) {
  const folder = store.find((f) => f.id === folderId);
  if (folder) folder.entry_count = Math.max(0, folder.entry_count + delta);
}

export function getFolderById(id: string): KBFolder | undefined {
  return store.find((f) => f.id === id);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const areaId = searchParams.get("areaId");
  const data = areaId ? store.filter((f) => f.areaId === areaId) : store;
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const { name, areaId, areaName } = await req.json();
  if (!name?.trim() || !areaId) {
    return NextResponse.json({ error: "name and areaId required" }, { status: 400 });
  }
  const folder: KBFolder = {
    id: `folder-${Date.now()}`,
    areaId,
    areaName: areaName ?? areaId,
    name: name.trim(),
    entry_count: 0,
    created_at: new Date().toISOString(),
  };
  store.push(folder);
  return NextResponse.json({ data: folder }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const idx = store.findIndex((f) => f.id === id);
  if (idx === -1) return NextResponse.json({ error: "not found" }, { status: 404 });
  store.splice(idx, 1);
  return NextResponse.json({ ok: true });
}
