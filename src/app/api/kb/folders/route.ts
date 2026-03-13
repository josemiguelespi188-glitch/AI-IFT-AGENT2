import { NextRequest, NextResponse } from "next/server";
import { folderStore, type KBFolder } from "@/lib/kb-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const areaId = searchParams.get("areaId") ?? undefined;
  return NextResponse.json({ data: folderStore.list(areaId) });
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
  folderStore.add(folder);
  return NextResponse.json({ data: folder }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const ok = folderStore.remove(id);
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
