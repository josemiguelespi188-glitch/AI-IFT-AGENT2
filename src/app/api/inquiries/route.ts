import { NextRequest, NextResponse } from "next/server";
import { getInquiries, getInquiryStats, updateInquiry } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statsOnly = searchParams.get("stats") === "true";
    const limit = parseInt(searchParams.get("limit") ?? "50", 10);

    if (statsOnly) {
      const stats = await getInquiryStats();
      return NextResponse.json({ data: stats });
    }

    const inquiries = await getInquiries(limit);
    return NextResponse.json({ data: inquiries });
  } catch (err) {
    console.error("[api/inquiries] GET error:", err);
    return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Inquiry ID is required" }, { status: 400 });
    }

    const updated = await updateInquiry(id, updates);
    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("[api/inquiries] PATCH error:", err);
    return NextResponse.json({ error: "Failed to update inquiry" }, { status: 500 });
  }
}
