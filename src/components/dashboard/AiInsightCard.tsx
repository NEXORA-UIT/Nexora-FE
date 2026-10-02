import * as React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, MessageSquare } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export const AiInsightCard: React.FC = () => {
  return (
    <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs sm:p-6">
      {/* Header: Title, Contextual Badge & View Link */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary-600" />
          <h2 className="text-sm font-semibold text-neutral-900">Project Assistant</h2>
          <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
            Assistant
          </span>
        </div>

        <Link
          to={ROUTES.UNDER_DEVELOPMENT}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-colors"
        >
          <span>View</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Insight Summary */}
      <p className="mt-3 text-xs leading-relaxed text-neutral-600">
        3 tasks are approaching deadlines this week. Task{" "}
        <span className="font-semibold text-neutral-800">
          "API schema validation"
        </span>{" "}
        has an upstream dependency with Clara Chen that is currently pending
        review.
      </p>

      {/* Sources Tag Pills */}
      <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="text-neutral-400 font-medium">Sources:</span>
        <span className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-neutral-600">
          Core Platform
        </span>
        <span className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-neutral-600">
          Task #104
        </span>
        <span className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-neutral-600">
          Project_Brief.pdf
        </span>
      </div>

      {/* Footer Ask Link */}
      <div className="mt-4 border-t border-neutral-100 pt-3">
        <Link
          to={ROUTES.UNDER_DEVELOPMENT}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <MessageSquare className="h-3.5 w-3.5 text-neutral-400" />
          <span>Ask about project documents</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
};
