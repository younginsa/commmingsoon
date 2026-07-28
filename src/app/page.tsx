import { Hero } from "@/components/Hero";
import { ProgressStrip } from "@/components/ProgressStrip";
import { Section } from "@/components/Section";
import { TopNav } from "@/components/TopNav";
import { CHALLENGE_TOTAL, projects } from "@/data/projects";
import {
  SECTION_ORDER,
  type Project,
  type ProjectStatus,
} from "@/types/project";

/**
 * Everything on this page is derived from `projects[].status`. There is no
 * per-section list to keep in sync — flip a status and the card moves.
 */
function groupByStatus(all: Project[]): Record<ProjectStatus, Project[]> {
  const grouped: Record<ProjectStatus, Project[]> = {
    released: [],
    "coming-soon": [],
    confirmed: [],
  };
  for (const project of all) grouped[project.status].push(project);
  return grouped;
}

export default function Home() {
  const grouped = groupByStatus(projects);

  // Newest releases first; everything else follows deadline / challenge order.
  grouped.released.sort((a, b) =>
    (b.releasedAt ?? "").localeCompare(a.releasedAt ?? ""),
  );
  grouped["coming-soon"].sort((a, b) =>
    (a.targetDate ?? "9999").localeCompare(b.targetDate ?? "9999"),
  );
  grouped.confirmed.sort((a, b) => a.no - b.no);

  // Featured hero: the flagged one, else the nearest deadline.
  const hero =
    grouped["coming-soon"].find((p) => p.featured) ?? grouped["coming-soon"][0];

  const counts: Record<ProjectStatus, number> = {
    released: grouped.released.length,
    "coming-soon": grouped["coming-soon"].length,
    confirmed: grouped.confirmed.length,
  };

  return (
    <div id="top" className="min-h-screen bg-ink">
      <TopNav released={counts.released} total={CHALLENGE_TOTAL} />

      <main>
        {hero && <Hero project={hero} />}

        <ProgressStrip counts={counts} total={CHALLENGE_TOTAL} />

        <div className="mx-auto max-w-[1600px] divide-y divide-hairline/60">
          {SECTION_ORDER.map((status) => (
            <Section key={status} status={status} projects={grouped[status]} />
          ))}
        </div>
      </main>

      <footer className="border-t border-hairline px-4 py-10 text-center text-xs text-mist md:px-8">
        59 apps. One at a time. ·{" "}
        <span className="font-mono">{counts.released} down</span>,{" "}
        <span className="font-mono">
          {CHALLENGE_TOTAL - counts.released} to go
        </span>
      </footer>
    </div>
  );
}
