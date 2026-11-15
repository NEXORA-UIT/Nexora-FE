import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import type { KnowledgeDocument } from "@/types/knowledge-base";

export interface DocumentDeleteDialogProps {
  isOpen: boolean;
  document: KnowledgeDocument | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export const DocumentDeleteDialog: React.FC<DocumentDeleteDialogProps> = ({
  isOpen,
  document,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  if (!document) return null;

  return (
    <DialogRoot open={isOpen} onOpenChange={(open) => !open && !isDeleting && onClose()}>
      <DialogContent size="sm" aria-labelledby="delete-doc-title">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle id="delete-doc-title" className="text-base font-bold text-neutral-900">
                Delete Knowledge Document
              </DialogTitle>
              <DialogDescription className="text-xs text-neutral-500">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody>
          <p className="text-sm leading-relaxed text-neutral-600">
            Are you sure you want to permanently delete{" "}
            <span className="font-semibold text-neutral-900">“{document.fileName}”</span>?
          </p>
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800">
            <p className="font-medium">⚠️ Vector Ingestion Notice:</p>
            <p className="mt-1">
              Deleting this document will immediately purge all{" "}
              {document.chunkCount ? `${document.chunkCount} text chunks` : "vector chunks"} and semantic
              embeddings from the AI index.
            </p>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" disabled={isDeleting} onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-rose-600 text-white hover:bg-rose-700"
            disabled={isDeleting}
            onClick={onConfirm}
          >
            {isDeleting ? "Deleting..." : "Delete Document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};
