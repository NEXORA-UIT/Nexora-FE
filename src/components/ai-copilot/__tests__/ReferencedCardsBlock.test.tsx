import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ReferencedCardsBlock } from "../ReferencedCardsBlock";
import { CitationsBlock } from "../CitationsBlock";
import { InlineCardBadge } from "../InlineCardBadge";

describe("ReferencedCardsBlock", () => {
  it("renders card chips and triggers onSelectCard when clicked", () => {
    const onSelectCard = vi.fn();
    const cards = [
      { label: "[C1]", card_id: "card-uuid-1", title: "Setup Dockerfile" },
      { label: "[C2]", card_id: "card-uuid-2", title: "Setup Postgres" },
    ];

    render(<ReferencedCardsBlock cards={cards} onSelectCard={onSelectCard} />);

    expect(screen.getByText(/REFERENCED CARDS/i)).toBeDefined();
    expect(screen.getByText("Setup Dockerfile")).toBeDefined();
    expect(screen.getByText("[C1]")).toBeDefined();

    fireEvent.click(screen.getByText("Setup Dockerfile"));
    expect(onSelectCard).toHaveBeenCalledWith("card-uuid-1");
  });

  it("returns null if cards array is empty", () => {
    const { container } = render(<ReferencedCardsBlock cards={[]} onSelectCard={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });
});

describe("CitationsBlock", () => {
  it("renders citation items with source title and snippet", () => {
    const citations = [
      {
        chunk_id: "chk-1",
        source_title: "Sprint Planning Doc",
        page: 2,
        snippet: "Mục tiêu sprint này là hoàn thành AI integration.",
      },
    ];

    render(<CitationsBlock citations={citations} />);

    expect(screen.getByText(/Trích dẫn tài liệu/i)).toBeDefined();
    expect(screen.getByText("Sprint Planning Doc")).toBeDefined();
    expect(screen.getByText(/Mục tiêu sprint này là hoàn thành AI integration/i)).toBeDefined();
  });

  it("returns null if citations array is empty", () => {
    const { container } = render(<CitationsBlock citations={[]} />);
    expect(container.firstChild).toBeNull();
  });
});

describe("InlineCardBadge", () => {
  it("renders label and fires onSelectCard on click", () => {
    const onSelectCard = vi.fn();
    render(
      <InlineCardBadge
        label="[C1]"
        cardId="card-uuid-1"
        title="Setup Dockerfile"
        onSelectCard={onSelectCard}
      />
    );

    const badge = screen.getByRole("button", { name: /\[C1\] Setup Dockerfile/i });
    expect(badge).toBeDefined();
    fireEvent.click(badge);
    expect(onSelectCard).toHaveBeenCalledWith("card-uuid-1");
  });
});
