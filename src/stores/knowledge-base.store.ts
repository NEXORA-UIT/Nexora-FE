import { create } from "zustand";
import { knowledgeBaseApi } from "@/apis/knowledge-base.api";
import type { DocumentStatus, KnowledgeDocument, RAGAnswer } from "@/types/knowledge-base";

export interface KnowledgeBaseState {
  documents: KnowledgeDocument[];
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;
  ragAnswer: RAGAnswer | null;
  isQuerying: boolean;
  activeBoardId: string | null;
  searchQuery: string;
  selectedFilterStatus: DocumentStatus | "ALL";
  errorMessage: string | null;

  // Actions
  setActiveBoard: (boardId: string) => void;
  loadDocuments: (boardId: string) => Promise<void>;
  uploadDocument: (boardId: string, file: File) => Promise<KnowledgeDocument>;
  deleteDocument: (documentId: string) => Promise<void>;
  queryRAG: (boardId: string, question: string) => Promise<void>;
  clearRAGAnswer: () => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: DocumentStatus | "ALL") => void;
  pollProcessingDocuments: () => void;
}

export const useKnowledgeBaseStore = create<KnowledgeBaseState>((set, get) => ({
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

  setActiveBoard: (boardId: string) => {
    set({ activeBoardId: boardId });
    void get().loadDocuments(boardId);
  },

  loadDocuments: async (boardId: string) => {
    set({ isLoading: true, errorMessage: null, activeBoardId: boardId });
    try {
      const docs = await knowledgeBaseApi.listDocuments(boardId);
      set({ documents: docs, isLoading: false });
    } catch (err: any) {
      set({
        errorMessage: err.message || "Failed to load documents",
        isLoading: false,
      });
    }
  },

  uploadDocument: async (boardId: string, file: File) => {
    set({ isUploading: true, uploadProgress: 10, errorMessage: null });
    try {
      const newDoc = await knowledgeBaseApi.uploadDocument(boardId, file, (pct) => {
        set({ uploadProgress: pct });
      });
      // Append or prepend new document
      const current = get().documents;
      set({
        documents: [newDoc, ...current.filter((d) => d.id !== newDoc.id)],
        isUploading: false,
        uploadProgress: 100,
      });

      // Start periodic status poller for asynchronous ingestion
      get().pollProcessingDocuments();
      return newDoc;
    } catch (err: any) {
      set({
        errorMessage: err.message || "Failed to upload document",
        isUploading: false,
        uploadProgress: 0,
      });
      throw err;
    }
  },

  deleteDocument: async (documentId: string) => {
    const boardId = get().activeBoardId;
    try {
      await knowledgeBaseApi.deleteDocument(documentId, boardId || undefined);
      set({
        documents: get().documents.filter((d) => d.id !== documentId),
      });
    } catch (err: any) {
      set({ errorMessage: err.message || "Failed to delete document" });
      throw err;
    }
  },

  queryRAG: async (boardId: string, question: string) => {
    if (!question.trim()) return;
    set({ isQuerying: true, errorMessage: null });
    try {
      const answer = await knowledgeBaseApi.queryRAG(boardId, question);
      set({ ragAnswer: answer, isQuerying: false });
    } catch (err: any) {
      set({
        errorMessage: err.message || "Failed to query RAG",
        isQuerying: false,
      });
    }
  },

  clearRAGAnswer: () => set({ ragAnswer: null }),

  setSearchQuery: (searchQuery: string) => set({ searchQuery }),

  setStatusFilter: (selectedFilterStatus: DocumentStatus | "ALL") =>
    set({ selectedFilterStatus }),

  pollProcessingDocuments: () => {
    const boardId = get().activeBoardId;
    if (!boardId) return;

    // Check every 2 seconds if there are still documents in PENDING or PROCESSING status
    const interval = setInterval(async () => {
      const currentDocs = get().documents;
      const hasProcessing = currentDocs.some(
        (d) => d.status === "PENDING" || d.status === "PROCESSING"
      );

      if (!hasProcessing) {
        clearInterval(interval);
        return;
      }

      const refreshed = await knowledgeBaseApi.listDocuments(boardId);
      set({ documents: refreshed });
    }, 2000);
  },
}));
