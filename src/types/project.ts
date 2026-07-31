/**
 * ONE flat interface for every project in the 59-app challenge.
 *
 * The `status` field is the only switch you ever need to touch: it decides
 * which section the card lands in and which card component renders it.
 *
 *   "confirmed"   -> Backlog rail        (ConfirmedCard)
 *   "coming-soon" -> Hero + Coming Soon  (ComingSoonCard + countdown)
 *   "released"    -> Released grid       (ReleasedCard)
 *
 * Fields are optional per status rather than split across separate types, so a
 * project can be promoted (confirmed -> coming-soon -> released) by editing one
 * string and filling in the extra fields as they become real.
 */
export type ProjectStatus = "confirmed" | "coming-soon" | "released";

/** Released projects link out through typed CTAs with preset designs. */
export type LinkType = "appstore" | "googleplay" | "weblink";

export interface ProjectLink {
  type: LinkType;
  url: string;
}

/** Admin-facing labels for each link type (public CTA text too). */
export const LINK_LABELS: Record<LinkType, string> = {
  appstore: "App Store",
  googleplay: "Google Play",
  weblink: "Web",
};

export interface Project {
  // ---- Always required -------------------------------------------------
  /** Stable slug, used as React key and anchor id. */
  id: string;
  /** Challenge number, 1–59. Rendered as the big "No. 07" watermark. */
  no: number;
  title: string;
  status: ProjectStatus;
  /**
   * One line of copy. Doubles as:
   *  - released    -> what the app does
   *  - coming-soon -> the core feature teaser
   *  - confirmed   -> the brief concept note
   */
  tagline: string;
  // ---- Optional, filled in as the project matures -----------------------
  /** Legacy: two hex stops for the old gradient posters. Unused by new UI. */
  accent?: [string, string];
  /** Legacy single image. Prefer `images[0]`. */
  image?: string;
  /** Screenshots / artwork. First one is the card thumbnail + hero art. */
  images?: string[];
  /** Tech tags. Empty for most `confirmed` rows — that's fine. */
  tags?: string[];

  /** released: up to 3 outbound links, each rendered as a preset CTA. */
  links?: ProjectLink[];
  /** released: ISO date (YYYY-MM-DD) shown as the completion date. */
  releasedAt?: string;
  /** Admin: pinned to the hero rotation (max 8 across all projects). */
  pinned?: boolean;

  /** coming-soon: ISO date (YYYY-MM-DD) that drives the D-Day countdown. */
  targetDate?: string;
  /** coming-soon: 0–100, drives the thin progress bar on the card. */
  progress?: number;
  /** coming-soon: up to 3 bullet features listed under the hero. */
  highlights?: string[];
  /** Legacy hero flag; superseded by `pinned`. */
  featured?: boolean;
}

/** First usable artwork for a project, or null for the dot-grid placeholder. */
export function projectThumb(project: Project): string | null {
  return project.images?.[0] ?? project.image ?? null;
}

/** First outbound link — the card/tile/hero primary destination. */
export function primaryLink(project: Project): ProjectLink | null {
  return project.links?.[0] ?? null;
}

/** Section metadata, keyed by status. Add a status → add a row. Nothing else. */
export const SECTIONS: Record<
  ProjectStatus,
  { label: string; eyebrow: string; blurb: string }
> = {
  "coming-soon": {
    label: "Coming Soon",
    eyebrow: "In progress",
    blurb: "Shipping next. Countdown is live.",
  },
  released: {
    label: "Released",
    eyebrow: "Live now",
    blurb: "Built, deployed, and in the wild.",
  },
  confirmed: {
    label: "Backlog",
    eyebrow: "Backlog",
    blurb: "Locked into the roadmap, not started yet.",
  },
};

/** Render order of the sections on the page. */
export const SECTION_ORDER: ProjectStatus[] = [
  "coming-soon",
  "released",
  "confirmed",
];
