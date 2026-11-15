import * as React from "react";
import { CheckCircle2, Clock, Loader2, AlertTriangle } from "lucide-react";
import type { DocumentStatus } from "@/types/knowledge-base";

export interface DocumentStatusBadgeProps {
  status: DocumentStatus;
  className?: string;
}

export const DocumentStatusBadge: React.FC<DocumentStatusBadgeProps> = ({ status, className = "" }) => {
  switch (status) {
    case "READY":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/80 ${className}`}
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          <span>READY</span>
        </span>
      );
    case "PROCESSING":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200/80 ${className}`}
        >
          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
          <span>PROCESSING</span>
        </span>
      );
    case "PENDING":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200/80 ${className}`}
        >
          <Clock className="h-3.5 w-3.5 text-amber-600" />
          <span>PENDING</span>
        </span>
      );
    case "FAILED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200/80 ${className}`}
        >
          <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
          <span>FAILED</span>
        </span>
      );
    default:
      return null;
  }
};
