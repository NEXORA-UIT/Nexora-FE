import { describe, it, expect } from "vitest";
import {
  formatDisplayDate,
  toInputDateValue,
  formatCardDueDate,
  formatActivityTimestamp,
} from "../date";
import {
  formatDisplayDate as formatDisplayDateFromIndex,
  toInputDateValue as toInputDateValueFromIndex,
  formatCardDueDate as formatCardDueDateFromIndex,
  formatActivityTimestamp as formatActivityTimestampFromIndex,
} from "../index";

describe("Date Utilities Suite", () => {
  describe("formatDisplayDate", () => {
    it("formats valid ISO dates into 'MMM d, yyyy'", () => {
      expect(formatDisplayDate("2026-09-05T10:00:00Z")).toBe("Sep 5, 2026");
      expect(formatDisplayDate("2026-12-25T00:00:00.000Z")).toBe("Dec 25, 2026");
    });

    it("returns default fallback 'Set date' when given null, undefined, or empty string", () => {
      expect(formatDisplayDate(null)).toBe("Set date");
      expect(formatDisplayDate(undefined)).toBe("Set date");
      expect(formatDisplayDate("")).toBe("Set date");
    });

    it("returns custom fallback if provided", () => {
      expect(formatDisplayDate(null, "No date")).toBe("No date");
      expect(formatDisplayDate(undefined, "Pick date")).toBe("Pick date");
      expect(formatDisplayDate("", "-")).toBe("-");
    });

    it("returns raw string if parsing fails", () => {
      expect(formatDisplayDate("invalid-date-string")).toBe("invalid-date-string");
    });
  });

  describe("toInputDateValue", () => {
    it("formats valid ISO date into HTML date input value 'yyyy-MM-dd'", () => {
      expect(toInputDateValue("2026-09-05T14:30:00Z")).toBe("2026-09-05");
      expect(toInputDateValue("2026-01-01T00:00:00.000Z")).toBe("2026-01-01");
    });

    it("returns empty string when input is null, undefined, or empty", () => {
      expect(toInputDateValue(null)).toBe("");
      expect(toInputDateValue(undefined)).toBe("");
      expect(toInputDateValue("")).toBe("");
    });

    it("returns empty string when input cannot be parsed", () => {
      expect(toInputDateValue("invalid-date")).toBe("");
    });
  });

  describe("formatCardDueDate", () => {
    it("formats valid ISO dates into compact badge label 'MMM dd'", () => {
      expect(formatCardDueDate("2026-09-05T08:00:00Z")).toBe("Sep 05");
      expect(formatCardDueDate("2026-11-20T08:00:00Z")).toBe("Nov 20");
    });

    it("returns null when input is null, undefined, or empty", () => {
      expect(formatCardDueDate(null)).toBeNull();
      expect(formatCardDueDate(undefined)).toBeNull();
      expect(formatCardDueDate("")).toBeNull();
    });

    it("returns null when input cannot be parsed", () => {
      expect(formatCardDueDate("invalid-date")).toBeNull();
    });
  });

  describe("formatActivityTimestamp", () => {
    it("formats valid ISO date into 'MMM d, h:mm a'", () => {
      // 2026-09-05 at 14:30 UTC
      const result = formatActivityTimestamp("2026-09-05T14:30:00Z");
      // Since local timezone affects hours, verify format structure
      expect(result).toMatch(/^[A-Z][a-z]{2} \d{1,2}, \d{1,2}:\d{2} (AM|PM)$/);
    });

    it("returns raw string on parsing failure", () => {
      expect(formatActivityTimestamp("not-a-date")).toBe("not-a-date");
    });
  });

  describe("Barrel export parity", () => {
    it("exports all date utilities via src/utils/index.ts", () => {
      expect(formatDisplayDateFromIndex).toBe(formatDisplayDate);
      expect(toInputDateValueFromIndex).toBe(toInputDateValue);
      expect(formatCardDueDateFromIndex).toBe(formatCardDueDate);
      expect(formatActivityTimestampFromIndex).toBe(formatActivityTimestamp);
    });
  });
});
