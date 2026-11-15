import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SemanticSearchBox } from "../SemanticSearchBox";
import { SemanticAnswerCard } from "../SemanticAnswerCard";
import type { RAGAnswer } from "@/types/knowledge-base";

describe("SemanticSearchBox & SemanticAnswerCard", () => {
  it("submits search question on button click", () => {
    const onSearch = vi.fn();
    render(<SemanticSearchBox onSearch={onSearch} isLoading={false} />);
    const input = screen.getByPlaceholderText(/Ask any question against your project knowledge/i);
    fireEvent.change(input, { target: { value: "What is the sprint deadline?" } });
    fireEvent.click(screen.getByRole("button", { name: /Ask RAG/i }));
    expect(onSearch).toHaveBeenCalledWith("What is the sprint deadline?");
  });

  it("renders synthesized answer and citations list", () => {
    const mockAnswer: RAGAnswer = {
      question: "What is the sprint deadline?",
      boardId: "b-1",
      answer: "The sprint deadline is November 20.",
      refused: false,
      citations: [
        {
          chunkId: "c-1",
          documentId: "d-1",
          fileName: "Sprint_Plan.pdf",
          pageNumber: 3,
          snippet: "Sprint closes on November 20 with final QA.",
        },
      ],
    };
    render(<SemanticAnswerCard answer={mockAnswer} onClear={vi.fn()} onContinueInChat={vi.fn()} />);
    expect(screen.getByText("The sprint deadline is November 20.")).toBeDefined();
    expect(screen.getByText(/Sprint_Plan\.pdf/i)).toBeDefined();
    expect(screen.getByText(/Page 3/i)).toBeDefined();
  });
});
