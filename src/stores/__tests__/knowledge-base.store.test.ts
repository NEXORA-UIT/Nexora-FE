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
      errorMessage: null,
    });
  });

  it("loads documents for active board", async () => {
    const store = useKnowledgeBaseStore.getState();
    await store.loadDocuments("b-1");
    const state = useKnowledgeBaseStore.getState();
    expect(state.documents.length).toBeGreaterThan(0);
    expect(state.activeBoardId).toBe("b-1");
    expect(state.isLoading).toBe(false);
  });

  it("updates search query and filter status", () => {
    const store = useKnowledgeBaseStore.getState();
    store.setSearchQuery("architecture");
    store.setStatusFilter("READY");

    const state = useKnowledgeBaseStore.getState();
    expect(state.searchQuery).toBe("architecture");
    expect(state.selectedFilterStatus).toBe("READY");
  });

  it("queries RAG and stores the answer", async () => {
    const store = useKnowledgeBaseStore.getState();
    await store.queryRAG("b-1", "Security specifications");

    const state = useKnowledgeBaseStore.getState();
    expect(state.ragAnswer).not.toBeNull();
    expect(state.ragAnswer?.question).toBe("Security specifications");
    expect(state.isQuerying).toBe(false);

    store.clearRAGAnswer();
    expect(useKnowledgeBaseStore.getState().ragAnswer).toBeNull();
  });

  it("handles upload and updates document list", async () => {
    const store = useKnowledgeBaseStore.getState();
    const file = new File(["dummy doc"], "upload_test.pdf", { type: "application/pdf" });
    await store.uploadDocument("b-1", file);

    const state = useKnowledgeBaseStore.getState();
    expect(state.documents.some((d) => d.fileName === "upload_test.pdf")).toBe(true);
    expect(state.isUploading).toBe(false);
  });
});
