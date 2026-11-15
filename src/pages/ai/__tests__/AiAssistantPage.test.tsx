import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AiAssistantPage } from "../AiAssistantPage";
import { useAiCopilotStore } from "@/stores/ai-copilot.store";
import { useWorkspaceStore } from "@/stores/workspace.store";

vi.mock("@/apis/ai.api", () => ({
  aiApi: {
    chat: vi.fn(),
  },
}));

vi.mock("@/apis/board.api", () => ({
  boardApi: {
    getBoards: vi.fn().mockResolvedValue([
      { id: "board-1", name: "Engineering Kanban" },
      { id: "board-2", name: "Marketing Sprint" },
    ]),
  },
}));

describe("AiAssistantPage", () => {
  beforeEach(() => {
    useWorkspaceStore.setState({
      workspaces: [
        {
          id: "ws-1",
          name: "Main Workspace",
          ownerId: "user-1",
          description: "",
          iconUrl: null,
          status: "ACTIVE",
          plan: "FREE",
          slug: "main-ws",
          createdAt: "",
          updatedAt: "",
          members: [],
        },
      ],
      activeWorkspaceId: "ws-1",
    });

    useAiCopilotStore.setState({
      isOpen: false,
      activeBoardId: "board-1",
      threads: {
        "board-1": [
          {
            id: "msg-1",
            sender: "assistant",
            text: "Chào bạn! Tôi là trợ lý AI.",
            timestamp: "10:30",
            citations: [],
            referencedCards: [],
          },
        ],
      },
      isThinking: false,
      thinkingStep: null,
      error: null,
    });

    vi.clearAllMocks();
  });

  it("renders full-page AI Assistant with board context header", () => {
    render(
      <MemoryRouter initialEntries={["/ai-assistant?boardId=board-1"]}>
        <AiAssistantPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/AI Assistant/i)).toBeDefined();
    expect(screen.getByText("Chào bạn! Tôi là trợ lý AI.")).toBeDefined();
    expect(screen.getByPlaceholderText(/Hỏi AI Copilot/i)).toBeDefined();
  });
});
