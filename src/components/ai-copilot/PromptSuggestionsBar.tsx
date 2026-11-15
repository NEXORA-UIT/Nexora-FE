import React from "react";
import { Sparkles, AlertCircle, Users, Search, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_PROMPT_SUGGESTION_ITEMS, type PromptSuggestionItem } from "@/constants/ai";

const getIcon = (iconName: PromptSuggestionItem["iconName"]) => {
  switch (iconName) {
    case "summary":
      return <BarChart3 className="w-3.5 h-3.5 text-blue-500" />;
    case "overdue":
      return <AlertCircle className="w-3.5 h-3.5 text-amber-500" />;
    case "workload":
      return <Users className="w-3.5 h-3.5 text-emerald-500" />;
    case "unassigned":
      return <Search className="w-3.5 h-3.5 text-purple-500" />;
  }
};

export interface PromptSuggestionsBarProps {
  onSelectPrompt: (prompt: string) => void;
  className?: string;
}

export const PromptSuggestionsBar: React.FC<PromptSuggestionsBarProps> = ({
  onSelectPrompt,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1.5 px-3 border-t border-neutral-100 bg-neutral-50/50",
        className
      )}
    >
      <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1 shrink-0">
        <Sparkles className="w-3 h-3 text-primary-500" />
        Gợi ý:
      </span>
      {DEFAULT_PROMPT_SUGGESTION_ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelectPrompt(item.prompt)}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-600 bg-white hover:bg-neutral-100 border border-neutral-200/80 rounded-full shrink-0 shadow-xs transition-colors cursor-pointer"
        >
          {getIcon(item.iconName)}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export const PromptSuggestionsGrid: React.FC<PromptSuggestionsBarProps> = ({
  onSelectPrompt,
  className,
}) => {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-2 w-full mt-4", className)}>
      {DEFAULT_PROMPT_SUGGESTION_ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelectPrompt(item.prompt)}
          className="flex flex-col items-start p-3 text-left bg-white hover:bg-primary-50/40 border border-neutral-200/80 hover:border-primary-300 rounded-xl transition-all shadow-2xs group cursor-pointer"
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 group-hover:text-primary-700">
            {getIcon(item.iconName)}
            <span>{item.label}</span>
          </div>
          <p className="mt-1 text-[11px] text-neutral-500 line-clamp-2">{item.prompt}</p>
        </button>
      ))}
    </div>
  );
};
