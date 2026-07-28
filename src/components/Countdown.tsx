"use client";

import { useSyncExternalStore } from "react";
import { dDayLabel, daysUntil } from "@/lib/format";

/* ------------------------------------------------------------------ *
 * One shared 1-second clock for every countdown on the page.
 * `now` is 0 on the server and until the first subscriber attaches, which is
 * how the components know not to render a ticking value during hydration.
 * ------------------------------------------------------------------ */

const listeners = new Set<() => void>();
let now = 0;
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  if (timer === null) {
    // Seed immediately so the clock appears on the first post-mount paint
    // instead of a second later. React re-reads the snapshot after subscribe.
    now = Date.now();
    timer = setInterval(() => {
      now = Date.now();
      for (const listener of listeners) listener();
    }, 1000);
  }
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };
}

const getSnapshot = () => now;
const getServerSnapshot = () => 0;

function parts(iso: string, at: number) {
  const [y, mo, d] = iso.split("-").map(Number);
  const diff = Date.UTC(y, mo - 1, d) - at;
  const abs = Math.abs(diff);
  return {
    days: Math.floor(abs / 86_400_000),
    hours: Math.floor(abs / 3_600_000) % 24,
    minutes: Math.floor(abs / 60_000) % 60,
    seconds: Math.floor(abs / 1000) % 60,
    past: diff <= 0,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Live D-Day counter.
 *
 * First paint is the server-computed `D-n` badge only; the H:M:S line appears
 * after mount. The server and a phone never agree on the current second, so
 * rendering it during hydration would mismatch.
 */
export function Countdown({
  targetDate,
  size = "md",
  light = false,
}: {
  targetDate: string;
  size?: "sm" | "md";
  /** Timer text color for light backgrounds; the red badge works on both. */
  light?: boolean;
}) {
  const at = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const t = at === 0 ? null : parts(targetDate, at);
  const big = size === "md";

  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`rounded-md bg-flame font-mono font-bold tracking-tight text-white ${
          big ? "px-2.5 py-1 text-base" : "px-2 py-0.5 text-xs"
        }`}
      >
        {dDayLabel(daysUntil(targetDate))}
      </span>

      {t && (
        <span
          className={`font-mono tabular-nums ${light ? "text-ash" : "text-mist"} ${
            big ? "text-sm" : "text-[11px]"
          }`}
        >
          {t.past ? "overdue by " : ""}
          {t.days}d {pad(t.hours)}:{pad(t.minutes)}:{pad(t.seconds)}
        </span>
      )}
    </div>
  );
}
