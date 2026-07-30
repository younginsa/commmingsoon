"use client";

import { useEffect, useState } from "react";
import { Countdown } from "@/components/Countdown";
import { Poster } from "@/components/Poster";
import { formatDate } from "@/lib/format";
import type { Project } from "@/types/project";

const ROTATE_MS = 7000;

/**
 * Netflix-style rotating hero. Cycles through the featured coming-soon
 * project plus the latest releases with a slow cross-fade.
 *
 * Cross-fade mechanics: the *previous* slide is rendered underneath at full
 * opacity, and the current slide — keyed by index so the animation restarts —
 * fades in over it. No transition library, one keyframe.
 */
export function HeroRotator({ slides }: { slides: Project[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      ROTATE_MS,
    );
    return () => clearInterval(id);
  }, [slides.length]);

  const prev = slides[(index - 1 + slides.length) % slides.length];

  return (
    <section className="relative isolate min-h-[86svh] w-full overflow-hidden md:min-h-[80vh]">
      {/* Outgoing slide stays put; incoming fades in over it. */}
      {slides.length > 1 && index > 0 && <Slide project={prev} hidden />}
      <Slide key={index} project={slides[index]} fade={index > 0} />

      {/* Slide indicators. Oversized hit areas for thumbs. */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 md:bottom-5">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Show ${slide.title}`}
              onClick={() => setIndex(i)}
              className="flex h-11 w-8 items-center justify-center"
            >
              <span
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === index ? "w-6 bg-flame" : "w-3 bg-white/25"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function Slide({
  project,
  fade = false,
  hidden = false,
}: {
  project: Project;
  fade?: boolean;
  hidden?: boolean;
}) {
  const released = project.status === "released";

  return (
    <div
      className={`${hidden ? "absolute inset-0" : "relative"} ${fade ? "hero-fade" : ""}`}
      aria-hidden={hidden}
    >
      <div className="absolute inset-0">
        <Poster
          project={project}
          className="h-full w-full"
          sizes="100vw"
          priority={!fade && !hidden}
          showNumber={false}
          mono
        />
      </div>

      {/* Bottom scrim on mobile, left-weighted scrim on desktop. */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-transparent md:bg-gradient-to-r md:from-ink md:via-ink/75 md:to-transparent" />

      <div className="relative flex min-h-[86svh] flex-col justify-end px-4 pt-24 pb-14 md:min-h-[80vh] md:max-w-2xl md:justify-center md:px-8 md:pb-16 lg:max-w-3xl">
        <p className="font-mono text-xs tracking-[0.25em] text-flame uppercase">
          {released ? "Now live" : "Coming Soon"} · No.{" "}
          {String(project.no).padStart(2, "0")} of 59
        </p>

        {/* Heavy display cut, one step smaller than v1 so long titles
            don't break the mobile hero. */}
        <h1 className="mt-3 text-3xl leading-[1.05] font-black tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
          {project.title}
        </h1>

        <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
          {project.tagline}
        </p>

        {/* Status line: countdown for coming-soon, ship date for released. */}
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
          {released ? (
            project.releasedAt && (
              <span className="text-sm text-mist">
                Shipped · {formatDate(project.releasedAt)}
              </span>
            )
          ) : (
            <>
              {project.targetDate && (
                <>
                  <Countdown targetDate={project.targetDate} />
                  <span className="text-sm text-mist">
                    Target · {formatDate(project.targetDate)}
                  </span>
                </>
              )}
            </>
          )}
        </div>

        {!released && project.highlights && (
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

        {/* 48px-tall CTAs — one row everywhere; equal halves on mobile. */}
        <div className="mt-7 flex gap-2.5">
          {released && project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-white px-2 text-sm font-semibold text-ink transition active:scale-[0.98] sm:flex-none sm:px-6 md:hover:bg-white/85"
            >
              <span className="text-flame">▶</span> Open live app
            </a>
          ) : (
            <a
              href="#coming-soon"
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-white px-2 text-sm font-semibold text-ink transition active:scale-[0.98] sm:flex-none sm:px-6 md:hover:bg-white/85"
            >
              <span className="text-flame">▶</span> See what&apos;s building
            </a>
          )}
          <a
            href="#confirmed"
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-lg bg-white/12 px-2 text-sm font-semibold text-white backdrop-blur transition active:scale-[0.98] sm:flex-none sm:px-6 md:hover:bg-white/20"
          >
            Browse the archive
          </a>
        </div>

        {project.tags && (
          <p className="mt-6 font-mono text-[11px] tracking-wider text-mist">
            {project.tags.join("  ·  ")}
          </p>
        )}
      </div>
    </div>
  );
}
