import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DocumentDropzone } from "../DocumentDropzone";

describe("DocumentDropzone", () => {
  it("renders upload prompt and file format guidance", () => {
    render(<DocumentDropzone onUpload={vi.fn()} isUploading={false} progress={0} />);
    expect(screen.getByText(/Drag and drop project documents/i)).toBeDefined();
    expect(screen.getByText(/PDF, DOCX, TXT, MD up to 15MB/i)).toBeDefined();
  });

  it("handles file selection via file input", () => {
    const onUpload = vi.fn();
    render(<DocumentDropzone onUpload={onUpload} isUploading={false} progress={0} />);
    const file = new File(["dummy content"], "spec.pdf", { type: "application/pdf" });
    const input = screen.getByLabelText(/Upload document/i) as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });
    expect(onUpload).toHaveBeenCalledWith(file);
  });

  it("shows uploading progress indicator when isUploading is true", () => {
    render(<DocumentDropzone onUpload={vi.fn()} isUploading={true} progress={45} />);
    expect(screen.getByText(/Uploading and queueing for ingestion... 45%/i)).toBeDefined();
  });
});
