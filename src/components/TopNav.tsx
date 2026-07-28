import { SECTIONS, SECTION_ORDER } from "@/types/project";

/**
 * Sticky nav. Links sit on 44px targets and stay on one line on small phones
 * by dropping the section blurbs, not by hiding the links.
 */
export function TopNav({
  released,
  total,
}: {
  released: number;
  total: number;
}) {
  return (
    // Near-solid ink, not translucent: the bar crosses the light zone too,
    // and a see-through dark bar over white reads as dirt.
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-ink/95 backdrop-blur-xl">
      <nav className="mx-auto flex h-14 max-w-[1600px] items-center gap-1 px-4 md:h-16 md:gap-2 md:px-8">
        <a
          href="#top"
          className="mr-auto flex min-h-11 items-center gap-1.5 text-sm font-black tracking-tight text-white md:text-base"
        >
          <span>JOHN BURN</span>
          <span className="hidden text-flame sm:inline">·</span>
          <span className="hidden text-mist sm:inline">ARCHIVE</span>
        </a>

        {SECTION_ORDER.map((status) => (
          <a
            key={status}
            href={`#${status}`}
            className="inline-flex min-h-11 items-center rounded-lg px-2.5 text-xs text-mist transition hover:text-white md:px-3 md:text-sm"
          >
            {SECTIONS[status].label}
          </a>
        ))}

        <span className="ml-1 hidden shrink-0 rounded-full border border-hairline px-3 py-1 font-mono text-xs text-mist sm:inline-block">
          {released}/{total}
        </span>
      </nav>
    </header>
  );
}
