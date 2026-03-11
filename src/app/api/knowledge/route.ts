import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { upsertKnowledge, seedPineconeFromSupabase } from "@/lib/pinecone";

// GET: list knowledge base entries
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const clientId = searchParams.get("client_id");

    const db = createServerClient();
    let query = db.from("knowledge_base").select("*, clients(name)").order("updated_at", { ascending: false });

    if (category) query = query.eq("category", category);
    if (clientId) query = query.eq("client_id", clientId);

    const { data, error } = await query.limit(100);
    if (error) throw error;

    return NextResponse.json({ data });
  } catch (err) {
    console.error("[api/knowledge] GET error:", err);
    return NextResponse.json({ error: "Failed to fetch knowledge" }, { status: 500 });
  }
}

// POST: add a knowledge entry
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, answer, category, client_id, source, approved_by } = body;

    if (!question || !answer || !category) {
      return NextResponse.json(
        { error: "question, answer, and category are required" },
        { status: 400 }
      );
    }

    const db = createServerClient();
    const { data, error } = await db
      .from("knowledge_base")
      .insert({ question, answer, category, client_id, source: source ?? "general", approved_by })
      .select()
      .single();

    if (error) throw error;

    // Sync to Pinecone
    await upsertKnowledge({
      id: data.id,
      question: data.question,
      answer: data.answer,
      category: data.category,
      clientId: data.client_id,
      source: data.source,
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error("[api/knowledge] POST error:", err);
    return NextResponse.json({ error: "Failed to add knowledge entry" }, { status: 500 });
  }
}

// PUT: seed Pinecone from existing Supabase knowledge
export async function PUT() {
  try {
    const db = createServerClient();
    const { data, error } = await db.from("knowledge_base").select("*");
    if (error) throw error;

    const entries = (data ?? []).map((e: Record<string, unknown>) => ({
      id: e.id as string,
      question: e.question as string,
      answer: e.answer as string,
      category: e.category as string,
      clientId: e.client_id as string | undefined,
      source: e.source as string,
    }));

    const result = await seedPineconeFromSupabase(entries);
    return NextResponse.json({
      message: `Seeded Pinecone with ${result.seeded} entries (${result.errors} errors)`,
      ...result,
    });
  } catch (err) {
    console.error("[api/knowledge] PUT error:", err);
    return NextResponse.json({ error: "Failed to seed Pinecone" }, { status: 500 });
  }
}
