import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/kb/upload
 * Accepts a multipart/form-data upload with a single "file" field.
 * Supported types: .txt, .md, .pdf
 * Returns { text, filename, size } — caller then POSTs to /api/kb/entries.
 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const name = file.name ?? "upload";
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    const supported = ["txt", "md", "pdf"];

    if (!supported.includes(ext)) {
      return NextResponse.json(
        { error: `Unsupported file type .${ext}. Use PDF, TXT, or MD.` },
        { status: 422 }
      );
    }

    let text = "";

    if (ext === "pdf") {
      // Use the internal pdf-parse module to avoid the test-file loader
      // that runs at import time and crashes in Next.js server environments.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse/lib/pdf-parse");
      const buffer = Buffer.from(await file.arrayBuffer());
      const parsed = await pdfParse(buffer);
      text = parsed.text ?? "";
    } else {
      // txt / md — plain text
      text = await file.text();
    }

    text = text.trim();

    if (!text) {
      return NextResponse.json(
        { error: "Could not extract text from the file." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      text,
      filename: name,
      size: file.size,
      ext,
      charCount: text.length,
    });
  } catch (err) {
    console.error("[kb/upload] error:", err);
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
  }
}
