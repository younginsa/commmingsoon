import type { Project } from "@/types/project";

/** Total apps in the challenge. */
export const CHALLENGE_TOTAL = 59;

/**
 * Read-only fallback used only when Blob (prod) and the local JSON scratch
 * file (dev) are both unavailable. Real content lives in Blob and is managed
 * through /admin — keep this empty so no placeholder ever leaks to the site.
 */
export const projects: Project[] = [];
