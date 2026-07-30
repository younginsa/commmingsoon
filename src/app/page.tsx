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

        {/* ---- light zone: the catalog. Hard cut, no gradient.
             Sections carry their own DS strip headers, which double as
             the dividers between them. ---- */}
        <Section status="coming-soon" projects={grouped["coming-soon"]} />
        <Section status="released" projects={grouped.released} />
        <Section status="confirmed" projects={grouped.confirmed} />
      </main>

      {/* DS bottom strip: 58px, top 1px line, mono counts. */}
      <footer className="border-t border-rule bg-paper px-4 md:px-8">
        <div className="mx-auto flex min-h-14 max-w-[1600px] items-center justify-between text-[13px] text-ash">
          <span>59 apps. One at a time.</span>
          <span className="font-mono text-[11px]">
            {counts.released} down · {CHALLENGE_TOTAL - counts.released} to go
          </span>
        </div>
      </footer>
    </div>
  );
}
