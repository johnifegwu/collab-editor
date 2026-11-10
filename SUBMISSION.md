# SUBMISSION CHECKLIST

## Core Features

- [x] **Document Creation** — Create new documents with a custom title; redirects to editor immediately.
- [x] **Document Editing** — Full rich-text editing via TipTap (Bold, Italic, Underline, H1/H2/H3, Bullet & Numbered Lists, Undo/Redo).
- [x] **Auto-Save** — Content is debounced and auto-saved every 800ms; "Saved ✓" indicator confirms persistence.
- [x] **Rename Documents** — Inline rename from the dashboard (hover → Rename) or by clicking the title in the editor.
- [x] **Delete Documents** — One-click delete with confirmation prompt; cascade removes access records.
- [x] **Reopen Documents** — All documents listed on the dashboard, reopened directly from the list.
- [x] **File Upload / Import** — Upload `.txt`, `.md`, or `.docx`; content is parsed server-side (mammoth for .docx) and imported into a new editable document.
- [x] **Sharing & Access Control** — Share button (owners only) opens a modal; enter a user's email to grant access; revoke from the same modal.
- [x] **Owned vs. Shared Separation** — Dashboard clearly separates "My Documents" (blue dot) from "Shared with Me" (green dot).
- [x] **View-Only for Shared Users** — Non-owners see content but toolbar is hidden and editing is disabled.
- [x] **Persistence** — SQLite database (`collab.db`) auto-created and auto-seeded on first run; survives page refreshes and restarts.
- [x] **Mock Authentication** — Two seeded users (Alice & Bob) switchable via a top-bar switcher; no password required.

---

## Engineering Deliverables

- [x] **`README.md`** — Step-by-step local setup, feature walkthrough, project structure, seeded accounts.
- [x] **`ARCHITECTURE.md`** — Technical decisions, tradeoffs table, deprioritization rationale, and future roadmap.
- [x] **`AI_WORKFLOW.md`** — AI tools used, efficiency gains, rejected outputs, and verification methods.
- [x] **`SUBMISSION.md`** — This file.
- [x] **Automated Tests** — 18 tests passing across 2 suites:
  - `__tests__/documents.test.ts` — 12 integration tests (create, share, revoke, cascade delete, duplicate guard)
  - `__tests__/toolbar.test.tsx` — 6 unit tests (render, active state, null guard)

---

## Seeded Demo Data

| User | Email | Owns | Shared With |
|---|---|---|---|
| Alice | alice@example.com | "Project Kickoff Notes", "Personal Draft" | Bob's "Meeting Notes" |
| Bob | bob@example.com | "Bob's Meeting Notes" | Alice's "Project Kickoff Notes" |

---

## How to Run

```bash
cd collab-editor
npm install
npm run dev   # → http://localhost:3000
npm test      # → 18 tests passing
```

---

## Intentionally Excluded (Within Timebox)

| Feature | Reason |
|---|---|
| Real-time collaboration (WebSockets / Yjs) | Deprioritized to keep data integrity and UX quality high |
| Full OAuth / JWT auth | Scope-inappropriate; mock auth cleanly demonstrates the sharing model |
| PDF export | Stretch goal; omitted to preserve test and documentation quality |
| "View-Only" vs. "Can Edit" granular roles | Noted in ARCHITECTURE.md as a natural next step |
