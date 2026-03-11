import { NextRequest, NextResponse } from "next/server";

export interface KBArea {
  id: string;
  name: string;
  created_at: string;
}

// Module-level in-memory store (persists across requests in one process)
const store: KBArea[] = [
  { id: "investor-relations", name: "Investor Relations", created_at: new Date().toISOString() },
  { id: "operations", name: "Operations", created_at: new Date().toISOString() },
  { id: "client-success", name: "Client Success", created_at: new Date().toISOString() },
];

export function getAreas(): KBArea[] {
  return store;
}

export async function GET() {
  return NextResponse.json({ data: store });
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
  store.push(area);
  return NextResponse.json({ data: area }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const idx = store.findIndex((a) => a.id === id);
  if (idx === -1) return NextResponse.json({ error: "not found" }, { status: 404 });
  store.splice(idx, 1);
  return NextResponse.json({ ok: true });
}
