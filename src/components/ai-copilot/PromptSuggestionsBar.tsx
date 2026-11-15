import React from "react";
import { Sparkles, AlertCircle, Users, Search, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PromptSuggestion {
  id: string;
  icon: React.ReactNode;
  label: string;
  prompt: string;
}

export const DEFAULT_PROMPT_SUGGESTIONS: PromptSuggestion[] = [
  {
    id: "summary",
    icon: <BarChart3 className="w-3.5 h-3.5 text-blue-500" />,
    label: "Tóm tắt tiến độ",
    prompt: "Tóm tắt tổng quan tiến độ của bảng này hiện tại?",
  },
  {
    id: "overdue",
    icon: <AlertCircle className="w-3.5 h-3.5 text-amber-500" />,
    label: "Việc quá hạn / Sắp hết hạn",
    prompt: "Những công việc nào đang bị quá hạn hoặc sắp đến hạn?",
  },
  {
    id: "workload",
    icon: <Users className="w-3.5 h-3.5 text-emerald-500" />,
    label: "Phân bổ thành viên",
    prompt: "Khối lượng công việc đang phân bổ cho các thành viên thế nào?",
  },
  {
    id: "unassigned",
    icon: <Search className="w-3.5 h-3.5 text-purple-500" />,
    label: "Việc chưa ai nhận",
    prompt: "Có những công việc nào chưa được gán cho ai?",
  },
];

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
      {DEFAULT_PROMPT_SUGGESTIONS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelectPrompt(item.prompt)}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-600 bg-white hover:bg-neutral-100 border border-neutral-200/80 rounded-full shrink-0 shadow-2xs transition-colors cursor-pointer"
        >
          {item.icon}
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
      {DEFAULT_PROMPT_SUGGESTIONS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelectPrompt(item.prompt)}
          className="flex flex-col items-start p-3 text-left bg-white hover:bg-primary-50/40 border border-neutral-200/80 hover:border-primary-300 rounded-xl transition-all shadow-2xs group cursor-pointer"
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 group-hover:text-primary-700">
            {item.icon}
            <span>{item.label}</span>
          </div>
          <p className="mt-1 text-[11px] text-neutral-500 line-clamp-2">{item.prompt}</p>
        </button>
      ))}
    </div>
  );
};
