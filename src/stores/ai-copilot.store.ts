import { create } from "zustand";
import { aiApi } from "@/apis/ai.api";
import type { ChatMessage, ChatAgentResponse } from "@/types";

export interface AiCopilotStoreState {
  isOpen: boolean;
  activeBoardId: string | null;
  threads: Record<string, ChatMessage[]>;
  isThinking: boolean;
  thinkingStep: string | null;
  error: string | null;

  // Actions
  openDrawer: (boardId?: string) => void;
  closeDrawer: () => void;
  toggleDrawer: (boardId?: string) => void;
  setActiveBoardId: (boardId: string) => void;
  sendMessage: (question: string, boardId?: string) => Promise<void>;
  clearThread: (boardId?: string) => void;
  getMessages: (boardId?: string) => ChatMessage[];
}

export const useAiCopilotStore = create<AiCopilotStoreState>((set, get) => ({
  isOpen: false,
  activeBoardId: null,
  threads: {},
  isThinking: false,
  thinkingStep: null,
  error: null,

  openDrawer: (boardId) => {
    set((state) => ({
      isOpen: true,
      activeBoardId: boardId || state.activeBoardId,
    }));
  },

  closeDrawer: () => {
    set({ isOpen: false });
  },

  toggleDrawer: (boardId) => {
    set((state) => ({
      isOpen: !state.isOpen,
      activeBoardId: boardId || state.activeBoardId,
    }));
  },

  setActiveBoardId: (boardId) => {
    set({ activeBoardId: boardId });
  },

  getMessages: (boardId) => {
    const targetBoardId = boardId || get().activeBoardId;
    if (!targetBoardId) return [];
    return get().threads[targetBoardId] || [];
  },

  clearThread: (boardId) => {
    const targetBoardId = boardId || get().activeBoardId;
    if (!targetBoardId) return;

    set((state) => ({
      threads: {
        ...state.threads,
        [targetBoardId]: [],
      },
      error: null,
    }));
  },

  sendMessage: async (question: string, boardId?: string) => {
    const targetBoardId = boardId || get().activeBoardId;
    if (!targetBoardId || !question.trim()) return;

    const trimmedQuestion = question.trim();
    const userMsgId = `user-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: trimmedQuestion,
      timestamp,
    };

    // Optimistically append user message and start thinking
    set((state) => {
      const currentThread = state.threads[targetBoardId] || [];
      return {
        threads: {
          ...state.threads,
          [targetBoardId]: [...currentThread, userMessage],
        },
        isThinking: true,
        thinkingStep: "Đang phân tích câu hỏi...",
        error: null,
      };
    });

    let stepTimer: ReturnType<typeof setTimeout> | undefined;

    try {
      // Dynamic thinking steps simulation if taking more than 500ms
      stepTimer = setTimeout(() => {
        if (get().isThinking) {
          set({ thinkingStep: "Đang tra cứu dữ liệu bảng..." });
        }
      }, 500);

      const response: ChatAgentResponse = await aiApi.chat({
        question: trimmedQuestion,
        board_id: targetBoardId,
      });

      clearTimeout(stepTimer);

      const assistantMessage: ChatMessage = {
        id: response.request_id || `asst-${Date.now()}`,
        sender: "assistant",
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: response.status,
        citations: response.citations || [],
        referencedCards: response.referenced_cards || [],
        executionSteps: response.execution_steps || [],
      };

      set((state) => {
        const currentThread = state.threads[targetBoardId] || [];
        return {
          threads: {
            ...state.threads,
            [targetBoardId]: [...currentThread, assistantMessage],
          },
          isThinking: false,
          thinkingStep: null,
          error: null,
        };
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Đã xảy ra lỗi khi kết nối tới AI Service.";

      const errorAssistantMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "assistant",
        text: "Xin lỗi, đã xảy ra lỗi trong quá trình xử lý yêu cầu. Vui lòng thử lại sau.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "error",
      };

      set((state) => {
        const currentThread = state.threads[targetBoardId] || [];
        return {
          threads: {
            ...state.threads,
            [targetBoardId]: [...currentThread, errorAssistantMsg],
          },
          isThinking: false,
          thinkingStep: null,
          error: errorMessage,
        };
      });
    } finally {
      if (stepTimer) clearTimeout(stepTimer);
    }
  },
}));
