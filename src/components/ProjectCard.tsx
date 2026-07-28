import { Countdown } from "@/components/Countdown";
import { Poster } from "@/components/Poster";
import { accentStyle, formatDate } from "@/lib/format";
import type { Project } from "@/types/project";

/**
 * Shared sizing: fixed-width snap item on mobile, grid track on md+.
 * Visual skin differs per zone — dark cinematic for coming-soon, light
 * catalog (spottedinprod-style hairlines) for released/confirmed.
 */
const SIZE =
  "group relative flex w-[76vw] max-w-[300px] shrink-0 snap-start flex-col " +
  "overflow-hidden md:w-auto md:max-w-none transition duration-300 ease-out";

const DARK_SKIN =
  "rounded-xl border border-hairline bg-surface " +
  "md:hover:-translate-y-1 md:hover:border-white/25 md:hover:shadow-2xl md:hover:shadow-black/60";

const LIGHT_SKIN =
  "rounded-lg border border-rule bg-paper " +
  "md:hover:border-carbon/40 md:hover:shadow-lg md:hover:shadow-black/5";

function Tags({ tags, light = false }: { tags?: string[]; light?: boolean }) {
  if (!tags?.length) return null;
  return (
    <ul className="mt-3 flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <li
          key={tag}
          className={`rounded-full border px-2 py-0.5 text-[11px] ${
            light
              ? "border-rule bg-paper-2 text-ash"
              : "border-hairline bg-surface-2 text-mist"
          }`}
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}

/* ---------------- Released: light catalog card ---------------- */

function ReleasedCard({ project }: { project: Project }) {
  const body = (
    <>
      <Poster project={project} />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-base font-semibold text-carbon">
            {project.title}
          </h3>
          {project.releasedAt && (
            <time
              dateTime={project.releasedAt}
              className="shrink-0 font-mono text-[11px] text-ash"
            >
              {formatDate(project.releasedAt)}
            </time>
          )}
        </div>
        <p className="mt-1.5 line-clamp-2 text-sm text-ash">
          {project.tagline}
        </p>
        <Tags tags={project.tags} light />

        {/* 44px-tall footer: the visible thumb target. */}
        <div className="mt-auto flex min-h-11 items-center gap-1.5 pt-4 text-sm font-medium text-carbon">
          <span className="text-flame">▶</span>
          {project.liveUrl ? "Open live app" : "Shipped"}
        </div>
      </div>
    </>
  );

  return project.liveUrl ? (
    <a
      href={project.liveUrl}
      target="_blank"
      rel="noreferrer"
      className={`${SIZE} ${LIGHT_SKIN} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flame`}
    >
      {body}
    </a>
  ) : (
    <article className={`${SIZE} ${LIGHT_SKIN}`}>{body}</article>
  );
}

/* ---------------- Coming soon: light card, live countdown ---------------- */

function ComingSoonCard({ project }: { project: Project }) {
  return (
    <article className={`${SIZE} ${LIGHT_SKIN}`}>
      <Poster project={project} className="aspect-[16/9]" />
      <div className="flex flex-1 flex-col p-4">
        {project.targetDate && (
          <Countdown targetDate={project.targetDate} size="sm" light />
        )}
        <h3 className="mt-2.5 text-base font-semibold text-carbon">
          {project.title}
        </h3>
        <p className="mt-1.5 line-clamp-3 text-sm text-ash">
          {project.tagline}
        </p>
        <Tags tags={project.tags} light />

        {typeof project.progress === "number" && (
          <div className="mt-auto pt-4">
            <div className="flex items-center justify-between text-[11px] text-ash">
              <span>Build progress</span>
              <span className="font-mono tabular-nums">
                {project.progress}%
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-rule">
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

/* ---------------- Confirmed: light card, blurred mystery art ------ */

function ConfirmedCard({ project }: { project: Project }) {
  return (
    <article className={`${SIZE} ${LIGHT_SKIN}`}>
      {/* Unannounced-app treatment: the accent gradient smeared into a soft
          blob, like a screenshot you're not allowed to see yet. The blurred
          layer is oversized so the blur never exposes a hard edge. */}
      <div className="relative aspect-[16/10] overflow-hidden bg-paper-2">
        <div
          className="absolute inset-0 scale-125 blur-2xl saturate-150"
          style={accentStyle(project.accent)}
        />
        <div className="absolute inset-0 bg-white/25" />
        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center font-mono text-5xl font-bold text-white/85 drop-shadow-sm select-none"
        >
          {String(project.no).padStart(2, "0")}
        </span>
      </div>

      <div className="flex flex-1 flex-col border-t border-rule p-4">
        <span className="font-mono text-[11px] tracking-widest text-ash uppercase">
          No. {String(project.no).padStart(2, "0")} · Confirmed
        </span>
        <h3 className="mt-1.5 text-base font-semibold text-carbon">
          {project.title}
        </h3>
        <p className="mt-1.5 line-clamp-3 text-sm text-ash">
          {project.tagline}
        </p>
        <Tags tags={project.tags} light />
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
