import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAiCopilotStore } from "../ai-copilot.store";
import { aiApi } from "@/apis/ai.api";

vi.mock("@/apis/ai.api", () => ({
  aiApi: {
    chat: vi.fn(),
  },
}));

describe("useAiCopilotStore", () => {
  beforeEach(() => {
    useAiCopilotStore.setState({
      isOpen: false,
      activeBoardId: null,
      threads: {},
      isThinking: false,
      thinkingStep: null,
      error: null,
    });
    vi.clearAllMocks();
  });

  it("toggles drawer and sets active board id", () => {
    const store = useAiCopilotStore.getState();
    store.openDrawer("board-123");
    expect(useAiCopilotStore.getState().isOpen).toBe(true);
    expect(useAiCopilotStore.getState().activeBoardId).toBe("board-123");

    store.closeDrawer();
    expect(useAiCopilotStore.getState().isOpen).toBe(false);
    // board id remains remembered
    expect(useAiCopilotStore.getState().activeBoardId).toBe("board-123");
  });

  it("sends user message and appends assistant reply with cards", async () => {
    vi.mocked(aiApi.chat).mockResolvedValueOnce({
      request_id: "req-1",
      board_id: "board-123",
      question: "Tóm tắt bảng",
      status: "answered",
      answer: "Board có 2 việc quá hạn.",
      citations: [],
      referenced_cards: [{ label: "[C1]", card_id: "c-1", title: "Task 1" }],
      execution_steps: ["fetch_cards"],
    });

    await useAiCopilotStore.getState().sendMessage("Tóm tắt bảng", "board-123");

    const messages = useAiCopilotStore.getState().getMessages("board-123");
    expect(messages).toHaveLength(2);
    expect(messages[0].sender).toBe("user");
    expect(messages[0].text).toBe("Tóm tắt bảng");
    expect(messages[1].sender).toBe("assistant");
    expect(messages[1].referencedCards).toHaveLength(1);
    expect(messages[1].referencedCards![0].label).toBe("[C1]");
    expect(useAiCopilotStore.getState().isThinking).toBe(false);
    expect(useAiCopilotStore.getState().error).toBeNull();
  });

  it("handles error during send message gracefully", async () => {
    vi.mocked(aiApi.chat).mockRejectedValueOnce(new Error("AI service unavailable"));

    await useAiCopilotStore.getState().sendMessage("Hello", "board-123");

    const messages = useAiCopilotStore.getState().getMessages("board-123");
    expect(messages).toHaveLength(2);
    expect(messages[1].sender).toBe("assistant");
    expect(messages[1].status).toBe("error");
    expect(useAiCopilotStore.getState().isThinking).toBe(false);
    expect(useAiCopilotStore.getState().error).toBeTruthy();
  });

  it("clears thread for specific board", () => {
    useAiCopilotStore.setState({
      threads: {
        "board-1": [
          { id: "m-1", sender: "user", text: "Hi", timestamp: "10:00" },
        ],
      },
    });

    useAiCopilotStore.getState().clearThread("board-1");
    expect(useAiCopilotStore.getState().getMessages("board-1")).toEqual([]);
  });
});
