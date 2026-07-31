import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { projects as seed } from "@/data/projects";
import type { Project } from "@/types/project";

/**
 * Project storage, in order of preference:
 *
 *   1. Vercel Blob   — when BLOB_READ_WRITE_TOKEN is set (production).
 *   2. Local JSON    — data/projects.json, dev scratch (gitignored).
 *   3. Seed module   — src/data/projects.ts, read-only fallback so the
 *                      public site always renders.
 *
 * The whole list is one JSON document — 59 small records, no need for rows.
 */

const BLOB_KEY = "data/projects.json";
const LOCAL_FILE = path.join(process.cwd(), "data", "projects.json");

const hasBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export async function getProjects(): Promise<Project[]> {
  if (hasBlob()) {
    try {
      const { list } = await import("@vercel/blob");
      const { blobs } = await list({ prefix: BLOB_KEY, limit: 1 });
      if (blobs.length > 0) {
        const res = await fetch(blobs[0].url, { cache: "no-store" });
        if (res.ok) return (await res.json()) as Project[];
      }
    } catch {
      // fall through to local/seed
    }
  }
  try {
    const raw = await fs.readFile(LOCAL_FILE, "utf8");
    return JSON.parse(raw) as Project[];
  } catch {
    return seed;
  }
}

export async function saveProjects(projects: Project[]): Promise<void> {
  const json = JSON.stringify(projects, null, 2);
  if (hasBlob()) {
    const { put } = await import("@vercel/blob");
    await put(BLOB_KEY, json, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return;
  }
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, json, "utf8");
}
