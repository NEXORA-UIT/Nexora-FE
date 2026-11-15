# RAG Knowledge Base & Document Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the interactive Frontend UI for Project Document Management and RAG Semantic Search in Nexora, supporting file upload (PDF, DOCX, TXT, MD), background ingestion status indicators (`PENDING`, `PROCESSING`, `READY`, `FAILED`), document table, delete confirmation, semantic search & Q&A test card with citations, and Topbar AI Assistant shortcut button activation.

**Architecture:** Decompose into clean, focused single-responsibility components in `src/components/knowledge-base/`. Create a dedicated Zustand store `src/stores/knowledge-base.store.ts` managing board-scoped document state, upload progress, simulated polling, and semantic search. Build an API client `src/apis/knowledge-base.api.ts` connecting to `/ai-service/v1/documents`, `/ai-service/v1/search`, and `/ai-service/v1/answers` with a contract-matched Mock Fallback Simulator for seamless local testing when backend services are offline.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Lucide React, Zustand v5, Radix UI, Vitest, Testing Library.

**Spec:** OpenAPI spec in `Backend/be/docs/api/openapi/knowledge-base.yaml`, FastAPI schemas in `ai/src/api/schemas.py`, endpoints in `ai/src/api/documents.py`, `search.py`, `answers.py`.

---

## Global Constraints

- Must follow existing codebase conventions in `Frontend/src/` (Zustand stores, Tailwind CSS, Lucide icons, Vitest).
- Must adhere strictly to clean modular architecture: each component in its own file under `src/components/knowledge-base/`, never crammed into a single monolith file.
- Must support file formats: `.pdf`, `.docx`, `.txt`, `.md` with max file size of 15MB.
- Document ingestion states: `PENDING` (queued), `PROCESSING` (extracting & embedding with spinner), `READY` (indexed for AI), `FAILED` (error with retry).
- Zero-code backend switch: API client must automatically attempt the real backend endpoint (`/ai-service/v1/...`), and gracefully fallback to the Mock State Simulator if the backend service is offline, with zero console crashes.
- All code must pass `npm run typecheck`, `npm run build`, and `npm test`.

---

## Review Focus

1. **Unsupported File Format / Oversized Upload:** Uploading a file >15MB or an unsupported format (e.g., `.exe`, `.png`) must show an immediate, user-friendly toast validation without sending a broken network request.
2. **Offline Backend Resilience:** When FastAPI or NestJS backend is not running, the UI must seamlessly operate using the Mock Simulator without throwing unhandled network rejections or blank screens.
3. **Simulated Ingestion State Lifecycle:** Uploaded files must realistically simulate transitioning from `PENDING` (queued) -> `PROCESSING` (animated spinner) -> `READY` (emerald badge) so the user can verify asynchronous polling.
4. **Document Purge Warning:** Deleting a document must prompt an accessible confirmation modal warning the user that all vector chunks and semantic embeddings will be permanently purged.
5. **RAG Citations Match AI Copilot:** Citations returned by the semantic search must have exact source file names, page numbers, and snippets matching the `CitationsBlock` structure already established in AI Copilot.

---

## Settled Design Decisions (Grill-Me Alignment)

1. **Board-Scoped Context:** A Board Selector dropdown is placed prominently at the top of `/knowledge` (defaulting to the user's active/first board). Users can switch boards seamlessly to manage documents and run RAG queries scoped per board.
2. **Dual-Tab Layout:** The page is organized into two tabs:
   - Tab 1: **"Project Documents & RAG"** (Default active): Document Dropzone, Documents Table with Status Badges, and Semantic Q&A Card.
   - Tab 2: **"Playbook & Guides"**: Preserves the existing mock product guide articles for easy team reference.
3. **Interactive Semantic Q&A Box:** An inline "Ask RAG" Card on the page allows users to test questions directly against the board's knowledge base. Displays synthesized answers, source citations (`CitationsList` matching AI Copilot's format), and a "Continue in AI Copilot" button to transition the query into the chat assistant.
4. **Realistic LocalStorage Simulator:** When the backend service is offline, uploads simulate a realistic lifecycle (`PENDING` for 1.5s -> `PROCESSING` with spinner for 3s -> `READY`), with state persisted in `localStorage` across page reloads. Zero code changes required when the real backend is started.

---

## Folder Structure

