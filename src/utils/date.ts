import { format, parseISO } from "date-fns";

/**
 * Pure date formatting utilities for the Nexora frontend.
 * All functions accept ISO 8601 strings (as stored in backend DTOs).
 * Invalid or missing dates are handled gracefully — callers receive a safe fallback.
 */

/**
 * Formats an ISO date string for display in card metadata fields.
 * Output: "Sep 5, 2026"
 * Returns the fallback string when the input is falsy or unparseable.
 *
 * Used by: CardDetailMetadata.tsx (date display labels)
 */
export function formatDisplayDate(
  isoString: string | null | undefined,
  fallback = "Set date"
): string {
  if (!isoString) return fallback;
  try {
    return format(parseISO(isoString), "MMM d, yyyy");
  } catch {
    return isoString;
  }
}

/**
 * Converts an ISO date string to the HTML date-input value format "yyyy-MM-dd".
 * Returns an empty string when the input is falsy or unparseable.
 *
 * Used by: CardDetailMetadata.tsx (date picker <input type="date"> value)
 */
export function toInputDateValue(isoString: string | null | undefined): string {
  if (!isoString) return "";
  try {
    return format(parseISO(isoString), "yyyy-MM-dd");
  } catch {
    return "";
  }
}

/**
 * Formats an ISO date string as a compact badge label on Kanban cards.
 * Output: "Sep 05"
 * Returns null when the input is falsy or unparseable so callers can hide the badge.
 *
 * Used by: KanbanCard.tsx (due-date chip)
 */
export function formatCardDueDate(
  isoString: string | null | undefined
): string | null {
  if (!isoString) return null;
  try {
    return format(parseISO(isoString), "MMM dd");
  } catch {
    return null;
  }
}

/**
 * Formats an ISO date string as a timestamped activity log label.
 * Output: "Sep 5, 2:30 PM"
 * Returns the raw string on parse failure to avoid swallowing diagnostic data.
 *
 * Used by: CardDetailActivity.tsx (comment and activity timestamps)
 */
export function formatActivityTimestamp(isoString: string): string {
  try {
    return format(parseISO(isoString), "MMM d, h:mm a");
  } catch {
    return isoString;
  }
}
