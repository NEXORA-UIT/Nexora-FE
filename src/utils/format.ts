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

/**
 * Computes uppercase member initials from full name or email.
 * - Multi-word names: First characters of the first two words (e.g. "Phan Gia Dat" -> "PG", "Alice PM" -> "AP")
 * - Single-word names: First character (e.g. "Alice" -> "A", "dev@nexora.app" -> "D")
 * - Empty / falsy names: Fallback string (defaults to "U")
 */
export function generateMemberInitials(
  name?: string | null,
  fallback = "U"
): string {
  if (!name) return fallback;
  const trimmed = name.trim();
  if (!trimmed) return fallback;
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length > 1) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return fallback;
}
