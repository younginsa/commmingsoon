"use client";

import { useEffect, useState } from "react";
import { SECTIONS, SECTION_ORDER } from "@/types/project";

const NAV_H = 64;

/**
 * Sticky nav with two skins: ink over the dark hero, DS paper once the light
 * catalog reaches it. Items follow the DS 내비항목 3-state — rest gray text,
 * hover = surface fill, active = ink text in a square 1px --line box (the
 * border stays light; only the text goes ink).
 *
 * Active section comes from a scroll-spy: the last section whose top has
 * passed the nav.
 */
export function TopNav({
  released,
  total,
}: {
  released: number;
  total: number;
}) {
  const [light, setLight] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = SECTION_ORDER.map((s) =>
      document.getElementById(s),
    ).filter((el): el is HTMLElement => el !== null);

    const onScroll = () => {
      // Light skin once the first catalog section slides under the nav.
      setLight(
        sections.length > 0 &&
          sections[0].getBoundingClientRect().top <= NAV_H,
      );
      // Scroll-spy: last section whose header has passed the nav.
      let current: string | null = null;
      for (const el of sections) {
        if (el.getBoundingClientRect().top <= NAV_H + 80) current = el.id;
      }
      setActive(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        light
          ? "border-rule bg-paper/95 backdrop-blur-xl"
          : "border-white/5 bg-ink/95 backdrop-blur-xl"
      }`}
    >
      <nav className="mx-auto flex h-14 max-w-[1600px] items-center gap-1 px-4 md:h-16 md:gap-2 md:px-8">
        <a
          href="#top"
          className={`mr-auto flex min-h-11 items-center gap-1.5 text-sm font-black tracking-tight md:text-base ${
            light ? "text-carbon" : "text-white"
          }`}
        >
          <span>JOHN BURN</span>
          <span
            className={`hidden sm:inline ${light ? "text-carbon" : "text-flame"}`}
          >
            ·
          </span>
          <span
            className={`hidden sm:inline ${light ? "text-ash" : "text-mist"}`}
          >
            ARCHIVE
          </span>
        </a>

        {SECTION_ORDER.map((status) => {
          const isActive = active === status;
          return (
            <a
              key={status}
              href={`#${status}`}
              className={`inline-flex min-h-9 items-center border px-2.5 text-xs transition-colors md:text-[15px] ${
                isActive
                  ? light
                    ? "border-rule text-carbon"
                    : "border-hairline text-white"
                  : light
                    ? "border-transparent text-[#6b6b6b] hover:bg-paper-2 hover:text-carbon"
                    : "border-transparent text-mist hover:bg-surface-2 hover:text-white"
              }`}
            >
              {SECTIONS[status].label}
            </a>
          );
        })}

        <span
          className={`ml-1 hidden shrink-0 rounded-full border px-3 py-1 font-mono text-xs sm:inline-block ${
            light ? "border-rule text-ash" : "border-hairline text-mist"
          }`}
        >
          {released}/{total}
        </span>
      </nav>
    </header>
  );
}
