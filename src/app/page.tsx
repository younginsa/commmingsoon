import { HeroRotator } from "@/components/HeroRotator";
import { ProgressStrip } from "@/components/ProgressStrip";
import { Section } from "@/components/Section";
import { TopNav } from "@/components/TopNav";
import { CHALLENGE_TOTAL, projects } from "@/data/projects";
import type { Project, ProjectStatus } from "@/types/project";

/**
 * Everything on this page is derived from `projects[].status`. There is no
 * per-section list to keep in sync — flip a status and the card moves.
 *
 * The page is two tonal zones:
 *   dark  — hero rotator, progress strip, Coming Soon  (the trailer)
 *   light — Released, Confirmed, footer                (the catalog)
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

  // Hero rotation: featured coming-soon first, then the two newest releases.
  const featured =
    grouped["coming-soon"].find((p) => p.featured) ?? grouped["coming-soon"][0];
  const heroSlides = [featured, ...grouped.released.slice(0, 2)].filter(
    (p): p is Project => Boolean(p),
  );

  const counts: Record<ProjectStatus, number> = {
    released: grouped.released.length,
    "coming-soon": grouped["coming-soon"].length,
    confirmed: grouped.confirmed.length,
  };

  return (
    <div id="top" className="min-h-screen bg-ink">
      <TopNav released={counts.released} total={CHALLENGE_TOTAL} />

      <main>
        {/* ---- dark zone: the trailer ---- */}
        {heroSlides.length > 0 && <HeroRotator slides={heroSlides} />}

        <ProgressStrip counts={counts} total={CHALLENGE_TOTAL} />

        {/* ---- light zone: the catalog. Hard cut, no gradient. ---- */}
        <Section status="coming-soon" projects={grouped["coming-soon"]} />

        <div aria-hidden className="bg-paper px-4 md:px-8">
          <div className="mx-auto max-w-[1600px] border-t border-rule" />
        </div>

        <Section status="released" projects={grouped.released} />

        <div aria-hidden className="bg-paper px-4 md:px-8">
          <div className="mx-auto max-w-[1600px] border-t border-rule" />
        </div>

        <Section status="confirmed" projects={grouped.confirmed} />
      </main>

      <footer className="border-t border-rule bg-paper px-4 py-10 text-center text-xs text-ash md:px-8">
        59 apps. One at a time. ·{" "}
        <span className="font-mono">{counts.released} down</span>,{" "}
        <span className="font-mono">
          {CHALLENGE_TOTAL - counts.released} to go
        </span>
      </footer>
    </div>
  );
}
