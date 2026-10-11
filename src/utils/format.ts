/**
 * Pure formatting utilities for displaying data units and metrics in the UI.
 */

/**
 * Formats file size in bytes to a human-readable string (e.g. 1.5 MB, 320 KB, 500 B).
 * Returns string inputs as-is for backward compatibility.
 */
export function formatFileSize(bytes: number | string): string {
  if (typeof bytes === "string") return bytes;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
