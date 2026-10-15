import * as React from "react";
import { Calendar, Clock } from "lucide-react";
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
  const handleDateChange = async (field: "startDate" | "dueDate", value: string) => {
    const isoVal = value ? new Date(value).toISOString() : null;
    await onUpdate({
      [field]: isoVal,
      updatedAt: cardUpdatedAt,
    });
  };

  return (
    <>
      {/* START DATE */}
      <div className="flex items-center">
        <span className="flex w-24 items-center gap-1.5 font-medium text-neutral-500">
          <Calendar className="h-3.5 w-3.5" />
          <span>Start date</span>
        </span>
        <label className="relative inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-neutral-200/80 bg-white px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50">
          <span>{formatDisplayDate(startDate)}</span>
          <input
            type="date"
            aria-label="Start date"
            value={toInputDateValue(startDate)}
            onChange={(e) => void handleDateChange("startDate", e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>
      </div>

      {/* DUE DATE */}
      <div className="flex items-center">
        <span className="flex w-24 items-center gap-1.5 font-medium text-neutral-500">
          <Clock className="h-3.5 w-3.5" />
          <span>Due date</span>
        </span>
        <label className="relative inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-neutral-200/80 bg-white px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50">
          <span>{formatDisplayDate(dueDate)}</span>
          <input
            type="date"
            aria-label="Due date"
            value={toInputDateValue(dueDate)}
            onChange={(e) => void handleDateChange("dueDate", e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>
      </div>
    </>
  );
};
