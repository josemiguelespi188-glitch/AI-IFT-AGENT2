import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// ── helpers ───────────────────────────────────────────────────────────────────

function db() {
  return createServerClient();
}

// ── GET /api/kb/folders ───────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parentId = searchParams.get("parentId"); // "null" → root only

  try {
    let query = db().from("kb_folders").select("*").order("created_at", { ascending: true });

    if (parentId === "null") {
      query = query.is("parent_id", null);
    } else if (parentId) {
      query = query.eq("parent_id", parentId);
    }
    // if no parentId param → return all folders

    const { data, error } = await query;
    if (error) {
      // Detect "table does not exist" error (PostgreSQL code 42P01)
      const isTableMissing =
        (error as { code?: string }).code === "42P01" ||
        error.message?.toLowerCase().includes("does not exist");
      if (isTableMissing) {
        return NextResponse.json({ data: [], setup_required: true });
      }
      throw error;
    }
    return NextResponse.json({ data: data ?? [] });
  } catch (err) {
    console.error("[kb/folders] GET error:", err);
    return NextResponse.json({ data: [] });
  }
}

// ── POST /api/kb/folders ──────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, parentId } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }

  try {
    const insert: Record<string, unknown> = {
      name: (name as string).trim(),
      entry_count: 0,
    };
    if (parentId) insert.parent_id = parentId;

    const { data, error } = await db()
      .from("kb_folders")
      .insert(insert)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error("[kb/folders] POST error:", err);
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}

// ── DELETE /api/kb/folders ────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  try {
    // Cascade delete removes subfolders automatically (FK ON DELETE CASCADE)
    const { error } = await db()
      .from("kb_folders")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[kb/folders] DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 });
  }
}

// ── PATCH /api/kb/folders (update entry_count) ────────────────────────────────

export async function PATCH(req: NextRequest) {
  const { id, delta } = await req.json();

  try {
    // Read current count, apply delta
    const { data: current } = await db()
      .from("kb_folders")
      .select("entry_count")
      .eq("id", id)
      .single();

    const newCount = Math.max(0, ((current?.entry_count as number) ?? 0) + (delta as number));

    const { error } = await db()
      .from("kb_folders")
      .update({ entry_count: newCount })
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[kb/folders] PATCH error:", err);
    return NextResponse.json({ error: "Failed to update count" }, { status: 500 });
  }
}
