import { Countdown } from "@/components/Countdown";
import { Poster } from "@/components/Poster";
import { formatDate } from "@/lib/format";
import type { Project } from "@/types/project";

/**
 * The wide "Coming Soon" banner — one featured project, full-bleed.
 *
 * Height uses `svh` on mobile so the CTAs never hide behind Safari's toolbar,
 * and the art keeps a cinematic ratio on desktop.
 */
export function Hero({ project }: { project: Project }) {
  return (
    <section className="relative isolate min-h-[86svh] w-full overflow-hidden md:min-h-[80vh]">
      <div className="absolute inset-0">
        <Poster
          project={project}
          className="h-full w-full"
          sizes="100vw"
          priority
          showNumber={false}
        />
      </div>

      {/* Bottom scrim on mobile, left-weighted scrim on desktop. */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-transparent md:bg-gradient-to-r md:from-ink md:via-ink/75 md:to-transparent" />

      <div className="relative flex min-h-[86svh] flex-col justify-end px-4 pt-24 pb-10 md:min-h-[80vh] md:max-w-2xl md:justify-center md:px-8 md:pb-16 lg:max-w-3xl">
        <p className="font-mono text-xs tracking-[0.25em] text-flame uppercase">
          Coming Soon · No. {String(project.no).padStart(2, "0")} of 59
        </p>

        <h1 className="mt-3 text-4xl leading-[1.05] font-black tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          {project.title}
        </h1>

        <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
          {project.tagline}
        </p>

        {project.targetDate && (
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Countdown targetDate={project.targetDate} />
            <span className="text-sm text-mist">
              Target · {formatDate(project.targetDate)}
            </span>
          </div>
        )}

        {project.highlights && (
          <ul className="mt-5 space-y-1.5">
            {project.highlights.map((line) => (
              <li
                key={line}
                className="flex gap-2.5 text-sm text-white/70 md:text-base"
              >
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-flame" />
                {line}
              </li>
            ))}
          </ul>
        )}

        {/* 48px-tall CTAs — full width on mobile so they're easy to hit. */}
        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
          <a
            href="#coming-soon"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-ink transition active:scale-[0.98] md:hover:bg-white/85"
          >
            <span className="text-flame">▶</span> See what&apos;s building
          </a>
          <a
            href="#confirmed"
            className="inline-flex min-h-12 items-center justify-center rounded-lg bg-white/12 px-6 text-sm font-semibold text-white backdrop-blur transition active:scale-[0.98] md:hover:bg-white/20"
          >
            Browse the backlog
          </a>
        </div>

        {project.tags && (
          <p className="mt-6 font-mono text-[11px] tracking-wider text-mist">
            {project.tags.join("  ·  ")}
          </p>
        )}
      </div>
    </section>
  );
}
