import * as React from "react";
import { Sparkles, Copy, Check, MessageSquareShare, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { CitationsList } from "./CitationsList";
import type { RAGAnswer } from "@/types/knowledge-base";

export interface SemanticAnswerCardProps {
  answer: RAGAnswer;
  onClear: () => void;
  onContinueInChat?: (question: string) => void;
}

export const SemanticAnswerCard: React.FC<SemanticAnswerCardProps> = ({
  answer,
  onClear,
  onContinueInChat,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(answer.answer);
      setCopied(true);
      toast.success("Answer copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy answer.");
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-200/80 bg-gradient-to-b from-blue-50/40 via-white to-white p-5 shadow-sm space-y-3.5">
      {/* Header with question and controls */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">
              Grounded AI Answer
            </span>
            <p className="text-xs font-semibold text-neutral-800 line-clamp-1">
              Q: “{answer.question}”
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            title="Copy answer"
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onClear}
            title="Dismiss"
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Answer Body */}
      {answer.refused ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>
            {answer.answer ||
              "Insufficient evidence found in the current documents to reliably answer this question."}
          </span>
        </div>
      ) : (
        <div className="text-xs sm:text-sm leading-relaxed text-neutral-800 whitespace-pre-wrap">
          {answer.answer}
        </div>
      )}

      {/* Source Citations */}
      <CitationsList citations={answer.citations} />

      {/* Footer Actions */}
      {onContinueInChat && (
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => onContinueInChat(answer.question)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-2xs hover:bg-blue-50 transition-colors"
          >
            <MessageSquareShare className="h-3.5 w-3.5" />
            <span>Continue in AI Copilot</span>
          </button>
        </div>
      )}
    </div>
  );
};
