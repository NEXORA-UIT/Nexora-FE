import * as React from "react";
import { Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import { formatDisplayDate, toInputDateValue } from "@/utils/date";
import type { UpdateCardInput } from "@/types";

export interface CardDateFieldsProps {
  startDate?: string | null;
  dueDate?: string | null;
  cardUpdatedAt: string;
  onUpdate: (payload: UpdateCardInput) => Promise<void>;
}

export const CardDateFields: React.FC<CardDateFieldsProps> = ({
  startDate,
  dueDate,
  cardUpdatedAt,
  onUpdate,
}) => {
  const startDateInputRef = React.useRef<HTMLInputElement>(null);
  const dueDateInputRef = React.useRef<HTMLInputElement>(null);

  const handleDateChange = async (field: "startDate" | "dueDate", value: string) => {
    const isoVal = value ? new Date(value).toISOString() : null;

    if (field === "dueDate" && isoVal && startDate) {
      const selectedDueDate = new Date(isoVal);
      const existingStartDate = new Date(startDate);
      if (selectedDueDate < existingStartDate) {
        toast.error("Start date must be before or equal to due date.");
        return;
      }
    }

    if (field === "startDate" && isoVal && dueDate) {
      const selectedStartDate = new Date(isoVal);
      const existingDueDate = new Date(dueDate);
      if (selectedStartDate > existingDueDate) {
        toast.error("Start date must be before or equal to due date.");
        return;
      }
    }

    await onUpdate({
      [field]: isoVal,
      updatedAt: cardUpdatedAt,
    });
  };

  const handleOpenPicker = (inputRef: React.RefObject<HTMLInputElement | null>) => {
    try {
      inputRef.current?.showPicker();
    } catch {
      inputRef.current?.focus();
    }
  };

  return (
    <>
      {/* START DATE */}
      <div className="flex items-center">
        <span className="flex w-24 items-center gap-1.5 font-medium text-neutral-500">
          <Calendar className="h-3.5 w-3.5" />
          <span>Start date</span>
        </span>
        <button
          type="button"
          aria-label="Start date"
          onClick={() => handleOpenPicker(startDateInputRef)}
          className="relative inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-neutral-200/80 bg-white px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <span>{formatDisplayDate(startDate)}</span>
          <input
            ref={startDateInputRef}
            type="date"
            aria-hidden="true"
            tabIndex={-1}
            value={toInputDateValue(startDate)}
            onChange={(e) => void handleDateChange("startDate", e.target.value)}
            className="absolute inset-0 pointer-events-none opacity-0"
          />
        </button>
      </div>

      {/* DUE DATE */}
      <div className="flex items-center">
        <span className="flex w-24 items-center gap-1.5 font-medium text-neutral-500">
          <Clock className="h-3.5 w-3.5" />
          <span>Due date</span>
        </span>
        <button
          type="button"
          aria-label="Due date"
          onClick={() => handleOpenPicker(dueDateInputRef)}
          className="relative inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-neutral-200/80 bg-white px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <span>{formatDisplayDate(dueDate)}</span>
          <input
            ref={dueDateInputRef}
            type="date"
            aria-hidden="true"
            tabIndex={-1}
            value={toInputDateValue(dueDate)}
            onChange={(e) => void handleDateChange("dueDate", e.target.value)}
            className="absolute inset-0 pointer-events-none opacity-0"
          />
        </button>
      </div>
    </>
  );
};
