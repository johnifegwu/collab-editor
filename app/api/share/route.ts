import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { randomUUID } from "crypto";

// POST /api/share — share a document with a user
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { documentId, email, requesterId } = body;

  if (!documentId || !email || !requesterId) {
    return NextResponse.json(
      { error: "documentId, email, and requesterId are required" },
      { status: 400 }
    );
  }

  const db = getDb();

  // Only the document owner can share
  const doc = db.prepare("SELECT * FROM documents WHERE id = ?").get(documentId) as { ownerId: string } | undefined;
  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }
  if (doc.ownerId !== requesterId) {
    return NextResponse.json(
      { error: "Only the owner can share this document" },
      { status: 403 }
    );
  }

  // Find user by email
  const targetUser = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as { id: string } | undefined;
  if (!targetUser) {
    return NextResponse.json(
      { error: "No user found with that email" },
      { status: 404 }
    );
  }

  // Cannot share with yourself
  if (targetUser.id === requesterId) {
    return NextResponse.json(
      { error: "You cannot share a document with yourself" },
      { status: 400 }
    );
  }

  // Upsert access record
  try {
    db.prepare(
      "INSERT INTO document_access (id, documentId, userId) VALUES (?, ?, ?)"
    ).run(randomUUID(), documentId, targetUser.id);
  } catch {
    // Already shared (UNIQUE constraint) — that's fine
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/share — revoke access
export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const { documentId, userId, requesterId } = body;

  const db = getDb();
  const doc = db.prepare("SELECT * FROM documents WHERE id = ?").get(documentId) as { ownerId: string } | undefined;
  if (!doc || doc.ownerId !== requesterId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  db.prepare(
    "DELETE FROM document_access WHERE documentId = ? AND userId = ?"
  ).run(documentId, userId);

  return NextResponse.json({ success: true });
}

// GET /api/share?documentId=... — list users with access
export async function GET(request: NextRequest) {
  const documentId = request.nextUrl.searchParams.get("documentId");
  if (!documentId) {
    return NextResponse.json({ error: "documentId required" }, { status: 400 });
  }

  const db = getDb();
  const accessList = db
    .prepare(
      `SELECT u.id, u.name, u.email
       FROM document_access da
       JOIN users u ON u.id = da.userId
       WHERE da.documentId = ?`
    )
    .all(documentId);

  return NextResponse.json({ access: accessList });
}
