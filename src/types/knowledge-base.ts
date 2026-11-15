export type DocumentStatus = "PENDING" | "PROCESSING" | "READY" | "FAILED";

export interface KnowledgeDocument {
  id: string;
  boardId: string;
  fileName: string;
  fileExtension: string;
  fileSize: number;
  status: DocumentStatus;
  chunkCount?: number;
  uploadedBy?: string;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
}

export interface RAGCitation {
  chunkId: string;
  documentId: string;
  fileName: string;
  pageNumber?: number | null;
  snippet: string;
  score?: number;
}

export interface RAGAnswer {
  question: string;
  boardId: string;
  answer: string;
  refused: boolean;
  citations: RAGCitation[];
}

export interface RAGQueryRequest {
  question: string;
  board_id: string;
  top_k?: number;
  candidate_k?: number;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  updatedAt: string;
  readMinutes: number;
}
