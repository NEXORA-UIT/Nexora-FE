import * as React from "react";
import { FolderSearch, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BoardEmptyStateProps {
  searchQuery?: string;
  onClearFilters?: () => void;
}

export const BoardEmptyState: React.FC<BoardEmptyStateProps> = ({
  searchQuery,
  onClearFilters,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/50 p-10 text-center select-none">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500 mb-3">
        <FolderSearch className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-bold text-neutral-800">No boards found</h3>
      <p className="mt-1 text-xs text-neutral-500 max-w-sm">
        {searchQuery
          ? `We couldn't find any boards matching "${searchQuery}". Try searching with different keywords.`
          : "There are no boards matching the selected filter in this workspace."}
      </p>
      {onClearFilters && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="mt-4 h-8 gap-1.5 rounded-lg text-xs"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset Filters</span>
        </Button>
      )}
    </div>
  );
};
