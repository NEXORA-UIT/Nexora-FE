import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DocumentTableRow } from "../DocumentTableRow";
import type { KnowledgeDocument } from "@/types/knowledge-base";

const mockDoc: KnowledgeDocument = {
  id: "doc-1",
  boardId: "b-1",
  fileName: "Architecture_Spec.pdf",
  fileExtension: "pdf",
  fileSize: 1048576, // 1 MB
  status: "READY",
  chunkCount: 18,
  uploadedBy: "John Doe",
  createdAt: "2026-11-15T08:00:00Z",
  updatedAt: "2026-11-15T08:02:00Z",
};

describe("DocumentTableRow", () => {
  it("renders document details, size, and READY status badge", () => {
    render(
      <table>
        <tbody>
          <DocumentTableRow document={mockDoc} onDelete={vi.fn()} onDownload={vi.fn()} />
        </tbody>
      </table>
    );
    expect(screen.getByText("Architecture_Spec.pdf")).toBeDefined();
    expect(screen.getByText("1.0 MB")).toBeDefined();
    expect(screen.getByText("READY")).toBeDefined();
    expect(screen.getByText(/18 chunks/i)).toBeDefined();
  });

  it("triggers onDelete when trash button is clicked", () => {
    const onDelete = vi.fn();
    render(
      <table>
        <tbody>
          <DocumentTableRow document={mockDoc} onDelete={onDelete} onDownload={vi.fn()} />
        </tbody>
      </table>
    );
    fireEvent.click(screen.getByLabelText(/Delete Architecture_Spec.pdf/i));
    expect(onDelete).toHaveBeenCalledWith("doc-1");
  });
});
