import { ProjectCard, ProjectTile } from "@/components/ProjectCard";
import { SECTIONS, type Project, type ProjectStatus } from "@/types/project";

/**
 * Responsive layouts, no JS:
 *
 *   Coming Soon    < md : horizontal snap rail (few items, cards carry the
 *                         live countdown + progress, worth the width)
 *   Released/
 *   Confirmed      < md : Netflix-style 3-column tile grid (these lists grow
 *                         toward 59 — a rail would take forever to swipe)
 *   everything     ≥ md : gapped card grid, 2 → 3 → 4 columns.
 */
const RAIL =
  "no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 " +
  "md:mx-0 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 md:pb-0";

/** "Coming Soon" holds 1–2 projects, so it caps at 3 tracks. */
const COLUMNS: Record<ProjectStatus, string> = {
  "coming-soon": "lg:grid-cols-3",
  released: "lg:grid-cols-3 xl:grid-cols-4",
  confirmed: "lg:grid-cols-3 xl:grid-cols-4",
};

export function Section({
  status,
  projects,
}: {
  status: ProjectStatus;
  projects: Project[];
}) {
  if (!projects.length) return null;
  const { label, blurb } = SECTIONS[status];
  const rail = status === "coming-soon";

  return (
    <section id={status} className="scroll-mt-20 bg-paper">
      {/* DS strip header: the line runs full-bleed, text stops at max-width. */}
      <header className="border-b border-rule px-4 md:px-8">
        <div className="mx-auto flex min-h-14 max-w-[1600px] items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <h2 className="text-[15px] text-carbon">{label}</h2>
            <p className="hidden text-[13px] text-ash sm:block">{blurb}</p>
          </div>
          {/* DS `.n` badge — the one round element in the system. */}
          <span className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-rule font-mono text-[11px] text-ash">
            {projects.length}
          </span>
        </div>
      </header>

      <div className="px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-[1600px]">
          {rail ? (
            <>
              <div className={`${RAIL} ${COLUMNS[status]}`}>
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
              {/* Swipe affordance, mobile only — pixel chevron, not an arrow. */}
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-ash md:hidden">
                Swipe to see all {projects.length}
                <span className="hchev text-chev" />
              </p>
            </>
          ) : (
            <>
              {/* Mobile: Netflix 3-up tile grid. */}
              <div className="grid grid-cols-3 gap-2 md:hidden">
                {projects.map((project) => (
                  <ProjectTile key={project.id} project={project} />
                ))}
              </div>
              {/* Desktop: full cards. */}
              <div
                className={`hidden md:grid md:grid-cols-2 md:gap-5 ${COLUMNS[status]}`}
              >
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
