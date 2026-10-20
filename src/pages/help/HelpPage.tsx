import * as React from "react";
import { ArrowRight, BookOpen, CalendarDays, CircleHelp, Layers3, ListChecks, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { HELP_FAQS } from "./help-content";

const GUIDES = [
  {
    title: "Workspace access",
    description: "Review membership, invitations, and the difference between workspace and board access.",
    href: ROUTES.BOARDS,
    icon: UsersRound,
    tone: "bg-blue-50 text-blue-700",
  },
  {
    title: "Board planning",
    description: "Organize a project into boards and lists, then move cards as work progresses.",
    href: ROUTES.BOARDS,
    icon: Layers3,
    tone: "bg-violet-50 text-violet-700",
  },
  {
    title: "My Tasks",
    description: "Find cards assigned to you and focus on upcoming work across your boards.",
    href: ROUTES.MY_TASKS,
    icon: ListChecks,
    tone: "bg-cyan-50 text-cyan-800",
  },
  {
    title: "Workspace Calendar",
    description: "See card due dates on a calendar and open a card in its board context.",
    href: ROUTES.CALENDAR,
    icon: CalendarDays,
    tone: "bg-amber-50 text-amber-800",
  },
];

export const HelpPage: React.FC = () => {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  return (
    <main className="mx-auto max-w-6xl space-y-9 pb-12">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#172554] via-[#1E40AF] to-[#2563EB] px-6 py-8 text-white shadow-lg shadow-blue-950/10 sm:px-10 sm:py-10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border border-white/10 bg-white/5" />
        <div className="relative max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-50">
            <BookOpen aria-hidden="true" className="h-4 w-4" /> Product help
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Help &amp; Guides</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
            Get oriented, understand how access works, and jump straight into your next step.
          </p>
        </div>
      </section>

      <section aria-labelledby="help-guides-heading" className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Get started</p>
          <h2 id="help-guides-heading" className="mt-1 text-xl font-semibold tracking-tight text-slate-900">Guides for your work</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {GUIDES.map(({ title, description, href, icon: Icon, tone }) => (
            <Link key={title} to={href} aria-label={title} className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:p-6">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                <Icon aria-hidden="true" className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-3 text-base font-semibold text-slate-900 group-hover:text-blue-700">
                  {title}<ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-blue-600 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="mt-2 block text-sm leading-6 text-slate-600">{description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="help-faq-heading" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <CircleHelp aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Quick answers</p>
            <h2 id="help-faq-heading" className="mt-0.5 text-lg font-semibold text-slate-900">Frequently asked questions</h2>
          </div>
        </div>
        <div className="mt-5 divide-y divide-slate-100">
          {HELP_FAQS.map(({ question, answer }, index) => {
            const isOpen = openFaq === index;
            const answerId = `help-faq-answer-${index}`;
            return (
              <div key={question} className="py-1">
                <button type="button" aria-expanded={isOpen} aria-controls={answerId} onClick={() => setOpenFaq(isOpen ? null : index)} className="flex w-full items-center justify-between gap-4 rounded-md py-4 text-left text-sm font-semibold text-slate-800 outline-none focus-visible:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                  {question}
                  <span aria-hidden="true" className={`text-lg leading-none text-blue-700 transition-transform ${isOpen ? "rotate-45" : ""}`}>+</span>
                </button>
                {isOpen && <p id={answerId} className="max-w-3xl pb-4 pr-8 text-sm leading-6 text-slate-600">{answer}</p>}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
};
