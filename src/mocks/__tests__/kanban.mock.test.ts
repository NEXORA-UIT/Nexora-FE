import { describe, it, expect } from "vitest";
import { MOCK_BOARD_DETAIL } from "../data/kanban.mock";

describe("Kanban Mock Detail & Task Entities", () => {
  it("enriches card-101 (NEX-101) with consistent happy-path data", () => {
    const todoList = MOCK_BOARD_DETAIL.lists.find((l) => l.id === "col-todo");
    const card101 = todoList?.cards.find((c) => c.id === "card-101");

    expect(card101).toBeDefined();
    // Prerequisite NEX-107 is complete, so card-101 must NOT be blocked
    expect(card101?.isBlocked).toBeFalsy();

    // Checklist
    expect(card101?.checklist).toHaveLength(2);
    expect(card101?.checklist?.[0].title).toBe("Draft quotes");
    expect(card101?.checklist?.[0].isCompleted).toBe(true);
    expect(card101?.checklist?.[1].title).toBe("Legal review");
    expect(card101?.checklist?.[1].isCompleted).toBe(false);

    // Dependencies
    expect(card101?.dependencies).toBeDefined();
    expect(card101?.dependencies?.[0].prerequisiteCode).toBe("NEX-107");
    expect(card101?.dependencies?.[0].isCompleted).toBe(true);

    // Attachments
    expect(card101?.attachments).toHaveLength(2);
    expect(card101?.attachments?.[0].fileName).toBe("copydeck_v2.docx");

    // Comments
    expect(card101?.comments?.length).toBeGreaterThanOrEqual(2);
  });

  it("marks card-103 (NEX-103) as blocked with incomplete prerequisite", () => {
    const todoList = MOCK_BOARD_DETAIL.lists.find((l) => l.id === "col-todo");
    const card103 = todoList?.cards.find((c) => c.id === "card-103");

    expect(card103).toBeDefined();
    expect(card103?.isBlocked).toBe(true);
    expect(card103?.blockReason).toContain("NEX-102");
    expect(card103?.dependencies?.[0].prerequisiteCode).toBe("NEX-102");
    expect(card103?.dependencies?.[0].isCompleted).toBe(false);
  });
});
