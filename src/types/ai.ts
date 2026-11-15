export type AiAgentStatus = "answered" | "insufficient_evidence" | "error";

export interface Citation {
  chunk_id: string;
  source_title: string;
  page?: number | null;
  snippet: string;
}

export interface ReferencedCard {
  label: string; // e.g. "[C1]"
  card_id: string;
  title: string;
  status?: string;
  list_name?: string;
}

export interface ChatAgentRequest {
  question: string;
  board_id: string;
  user_id?: string;
  thread_id?: string;
  max_steps?: number;
}

export interface ChatAgentResponse {
  request_id: string;
  board_id: string;
  question: string;
  status: AiAgentStatus;
  answer: string;
  citations: Citation[];
  referenced_cards: ReferencedCard[];
  execution_steps?: string[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  status?: AiAgentStatus;
  citations?: Citation[];
  referencedCards?: ReferencedCard[];
  executionSteps?: string[];
}
