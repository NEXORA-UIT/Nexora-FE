import * as React from "react";
import { Search, Filter, FileText, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { DocumentTableRow } from "./DocumentTableRow";
import { DocumentDeleteDialog } from "./DocumentDeleteDialog";
import type { DocumentStatus, KnowledgeDocument } from "@/types/knowledge-base";

export interface DocumentTableProps {
  documents: KnowledgeDocument[];
  onDeleteDoc: (id: string) => Promise<void> | void;
  isLoading?: boolean;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  onDeleteDoc,
  isLoading = false,
}) => {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<DocumentStatus | "ALL">("ALL");
  const [deleteTarget, setDeleteTarget] = React.useState<KnowledgeDocument | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const filteredDocs = React.useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        !search.trim() || doc.fileName.toLowerCase().includes(search.trim().toLowerCase());
      const matchesStatus = statusFilter === "ALL" || doc.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [documents, search, statusFilter]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDeleteDoc(deleteTarget.id);
      toast.success(`"${deleteTarget.fileName}" deleted and vector embeddings purged.`);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete document.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = (doc: KnowledgeDocument) => {
    toast.success(`Preparing download for "${doc.fileName}"...`);
    // Simulated blob download
    const blob = new Blob([`Sample content for ${doc.fileName}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = doc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents by name..."
            className="h-9 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-neutral-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 outline-none focus:border-primary-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="READY">Ready only</option>
            <option value="PROCESSING">Processing</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200/80 bg-neutral-50/70 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                <th scope="col" className="py-3 pl-4 pr-3">
                  Document Name
                </th>
                <th scope="col" className="px-3 py-3">
                  Size
                </th>
                <th scope="col" className="px-3 py-3">
                  Uploaded
                </th>
                <th scope="col" className="px-3 py-3">
                  Ingestion Status
                </th>
                <th scope="col" className="py-3 pl-3 pr-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-xs text-neutral-500">
                    Loading knowledge documents...
                  </td>
                </tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <FileText className="mx-auto h-8 w-8 text-neutral-300" />
                    <p className="mt-2 text-xs font-semibold text-neutral-700">No documents found</p>
                    <p className="mt-0.5 text-[11px] text-neutral-400">
                      {search || statusFilter !== "ALL"
                        ? "Try clearing filters or search terms."
                        : "Upload project specifications or notes to enable AI Copilot RAG citations."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <DocumentTableRow
                    key={doc.id}
                    document={doc}
                    onDelete={() => setDeleteTarget(doc)}
                    onDownload={handleDownload}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DocumentDeleteDialog
        isOpen={Boolean(deleteTarget)}
        document={deleteTarget}
        isDeleting={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
