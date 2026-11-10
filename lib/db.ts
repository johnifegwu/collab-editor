import Database from "better-sqlite3";
import path from "path";

// Use DATABASE_URL env var (strips the "file:" prefix) or fall back to cwd
function resolveDbPath(): string {
  const url = process.env.DATABASE_URL;
  if (url) {
    // Strip "file:" prefix if present (e.g. "file:/data/collab.db" → "/data/collab.db")
    return url.replace(/^file:/, "");
  }
  return path.join(process.cwd(), "collab.db");
}

const DB_PATH = resolveDbPath();

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id        TEXT PRIMARY KEY,
      email     TEXT UNIQUE NOT NULL,
      name      TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS documents (
      id        TEXT PRIMARY KEY,
      title     TEXT NOT NULL,
      content   TEXT NOT NULL DEFAULT '',
      ownerId   TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS document_access (
      id         TEXT PRIMARY KEY,
      documentId TEXT NOT NULL,
      userId     TEXT NOT NULL,
      createdAt  TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE (documentId, userId)
    );
  `);

  // Seed mock users if they don't exist
  const existingUsers = db
    .prepare("SELECT COUNT(*) as count FROM users")
    .get() as { count: number };
  if (existingUsers.count === 0) {
    seedData(db);
  }
}

function seedData(db: Database.Database) {
  const insertUser = db.prepare(
    "INSERT INTO users (id, email, name) VALUES (?, ?, ?)"
  );
  insertUser.run("user_alice", "alice@example.com", "Alice");
  insertUser.run("user_bob", "bob@example.com", "Bob");

  const insertDoc = db.prepare(
    "INSERT INTO documents (id, title, content, ownerId) VALUES (?, ?, ?, ?)"
  );

  insertDoc.run(
    "doc_kickoff",
    "Project Kickoff Notes",
    "<h2>Project Kickoff</h2><p>Welcome to the collaborative document editor!</p><ul><li>Review requirements</li><li>Assign owners</li></ul>",
    "user_alice"
  );

  insertDoc.run(
    "doc_alice_draft",
    "Personal Draft",
    "<p>This is Alice's private draft document.</p>",
    "user_alice"
  );

  insertDoc.run(
    "doc_bob_notes",
    "Bob's Meeting Notes",
    "<p>Notes from the last sprint planning session.</p>",
    "user_bob"
  );

  // Alice shares doc_kickoff with Bob; Bob shares doc_bob_notes with Alice
  const insertAccess = db.prepare(
    "INSERT INTO document_access (id, documentId, userId) VALUES (?, ?, ?)"
  );
  insertAccess.run("access_1", "doc_kickoff", "user_bob");
  insertAccess.run("access_2", "doc_bob_notes", "user_alice");
}

export default getDb;
