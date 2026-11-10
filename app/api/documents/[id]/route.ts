import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

// GET /api/documents/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const db = getDb();
  const doc = db
    .prepare(
      `SELECT d.*, u.name as ownerName
       FROM documents d
       JOIN users u ON u.id = d.ownerId
       WHERE d.id = ?`
    )
    .get(id);

  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(doc);
}

// PATCH /api/documents/[id] — update title and/or content
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const { title, content } = body;

  const db = getDb();
  const existing = db.prepare("SELECT * FROM documents WHERE id = ?").get(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updates: string[] = [];
  const values: unknown[] = [];

  if (title !== undefined) {
    updates.push("title = ?");
    values.push(title);
  }
  if (content !== undefined) {
    updates.push("content = ?");
    values.push(content);
  }
  updates.push("updatedAt = ?");
  values.push(new Date().toISOString());
  values.push(id);

  db.prepare(`UPDATE documents SET ${updates.join(", ")} WHERE id = ?`).run(
    ...values
  );

  const updated = db.prepare("SELECT * FROM documents WHERE id = ?").get(id);
  return NextResponse.json(updated);
}

// DELETE /api/documents/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const db = getDb();
  const existing = db.prepare("SELECT * FROM documents WHERE id = ?").get(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  db.prepare("DELETE FROM documents WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}
