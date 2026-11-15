import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Clock3,
  Database,
  Search,
  Sparkles,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  BoardSelectorHeader,
  DocumentDropzone,
  DocumentTable,
  SemanticSearchBox,
  SemanticAnswerCard,
} from "@/components/knowledge-base";
import { useKnowledgeBaseStore } from "@/stores/knowledge-base.store";
import { useWorkspaceBoards } from "@/hooks";
import { ROUTES } from "@/constants/routes";
import { KNOWLEDGE_BASE_ARTICLES } from "@/mocks/data/knowledge-base.mock";
import type { KnowledgeBaseArticle } from "@/types/knowledge-base";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(`${value}T00:00:00`)
  );
}

export const KnowledgeBasePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<"rag" | "playbook">("rag");

  // Playbook states
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [selectedArticle, setSelectedArticle] = React.useState<KnowledgeBaseArticle | null>(null);

  // Workspace and boards context
  const { boards } = useWorkspaceBoards();

  // Knowledge Base RAG store
  const {
    documents,
    isLoading: isDocsLoading,
    isUploading,
    uploadProgress,
    ragAnswer,
    isQuerying,
    activeBoardId,
    setActiveBoard,
    uploadDocument,
    deleteDocument,
    queryRAG,
    clearRAGAnswer,
    stopPolling,
  } = useKnowledgeBaseStore();

  // Stop background polling on unmount
  React.useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // Synchronize active board when boards load
  React.useEffect(() => {
    if (boards.length > 0) {
      if (!activeBoardId || !boards.some((b) => b.id === activeBoardId)) {
        setActiveBoard(boards[0].id);
      }
    }
  }, [boards, activeBoardId, setActiveBoard]);

  const categories = React.useMemo(
    () => [...new Set(KNOWLEDGE_BASE_ARTICLES.map((article) => article.category))].sort(),
    []
  );

  const filteredArticles = React.useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return KNOWLEDGE_BASE_ARTICLES.filter((article) => {
      const matchesCategory = category === "all" || article.category === category;
      const searchableText = `${article.title} ${article.summary} ${article.content}`.toLocaleLowerCase();
      return matchesCategory && (!normalizedQuery || searchableText.includes(normalizedQuery));
    });
  }, [category, query]);

  const handleUpload = async (file: File) => {
    const currentBoardId = activeBoardId || (boards[0]?.id ?? "default-board");
    try {
      await uploadDocument(currentBoardId, file);
      toast.success("Document uploaded successfully.");
    } catch {
      toast.error("Failed to upload document. Please try again.");
    }
  };

  const handleSearchQuestion = async (q: string) => {
    const currentBoardId = activeBoardId || (boards[0]?.id ?? "default-board");
    await queryRAG(currentBoardId, q);
  };

  const handleContinueInChat = (_q: string) => {
    const targetBoardId = activeBoardId || (boards[0]?.id ?? "");
    navigate(`${ROUTES.AI_ASSISTANT}?boardId=${encodeURIComponent(targetBoardId)}`);
  };

  // Article reading view inside Playbook tab
  if (selectedArticle && activeTab === "playbook") {
    return (
      <main className="mx-auto max-w-5xl space-y-6 pb-12">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setSelectedArticle(null)}
          className="gap-2 px-0 text-slate-600 hover:text-blue-700"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to knowledge base
        </Button>
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-[#172554] via-[#1E40AF] to-[#2563EB] px-6 py-8 text-white sm:px-10 sm:py-10">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="rounded-full bg-white/15 px-3 py-1">{selectedArticle.category}</span>
              <span className="rounded-full border border-cyan-200/40 bg-cyan-300/15 px-3 py-1 text-cyan-50">
                Guide
              </span>
            </div>
            <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {selectedArticle.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">{selectedArticle.summary}</p>
            <p className="mt-5 flex items-center gap-2 text-xs text-blue-100">
              <Clock3 aria-hidden="true" className="h-4 w-4" /> {selectedArticle.readMinutes} min read
              <span aria-hidden="true">·</span> Updated {formatDate(selectedArticle.updatedAt)}
            </p>
          </div>
          <div className="max-w-3xl px-6 py-8 sm:px-10 sm:py-10">
            <div className="space-y-5 text-sm leading-7 text-slate-700">
              {selectedArticle.content.split("\n\n").map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </article>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-7 pb-16">
      {/* Top Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#172554] via-[#1E40AF] to-[#2563EB] px-6 py-8 text-white shadow-lg shadow-blue-950/10 sm:px-10 sm:py-9">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border border-white/10 bg-white/5"
        />
        <div className="relative max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-50">
            <Database aria-hidden="true" className="h-3.5 w-3.5" /> AI Knowledge Center
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Knowledge Base
          </h1>
          <p className="mt-2.5 max-w-2xl text-sm leading-6 text-blue-100">
            Upload project documentation, specifications, and architecture notes. Nexora automatically
            extracts, vectorizes, and indexes text to power AI Copilot citations.
          </p>

          {/* Tab Navigation Switcher */}
          <div className="mt-6 flex items-center gap-1.5 rounded-xl bg-white/15 p-1 w-fit border border-white/20">
            <button
              type="button"
              onClick={() => setActiveTab("rag")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "rag"
                  ? "bg-white text-blue-900 shadow-sm"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Project Documents & RAG</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("playbook")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "playbook"
                  ? "bg-white text-blue-900 shadow-sm"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Playbook & Guides</span>
            </button>
          </div>
        </div>
      </section>

      {/* TAB 1: Project Documents & RAG Engine */}
      {activeTab === "rag" && (
        <section className="space-y-6 animate-in fade-in-50 duration-200">
          {/* Board Selector & Metrics Header */}
          <BoardSelectorHeader
            boards={boards.map((b) => ({ id: b.id, title: b.title }))}
            activeBoardId={activeBoardId}
            onSelectBoard={setActiveBoard}
            documents={documents}
          />

          {/* Upload Dropzone */}
          <DocumentDropzone
            onUpload={handleUpload}
            isUploading={isUploading}
            progress={uploadProgress}
          />

          {/* Semantic Search Box & Answer Card */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary-600" />
              <h2 className="text-sm font-bold text-neutral-900">Semantic Search & RAG Test</h2>
            </div>
            <SemanticSearchBox onSearch={handleSearchQuestion} isLoading={isQuerying} />
            {ragAnswer && (
              <SemanticAnswerCard
                answer={ragAnswer}
                onClear={clearRAGAnswer}
                onContinueInChat={handleContinueInChat}
              />
            )}
          </div>

          {/* Document Management Table */}
          <div className="space-y-3.5 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-neutral-500" />
                <h2 className="text-sm font-bold text-neutral-900">Project Documents</h2>
              </div>
              <span className="text-xs text-neutral-500">{documents.length} document(s)</span>
            </div>
            <DocumentTable
              documents={documents}
              onDeleteDoc={deleteDocument}
              isLoading={isDocsLoading}
            />
          </div>
        </section>
      )}

      {/* TAB 2: Playbook & Guides */}
      {activeTab === "playbook" && (
        <section aria-label="Knowledge articles" className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
            <div className="flex-1">
              <Input
                type="search"
                label="Search articles"
                placeholder="Try “board status” or “membership”"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                actionSlot={<Search aria-hidden="true" className="h-4 w-4 text-slate-400" />}
              />
            </div>
            <div className="w-full space-y-1.5 sm:w-56">
              <label htmlFor="knowledge-category" className="block text-xs font-medium text-slate-700">
                Filter by category
              </label>
              <select
                id="knowledge-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All categories</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {filteredArticles.map((article) => (
              <article
                key={article.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
              >
                <div className="space-y-3">
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {article.category}
                  </span>
                  <h3 className="text-lg font-semibold tracking-tight text-slate-900">{article.title}</h3>
                  <p className="text-sm leading-6 text-slate-600 line-clamp-3">{article.summary}</p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                  <span>{article.readMinutes} min read</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedArticle(article)}
                  >
                    Read article
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
};
