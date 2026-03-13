import { NextRequest, NextResponse } from "next/server";
import { areaStore, type KBArea } from "@/lib/kb-store";

export async function GET() {
  return NextResponse.json({ data: areaStore.list() });
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }
  const area: KBArea = {
    id: `area-${Date.now()}`,
    name: name.trim(),
    created_at: new Date().toISOString(),
  };
  areaStore.add(area);
  return NextResponse.json({ data: area }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const ok = areaStore.remove(id);
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
