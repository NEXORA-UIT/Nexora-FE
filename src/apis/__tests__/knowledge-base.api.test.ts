import { describe, it, expect } from "vitest";
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

  it("uploads a document and returns a pending or processing document object", async () => {
    const file = new File(["sample test content"], "sprint_spec.pdf", { type: "application/pdf" });
    const doc = await knowledgeBaseApi.uploadDocument(boardId, file);
    expect(doc.fileName).toBe("sprint_spec.pdf");
    expect(["PENDING", "PROCESSING", "READY"]).toContain(doc.status);
    expect(doc.boardId).toBe(boardId);
  });

  it("deletes a document by id", async () => {
    const file = new File(["to delete"], "delete_me.txt", { type: "text/plain" });
    const uploaded = await knowledgeBaseApi.uploadDocument(boardId, file);
    await knowledgeBaseApi.deleteDocument(uploaded.id);
    const docs = await knowledgeBaseApi.listDocuments(boardId);
    expect(docs.some((d) => d.id === uploaded.id)).toBe(false);
  });

  it("queries RAG and returns an answer with citations", async () => {
    const res = await knowledgeBaseApi.queryRAG(boardId, "What are the sprint goals?");
    expect(res).toHaveProperty("answer");
    expect(typeof res.answer).toBe("string");
    expect(Array.isArray(res.citations)).toBe(true);
  });
});
