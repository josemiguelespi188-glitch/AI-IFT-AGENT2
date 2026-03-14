import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/kb/upload
 * Supported types: .pdf, .xlsx, .xls, .txt, .md
 *
 * Excel conversion strategy:
 *   Each row is formatted as "Header: value / Header: value / ..."
 *   Each sheet is introduced with its name.
 *   Empty rows are skipped.
 *   This produces structured text that chunks and vectorizes well.
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
    const supported = ["txt", "md", "pdf", "xlsx", "xls"];

    if (!supported.includes(ext)) {
      return NextResponse.json(
        { error: `Unsupported file type .${ext}. Use PDF, XLSX, XLS, TXT, or MD.` },
        { status: 422 }
      );
    }

    let text = "";

    if (ext === "pdf") {
      const { getDocumentProxy, extractText } = await import("unpdf");
      const buffer = await file.arrayBuffer();
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const result = await extractText(pdf, { mergePages: true });
      text = result.text as string;

    } else if (ext === "xlsx" || ext === "xls") {
      text = await excelToText(await file.arrayBuffer(), name);

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

/**
 * Convert an Excel workbook buffer to structured plain text.
 *
 * Output format example:
 *
 *   === Sheet: IFT CLIENTS ===
 *
 *   [Row 2]
 *   Community: Signature Capital | Portal link: https://... | Email: n@gmail.com | Client Status: Active
 *
 *   [Row 3]
 *   Community: Sunrise Capital Partners | ...
 *
 * Each row is on one line so it stays in a single chunk and preserves
 * the relationship between all field values for that record.
 */
async function excelToText(buffer: ArrayBuffer, filename: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const XLSX = require("xlsx") as typeof import("xlsx");

  const workbook = XLSX.read(Buffer.from(buffer), { type: "buffer" });

  const sections: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    const ws = workbook.Sheets[sheetName];
    // header:1 → first row becomes headers array, rest are arrays
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
      defval: "",
      raw: false, // format dates and numbers as strings
    });

    if (rawRows.length === 0) continue;

    const sheetLines: string[] = [];
    sheetLines.push(`=== ${filename} — Sheet: ${sheetName} ===\n`);

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      // Skip rows where every value is empty
      const values = Object.values(row).map((v) => String(v ?? "").trim());
      if (values.every((v) => v === "")) continue;

      // Build "Header: value" pairs, skipping blank columns
      const pairs = Object.entries(row)
        .map(([k, v]) => {
          const val = String(v ?? "").trim();
          return val ? `${k}: ${val}` : null;
        })
        .filter(Boolean);

      if (pairs.length > 0) {
        sheetLines.push(`[Row ${i + 2}]\n${pairs.join(" | ")}`);
      }
    }

    sections.push(sheetLines.join("\n"));
  }

  return sections.join("\n\n");
}
