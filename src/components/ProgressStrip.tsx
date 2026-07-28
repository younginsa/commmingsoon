import type { ProjectStatus } from "@/types/project";

const STATS: { status: ProjectStatus; label: string; dot: string }[] = [
  { status: "released", label: "Released", dot: "bg-flame" },
  { status: "coming-soon", label: "Coming Soon", dot: "bg-white" },
  { status: "confirmed", label: "Confirmed", dot: "bg-white/30" },
];

/** The "x of 59" band that sits between the hero and the first rail. */
export function ProgressStrip({
  counts,
  total,
}: {
  counts: Record<ProjectStatus, number>;
  total: number;
}) {
  const pct = Math.round((counts.released / total) * 100);

  return (
    <div className="border-y border-hairline bg-surface/40 px-4 py-5 md:px-8 md:py-6">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <p className="text-sm text-mist">
          <span className="font-mono text-2xl font-bold text-white md:text-3xl">
            {counts.released}
          </span>
          <span className="font-mono text-lg text-mist"> / {total}</span> apps
          shipped
        </p>

        <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
          {STATS.map(({ status, label, dot }) => (
            <li
              key={status}
              className="flex items-center gap-1.5 text-xs text-mist"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
              {label}
              <span className="font-mono tabular-nums text-white/70">
                {counts[status]}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-flame transition-[width] duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
