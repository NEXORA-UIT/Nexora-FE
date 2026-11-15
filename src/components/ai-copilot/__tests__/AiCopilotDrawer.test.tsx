import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AiCopilotDrawer } from "../AiCopilotDrawer";
import { useAiCopilotStore } from "@/stores/ai-copilot.store";
import { ROUTES } from "@/constants/routes";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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
    expect(screen.getByText(/Xin chào|Hello/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Ask AI Copilot|Hỏi AI Copilot/i)).toBeDefined();
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

    const closeBtn = screen.getByRole("button", { name: /Close|Đóng/i });
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

    const input = screen.getByPlaceholderText(/Ask AI Copilot|Hỏi AI Copilot/i);
    fireEvent.change(input, { target: { value: "Summarize progress" } });

    const sendBtn = screen.getByRole("button", { name: /Send|Gửi/i });
    fireEvent.click(sendBtn);

    expect(sendMessageSpy).toHaveBeenCalledWith("Summarize progress", "b-1");
  });

  it("navigates to ROUTES.AI_ASSISTANT when maximize button is clicked", () => {
    render(
      <MemoryRouter>
        <AiCopilotDrawer boardId="b-1" onSelectCard={vi.fn()} />
      </MemoryRouter>
    );

    const expandBtn = screen.getByRole("button", { name: /Open full page|Mở toàn màn hình/i });
    fireEvent.click(expandBtn);
    expect(mockNavigate).toHaveBeenCalledWith(`${ROUTES.AI_ASSISTANT}?boardId=b-1`);
  });
});