```
Frontend/src/
├── types/
│   └── knowledge-base.ts              # KnowledgeDocument, DocumentStatus, RAGCitation, RAGAnswer, SearchChunk
├── apis/
│   ├── knowledge-base.api.ts          # Contract-aligned API client + Mock Fallback Simulator
│   └── __tests__/
│       └── knowledge-base.api.test.ts # API client tests
├── stores/
│   ├── knowledge-base.store.ts        # Zustand store managing documents, polling, and RAG Q&A
│   └── __tests__/
│       └── knowledge-base.store.test.ts
├── components/knowledge-base/
│   ├── DocumentStatusBadge.tsx        # Status badge (PENDING, PROCESSING with spinner, READY, FAILED)
│   ├── DocumentTableRow.tsx           # Single document row (icon, size, date, status, actions)
│   ├── DocumentDeleteDialog.tsx       # Delete confirmation dialog with vector purge warning
│   ├── DocumentDropzone.tsx           # Drag & drop upload area with progress bar
│   ├── DocumentTable.tsx              # Documents list table with filter, search, empty state
│   ├── SemanticSearchBox.tsx          # Q&A prompt input box with keyboard shortcuts
│   ├── SemanticAnswerCard.tsx         # Synthesized answer display with refusal alert
│   ├── CitationsList.tsx              # Citations list matching AI Copilot structure
│   ├── BoardSelectorHeader.tsx        # Board selector & document metrics summary cards
│   ├── index.ts                       # Clean barrel exports
│   └── __tests__/
│       ├── DocumentTableRow.test.tsx
│       ├── DocumentDropzone.test.tsx
│       └── SemanticSearch.test.tsx
├── pages/knowledge/
│   ├── KnowledgeBasePage.tsx          # Orchestrator layout page with dual tabs (RAG Engine vs Playbook)
│   └── __tests__/
│       └── KnowledgeBasePage.test.tsx
└── components/navigation/
    └── Topbar.tsx                     # Enable AI Assistant button linking to /assistant
```

---

### Task 1: Types & API Client Layer with Mock Fallback Simulator

**Files:**
- Modify: `Frontend/src/types/knowledge-base.ts`
- Create: `Frontend/src/apis/knowledge-base.api.ts`
- Create: `Frontend/src/apis/__tests__/knowledge-base.api.test.ts`

**Interfaces:**
- Consumes: `client.ts` Axios instance or fetch, `Citation` from `src/types/ai.ts`.
- Produces:
  - `DocumentStatus = "PENDING" | "PROCESSING" | "READY" | "FAILED"`
  - `KnowledgeDocument`: `{ id, boardId, fileName, fileExtension, fileSize, status, chunkCount, uploadedBy, createdAt, updatedAt }`
  - `RAGAnswer`: `{ question, boardId, answer, refused, citations: RAGCitation[] }`
  - `knowledgeBaseApi.listDocuments(boardId: string): Promise<KnowledgeDocument[]>`
  - `knowledgeBaseApi.uploadDocument(boardId: string, file: File, onProgress?: (pct: number) => void): Promise<KnowledgeDocument>`
  - `knowledgeBaseApi.deleteDocument(documentId: string): Promise<void>`
  - `knowledgeBaseApi.queryRAG(boardId: string, question: string): Promise<RAGAnswer>`

- [ ] **Step 1: Write failing test for `knowledgeBaseApi`**

```typescript
// Frontend/src/apis/__tests__/knowledge-base.api.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { knowledgeBaseApi } from "../knowledge-base.api";

describe("knowledgeBaseApi", () => {
  const boardId = "board-test-1";

  it("lists documents for a board with fallback mock data", async () => {
    const docs = await knowledgeBaseApi.listDocuments(boardId);
    expect(Array.isArray(docs)).toBe(true);
    expect(docs.length).toBeGreaterThan(0);
    expect(docs[0]).toHaveProperty("fileName");
    expect(docs[0]).toHaveProperty("status");
  });

  it("uploads a document and returns a pending/processing document object", async () => {
    const file = new File(["test content"], "sprint_spec.pdf", { type: "application/pdf" });
    const doc = await knowledgeBaseApi.uploadDocument(boardId, file);
    expect(doc.fileName).toBe("sprint_spec.pdf");
    expect(["PENDING", "PROCESSING", "READY"]).toContain(doc.status);
  });

  it("queries RAG and returns an answer with citations", async () => {
    const res = await knowledgeBaseApi.queryRAG(boardId, "What are the project goals?");
    expect(res).toHaveProperty("answer");
    expect(Array.isArray(res.citations)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix Frontend test -- src/apis/__tests__/knowledge-base.api.test.ts --run`
Expected: FAIL (module `../knowledge-base.api` not found).

