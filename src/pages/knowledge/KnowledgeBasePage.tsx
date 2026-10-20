import * as React from "react";
import { ArrowLeft, ArrowRight, BookOpen, Clock3, Search, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KNOWLEDGE_BASE_ARTICLES } from "@/mocks/data/knowledge-base.mock";
import type { KnowledgeBaseArticle } from "@/types/knowledge-base";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(`${value}T00:00:00`)
  );
}

export const KnowledgeBasePage: React.FC = () => {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [selectedArticle, setSelectedArticle] = React.useState<KnowledgeBaseArticle | null>(null);

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

  if (selectedArticle) {
    return (
      <main className="mx-auto max-w-5xl space-y-6 pb-12">
        <Button type="button" variant="ghost" onClick={() => setSelectedArticle(null)} className="gap-2 px-0 text-slate-600 hover:text-blue-700">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to knowledge base
        </Button>
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-[#172554] via-[#1E40AF] to-[#2563EB] px-6 py-8 text-white sm:px-10 sm:py-10">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="rounded-full bg-white/15 px-3 py-1">{selectedArticle.category}</span>
              <span className="rounded-full border border-cyan-200/40 bg-cyan-300/15 px-3 py-1 text-cyan-50">Demo content</span>
            </div>
            <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">{selectedArticle.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">{selectedArticle.summary}</p>
            <p className="mt-5 flex items-center gap-2 text-xs text-blue-100">
              <Clock3 aria-hidden="true" className="h-4 w-4" /> {selectedArticle.readMinutes} min read
              <span aria-hidden="true">·</span> Updated {formatDate(selectedArticle.updatedAt)}
            </p>
          </div>
          <div className="max-w-3xl px-6 py-8 sm:px-10 sm:py-10">
            <div className="space-y-5 text-sm leading-7 text-slate-700">
              {selectedArticle.content.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            <p className="mt-8 border-t border-slate-100 pt-5 text-xs text-slate-500">
              This article is sample product guidance for the Nexora demo.
            </p>
          </div>
        </article>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 pb-12">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#172554] via-[#1E40AF] to-[#2563EB] px-6 py-8 text-white shadow-lg shadow-blue-950/10 sm:px-10 sm:py-10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border border-white/10 bg-white/5" />
        <div className="relative max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-50">
            <BookOpen aria-hidden="true" className="h-4 w-4" /> Team playbook
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Knowledge Base</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
            Find quick guidance for workspace access, project boards, and your day-to-day planning.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-cyan-200/40 bg-cyan-300/15 px-3 py-1.5 text-xs font-semibold text-cyan-50">Demo content</span>
            <span className="text-xs text-blue-100">Read-only sample articles</span>
          </div>
        </div>
      </section>

      <section aria-label="Knowledge articles" className="space-y-5">
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
            <label htmlFor="knowledge-category" className="block text-xs font-medium text-slate-700">Filter by category</label>
            <select id="knowledge-category" value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
              <option value="all">All categories</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <p className="text-base font-semibold text-slate-900">No articles match those filters</p>
            <p className="mt-2 text-sm text-slate-500">Try a different phrase or browse every category.</p>
            <Button type="button" variant="outline" className="mt-5" onClick={() => { setQuery(""); setCategory("all"); }}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredArticles.map((article) => (
              <button
                key={article.id}
                type="button"
                onClick={() => setSelectedArticle(article)}
                className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:p-6"
              >
                <span className="flex w-full items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    <Tag aria-hidden="true" className="h-3.5 w-3.5" /> {article.category}
                  </span>
                  <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-800">Demo content</span>
                </span>
                <span className="mt-5 text-lg font-semibold tracking-tight text-slate-900 group-hover:text-blue-700">{article.title}</span>
                <span className="mt-2 flex-1 text-sm leading-6 text-slate-600">{article.summary}</span>
                <span className="mt-5 flex w-full items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                  <span>{article.readMinutes} min read · Updated {formatDate(article.updatedAt)}</span>
                  <ArrowRight aria-hidden="true" className="h-4 w-4 text-blue-600 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};
