# AI-Native Workflow & Engineering Reliability Note

## AI Tooling & Setup
* **Primary Assistant:** AI Coding Assistant (IBM Bob)
* **Usage Focus:** Scaffold initial boilerplate, generate database schemas, write file-parsing utilities, and generate unit test suites.

---

## Material Efficiency Gains
1. **Schema & Migration Speed:** AI generated the initial Prisma schema (`Document`, `User`, `DocumentAccess`) along with relational constraints in seconds.
2. **File Parser Utilities:** Rapidly scaffolded client-side FileReader logic and `mammoth.js` handlers for converting `.docx` binary buffers to structured text.
3. **Automated Test Scaffolding:** Accelerated the creation of Jest/React Testing Library specs for testing document access state and rich-text toolbar toggles.

---

## Critical Interventions (AI Output Changed or Rejected)

* **Rejected Over-Engineered Auth:** AI initially attempted to generate a complex NextAuth/JWT authentication pipeline with refresh token rotation. I rejected this to avoid scope creep, instructing the model to implement a deterministic, seeded mock-user context to ensure easy local and deployed evaluation.
* **Corrected Rich-Text XSS Risk:** AI-generated raw HTML injection logic for file imports lacked proper sanitization. I modified the code to route raw inputs through DOMPurify / TipTap native HTML parsers to eliminate security vulnerabilities.
* **Fixed Relational Access Bug:** AI's initial database query for "Shared Documents" returned all public documents regardless of user explicit permissions. I manually adjusted the SQL/Prisma query to perform strict inner-join filtering on `DocumentAccess.userId`.

---

## Verification & Quality Assurance
* **Functional Integrity:** Verified end-to-end user flows manually across both Owner and Guest accounts (Create $\rightarrow$ Edit $\rightarrow$ Import File $\rightarrow$ Share $\rightarrow$ Refresh & Verify State).
* **Automated Testing:** Ran automated unit and integration tests covering backend permission enforcement and component rendering.
* **Edge Cases:** Manually verified handling of invalid file types, empty document titles, and non-existent shared document IDs.