- [ ] **Step 3: Implement types and API client with Mock Simulator**

In `Frontend/src/types/knowledge-base.ts`, define `KnowledgeDocument`, `DocumentStatus`, `RAGCitation`, `RAGAnswer`.
In `Frontend/src/apis/knowledge-base.api.ts`, create methods that try `axios.get('/ai-service/v1/...')` and catch network connection failures to gracefully return simulated in-memory store data.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix Frontend test -- src/apis/__tests__/knowledge-base.api.test.ts --run`
Expected: PASS (all 3 tests pass).

- [ ] **Step 5: Commit**

```bash
git -C Frontend add src/types/knowledge-base.ts src/apis/knowledge-base.api.ts src/apis/__tests__/knowledge-base.api.test.ts
git -C Frontend commit -m "feat(rag): add knowledge base types and API client with mock fallback simulator"
```

---

### Task 2: Zustand Store for RAG & Asynchronous Ingestion Management

**Files:**
- Create: `Frontend/src/stores/knowledge-base.store.ts`
- Create: `Frontend/src/stores/__tests__/knowledge-base.store.test.ts`

**Interfaces:**
- Consumes: `knowledgeBaseApi`, types from `src/types/knowledge-base.ts`.
- Produces:
  - `useKnowledgeBaseStore`:
    - State: `documents: KnowledgeDocument[]`, `isLoading: boolean`, `isUploading: boolean`, `uploadProgress: number`, `ragAnswer: RAGAnswer | null`, `isQuerying: boolean`, `activeBoardId: string | null`, `searchQuery: string`, `selectedFilterStatus: DocumentStatus | "ALL"`.
    - Actions: `setActiveBoard(boardId: string)`, `loadDocuments(boardId: string)`, `uploadDocument(boardId: string, file: File)`, `deleteDocument(documentId: string)`, `queryRAG(boardId: string, question: string)`, `clearRAGAnswer()`, `setSearchQuery(q: string)`, `setStatusFilter(status: DocumentStatus | "ALL")`.

- [ ] **Step 1: Write failing test for `useKnowledgeBaseStore`**

```typescript
// Frontend/src/stores/__tests__/knowledge-base.store.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { useKnowledgeBaseStore } from "../knowledge-base.store";

