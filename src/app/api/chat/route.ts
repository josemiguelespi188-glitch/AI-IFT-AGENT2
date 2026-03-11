import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "messages array required" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            systemPrompt ||
            "You are an AI assistant for Industry FinTech, a financial services platform. Help the team with investor relations, operations, and client success questions. Be concise, professional, and accurate.",
        },
        ...messages,
      ],
      max_tokens: 1024,
    });

    const reply = completion.choices[0]?.message?.content ?? "";
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[api/chat]", err);
    return NextResponse.json({ error: "Failed to get AI response" }, { status: 500 });
  }
}
