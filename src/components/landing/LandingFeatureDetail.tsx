import * as React from "react";
import {
  Check,
  CheckCircle2,
  Sparkles,
  Paperclip,
  Send,
  FileText,
  Clock,
  ChevronUp,
} from "lucide-react";

export const LandingFeatureDetail: React.FC = () => {
  return (
    <section id="features" className="space-y-20 py-16 sm:space-y-28 sm:py-24">
      {/* -------------------------------------------------------------
          Feature 1: Plan work your way (Task Management)
          ------------------------------------------------------------- */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left Text */}
          <div className="lg:col-span-5">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
              Task Management
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
              Plan work your way.
            </h2>
            <p className="mt-4 text-sm text-neutral-600 leading-relaxed">
              Organize projects with customizable boards, swimlanes, and lists.
              Track dependencies, deadlines, and priorities effortlessly without clutter.
            </p>

            <ul className="mt-6 space-y-3 text-xs font-medium text-neutral-700">
              <li className="flex items-center gap-2.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
                <span>Flexible Kanban and list views for every team member</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
                <span>Custom labels, priorities, and dependency tracking</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
                <span>Detailed task modals with checklists and file attachments</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
                <span>Real-time status updates without manual report writing</span>
              </li>
            </ul>
          </div>

          {/* Right Visual: Mock Task Detail Card */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-xl sm:p-7 select-none">
              {/* Header Badges */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-primary-50 px-2 py-0.5 text-xs font-bold text-primary-700">
                    CORE-104
                  </span>
                  <span className="flex items-center gap-1 rounded border border-error-200 bg-error-50 px-2 py-0.5 text-xs font-bold text-error-600">
                    <ChevronUp className="h-3 w-3 stroke-[3]" />
                    <span>High Priority</span>
                  </span>
                </div>
                <span className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600">
                  In progress
                </span>
              </div>

              {/* Task Title & Details */}
              <h3 className="mt-4 text-base font-bold text-neutral-900">
                Review authentication flow & session rotation
              </h3>
              <p className="mt-1 text-xs text-neutral-500">
                Created by Alex Morgan • Assigned to Đạt • Sprint 42
              </p>

              {/* Checklist */}
              <div className="mt-5 space-y-2 rounded-xl bg-neutral-50 p-4 border border-neutral-200/70">
                <span className="text-xs font-bold text-neutral-700">
                  Checklist (2/3 completed)
                </span>
                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="flex items-center gap-2 text-neutral-400 line-through">
                    <CheckCircle2 className="h-4 w-4 text-success-500" />
                    <span>Implement Zod form validation schemas</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400 line-through">
                    <CheckCircle2 className="h-4 w-4 text-success-500" />
                    <span>Configure 3-segment password strength meter</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-neutral-800">
                    <div className="h-4 w-4 rounded border border-neutral-300 bg-white" />
                    <span>Audit color tokens against WCAG AA standards</span>
                  </div>
                </div>
              </div>

              {/* Attachments */}
              <div className="mt-4 flex items-center gap-2 text-xs text-neutral-600">
                <Paperclip className="h-3.5 w-3.5 text-neutral-400" />
                <span className="rounded border border-neutral-200 bg-neutral-50 px-2 py-0.5 font-mono text-[11px]">
                  Auth_Spec_v2.pdf (1.4 MB)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          Feature 2: Contextual AI Assistant (Reversed Layout)
          ------------------------------------------------------------- */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left Visual: Mock AI Chat Window */}
          <div className="order-2 lg:order-1 lg:col-span-7">
            <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xl sm:p-6 select-none">
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-[#7C3AED]">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 leading-none">
                      Nexora AI Assistant
                    </h4>
                    <span className="text-[10px] text-success-600 font-medium">
                      Project context synced
                    </span>
                  </div>
                </div>
                <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-mono text-neutral-500">
                  Sprint 42
                </span>
              </div>

              {/* Chat Conversation */}
              <div className="mt-4 space-y-3.5 text-xs">
                {/* User Prompt */}
                <div className="flex justify-end">
                  <div className="rounded-xl bg-primary-600 px-3.5 py-2 text-white shadow-2xs max-w-md">
                    Summarize blockers and critical path in Sprint 42.
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex justify-start">
                  <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-3.5 text-neutral-700 space-y-2 max-w-lg">
                    <p className="font-semibold text-neutral-900">
                      There is 1 active dependency blocker detected:
                    </p>
                    <p className="leading-relaxed">
                      Task <span className="font-semibold text-neutral-800">#128 ("API schema for AI agent")</span> requires Clara Chen's review before OAuth token rotation can be merged into staging.
                    </p>
                    {/* Source citation badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
                      <span className="text-neutral-400">Grounded from:</span>
                      <span className="rounded border border-neutral-200 bg-white px-1.5 py-0.5 font-mono text-neutral-600">
                        Sprint 42
                      </span>
                      <span className="rounded border border-neutral-200 bg-white px-1.5 py-0.5 font-mono text-neutral-600">
                        Task #128
                      </span>
                      <span className="rounded border border-neutral-200 bg-white px-1.5 py-0.5 font-mono text-neutral-600">
                        Auth_Spec_v2.pdf
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mock Chat Input */}
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2">
                <input
                  type="text"
                  placeholder="Ask a question about project documents or tasks..."
                  className="w-full bg-transparent text-xs text-neutral-800 placeholder-neutral-400 outline-none"
                  readOnly
                />
                <button
                  type="button"
                  className="rounded-lg bg-primary-600 p-1 text-white hover:bg-primary-700 transition-colors"
                  aria-label="Send query"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Text */}
          <div className="order-1 lg:order-2 lg:col-span-5">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
              Intelligent Assistant
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
              Your project, with an AI that understands the context.
            </h2>
            <p className="mt-4 text-sm text-neutral-600 leading-relaxed">
              Ask questions about deadlines, blockers, and specifications. Nexora's
              AI searches your actual tasks, board activity, and documents to provide
              grounded answers with citations.
            </p>

            <ul className="mt-6 space-y-3 text-xs font-medium text-neutral-700">
              <li className="flex items-center gap-2.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
                <span>Context-aware answers referencing exact tasks and sprints</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
                <span>Automatic blocker detection and risk assessment</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
                <span>Instant meeting and release note summarization</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          Feature 3: Turn project documents into usable knowledge
          ------------------------------------------------------------- */}
      <div id="knowledge" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left Text */}
          <div className="lg:col-span-5">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
              Knowledge Base
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
              Turn project documents into usable knowledge.
            </h2>
            <p className="mt-4 text-sm text-neutral-600 leading-relaxed">
              No more lost specs or outdated wikis. Keep technical specifications,
              PRDs, and architecture decisions connected directly to the tasks they define.
            </p>

            <ul className="mt-6 space-y-3 text-xs font-medium text-neutral-700">
              <li className="flex items-center gap-2.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
                <span>Unified repository for PRDs, architecture, and meeting notes</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
                <span>Live links between wiki documents and board cards</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
                <span>Instant AI semantic search across all uploaded resources</span>
              </li>
            </ul>
          </div>

          {/* Right Visual: Mock Knowledge Base List */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-xl select-none">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary-600" />
                  <span className="text-xs font-bold text-neutral-900">
                    Core Platform / Knowledge Base
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-primary-600 hover:underline cursor-pointer">
                  + Upload doc
                </span>
              </div>

              <div className="mt-4 divide-y divide-neutral-100 text-xs">
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-primary-600">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block font-semibold text-neutral-800">
                        Auth_Spec_v2.pdf
                      </span>
                      <span className="block text-[11px] text-neutral-400">
                        PRD • Linked to Sprint 42
                      </span>
                    </div>
                  </div>
                  <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
                    Updated 2h ago
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-[#7C3AED]">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block font-semibold text-neutral-800">
                        API Architecture RFC
                      </span>
                      <span className="block text-[11px] text-neutral-400">
                        Technical Spec • 12 dependencies
                      </span>
                    </div>
                  </div>
                  <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
                    Yesterday
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block font-semibold text-neutral-800">
                        Design Tokens & Typography Rules
                      </span>
                      <span className="block text-[11px] text-neutral-400">
                        Design System • WCAG Guidelines
                      </span>
                    </div>
                  </div>
                  <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
                    3d ago
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          Feature 4: Keep your team aligned (Reversed Layout)
          ------------------------------------------------------------- */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left Visual: Mock Team Activity Feed */}
          <div className="order-2 lg:order-1 lg:col-span-7">
            <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-xl select-none">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <span className="text-xs font-bold text-neutral-900">
                  Live Project Activity
                </span>
                <span className="flex items-center gap-1 text-[11px] text-neutral-400 font-medium">
                  <Clock className="h-3 w-3" />
                  <span>Real-time stream</span>
                </span>
              </div>

              <div className="mt-4 space-y-3.5 text-xs">
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white shrink-0">
                    AM
                  </div>
                  <div className="min-w-0">
                    <p className="text-neutral-800">
                      <span className="font-semibold">Alex Morgan</span> completed task{" "}
                      <span className="font-semibold text-primary-600">
                        "Review authentication flow"
                      </span>
                    </p>
                    <span className="text-[10px] text-neutral-400">20 minutes ago</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#7C3AED] text-[10px] font-bold text-white shrink-0">
                    CC
                  </div>
                  <div className="min-w-0">
                    <p className="text-neutral-800">
                      <span className="font-semibold">Clara Chen</span> approved schema changes on{" "}
                      <span className="font-semibold text-[#7C3AED]">
                        "API Architecture RFC"
                      </span>
                    </p>
                    <span className="text-[10px] text-neutral-400">1 hour ago</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#4F46E5] text-[10px] font-bold text-white shrink-0">
                    Đ
                  </div>
                  <div className="min-w-0">
                    <p className="text-neutral-800">
                      <span className="font-semibold">Đạt</span> moved card{" "}
                      <span className="font-semibold text-neutral-900">
                        "Wireframe landing page"
                      </span>{" "}
                      to <span className="font-semibold text-success-600">Done</span>
                    </p>
                    <span className="text-[10px] text-neutral-400">3 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Text */}
          <div className="order-1 lg:order-2 lg:col-span-5">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
              Team Alignment
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
              Keep your team aligned.
            </h2>
            <p className="mt-4 text-sm text-neutral-600 leading-relaxed">
              Eliminate status meetings. Every team member sees clear ownership,
              upcoming deadlines, and cross-team dependencies in one central view.
            </p>

            <ul className="mt-6 space-y-3 text-xs font-medium text-neutral-700">
              <li className="flex items-center gap-2.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
                <span>Real-time activity logs and notification center</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
                <span>Clear task ownership and contributor velocity</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
                <span>Automated reminder alerts before deadlines lapse</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
