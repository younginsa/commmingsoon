import type { Project } from "@/types/project";

/** Total apps in the challenge. */
export const CHALLENGE_TOTAL = 59;

/**
 * The single source of truth. Move a card between sections by changing
 * `status` — nothing else in the app needs to know.
 */
export const projects: Project[] = [
  {
    id: "standup-ghost",
    no: 4,
    title: "Standup Ghost",
    status: "coming-soon",
    featured: true,
    tagline:
      "Writes your daily standup from your commits, PRs, and calendar — then posts it to Slack before you wake up.",
    highlights: [
      "Reads git history + Linear tickets, no manual input",
      "Tone slider: terse changelog → full narrative",
      "Scheduled post at 9:00 KST, editable for 30 minutes",
    ],
    targetDate: "2026-08-15",
    progress: 62,
    tags: ["Next.js", "Slack API", "Vercel Cron", "Claude"],
    accent: ["#5b2df0", "#0f0c29"],
  },
  {
    id: "portfolio-pulse",
    no: 5,
    title: "Portfolio Pulse",
    status: "coming-soon",
    tagline:
      "Drops a live heartbeat on your portfolio: uptime, traffic, and last-commit age for every project you ship.",
    highlights: [
      "One embed script, zero backend to run",
      "Auto-detects dead links and stale repos",
    ],
    targetDate: "2026-09-02",
    progress: 24,
    tags: ["React", "Edge Functions", "Upstash"],
    accent: ["#0ea5a4", "#062726"],
  },
  {
    id: "dopamine-detox",
    no: 1,
    title: "Dopamine Detox Timer",
    status: "released",
    tagline:
      "A focus timer that gets uglier the more you break it. Shame-driven productivity.",
    releasedAt: "2026-05-11",
    liveUrl: "https://dopamine-detox.example.com",
    repoUrl: "https://github.com/example/dopamine-detox",
    tags: ["React", "Zustand", "PWA"],
    accent: ["#e50914", "#2a0406"],
  },
  {
    id: "ledger-lens",
    no: 2,
    title: "Ledger Lens",
    status: "released",
    tagline:
      "Snap a receipt, get a categorized expense row. Korean receipts included.",
    releasedAt: "2026-06-08",
    liveUrl: "https://ledger-lens.example.com",
    repoUrl: "https://github.com/example/ledger-lens",
    tags: ["Next.js", "Claude Vision", "Supabase", "Tailwind"],
    accent: ["#f59e0b", "#2b1a02"],
  },
  {
    id: "next-on-my-dev-life",
    no: 3,
    title: "Next on My Dev-Life",
    status: "released",
    tagline:
      "This board. A Netflix-style tracker for all 59 apps, driven by one flat JSON file.",
    releasedAt: "2026-07-24",
    liveUrl: "https://dev-life.example.com",
    repoUrl: "https://github.com/example/next-on-my-dev-life",
    tags: ["Next.js 16", "Tailwind v4", "TypeScript"],
    accent: ["#3b82f6", "#050b1c"],
  },
  {
    id: "commit-mood",
    no: 6,
    title: "Commit Mood",
    status: "confirmed",
    tagline:
      "Sentiment-tags a year of commit messages and plots the weeks you were clearly suffering.",
    accent: ["#8b5cf6", "#120a24"],
  },
  {
    id: "deploy-roulette",
    no: 7,
    title: "Deploy Roulette",
    status: "confirmed",
    tagline:
      "Friday-deploy risk score from diff size, test coverage, and how late it is.",
    accent: ["#ef4444", "#210708"],
  },
  {
    id: "api-lint",
    no: 8,
    title: "API Lint",
    status: "confirmed",
    tagline:
      "Paste an OpenAPI spec, get a blunt review of your naming and status codes.",
    accent: ["#22c55e", "#06230f"],
  },
  {
    id: "cold-start",
    no: 9,
    title: "Cold Start",
    status: "confirmed",
    tagline:
      "Turns a one-line idea into a scoped 48-hour build plan with a cut list.",
    accent: ["#64748b", "#0d1117"],
  },
];
