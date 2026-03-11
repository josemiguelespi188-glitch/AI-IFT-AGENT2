import { NextRequest, NextResponse } from "next/server";
import { processInquiry } from "@/lib/agent";
import { createInquiry, updateInquiry } from "@/lib/supabase";
import type { InquiryInput, ProcessInquiryResponse } from "@/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as InquiryInput;

    // Validate required fields
    if (!body.text?.trim()) {
      return NextResponse.json(
        { error: "Inquiry text is required" },
        { status: 400 }
      );
    }
    if (!body.channel) {
      return NextResponse.json(
        { error: "Channel is required (portal, email, zendesk, phone)" },
        { status: 400 }
      );
    }

    // Create inquiry record in Supabase (initial state)
    const inquiry = await createInquiry({
      investor_email: body.investor_email,
      investor_name: body.investor_name,
      channel: body.channel,
      category: "other_unknown",
      original_text: body.text,
      subject: body.subject,
      status: "processing",
    });

    if (!inquiry) {
      return NextResponse.json(
        { error: "Failed to create inquiry record" },
        { status: 500 }
      );
    }

    const startTime = Date.now();

    // Run the AI agent
    const result = await processInquiry(body);

    const processingTime = Date.now() - startTime;

    // Update the inquiry record with the result
    await updateInquiry(inquiry.id, {
      category: result.category,
      status: result.status === "duplicate" ? "duplicate" : result.status,
      ai_response: result.response,
      escalation_summary: result.escalation_summary
        ? JSON.parse(JSON.stringify(result.escalation_summary))
        : null,
      confidence_score: result.confidence_score,
      processing_time_ms: processingTime,
      duplicate_of: result.duplicate_inquiry_id,
      resolved_at:
        result.status === "resolved" ? new Date().toISOString() : undefined,
    });

    const response: ProcessInquiryResponse = {
      inquiry_id: inquiry.id,
      result,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[api/agent] Error:", err);
    return NextResponse.json(
      { error: "Internal server error processing inquiry" },
      { status: 500 }
    );
  }
}
