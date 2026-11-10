import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

/**
 * POST /api/upload
 * Accepts a multipart form with a file (.txt, .md, .docx).
 * Returns { title, content } where content is HTML ready for TipTap.
 *
 * .docx conversion is done server-side using mammoth.
 * .txt/.md are returned as sanitized HTML paragraphs.
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const name = file.name;
  const ext = name.split(".").pop()?.toLowerCase();

  if (!["txt", "md", "docx"].includes(ext ?? "")) {
    return NextResponse.json(
      { error: "Unsupported file type. Please upload .txt, .md, or .docx" },
      { status: 415 }
    );
  }

  const title = name.replace(/\.[^.]+$/, "") || `Imported ${randomUUID().slice(0, 6)}`;

  let content = "";

  if (ext === "docx") {
    const mammoth = (await import("mammoth")).default;
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await mammoth.convertToHtml({ buffer });
    content = result.value;
  } else {
    // .txt or .md — convert plain text/markdown to simple HTML paragraphs
    const text = await file.text();
    content = text
      .split(/\r?\n/)
      .map((line) => {
        if (line.trim() === "") return "";
        // Basic markdown heading detection
        const h3 = line.match(/^### (.+)/);
        const h2 = line.match(/^## (.+)/);
        const h1 = line.match(/^# (.+)/);
        const bullet = line.match(/^[-*] (.+)/);
        if (h1) return `<h1>${escapeHtml(h1[1])}</h1>`;
        if (h2) return `<h2>${escapeHtml(h2[1])}</h2>`;
        if (h3) return `<h3>${escapeHtml(h3[1])}</h3>`;
        if (bullet) return `<ul><li>${escapeHtml(bullet[1])}</li></ul>`;
        return `<p>${escapeHtml(line)}</p>`;
      })
      .filter(Boolean)
      .join("\n");
  }

  return NextResponse.json({ title, content });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
