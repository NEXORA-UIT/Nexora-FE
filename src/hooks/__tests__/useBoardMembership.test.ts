import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/apis/client";
import { boardApi } from "@/apis/board.api";
import { workspaceApi } from "@/apis/workspace.api";
import { useBoardMembership } from "../useBoardMembership";
import type { BoardMember } from "@/types";

const member: BoardMember = {
  id: "member-1",
  name: "Member One",
  initials: "MO",
  role: "MEMBER",
};

describe("useBoardMembership", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(workspaceApi, "listWorkspaceMembers").mockResolvedValue({ items: [] });
  });

  it("clears Board members after access is revoked", async () => {
    vi.spyOn(boardApi, "getBoardMembers")
      .mockResolvedValueOnce([member])
      .mockRejectedValueOnce(new ApiError("Forbidden", "BOARD_FORBIDDEN", 403));

    const { result } = renderHook(() => useBoardMembership("board-1", "workspace-1"));
    await waitFor(() => expect(result.current.members).toHaveLength(1));
    await act(async () => result.current.refresh());

    expect(result.current.members).toEqual([]);
    expect(result.current.workspaceMembers).toEqual([]);
  });

  it("ignores an old Board member response after navigating to another Board", async () => {
    let resolveOldRequest!: (members: BoardMember[]) => void;
    vi.spyOn(boardApi, "getBoardMembers").mockImplementation((boardId) =>
      boardId === "board-1"
        ? new Promise((resolve) => {
            resolveOldRequest = resolve;
          })
        : Promise.resolve([{ ...member, id: "member-2" }])
    );

    const { result, rerender } = renderHook(
      ({ boardId }) => useBoardMembership(boardId, "workspace-1"),
      { initialProps: { boardId: "board-1" } }
    );
    rerender({ boardId: "board-2" });
    await waitFor(() => expect(result.current.members[0]?.id).toBe("member-2"));

    await act(async () => resolveOldRequest([member]));
    expect(result.current.members[0]?.id).toBe("member-2");
  });
});
