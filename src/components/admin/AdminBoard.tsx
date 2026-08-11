"use client";

import { useMemo, useState } from "react";
import { EditPanel } from "@/components/admin/EditPanel";
import {
  projectThumb,
  type Project,
  type ProjectStatus,
} from "@/types/project";

const MAX_PINNED = 8;

const STATUS_LABEL: Record<ProjectStatus, string> = {
  released: "Released",
  "coming-soon": "WIP",
  confirmed: "Backlog",
};

const GRID =
  "grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3 lg:grid-cols-4 xl:grid-cols-6";

/**
 * Admin board: Hero list (pinned, max 8) + the 59-slot project grid.
 * Every mutation optimistically updates local state, then PUTs the whole
 * list — one document, one endpoint, no partial-update bookkeeping.
 */
export function AdminBoard({
  initial,
  total,
}: {
  initial: Project[];
  total: number;
}) {
  const [projects, setProjects] = useState<Project[]>(initial);
  const [editingNo, setEditingNo] = useState<number | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "error">(
    "idle",
  );

  const byNo = useMemo(() => {
    const map = new Map<number, Project>();
    for (const p of projects) map.set(p.no, p);
    return map;
  }, [projects]);

  const pinned = useMemo(
    () => projects.filter((p) => p.pinned).sort((a, b) => a.no - b.no),
    [projects],
  );

  async function persist(next: Project[]) {
    setProjects(next);
    setSaveState("saving");
    try {
      const res = await fetch("/api/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) throw new Error();
      setSaveState("idle");
    } catch {
      setSaveState("error");
    }
  }

  function togglePin(no: number) {
    const target = byNo.get(no);
    if (!target) return;
    if (!target.pinned && pinned.length >= MAX_PINNED) return;
    persist(
      projects.map((p) => (p.no === no ? { ...p, pinned: !p.pinned } : p)),
    );
  }

  function saveProject(saved: Project) {
    const exists = byNo.has(saved.no);
    persist(
      exists
        ? projects.map((p) => (p.no === saved.no ? saved : p))
        : [...projects, saved].sort((a, b) => a.no - b.no),
    );
    setEditingNo(null);
  }

  function deleteProject(no: number) {
    persist(projects.filter((p) => p.no !== no));
    setEditingNo(null);
  }

  return (
    <div>
      {/* ── Hero list ─────────────────────────────── */}
      <header className="border-b border-rule px-4 pt-8 md:px-8 md:pt-10">
        <div className="mx-auto flex min-h-14 max-w-[1600px] items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <h2 className="text-[15px] text-carbon">Hero list</h2>
            <p className="hidden text-[13px] text-ash sm:block">
              Pinned projects rotate in the hero banner.
            </p>
          </div>
          <span className="font-mono text-[11px] text-ash">
            {pinned.length}/{MAX_PINNED}
          </span>
        </div>
      </header>

      <div className="px-4 pt-3 pb-10 md:px-8">
        <div className="mx-auto max-w-[1600px]">
          {pinned.length === 0 ? (
            <p className="text-[13px] text-ash">
              Nothing pinned — use “Pin to hero” on a project below. Until
              then the hero falls back to the newest projects.
            </p>
          ) : (
            <div className={GRID}>
              {pinned.map((p) => (
                <SlotCard
                  key={p.no}
                  no={p.no}
                  project={p}
                  pinDisabled={false}
                  onEdit={() => setEditingNo(p.no)}
                  onPin={() => togglePin(p.no)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 59 Projects ───────────────────────────── */}
      <header className="border-t border-rule px-4 pt-8 md:px-8 md:pt-10">
        <div className="mx-auto flex min-h-14 max-w-[1600px] items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <h2 className="text-[15px] text-carbon">{total} Projects</h2>
            <p className="hidden text-[13px] text-ash sm:block">
              Click a card to edit.
            </p>
          </div>
          <span
            className={`font-mono text-[11px] ${
              saveState === "error" ? "text-flame" : "text-ash"
            }`}
          >
            {saveState === "saving"
              ? "saving…"
              : saveState === "error"
                ? "save failed — retry your last change"
                : `${projects.length} filled`}
          </span>
        </div>
      </header>

      <div className="px-4 pt-3 pb-20 md:px-8">
        <div className="mx-auto max-w-[1600px]">
          <div className={GRID}>
            {Array.from({ length: total }, (_, i) => {
              const no = i + 1;
              const project = byNo.get(no) ?? null;
              // Pinned cards live in the Hero list above — leave a stub here
              // so the numbering stays continuous.
              if (project?.pinned) {
                return (
                  <button
                    key={no}
                    type="button"
                    onClick={() => setEditingNo(no)}
                    className="flex min-h-24 flex-col items-start justify-between border border-rule bg-paper-2/60 p-2.5 text-left opacity-70 transition hover:opacity-100"
                  >
                    <span className="font-mono text-[11px] text-ash">
                      {String(no).padStart(2, "0")}
                    </span>
                    <span className="text-[12px] text-ash">
                      {project.title} — in Hero list ↑
                    </span>
                  </button>
                );
              }
              return (
                <SlotCard
                  key={no}
                  no={no}
                  project={project}
                  pinDisabled={pinned.length >= MAX_PINNED}
                  onEdit={() => setEditingNo(no)}
                  onPin={() => togglePin(no)}
                />
              );
            })}
          </div>
        </div>
      </div>

      {editingNo !== null && (
        <EditPanel
          key={editingNo}
          no={editingNo}
          project={byNo.get(editingNo) ?? null}
          onClose={() => setEditingNo(null)}
          onSave={saveProject}
          onDelete={deleteProject}
        />
      )}
    </div>
  );
}

function SlotCard({
  no,
  project,
  pinDisabled,
  onEdit,
  onPin,
}: {
  no: number;
  project: Project | null;
  pinDisabled: boolean;
  onEdit: () => void;
  onPin: () => void;
}) {
  const thumb = project ? projectThumb(project) : null;

  return (
    <div className="flex flex-col border border-rule bg-paper transition-colors hover:border-chev">
      <button type="button" onClick={onEdit} className="text-left">
        <div className="flex min-h-9 items-center justify-between gap-2 border-b border-rule px-2.5 py-1.5">
          <span className="truncate text-[13px] text-carbon">
            {project?.title ?? <span className="text-chev">empty</span>}
          </span>
          <span className="shrink-0 font-mono text-[11px] text-ash">
            {String(no).padStart(2, "0")}
          </span>
        </div>
        <div className="dotgrid relative flex aspect-[16/10] items-center justify-center">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin-only preview, any origin
            <img
              src={thumb}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : project ? (
            <span className="border border-rule bg-paper px-2 py-0.5 font-mono text-[10px] tracking-[0.08em] text-ash">
              no image
            </span>
          ) : (
            <span className="font-mono text-[10px] tracking-[0.08em] text-chev">
              + fill in
            </span>
          )}
        </div>
      </button>

      <div className="flex min-h-9 items-center justify-between px-2.5 py-1.5">
        <span className="font-mono text-[11px] text-ash">
          {project ? STATUS_LABEL[project.status] : "—"}
        </span>
        {project && (
          <button
            type="button"
            onClick={onPin}
            disabled={pinDisabled}
            className={`rounded-[4px] px-2 py-0.5 text-[11px] transition ${
              project.pinned
                ? "bg-black text-white hover:opacity-80"
                : "bg-paper-2 text-ash hover:text-carbon disabled:cursor-not-allowed disabled:opacity-40"
            }`}
          >
            {project.pinned ? "pinned ✓" : "pin to hero"}
          </button>
        )}
      </div>
    </div>
  );
}
