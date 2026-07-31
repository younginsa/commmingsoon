import { isAuthed } from "@/lib/auth";
import { getProjects, saveProjects } from "@/lib/store";
import { CHALLENGE_TOTAL } from "@/data/projects";
import type { Project } from "@/types/project";

const STATUSES = new Set(["released", "coming-soon", "confirmed"]);
const LINK_TYPES = new Set(["appstore", "googleplay", "weblink"]);
export const MAX_PINNED = 8;

export async function GET() {
  return Response.json(await getProjects());
}

/** PUT [Project, ...] → replace the whole list. Admin only. */
export async function PUT(request: Request) {
  if (!(await isAuthed())) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let incoming: Project[];
  try {
    incoming = await request.json();
    if (!Array.isArray(incoming)) throw new Error();
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }

  // Shape checks — reject anything that would break the public page.
  const seen = new Set<number>();
  for (const p of incoming) {
    if (
      typeof p !== "object" ||
      !p.id ||
      typeof p.title !== "string" ||
      !STATUSES.has(p.status) ||
      !Number.isInteger(p.no) ||
      p.no < 1 ||
      p.no > CHALLENGE_TOTAL ||
      seen.has(p.no)
    ) {
      return Response.json(
        { error: `invalid project (no. ${p?.no ?? "?"})` },
        { status: 400 },
      );
    }
    seen.add(p.no);
    if (p.links) {
      if (
        p.links.length > 3 ||
        p.links.some((l) => !LINK_TYPES.has(l.type) || typeof l.url !== "string")
      ) {
        return Response.json(
          { error: `invalid links (no. ${p.no})` },
          { status: 400 },
        );
      }
    }
  }

  if (incoming.filter((p) => p.pinned).length > MAX_PINNED) {
    return Response.json(
      { error: `max ${MAX_PINNED} pinned projects` },
      { status: 400 },
    );
  }

  await saveProjects(incoming);
  return Response.json({ ok: true, count: incoming.length });
}
