import Image from "next/image";
import { accentStyle } from "@/lib/format";
import type { Project } from "@/types/project";

/** Hero placeholder: dark gray gradient, no hue. */
const MONO_STYLE = {
  backgroundImage:
    "radial-gradient(120% 120% at 20% 0%, #3f3f46 0%, #1c1c21 55%, #08080b 100%)",
};

/**
 * The artwork block. Uses `project.image` when there is one and falls back to
 * a gradient — the project's `accent` colors, or a neutral dark gray when
 * `mono` is set (the hero uses this).
 *
 * `className` carries the aspect ratio — cards and the hero want different ones.
 */
export function Poster({
  project,
  className = "aspect-[16/10]",
  sizes = "(max-width: 768px) 76vw, 25vw",
  priority = false,
  showNumber = true,
  mono = false,
}: {
  project: Project;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Off for the hero, which already prints "No. 04 of 59" in the eyebrow. */
  showNumber?: boolean;
  /** Dark gray placeholder gradient instead of the accent colors. */
  mono?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={mono ? MONO_STYLE : accentStyle(project.accent)}
    >
      {project.image && (
        <Image
          src={project.image}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      )}

      {/* Number watermark — reads as poster art, not as a label. */}
      {showNumber && (
        <span
          aria-hidden
          className="absolute -bottom-4 right-2 font-mono text-[5.5rem] leading-none font-bold text-white/12 select-none md:text-[7rem]"
        >
          {String(project.no).padStart(2, "0")}
        </span>
      )}

      {/* Scrim so overlaid text stays legible on any artwork. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
    </div>
  );
}