describe("useKnowledgeBaseStore", () => {
  beforeEach(() => {
    useKnowledgeBaseStore.setState({
      documents: [],
      isLoading: false,
      isUploading: false,
      uploadProgress: 0,
      ragAnswer: null,
      isQuerying: false,
      activeBoardId: null,
      searchQuery: "",
      selectedFilterStatus: "ALL",
    });
  });

  it("loads documents for active board", async () => {
    const store = useKnowledgeBaseStore.getState();
    await store.loadDocuments("b-1");
    expect(useKnowledgeBaseStore.getState().documents.length).toBeGreaterThan(0);
    expect(useKnowledgeBaseStore.getState().activeBoardId).toBe("b-1");
  });

  it("queries RAG and stores the answer", async () => {
    const store = useKnowledgeBaseStore.getState();
    await store.queryRAG("b-1", "Security specifications");
    expect(useKnowledgeBaseStore.getState().ragAnswer).not.toBeNull();
    expect(useKnowledgeBaseStore.getState().isQuerying).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix Frontend test -- src/stores/__tests__/knowledge-base.store.test.ts --run`
Expected: FAIL (module `../knowledge-base.store` not found).

- [ ] **Step 3: Implement `useKnowledgeBaseStore`**

In `Frontend/src/stores/knowledge-base.store.ts`, implement Zustand v5 store with document CRUD, status filtering, upload simulation, and RAG answering.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix Frontend test -- src/stores/__tests__/knowledge-base.store.test.ts --run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git -C Frontend add src/stores/knowledge-base.store.ts src/stores/__tests__/knowledge-base.store.test.ts
git -C Frontend commit -m "feat(rag): create Zustand store for knowledge base and RAG queries"
```

---

### Task 3: Document Status Badge, Table Row & Delete Confirmation Dialog

**Files:**
- Create: `Frontend/src/components/knowledge-base/DocumentStatusBadge.tsx`
- Create: `Frontend/src/components/knowledge-base/DocumentTableRow.tsx`
- Create: `Frontend/src/components/knowledge-base/DocumentDeleteDialog.tsx`
- Create: `Frontend/src/components/knowledge-base/__tests__/DocumentTableRow.test.tsx`

**Interfaces:**
- Consumes: `KnowledgeDocument`, `DocumentStatus` types, `Button`, `Dialog` UI primitives, Lucide icons (`FileText`, `FileSpreadsheet`, `FileCode`, `Loader2`, `CheckCircle2`, `Clock`, `AlertTriangle`, `Trash2`, `Download`).
- Produces:
  - `<DocumentStatusBadge status={status} />`
  - `<DocumentTableRow document={doc} onDelete={(id) => ...} onDownload={(doc) => ...} />`
  - `<DocumentDeleteDialog isOpen={isOpen} document={doc} onClose={() => ...} onConfirm={() => ...} />`

- [ ] **Step 1: Write failing test for `DocumentTableRow` and `DocumentStatusBadge`**

```typescript
// Frontend/src/components/knowledge-base/__tests__/DocumentTableRow.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DocumentTableRow } from "../DocumentTableRow";
import type { KnowledgeDocument } from "@/types/knowledge-base";

const mockDoc: KnowledgeDocument = {
  id: "doc-1",
  boardId: "b-1",
  fileName: "Architecture_Spec.pdf",
  fileExtension: "pdf",
  fileSize: 1048576, // 1 MB
  status: "READY",
  chunkCount: 18,
  uploadedBy: "John Doe",
  createdAt: "2026-11-15T08:00:00Z",
  updatedAt: "2026-11-15T08:02:00Z",
};

describe("DocumentTableRow", () => {
  it("renders document details, size, and READY status badge", () => {
    render(<DocumentTableRow document={mockDoc} onDelete={vi.fn()} onDownload={vi.fn()} />);
    expect(screen.getByText("Architecture_Spec.pdf")).toBeDefined();
    expect(screen.getByText("1.0 MB")).toBeDefined();
    expect(screen.getByText("READY")).toBeDefined();
    expect(screen.getByText("18 chunks")).toBeDefined();
  });

  it("triggers onDelete when trash icon is clicked", () => {
    const onDelete = vi.fn();
    render(<DocumentTableRow document={mockDoc} onDelete={onDelete} onDownload={vi.fn()} />);
    fireEvent.click(screen.getByLabelText(/Delete Architecture_Spec.pdf/i));
    expect(onDelete).toHaveBeenCalledWith("doc-1");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix Frontend test -- src/components/knowledge-base/__tests__/DocumentTableRow.test.tsx --run`
Expected: FAIL.

- [ ] **Step 3: Implement `DocumentStatusBadge`, `DocumentTableRow`, `DocumentDeleteDialog`**

- `DocumentStatusBadge.tsx`: Colors: PENDING (amber background/text), PROCESSING (blue background with spinning Loader2), READY (emerald background with check icon), FAILED (rose background with alert icon).
- `DocumentTableRow.tsx`: File type icons (Red for PDF, Blue for DOCX, Gray for TXT/MD), format helper for file size, action buttons for download and delete.
- `DocumentDeleteDialog.tsx`: Radix Dialog with alert icon, explaining that deleting will also purge all vector chunks.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix Frontend test -- src/components/knowledge-base/__tests__/DocumentTableRow.test.tsx --run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git -C Frontend add src/components/knowledge-base/DocumentStatusBadge.tsx src/components/knowledge-base/DocumentTableRow.tsx src/components/knowledge-base/DocumentDeleteDialog.tsx src/components/knowledge-base/__tests__/DocumentTableRow.test.tsx
git -C Frontend commit -m "feat(rag): add document row, status badge, and delete confirmation dialog"
```

---

### Task 4: Drag & Drop Uploader (Dropzone) & Document Table

**Files:**
- Create: `Frontend/src/components/knowledge-base/DocumentDropzone.tsx`
- Create: `Frontend/src/components/knowledge-base/DocumentTable.tsx`
- Create: `Frontend/src/components/knowledge-base/__tests__/DocumentDropzone.test.tsx`

**Interfaces:**
- Consumes: `useKnowledgeBaseStore`, `DocumentTableRow`, `DocumentDeleteDialog`.
- Produces:
  - `<DocumentDropzone onUpload={(file) => ...} isUploading={isUploading} progress={progress} />`
  - `<DocumentTable documents={documents} onDeleteDoc={(id) => ...} isLoading={isLoading} />`

- [ ] **Step 1: Write failing test for `DocumentDropzone`**

```typescript
// Frontend/src/components/knowledge-base/__tests__/DocumentDropzone.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DocumentDropzone } from "../DocumentDropzone";

describe("DocumentDropzone", () => {
  it("renders upload prompt and handles file selection", () => {
    const onUpload = vi.fn();
    render(<DocumentDropzone onUpload={onUpload} isUploading={false} progress={0} />);
    expect(screen.getByText(/Drag and drop project documents/i)).toBeDefined();
    expect(screen.getByText(/PDF, DOCX, TXT, MD up to 15MB/i)).toBeDefined();

    const file = new File(["dummy content"], "spec.pdf", { type: "application/pdf" });
    const input = screen.getByLabelText(/Upload document/i);
    fireEvent.change(input, { target: { files: [file] } });

    expect(onUpload).toHaveBeenCalledWith(file);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix Frontend test -- src/components/knowledge-base/__tests__/DocumentDropzone.test.tsx --run`
Expected: FAIL.

- [ ] **Step 3: Implement `DocumentDropzone` and `DocumentTable`**

- `DocumentDropzone.tsx`: Drag & drop event listeners (`onDragOver`, `onDragLeave`, `onDrop`), file type verification, size limit (15MB) validation with toast error, progress bar during upload.
- `DocumentTable.tsx`: Search bar for filtering document names, status filter dropdown ("All", "Ready", "Processing", "Failed"), clean table header, empty state with upload callout.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix Frontend test -- src/components/knowledge-base/__tests__/DocumentDropzone.test.tsx --run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git -C Frontend add src/components/knowledge-base/DocumentDropzone.tsx src/components/knowledge-base/DocumentTable.tsx src/components/knowledge-base/__tests__/DocumentDropzone.test.tsx
git -C Frontend commit -m "feat(rag): add drag and drop uploader and document management table"
```

---

### Task 5: Semantic Search, Q&A Answer Card & Citations List

**Files:**
- Create: `Frontend/src/components/knowledge-base/SemanticSearchBox.tsx`
- Create: `Frontend/src/components/knowledge-base/SemanticAnswerCard.tsx`
- Create: `Frontend/src/components/knowledge-base/CitationsList.tsx`
- Create: `Frontend/src/components/knowledge-base/__tests__/SemanticSearch.test.tsx`

**Interfaces:**
- Consumes: `RAGAnswer`, `RAGCitation` types, `useKnowledgeBaseStore`.
- Produces:
  - `<SemanticSearchBox onSearch={(q) => ...} isLoading={isLoading} />`
  - `<SemanticAnswerCard answer={ragAnswer} onClear={() => ...} />`
  - `<CitationsList citations={citations} />`

- [ ] **Step 1: Write failing test for Semantic Search & Answer Card**

```typescript
// Frontend/src/components/knowledge-base/__tests__/SemanticSearch.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SemanticSearchBox } from "../SemanticSearchBox";
import { SemanticAnswerCard } from "../SemanticAnswerCard";
import type { RAGAnswer } from "@/types/knowledge-base";

describe("SemanticSearchBox & SemanticAnswerCard", () => {
  it("submits search question on button click", () => {
    const onSearch = vi.fn();
    render(<SemanticSearchBox onSearch={onSearch} isLoading={false} />);
    const input = screen.getByPlaceholderText(/Ask any question against your project knowledge/i);
    fireEvent.change(input, { target: { value: "What is the sprint deadline?" } });
    fireEvent.click(screen.getByRole("button", { name: /Ask RAG/i }));
    expect(onSearch).toHaveBeenCalledWith("What is the sprint deadline?");
  });

  it("renders synthesized answer and citations list", () => {
    const mockAnswer: RAGAnswer = {
      question: "What is the sprint deadline?",
      boardId: "b-1",
      answer: "The sprint deadline is November 20.",
      refused: false,
      citations: [
        {
          chunkId: "c-1",
          documentId: "d-1",
          fileName: "Sprint_Plan.pdf",
          pageNumber: 3,
          snippet: "Sprint closes on November 20 with final QA.",
        },
      ],
    };
    render(<SemanticAnswerCard answer={mockAnswer} onClear={vi.fn()} />);
    expect(screen.getByText("The sprint deadline is November 20.")).toBeDefined();
    expect(screen.getByText("Sprint_Plan.pdf")).toBeDefined();
    expect(screen.getByText(/Page 3/i)).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix Frontend test -- src/components/knowledge-base/__tests__/SemanticSearch.test.tsx --run`
Expected: FAIL.

- [ ] **Step 3: Implement `SemanticSearchBox`, `SemanticAnswerCard`, `CitationsList`**

- `SemanticSearchBox.tsx`: Input bar with search/sparkle icon, suggested quick questions, keyboard Enter submission.
- `SemanticAnswerCard.tsx`: Card with AI avatar, answer markdown styling, "Refused" alert if insufficient evidence, copy answer button.
- `CitationsList.tsx`: Reusable cards showing document title, page badge, quoted snippet.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix Frontend test -- src/components/knowledge-base/__tests__/SemanticSearch.test.tsx --run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git -C Frontend add src/components/knowledge-base/SemanticSearchBox.tsx src/components/knowledge-base/SemanticAnswerCard.tsx src/components/knowledge-base/CitationsList.tsx src/components/knowledge-base/__tests__/SemanticSearch.test.tsx
git -C Frontend commit -m "feat(rag): add semantic search box, answer card, and citations list"
```

---

### Task 6: Page Integration, Topbar AI Shortcut & Barrel Exports

**Files:**
- Create: `Frontend/src/components/knowledge-base/BoardSelectorHeader.tsx`
- Create: `Frontend/src/components/knowledge-base/index.ts`
- Modify: `Frontend/src/pages/knowledge/KnowledgeBasePage.tsx`
- Modify: `Frontend/src/components/navigation/Topbar.tsx:101-112`
- Modify: `Frontend/src/components/navigation/Sidebar.tsx:298-305`
- Create: `Frontend/src/pages/knowledge/__tests__/KnowledgeBasePage.test.tsx`

**Interfaces:**
- Consumes: All components from `src/components/knowledge-base/`, `useWorkspaceStore`, `useKnowledgeBaseStore`.
- Produces:
  - `<KnowledgeBasePage />` (Full RAG Knowledge Center with Board switcher, Documents Table, Drag-drop Uploader, Semantic Q&A, and Secondary tab for Product Guides).
  - Active `Topbar.tsx` AI Assistant shortcut button navigating to `ROUTES.AI_ASSISTANT`.

- [ ] **Step 1: Write failing test for `KnowledgeBasePage`**

```typescript
// Frontend/src/pages/knowledge/__tests__/KnowledgeBasePage.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { KnowledgeBasePage } from "../KnowledgeBasePage";

vi.mock("@/stores/workspace.store", () => ({
  useWorkspaceStore: () => ({
    workspaces: [{ id: "ws-1", name: "Core Platform" }],
    activeWorkspaceId: "ws-1",
    getActiveWorkspace: () => ({ id: "ws-1", name: "Core Platform" }),
  }),
}));

describe("KnowledgeBasePage", () => {
  it("renders Knowledge Base header, tabs, and documents section", () => {
    render(
      <MemoryRouter>
        <KnowledgeBasePage />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: /Knowledge Base/i })).toBeDefined();
    expect(screen.getByText(/Project Documents & RAG/i)).toBeDefined();
    expect(screen.getByText(/Drag and drop project documents/i)).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix Frontend test -- src/pages/knowledge/__tests__/KnowledgeBasePage.test.tsx --run`
Expected: FAIL.

- [ ] **Step 3: Implement `BoardSelectorHeader`, `index.ts`, `KnowledgeBasePage`, and fix `Topbar.tsx`**

- `BoardSelectorHeader.tsx`: Allows choosing which board's knowledge base to manage; displays metric cards (Total Documents, Ready to Query, Processed Chunks).
- `KnowledgeBasePage.tsx`: Two tabs:
  - Tab 1: **"Project Documents & RAG"**: Dropzone, Documents Table, Semantic Search & Answers.
  - Tab 2: **"Playbook & Guides"**: Preserves the existing mock product articles for reference.
- `Topbar.tsx`: Remove `disabled` and change "AI unavailable" to "AI Assistant" with `onClick={() => navigate(ROUTES.AI_ASSISTANT)}`.
- `Sidebar.tsx`: Update `aria-label="AI Assistant"`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix Frontend test -- src/pages/knowledge/__tests__/KnowledgeBasePage.test.tsx --run`
Expected: PASS.

- [ ] **Step 5: Run full verification suite**

Run:
```bash
npm --prefix Frontend run typecheck
npm --prefix Frontend test -- --run
npm --prefix Frontend run build
```
Expected: All tests pass, 0 type errors, production build succeeds.

- [ ] **Step 6: Commit**

```bash
git -C Frontend add src/components/knowledge-base/ src/pages/knowledge/ src/components/navigation/Topbar.tsx src/components/navigation/Sidebar.tsx
git -C Frontend commit -m "feat(rag): integrate complete Knowledge Base RAG interface and activate Topbar AI shortcut"
```
