import { describe, it, expect, vi, beforeEach } from "vitest";
import { aiApi, aiClient } from "../ai.api";

describe("aiApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends chat request and returns parsed response", async () => {
    const mockResponse = {
      data: {
        request_id: "req-1",
        board_id: "b-1",
        question: "Tóm tắt bảng",
        status: "answered",
        answer: "Board có 5 task.",
        citations: [],
        referenced_cards: [
          { label: "[C1]", card_id: "c-1", title: "Task 1" }
        ],
      },
    };

    const postSpy = vi.spyOn(aiClient, "post").mockResolvedValueOnce(mockResponse);

    const result = await aiApi.chat({
      question: "Tóm tắt bảng",
      board_id: "b-1",
    });

    expect(result.status).toBe("answered");
    expect(result.referenced_cards).toHaveLength(1);
    expect(result.referenced_cards[0].label).toBe("[C1]");
    expect(result.referenced_cards[0].title).toBe("Task 1");
    expect(postSpy).toHaveBeenCalledWith("/v1/agent/chat", {
      question: "Tóm tắt bảng",
      board_id: "b-1",
    });
  });
});
