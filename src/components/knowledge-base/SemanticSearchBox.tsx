import * as React from "react";
import { Sparkles, ArrowRight, Loader2, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SemanticSearchBoxProps {
  onSearch: (question: string) => void | Promise<void>;
  isLoading?: boolean;
  className?: string;
}

const SUGGESTED_QUERIES = [
  "What are the sprint goals?",
  "Security & authentication requirements",
  "API architecture specifications",
];

export const SemanticSearchBox: React.FC<SemanticSearchBoxProps> = ({
  onSearch,
  isLoading = false,
  className = "",
}) => {
  const [question, setQuestion] = React.useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim() || isLoading) return;
    onSearch(question.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-3.5 flex items-center pointer-events-none text-primary-500">
          <Sparkles className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Ask any question against your project knowledge (RAG)..."
          className="h-11 w-full rounded-2xl border border-neutral-200/90 bg-white pl-10 pr-28 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 shadow-2xs focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <div className="absolute right-2">
          <Button
            type="submit"
            size="sm"
            disabled={!question.trim() || isLoading}
            className="h-8 gap-1.5 rounded-xl bg-primary-600 px-3 text-xs font-semibold text-white shadow-2xs hover:bg-primary-700"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <span>Ask RAG</span>
                <ArrowRight className="h-3 w-3" />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Quick query pills */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500 pl-1">
        <span className="flex items-center gap-1 text-[11px] font-medium text-neutral-400 shrink-0">
          <Lightbulb className="h-3 w-3 text-amber-500" />
          <span>Try:</span>
        </span>
        {SUGGESTED_QUERIES.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => {
              setQuestion(suggestion);
              onSearch(suggestion);
            }}
            disabled={isLoading}
            className="rounded-lg border border-neutral-200/60 bg-white px-2 py-0.5 text-[11px] font-medium text-neutral-600 hover:border-primary-300 hover:bg-primary-50/50 hover:text-primary-700 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};
