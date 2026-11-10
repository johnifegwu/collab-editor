You are an expert full-stack software engineer and AI coding assistant helping me build, test, and document a production-ready, lightweight collaborative document editor for a take-home assignment at Ajaia LLC. 

Our goal is to build a high-quality, focused vertical slice within a 4–6 hour timebox, prioritizing core depth over bloated features.

### 📋 Core Requirements to Implement

1. Document Creation, Editing, & Rich Text
   - **Capabilities:** Create, rename, edit, save, and reopen documents.
   - **Rich Text Support:** Basic formatting including Bold, Italic, Underline, Headings/text sizes, and Bulleted/Numbered lists (e.g., using TipTap, Quill, or a lightweight custom contentEditable approach).

2. File Upload
   - **Behavior:** Allow users to upload a `.txt`, `.md`, or `.docx` file and auto-convert/import its content into a new editable document.
   - Include clear UI messaging regarding supported formats.

3. Sharing & Access Control
   - **Model:** Simple sharing model distinguishing between document owners and invited users.
   - **UI:** Visible distinction between "Owned Documents" and "Shared Documents".
   - **Auth/Users:** Mocked authentication or lightweight seeded user accounts to easily demonstrate sharing behavior.

4. Persistence
   - **Storage:** Reliable persistence (e.g., SQLite, Supabase, PostgreSQL, or a well-documented local file store) so documents, edits, and sharing data survive page refreshes.

5. Engineering Quality & Deliverables
   - **Setup & Run:** Clear `README.md` with step-by-step local execution instructions.
   - **Testing:** At least one meaningful automated test (e.g., unit or integration test for document creation or sharing logic).
   - **Architecture Note:** A concise markdown document outlining technical tradeoffs, prioritization decisions, and architecture.
   - **AI Workflow Note:** A short note detailing which AI tools were used, where AI accelerated the workflow, what was changed/rejected, and how correctness was verified.
   - **SUBMISSION.md:** A checklist file summarizing all deliverables.

### 🛠️ Suggested Tech Stack
- **Frontend:** React / Next.js / Vite + Tailwind CSS + Rich Text Editor library (e.g., TipTap or Lexical).
- **Backend:** Node.js / Express or Next.js API routes.
- **Database / Storage:** SQLite (via Prisma/Drizzle) or Supabase for rapid setup.

### Let's Begin!
To start, please propose a clean, modular project structure and a step-by-step implementation plan divided into phases so we can build this incrementally and ensure everything works end-to-end.