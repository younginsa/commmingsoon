import { ProjectCard } from "@/components/ProjectCard";
import { SECTIONS, type Project, type ProjectStatus } from "@/types/project";

/**
 * One responsive container, two layouts — no JS, no media-query hooks.
 *
 *   < md : flex + overflow-x-auto + snap  → Netflix-style horizontal rail.
 *          The negative margin lets it bleed to both screen edges while the
 *          matching padding keeps the first/last card off the glass.
 *   ≥ md : grid, 2 → 3 → 4 columns, overflow reset so hover lift isn't clipped.
 */
const RAIL =
  "no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 " +
  "md:mx-0 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 md:pb-0";

/**
 * Column count per section. "Coming Soon" holds one or two projects at a time,
 * so it caps at 3 tracks — four would leave half the row empty.
 */
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
  const { label, eyebrow, blurb } = SECTIONS[status];

  return (
    <section id={status} className="scroll-mt-20 px-4 py-8 md:px-8 md:py-12">
      <header className="mb-4 flex items-end justify-between gap-4 md:mb-6">
        <div>
          <p className="font-mono text-[11px] tracking-[0.2em] text-flame uppercase">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-white md:text-3xl">
            {label}
          </h2>
          <p className="mt-1 text-sm text-mist">{blurb}</p>
        </div>
        <span className="shrink-0 rounded-full border border-hairline bg-surface px-3 py-1 font-mono text-xs text-mist">
          {projects.length}
        </span>
      </header>

      <div className={`${RAIL} ${COLUMNS[status]}`}>
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {/* Swipe affordance, mobile only. */}
      <p className="mt-2 text-[11px] text-mist/60 md:hidden">
        Swipe to see all {projects.length} →
      </p>
    </section>
  );
}
