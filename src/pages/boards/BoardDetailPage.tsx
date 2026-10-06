import * as React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export const BoardDetailPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();

  return (
    <div className="space-y-6">
      {/* Route-driven Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-500">
        <Link
          to={ROUTES.BOARDS}
          className="flex items-center gap-1 font-medium text-neutral-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Core Platform</span>
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
        <span className="font-semibold text-neutral-900">{boardId || "Board Detail"}</span>
      </nav>

      {/* Scaffold container */}
      <div className="rounded-2xl border border-neutral-200/90 bg-white p-12 text-center">
        <div className="flex justify-center mb-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
        </div>
        <h2 className="text-base font-bold text-neutral-900">Loading Kanban Canvas...</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Loading board {boardId}
        </p>
      </div>
    </div>
  );
};
