import { describe, it, expect } from "vitest";
import { formatFileSize } from "../format";
import { formatFileSize as formatFileSizeFromIndex } from "../index";
import { formatFileSize as formatFileSizeFromMapper } from "@/mappers/card.mapper";

describe("formatFileSize Utility Suite (F-018)", () => {
  it("formats zero bytes correctly", () => {
    expect(formatFileSize(0)).toBe("0 B");
  });

  it("formats small byte values below 1 KB", () => {
    expect(formatFileSize(1)).toBe("1 B");
    expect(formatFileSize(500)).toBe("500 B");
    expect(formatFileSize(1023)).toBe("1023 B");
  });

  it("formats kilobyte values at and above 1024 bytes", () => {
    expect(formatFileSize(1024)).toBe("1.0 KB");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(2048)).toBe("2.0 KB");
    expect(formatFileSize(1024 * 100)).toBe("100.0 KB");
  });

  it("formats megabyte values at and above 1 MB", () => {
    expect(formatFileSize(1024 * 1024)).toBe("1.0 MB");
    expect(formatFileSize(1024 * 1024 * 2.5)).toBe("2.5 MB");
    expect(formatFileSize(1024 * 1024 * 10.25)).toBe("10.3 MB");
  });

  it("returns string inputs as-is for backward compatibility", () => {
    expect(formatFileSize("1.5 MB")).toBe("1.5 MB");
    expect(formatFileSize("320 KB")).toBe("320 KB");
    expect(formatFileSize("")).toBe("");
  });

  it("maintains identical exports via utils/index and mappers/card.mapper re-exports", () => {
    expect(formatFileSizeFromIndex).toBe(formatFileSize);
    expect(formatFileSizeFromMapper).toBe(formatFileSize);
    expect(formatFileSizeFromIndex(2048)).toBe("2.0 KB");
    expect(formatFileSizeFromMapper(2048)).toBe("2.0 KB");
  });
});
