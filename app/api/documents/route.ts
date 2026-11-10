import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { randomUUID } from "crypto";

// GET /api/documents?userId=...
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const db = getDb();

  const owned = db
    .prepare(
      `SELECT d.*, u.name as ownerName
       FROM documents d
       JOIN users u ON u.id = d.ownerId
       WHERE d.ownerId = ?
       ORDER BY d.updatedAt DESC`
    )
    .all(userId);

  const shared = db
    .prepare(
      `SELECT d.*, u.name as ownerName
       FROM documents d
       JOIN document_access da ON da.documentId = d.id
       JOIN users u ON u.id = d.ownerId
       WHERE da.userId = ? AND d.ownerId != ?
       ORDER BY d.updatedAt DESC`
    )
    .all(userId, userId);

  return NextResponse.json({ owned, shared });
}

// POST /api/documents — create a new document
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, content = "", ownerId } = body;

  if (!title || !ownerId) {
    return NextResponse.json(
      { error: "title and ownerId required" },
      { status: 400 }
    );
  }

  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(
    "INSERT INTO documents (id, title, content, ownerId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(id, title, content, ownerId, now, now);

  const doc = db.prepare("SELECT * FROM documents WHERE id = ?").get(id);
  return NextResponse.json(doc, { status: 201 });
}
