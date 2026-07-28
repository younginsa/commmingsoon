import { Countdown } from "@/components/Countdown";
import { Poster } from "@/components/Poster";
import { formatDate } from "@/lib/format";
import type { Project } from "@/types/project";

/**
 * Card sizing lives here and nowhere else.
 *
 * Mobile: fixed-width so the parent rail can scroll it horizontally.
 * md+:    width comes from the parent grid track.
 */
const CARD =
  "group relative flex w-[76vw] max-w-[300px] shrink-0 snap-start flex-col " +
  "overflow-hidden rounded-xl border border-hairline bg-surface " +
  "md:w-auto md:max-w-none " +
  "transition duration-300 ease-out md:hover:-translate-y-1 " +
  "md:hover:border-white/25 md:hover:shadow-2xl md:hover:shadow-black/60";

function Tags({ tags }: { tags?: string[] }) {
  if (!tags?.length) return null;
  return (
    <ul className="mt-3 flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <li
          key={tag}
          className="rounded-full border border-hairline bg-surface-2 px-2 py-0.5 text-[11px] text-mist"
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */

function ReleasedCard({ project }: { project: Project }) {
  const body = (
    <>
      <Poster project={project} />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-base font-semibold text-white">{project.title}</h3>
          {project.releasedAt && (
            <time
              dateTime={project.releasedAt}
              className="shrink-0 font-mono text-[11px] text-mist"
            >
              {formatDate(project.releasedAt)}
            </time>
          )}
        </div>
        <p className="mt-1.5 line-clamp-2 text-sm text-mist">
          {project.tagline}
        </p>
        <Tags tags={project.tags} />

        {/* 44px-tall footer: the thumb target, separate from the card link. */}
        <div className="mt-auto flex min-h-11 items-center gap-1.5 pt-4 text-sm font-medium text-white">
          <span className="text-flame">▶</span>
          {project.liveUrl ? "Open live app" : "Shipped"}
        </div>
      </div>
    </>
  );

  // Whole card is one big tap target when there is somewhere to go.
  return project.liveUrl ? (
    <a
      href={project.liveUrl}
      target="_blank"
      rel="noreferrer"
      className={`${CARD} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flame`}
    >
      {body}
    </a>
  ) : (
    <article className={CARD}>{body}</article>
  );
}

function ComingSoonCard({ project }: { project: Project }) {
  return (
    <article className={CARD}>
      <Poster project={project} className="aspect-[16/9]" />
      <div className="flex flex-1 flex-col p-4">
        {project.targetDate && (
          <Countdown targetDate={project.targetDate} size="sm" />
        )}
        <h3 className="mt-2.5 text-base font-semibold text-white">
          {project.title}
        </h3>
        <p className="mt-1.5 line-clamp-3 text-sm text-mist">
          {project.tagline}
        </p>
        <Tags tags={project.tags} />

        {typeof project.progress === "number" && (
          <div className="mt-auto pt-4">
            <div className="flex items-center justify-between text-[11px] text-mist">
              <span>Build progress</span>
              <span className="font-mono tabular-nums">{project.progress}%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-flame"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function ConfirmedCard({ project }: { project: Project }) {
  return (
    <article className={`${CARD} border-dashed`}>
      <Poster project={project} className="aspect-[16/10] opacity-55" />
      <div className="flex flex-1 flex-col p-4">
        <span className="font-mono text-[11px] tracking-widest text-mist uppercase">
          No. {String(project.no).padStart(2, "0")} · Confirmed
        </span>
        <h3 className="mt-1.5 text-base font-semibold text-white/85">
          {project.title}
        </h3>
        <p className="mt-1.5 line-clamp-3 text-sm text-mist">
          {project.tagline}
        </p>
        <Tags tags={project.tags} />
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */

/** The only place `status` is branched on. Add a status → add a case. */
export function ProjectCard({ project }: { project: Project }) {
  switch (project.status) {
    case "released":
      return <ReleasedCard project={project} />;
    case "coming-soon":
      return <ComingSoonCard project={project} />;
    case "confirmed":
      return <ConfirmedCard project={project} />;
  }
}
