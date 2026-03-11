import { NextRequest, NextResponse } from "next/server";
import { searchKBEntries } from "@/lib/pinecone";

export async function POST(req: NextRequest) {
  const { query, area, folder, topK } = await req.json();
  if (!query?.trim()) {
    return NextResponse.json({ error: "query required" }, { status: 400 });
  }

  try {
    const results = await searchKBEntries(query, { area, folder, topK: topK ?? 5 });
    return NextResponse.json({ data: results });
  } catch (err) {
    console.error("[kb/search] error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
