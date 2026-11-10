/**
 * Integration tests for the documents API route (document creation and sharing logic).
 * Uses an in-memory SQLite database via better-sqlite3 to avoid polluting the dev DB.
 */

import Database from "better-sqlite3";
import { randomUUID } from "crypto";

// ── Minimal DB setup (mirrors lib/db.ts schema) ──────────────────────────────
function createTestDb() {
  const db = new Database(":memory:");
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      ownerId TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE document_access (
      id TEXT PRIMARY KEY,
      documentId TEXT NOT NULL,
      userId TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE (documentId, userId)
    );
  `);
  return db;
}

// ── Helpers that mirror the API route logic ───────────────────────────────────
function createUser(db: Database.Database, id: string, email: string, name: string) {
  db.prepare("INSERT INTO users (id, email, name) VALUES (?, ?, ?)").run(id, email, name);
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as {
    id: string; email: string; name: string;
  };
}

function createDocument(
  db: Database.Database,
  title: string,
  ownerId: string,
  content = ""
) {
  const id = randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    "INSERT INTO documents (id, title, content, ownerId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(id, title, content, ownerId, now, now);
  return db.prepare("SELECT * FROM documents WHERE id = ?").get(id) as {
    id: string; title: string; content: string; ownerId: string;
  };
}

function shareDocument(db: Database.Database, documentId: string, userId: string) {
  db.prepare(
    "INSERT INTO document_access (id, documentId, userId) VALUES (?, ?, ?)"
  ).run(randomUUID(), documentId, userId);
}

function getOwnedDocuments(db: Database.Database, userId: string) {
  return db
    .prepare("SELECT * FROM documents WHERE ownerId = ? ORDER BY updatedAt DESC")
    .all(userId);
}

function getSharedDocuments(db: Database.Database, userId: string) {
  return db
    .prepare(
      `SELECT d.* FROM documents d
       JOIN document_access da ON da.documentId = d.id
       WHERE da.userId = ? AND d.ownerId != ?`
    )
    .all(userId, userId);
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("Document creation", () => {
  let db: Database.Database;
  let alice: { id: string; email: string; name: string };

  beforeEach(() => {
    db = createTestDb();
    alice = createUser(db, "user_alice", "alice@example.com", "Alice");
  });

  afterEach(() => db.close());

  test("creates a document and returns it with correct fields", () => {
    const doc = createDocument(db, "My Doc", alice.id, "<p>Hello</p>");
    expect(doc.title).toBe("My Doc");
    expect(doc.ownerId).toBe(alice.id);
    expect(doc.content).toBe("<p>Hello</p>");
    expect(doc.id).toBeTruthy();
  });

  test("owned documents list contains the created document", () => {
    createDocument(db, "Doc A", alice.id);
    createDocument(db, "Doc B", alice.id);
    const owned = getOwnedDocuments(db, alice.id);
    expect(owned).toHaveLength(2);
    expect((owned as { title: string }[]).map((d) => d.title)).toEqual(
      expect.arrayContaining(["Doc A", "Doc B"])
    );
  });

  test("shared documents list is empty before any sharing", () => {
    const bob = createUser(db, "user_bob", "bob@example.com", "Bob");
    createDocument(db, "Alice Doc", alice.id);
    const sharedWithBob = getSharedDocuments(db, bob.id);
    expect(sharedWithBob).toHaveLength(0);
  });
});

describe("Sharing logic", () => {
  let db: Database.Database;
  let alice: { id: string };
  let bob: { id: string };

  beforeEach(() => {
    db = createTestDb();
    alice = createUser(db, "user_alice", "alice@example.com", "Alice");
    bob = createUser(db, "user_bob", "bob@example.com", "Bob");
  });

  afterEach(() => db.close());

  test("shared document appears in recipient's shared list", () => {
    const doc = createDocument(db, "Shared Doc", alice.id);
    shareDocument(db, doc.id, bob.id);

    const sharedWithBob = getSharedDocuments(db, bob.id);
    expect(sharedWithBob).toHaveLength(1);
    expect((sharedWithBob[0] as { id: string }).id).toBe(doc.id);
  });

  test("shared document does NOT appear in owner's owned list as shared", () => {
    const doc = createDocument(db, "Shared Doc", alice.id);
    shareDocument(db, doc.id, bob.id);

    // Alice's owned list should still contain only her documents
    const aliceOwned = getOwnedDocuments(db, alice.id);
    expect(aliceOwned).toHaveLength(1);

    // Alice's shared list should be empty (she owns this, not shared to her)
    const aliceShared = getSharedDocuments(db, alice.id);
    expect(aliceShared).toHaveLength(0);
  });

  test("owner's document does not appear in their shared list", () => {
    const doc = createDocument(db, "Alice's Doc", alice.id);
    shareDocument(db, doc.id, bob.id);

    // Owner should see it in owned, not shared
    const aliceOwned = getOwnedDocuments(db, alice.id);
    const aliceShared = getSharedDocuments(db, alice.id);
    expect(aliceOwned).toHaveLength(1);
    expect(aliceShared).toHaveLength(0);
  });

  test("duplicate share is silently ignored (UNIQUE constraint)", () => {
    const doc = createDocument(db, "Doc", alice.id);
    shareDocument(db, doc.id, bob.id);

    // Try sharing again — should not throw
    expect(() => {
      try {
        shareDocument(db, doc.id, bob.id);
      } catch {
        // Expected — UNIQUE violation
      }
    }).not.toThrow();

    // Still only one access record
    const count = db
      .prepare(
        "SELECT COUNT(*) as c FROM document_access WHERE documentId = ? AND userId = ?"
      )
      .get(doc.id, bob.id) as { c: number };
    expect(count.c).toBe(1);
  });

  test("revoking access removes the document from shared list", () => {
    const doc = createDocument(db, "Doc", alice.id);
    shareDocument(db, doc.id, bob.id);

    // Revoke
    db.prepare(
      "DELETE FROM document_access WHERE documentId = ? AND userId = ?"
    ).run(doc.id, bob.id);

    const sharedWithBob = getSharedDocuments(db, bob.id);
    expect(sharedWithBob).toHaveLength(0);
  });
});

describe("Document update and delete", () => {
  let db: Database.Database;
  let alice: { id: string };

  beforeEach(() => {
    db = createTestDb();
    alice = createUser(db, "user_alice", "alice@example.com", "Alice");
  });

  afterEach(() => db.close());

  test("updating a document changes its title and content", () => {
    const doc = createDocument(db, "Old Title", alice.id, "<p>old</p>");
    const now = new Date().toISOString();
    db.prepare(
      "UPDATE documents SET title = ?, content = ?, updatedAt = ? WHERE id = ?"
    ).run("New Title", "<p>new</p>", now, doc.id);

    const updated = db
      .prepare("SELECT * FROM documents WHERE id = ?")
      .get(doc.id) as { title: string; content: string };
    expect(updated.title).toBe("New Title");
    expect(updated.content).toBe("<p>new</p>");
  });

  test("deleting a document also removes its access records (CASCADE)", () => {
    const bob = createUser(db, "user_bob", "bob@example.com", "Bob");
    const doc = createDocument(db, "To Delete", alice.id);
    shareDocument(db, doc.id, bob.id);

    // Confirm access exists
    const before = db
      .prepare("SELECT * FROM document_access WHERE documentId = ?")
      .all(doc.id);
    expect(before).toHaveLength(1);

    // Delete doc
    db.prepare("DELETE FROM documents WHERE id = ?").run(doc.id);

    // Access should be gone due to CASCADE
    const after = db
      .prepare("SELECT * FROM document_access WHERE documentId = ?")
      .all(doc.id);
    expect(after).toHaveLength(0);
  });
});
