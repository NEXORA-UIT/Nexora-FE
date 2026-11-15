import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AiCopilotDrawer } from "../AiCopilotDrawer";
import { useAiCopilotStore } from "@/stores/ai-copilot.store";

describe("AiCopilotDrawer", () => {
  beforeEach(() => {
    useAiCopilotStore.setState({
      isOpen: true,
      activeBoardId: "b-1",
      threads: {
        "b-1": [
          {
            id: "m-1",
            sender: "assistant",
            text: "Xin chào! Tôi có thể giúp gì cho bảng này?",
            timestamp: "10:00",
            citations: [],
            referencedCards: [
              { label: "[C1]", card_id: "c-1", title: "Thẻ đầu tiên" }
            ],
          },
        ],
      },
      isThinking: false,
      thinkingStep: null,
      error: null,
    });
    vi.clearAllMocks();
  });

  it("renders when open and displays messages and input", () => {
    render(
      <MemoryRouter>
        <AiCopilotDrawer boardId="b-1" onSelectCard={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText(/AI Copilot/i)).toBeDefined();
    expect(screen.getByText(/Xin chào! Tôi có thể giúp gì cho bảng này\?/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Hỏi AI Copilot/i)).toBeDefined();
    expect(screen.getByText("Thẻ đầu tiên")).toBeDefined();
  });

  it("calls onSelectCard when card chip in message is clicked", () => {
    const onSelectCard = vi.fn();
    render(
      <MemoryRouter>
        <AiCopilotDrawer boardId="b-1" onSelectCard={onSelectCard} />
      </MemoryRouter>
    );

    const cardChip = screen.getByText("Thẻ đầu tiên");
    fireEvent.click(cardChip);
    expect(onSelectCard).toHaveBeenCalledWith("c-1");
  });

  it("closes drawer when close button is clicked", () => {
    render(
      <MemoryRouter>
        <AiCopilotDrawer boardId="b-1" onSelectCard={vi.fn()} />
      </MemoryRouter>
    );

    const closeBtn = screen.getByRole("button", { name: /Đóng/i });
    fireEvent.click(closeBtn);
    expect(useAiCopilotStore.getState().isOpen).toBe(false);
  });

  it("submits message when send button is clicked", () => {
    const sendMessageSpy = vi.spyOn(useAiCopilotStore.getState(), "sendMessage");

    render(
      <MemoryRouter>
        <AiCopilotDrawer boardId="b-1" onSelectCard={vi.fn()} />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/Hỏi AI Copilot/i);
    fireEvent.change(input, { target: { value: "Tóm tắt tiến độ" } });

    const sendBtn = screen.getByRole("button", { name: /Gửi/i });
    fireEvent.click(sendBtn);

    expect(sendMessageSpy).toHaveBeenCalledWith("Tóm tắt tiến độ", "b-1");
  });
});
