import React from "react";
import { CheckSquare, ExternalLink } from "lucide-react";
import type { ReferencedCard } from "@/types";
import { cn } from "@/lib/utils";

export interface ReferencedCardsBlockProps {
  cards?: ReferencedCard[];
  onSelectCard?: (cardId: string) => void;
  className?: string;
}

export const ReferencedCardsBlock: React.FC<ReferencedCardsBlockProps> = ({
  cards,
  onSelectCard,
  className,
}) => {
  if (!cards || cards.length === 0) return null;

  return (
    <div className={cn("mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800", className)}>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-neutral-500 uppercase mb-2">
        <CheckSquare className="w-3.5 h-3.5 text-neutral-400" />
        <span>REFERENCED CARDS</span>
        <span className="text-[10px] px-1.5 py-0.2 bg-neutral-100 text-neutral-600 rounded-full font-medium">
          {cards.length}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-1.5">
        {cards.map((card) => (
          <button
            key={card.card_id}
            type="button"
            onClick={() => onSelectCard?.(card.card_id)}
            className="flex items-center justify-between w-full text-left px-2.5 py-2 text-xs rounded-lg border border-neutral-200/80 bg-neutral-50/60 hover:bg-white hover:border-primary-300 hover:shadow-xs transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <span className="px-1.5 py-0.5 text-[11px] font-bold bg-primary-100 text-primary-700 rounded-md shrink-0">
                {card.label}
              </span>
              <span className="font-medium text-neutral-800 truncate group-hover:text-primary-700 transition-colors">
                {card.title}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0 text-neutral-400 group-hover:text-primary-600">
              {card.list_name && (
                <span className="text-[10px] text-neutral-500 bg-neutral-200/60 px-1.5 py-0.5 rounded">
                  {card.list_name}
                </span>
              )}
              <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
