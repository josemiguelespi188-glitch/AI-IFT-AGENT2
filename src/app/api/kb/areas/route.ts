import { NextResponse } from "next/server";

// Areas are no longer used — KB structure is folders + subfolders only.
// This endpoint is kept for backward compatibility but returns an empty list.

export async function GET() {
  return NextResponse.json({ data: [] });
}

export async function POST() {
  return NextResponse.json({ error: "Areas have been replaced by folders" }, { status: 410 });
}

export async function DELETE() {
  return NextResponse.json({ ok: true });
}
