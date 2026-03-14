import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/kb/upload
 * Accepts a multipart/form-data upload with a single "file" field.
 * Supported types: .txt, .md, .pdf
 * Returns { text, filename, size } — caller then POSTs to /api/kb/entries.
 *
 * Uses `unpdf` for PDF parsing — designed for serverless / Next.js App Router
 * environments. Avoids the filesystem access issues of pdf-parse / pdfjs-dist.
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
      const { getDocumentProxy, extractText } = await import("unpdf");
      const buffer = await file.arrayBuffer();
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const result = await extractText(pdf, { mergePages: true });
      // With mergePages:true, result.text is always a joined string
      text = result.text as string;
    } else {
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
    const message = err instanceof Error ? err.message : String(err);
    console.error("[kb/upload] error:", message);
    return NextResponse.json(
      { error: `Failed to process file: ${message}` },
      { status: 500 }
    );
  }
}
