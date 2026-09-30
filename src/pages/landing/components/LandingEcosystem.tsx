import * as React from "react";
import { ArrowRight } from "lucide-react";
import { GitHubIcon } from "@/components/common/Icons";

interface IntegrationItem {
  name: string;
  category: string;
  description: string;
  iconBg: string;
  badgeText: string;
  icon: React.ReactNode;
}

const INTEGRATIONS: IntegrationItem[] = [
  {
    name: "GitHub",
    category: "Code Hosting",
    description:
      "Bi-directional sync with pull requests, commits, and branch creation directly from tasks.",
    iconBg: "bg-neutral-900 text-white",
    badgeText: "Native App",
    icon: <GitHubIcon size={22} />,
  },
  {
    name: "GitLab",
    category: "DevOps & CI/CD",
    description:
      "Enterprise self-hosted and cloud pipeline status checks linked to sprint milestones.",
    iconBg: "bg-[#FC6D26] text-white",
    badgeText: "Enterprise",
    icon: (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.29-.94l1.22-3.78 2.44-7.51c.06-.18.2-.32.38-.37.18-.05.37 0 .5.12.13.12.2.29.17.47l-2 6.13h16.46l-2-6.13c-.03-.18.04-.35.17-.47.13-.12.32-.17.5-.12.18.05.32.19.38.37l2.44 7.51 1.22 3.78c.07.31-.03.64-.29.94z" />
      </svg>
    ),
  },
  {
    name: "Figma",
    category: "Design Handoff",
    description:
      "Embed interactive canvases, component variants, and design specs into user stories.",
    iconBg: "bg-black text-white",
    badgeText: "Live Embed",
    icon: (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <path d="M8 24c2.2 0 4-1.8 4-4v-4H8c-2.2 0-4 1.8-4 4s1.8 4 4 4z" fill="#0ACF83" />
        <path d="M4 12c0-2.2 1.8-4 4-4h4v8H8c-2.2 0-4-1.8-4-4z" fill="#A259FF" />
        <path d="M4 4c0-2.2 1.8-4 4-4h4v8H8c-2.2 0-4-1.8-4-4z" fill="#F24E1E" />
        <path d="M12 0h4c2.2 0 4 1.8 4 4s-1.8 4-4 4h-4V0z" fill="#FF7262" />
        <path d="M20 12c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4 4 1.8 4 4z" fill="#1ABCFE" />
      </svg>
    ),
  },
  {
    name: "Slack",
    category: "Team Messaging",
    description:
      "Proactive dependency blocker alerts, daily standup digests, and quick task creation.",
    iconBg: "bg-[#4A154B] text-white",
    badgeText: "Realtime Bot",
    icon: (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
      </svg>
    ),
  },
  {
    name: "VS Code",
    category: "IDE Extension",
    description:
      "Inspect assigned tasks, execute AI code refactoring, and update sprint state in editor.",
    iconBg: "bg-[#007ACC] text-white",
    badgeText: "Extension",
    icon: (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .32 8.688l3.415 3.308L.32 15.304a1 1 0 0 0 .007 1.427l1.322 1.202a1 1 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.49 1.49 0 0 0 1.704.29l4.94-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z" />
      </svg>
    ),
  },
  {
    name: "Postman",
    category: "API Testing",
    description:
      "Map contract test results and OpenAPI collections directly to backend tasks.",
    iconBg: "bg-[#FF6C37] text-white",
    badgeText: "Webhooks",
    icon: (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.528 8.665c-.147-.023-.298-.035-.453-.035-1.42 0-2.57 1.15-2.57 2.57 0 .313.056.613.16.89L7.49 14.364a2.553 2.553 0 0 0-.743-.11c-1.42 0-2.57 1.15-2.57 2.57s1.15 2.57 2.57 2.57 2.57-1.15 2.57-2.57c0-.313-.056-.613-.16-.89l3.175-2.274c.23.07.474.11.726.11 1.42 0 2.57-1.15 2.57-2.57a2.57 2.57 0 0 0-2.095-2.535zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
      </svg>
    ),
  },
];

export const LandingEcosystem: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 bg-neutral-50/50 border-t border-neutral-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl text-left mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
            Integrates natively with your toolchain
          </h2>

          <p className="mt-4 text-base text-neutral-600 sm:text-lg leading-relaxed">
            Keep your team working in the tools they love. Nexora connects your
            repositories, communication channels, and design files in real time.
          </p>
        </div>

        {/* 6 Grid Cards */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {INTEGRATIONS.map((item) => (
            <div
              key={item.name}
              className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs hover:border-primary-300 hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.iconBg} shadow-xs`}
                  >
                    {item.icon}
                  </div>
                  <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-600 border border-neutral-200">
                    {item.badgeText}
                  </span>
                </div>

                <div className="mt-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    {item.category}
                  </span>
                  <h3 className="text-base font-bold text-neutral-900">
                    {item.name}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-neutral-600">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center text-xs font-semibold text-primary-600 hover:text-primary-700 select-none cursor-pointer">
                <span>View integration docs</span>
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
