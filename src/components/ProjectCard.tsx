import Image from "next/image";
import { Countdown } from "@/components/Countdown";
import { formatDate } from "@/lib/format";
import {
  LINK_LABELS,
  primaryLink,
  projectThumb,
  type Project,
} from "@/types/project";

/**
 * Light-zone cards follow the spottedinprod DS `comp-card` pattern:
 * square corners, 1px --line borders, a 13px head strip, a 16:10 dot-grid
 * visual area, and a mono chip row. No shadows, no hue — state and structure
 * are expressed with borders, fills, and underlines only.
 *
 * Sizing: fixed-width snap item on mobile, grid track on md+.
 */
const CARD =
  "group relative flex w-[76vw] max-w-[300px] shrink-0 snap-start flex-col " +
  "overflow-hidden border border-rule bg-paper transition-colors duration-200 " +
  "md:w-auto md:max-w-none md:hover:border-chev";

/** DS chip: mono 11px, 1px line, square. */
function Chips({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return (
    <ul className="flex flex-wrap gap-1.5 px-3.5 pt-0 pb-3">
      {items.map((item) => (
        <li
          key={item}
          className="border border-rule px-2 py-0.5 font-mono text-[11px] text-ash"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/** DS card head strip: 13px, bottom 1px line, optional mono meta on the right. */
function Head({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-2 border-b border-rule px-3.5 py-2">
      <h3 className="truncate text-[13px] text-carbon">{title}</h3>
      {meta && (
        <span className="shrink-0 font-mono text-[11px] text-ash">{meta}</span>
      )}
    </div>
  );
}

/**
 * DS visual area: 16:10 dot grid with a mono label chip, or the real
 * screenshot once `project.image` exists.
 */
function Vis({ project, caption }: { project: Project; caption: string }) {
  const thumb = projectThumb(project);
  return (
    <div className="dotgrid relative flex aspect-[16/10] items-center justify-center">
      {thumb ? (
        <Image
          src={thumb}
          alt=""
          fill
          sizes="(max-width: 768px) 76vw, 25vw"
          className="object-cover"
        />
      ) : (
        <div className="flex flex-col items-center gap-1.5">
          <span className="border border-rule bg-paper px-2.5 py-1 font-mono text-[10px] tracking-[0.08em] text-ash">
            No. {String(project.no).padStart(2, "0")}
          </span>
          <span className="text-[11px] text-ash">{caption}</span>
        </div>
      )}
    </div>
  );
}

/* ---------------- Released ---------------- */

function ReleasedCard({ project }: { project: Project }) {
  const links = (project.links ?? []).filter((l) => l.url);

  return (
    <article className={CARD}>
      <Head
        title={project.title}
        meta={project.releasedAt ? formatDate(project.releasedAt) : undefined}
      />
      <Vis project={project} caption="screenshot soon" />
      <div className="flex flex-1 flex-col border-t border-rule">
        {/* mb (not pb): clamped overflow paints into padding, so padding-bottom
            here would show a sliver of the clipped next line. */}
        <p className="mb-2 line-clamp-2 px-3.5 pt-2.5 text-sm leading-relaxed text-ash">
          {project.tagline}
        </p>
        <Chips items={project.tags} />
        {/* Footer row: one preset CTA per link (max 3), 44px tall. */}
        <div className="mt-auto flex min-h-11 items-center gap-1.5 border-t border-rule px-3.5 py-2">
          {links.length === 0 ? (
            <span className="text-sm text-carbon">Shipped</span>
          ) : (
            links.map((link) => (
              <a
                key={link.type + link.url}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-8 items-center gap-1.5 rounded-[4px] bg-paper-2 px-2.5 text-[12px] font-medium text-carbon transition hover:bg-rule"
              >
                {LINK_LABELS[link.type]}
                <span className="hchev scale-75 text-chev" />
              </a>
            ))
          )}
        </div>
      </div>
    </article>
  );
}

/* ---------------- Coming soon ---------------- */

function ComingSoonCard({ project }: { project: Project }) {
  return (
    <article className={CARD}>
      <Head
        title={project.title}
        meta={
          project.targetDate ? formatDate(project.targetDate) : undefined
        }
      />
      <Vis project={project} caption="in production" />
      <div className="flex flex-1 flex-col border-t border-rule">
        <div className="px-3.5 pt-2.5">
          {project.targetDate && (
            <Countdown targetDate={project.targetDate} size="sm" light />
          )}
        </div>
        <p className="px-3.5 pt-2 pb-2 text-sm leading-relaxed text-ash">
          {project.tagline}
        </p>
        <Chips items={project.tags} />

        {typeof project.progress === "number" && (
          <div className="mt-auto border-t border-rule px-3.5 py-2.5">
            <div className="flex items-center justify-between font-mono text-[11px] text-ash">
              <span>progress</span>
              <span className="tabular-nums">{project.progress}%</span>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden bg-paper-2">
              <div
                className="h-full bg-carbon"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

/* ---------------- Confirmed ---------------- */

function ConfirmedCard({ project }: { project: Project }) {
  return (
    <article className={CARD}>
      <Head
        title={project.title}
        meta={`No. ${String(project.no).padStart(2, "0")}`}
      />
      <Vis project={project} caption="concept locked" />
      <div className="flex flex-1 flex-col border-t border-rule">
        <p className="mb-2 line-clamp-3 px-3.5 pt-2.5 text-sm leading-relaxed text-ash">
          {project.tagline}
        </p>
        <Chips items={project.tags} />
      </div>
    </article>
  );
}

/* ---------------- Mobile tile: Netflix-style 3-up grid ---------------- */

/**
 * Compact portrait tile for the mobile 3-column grids (Released/Confirmed) —
 * the Netflix search-grid pattern, in DS clothes: 2:3 dot-grid poster with
 * the number chip, title strip below. Real artwork fills the poster when
 * `image` exists.
 */
export function ProjectTile({ project }: { project: Project }) {
  const thumb = projectThumb(project);
  const link = primaryLink(project);
  const inner = (
    <>
      <div className="dotgrid relative flex aspect-[2/3] items-center justify-center">
        {thumb ? (
          <Image
            src={thumb}
            alt=""
            fill
            sizes="30vw"
            className="object-cover"
          />
        ) : (
          <span className="border border-rule bg-paper px-1.5 py-0.5 font-mono text-[10px] tracking-[0.08em] text-ash">
            {String(project.no).padStart(2, "0")}
          </span>
        )}
      </div>
      <div className="border-t border-rule px-1.5 py-1.5">
        <p className="truncate text-[11px] text-carbon">{project.title}</p>
      </div>
    </>
  );

  const cls = "flex flex-col overflow-hidden border border-rule bg-paper";

  return link ? (
    <a href={link.url} target="_blank" rel="noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <article className={cls}>{inner}</article>
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
