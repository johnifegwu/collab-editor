# Collab Editor

A lightweight, production-quality collaborative document editor built as a take-home assignment for Ajaia LLC. Demonstrates a clean full-stack vertical slice with rich-text editing, file import, sharing & access control, and reliable persistence — all within a 4–6 hour timebox.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 19, Tailwind CSS v4 |
| **Rich Text** | TipTap v3 (Bold, Italic, Underline, H1/H2/H3, Bullet & Ordered Lists) |
| **Backend** | Next.js API Routes (Node.js) |
| **Database** | SQLite via `better-sqlite3` (zero-config, auto-seeded) |
| **File Import** | `mammoth` (.docx → HTML), plain-text parser (.txt/.md) |
| **Tests** | Jest 29 + ts-jest + React Testing Library |

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** v8 or higher

---

## Quick Start

### 1. Navigate to the app directory

```bash
cd collab-editor
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> The SQLite database (`collab.db`) is created **automatically** on first run, with two seeded users and sample documents. No separate migration or setup step required.

---

## Seeded Demo Accounts

The app uses mock authentication (no passwords). Switch between users via the **user switcher** in the top navigation bar.

| Name | Email | Role |
|---|---|---|
| **Alice** | alice@example.com | Owns "Project Kickoff Notes" and "Personal Draft" |
| **Bob** | bob@example.com | Owns "Bob's Meeting Notes" |

**Pre-configured sharing:**
- Alice's "Project Kickoff Notes" → shared with Bob
- Bob's "Meeting Notes" → shared with Alice

---

## Features Walkthrough

### Document Creation
1. Type a title in the input field and click **+ New**, or leave blank for "Untitled Document".
2. You are redirected immediately to the editor.

### Rich Text Editing
- Use the toolbar: **B** (Bold), *I* (Italic), <u>U</u> (Underline), H1/H2/H3, • List, 1. List, Undo/Redo.
- All changes are **auto-saved** with an 800ms debounce. A "Saved ✓" indicator appears after each save.

### Rename a Document
- On the dashboard: hover a document row → click **Rename**.
- In the editor: click the document title (owners only).

### Delete a Document
- On the dashboard: hover a document row → click **Delete** (confirmation prompt).

### File Import
1. Click **Import File** on the dashboard.
2. Select a `.txt`, `.md`, or `.docx` file.
3. The file is parsed server-side and opened in the editor as a new document.

### Sharing
1. Open any document you **own** and click **Share** (top-right).
2. Enter `bob@example.com` (or `alice@example.com`) and click **Share**.
3. Switch user via the switcher — the document now appears in that user's **Shared with Me** section.
4. Owners can revoke access from the same Share modal.

### View-Only Access
Shared users can **read** documents but the toolbar is hidden and editing is disabled. A notice confirms view-only status.

---

## Running Tests

```bash
npm test
```

**Test suite coverage:**
- `__tests__/documents.test.ts` — 12 integration tests: document creation, ownership queries, sharing logic, cascaded deletes, duplicate share handling, access revocation.
- `__tests__/toolbar.test.tsx` — 6 unit tests: toolbar rendering, button labels, active state styling, null-editor guard.

---

## Project Structure

```
collab-editor/
├── app/
│   ├── page.tsx                  # Dashboard (owned + shared documents)
│   ├── editor/[id]/page.tsx      # Rich text editor page
│   ├── api/
│   │   ├── documents/route.ts    # GET (list), POST (create)
│   │   ├── documents/[id]/route.ts  # GET, PATCH, DELETE
│   │   ├── share/route.ts        # GET (access list), POST (grant), DELETE (revoke)
│   │   └── upload/route.ts       # POST (file → HTML)
│   └── globals.css
├── components/
│   ├── Editor.tsx                # TipTap editor with auto-save
│   ├── Toolbar.tsx               # Rich text formatting toolbar
│   ├── DocumentList.tsx          # Owned + shared document sections
│   ├── ShareModal.tsx            # Share / revoke access modal
│   ├── FileUpload.tsx            # File import button
│   └── UserSwitcher.tsx          # Mock auth switcher
├── lib/
│   ├── db.ts                     # SQLite singleton + schema init + seed
│   ├── mockAuth.ts               # Seeded user definitions
│   └── types.ts                  # Shared TypeScript interfaces
├── __tests__/
│   ├── documents.test.ts         # Integration tests
│   └── toolbar.test.tsx          # Unit tests
├── ARCHITECTURE.md
├── AI_WORKFLOW.md
└── SUBMISSION.md
```

---

## Environment

The app reads `DATABASE_URL` from `.env` but falls back to `collab.db` in the project root. The `.env` file is pre-configured:

```
DATABASE_URL="file:./dev.db"
```

No external services, no cloud credentials, no sign-up required.
