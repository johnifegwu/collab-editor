# Architecture & Technical Tradeoffs Note

## System Overview
This project is a lightweight, full-stack collaborative document editor designed to demonstrate core product-engineering principles: clean abstraction, reliable state persistence, and clear access boundaries.

### Tech Stack
* **Frontend:** Next.js 14 (App Router), React 19, Tailwind CSS v4.
* **Backend:** Next.js API Routes (Node.js runtime).
* **Database:** SQLite via `better-sqlite3` (zero-config, auto-seeded) (chosen for zero-config local evaluation and fast schema migrations).
* **File Processing:** `mammoth` (.docx → HTML), plain-text parser (.txt/.md).
* **Tests:**  Jest 29 + ts-jest + React Testing Library.

---

## Technical Decisions & Tradeoffs

### 1. Document Storage & Rich Text Representation
* **Decision:** Document content is stored as clean HTML/JSON structured strings in SQLite.
* **Tradeoff:** Storing rich text as HTML/JSON simplified sanitization and immediate editor rendering. While storing delta operations (e.g., Yjs or OT operations) is ideal for true real-time multi-cursor collaboration, standard JSON state was chosen to keep execution focused within the 4–6 hour timebox while remaining robust for persistent single-user/shared edits.

### 2. Authentication & Sharing Model
* **Decision:** Implemented a seeded, lightweight mock authentication system (switchable user profiles: Owner vs. Guest).
* **Tradeoff:** Full OAuth/JWT infrastructure would consume significant setup time without adding product evaluation value. Instead, explicit seed users (e.g., `alice@example.com` and `bob@example.com`) and an explicit `DocumentAccess` relational table clearly demonstrate authorization rules, shared vs. owned queries, and access enforcement.

### 3. File Import Engine
* **Decision:** Client-side file parsing for `.txt`, `.md`, and `.docx` converting directly into editor state upon upload.
* **Tradeoff:** Processing imports in the application tier avoids unnecessary cloud storage bucket overhead (S3/GCS) while delivering instant user feedback upon file selection.

---

## Scoping & Deprioritization

| Feature | Status | Justification |
| :--- | :--- | :--- |
| **Rich Text Formatting** | ✅ Completed | Fully supported (Bold, Italic, Underline, Headings, Lists). |
| **File Import & Parsing** | ✅ Completed | Import `.txt`, `.md`, and `.docx` directly into editable drafts. |
| **Sharing & Permissions** | ✅ Completed | Explicit owner vs. shared document separation. |
| **Real-time WebSockets / OT** | ❌ Deprioritized | Sacrificed live multi-cursor sync to focus on data integrity, UX, and clean persistence within the time limit. |
| **Export to PDF** | ❌ Deprioritized | Kept as an optional stretch; prioritized unit tests and local/deployment setup. |

---

## What I Would Build Next (Next 2–4 Hours)
1. **Granular Permissions:** Introduce "View-Only" vs. "Can Edit" roles in the `DocumentAccess` model.
2. **Real-time Indicators:** Integrate WebSockets or Supabase Realtime for live active user badges and visual typing indicators.
3. **Version History:** Add an audit log table to snapshot document versions on save.