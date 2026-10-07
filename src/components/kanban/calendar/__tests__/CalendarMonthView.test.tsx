import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CalendarMonthView } from "../CalendarMonthView";
import { getCalendarMonthDays } from "../calendar.utils";

describe("CalendarMonthView", () => {
  it("renders 7 weekday headers from Mon to Sun in order", () => {
    const days = getCalendarMonthDays(new Date(2026, 8, 15), []);
    render(<CalendarMonthView days={days} onCardClick={vi.fn()} />);

    const headers = screen.getAllByRole("columnheader");
    expect(headers).toHaveLength(7);
    expect(headers[0].textContent).toBe("Mon");
    expect(headers[1].textContent).toBe("Tue");
    expect(headers[2].textContent).toBe("Wed");
    expect(headers[3].textContent).toBe("Thu");
    expect(headers[4].textContent).toBe("Fri");
    expect(headers[5].textContent).toBe("Sat");
    expect(headers[6].textContent).toBe("Sun");
  });
});
