import * as React from "react";
import { Compass, Home, Kanban } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

export const NotFoundPage: React.FC = () => (
  <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
    <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-lg shadow-slate-900/[0.04] sm:p-10">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        <Compass aria-hidden="true" className="h-7 w-7" />
      </span>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">404 · Route not found</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Page not found</h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
        This address does not point to a Nexora page. Choose a workspace view to continue.
      </p>
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <Link to={ROUTES.HOME} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
          <Home aria-hidden="true" className="h-4 w-4" /> Go to Home
        </Link>
        <Link to={ROUTES.BOARDS} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
          <Kanban aria-hidden="true" className="h-4 w-4" /> Browse Boards
        </Link>
      </div>
    </section>
  </main>
);
