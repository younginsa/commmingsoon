"use client";

import { useState } from "react";
import {
  LINK_LABELS,
  type LinkType,
  type Project,
  type ProjectLink,
  type ProjectStatus,
} from "@/types/project";

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "released", label: "Released" },
  { value: "coming-soon", label: "WIP" },
  { value: "confirmed", label: "Backlog" },
];

const LINK_TYPES: LinkType[] = ["appstore", "googleplay", "weblink"];
const MAX_LINKS = 3;

const FIELD =
  "w-full border border-rule bg-paper px-3 py-2 text-[14px] text-carbon outline-none focus:border-carbon";
const LABEL =
  "block font-mono text-[11px] tracking-[0.08em] text-ash uppercase";

/**
 * Card editor — a right-side panel, not a modal. Only the × (or Cancel)
 * closes it; clicking the board behind leaves it open, so you can open
 * another card directly.
 *
 * Common fields (title / status / description / images / tags) plus
 * status-dependent secondary data:
 *   released → up to 3 typed links
 *   WIP      → target date
 */
export function EditPanel({
  no,
  project,
  onClose,
  onSave,
}: {
  no: number;
  project: Project | null;
  onClose: () => void;
  onSave: (saved: Project) => void;
}) {
  const [title, setTitle] = useState(project?.title ?? "");
  const [status, setStatus] = useState<ProjectStatus>(
    project?.status ?? "confirmed",
  );
  const [tagline, setTagline] = useState(project?.tagline ?? "");
  const [images, setImages] = useState<string[]>(
    project?.images ?? (project?.image ? [project.image] : []),
  );
  const [tags, setTags] = useState((project?.tags ?? []).join(", "));
  const [links, setLinks] = useState<ProjectLink[]>(project?.links ?? []);
  const [targetDate, setTargetDate] = useState(project?.targetDate ?? "");
  const [releasedAt, setReleasedAt] = useState(project?.releasedAt ?? "");
  const [progress, setProgress] = useState(
    project?.progress != null ? String(project.progress) : "",
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: form });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error ?? "upload failed");
        }
        const { url } = await res.json();
        setImages((prev) => [...prev, url]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "upload failed");
    } finally {
      setUploading(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    const saved: Project = {
      // Preserve anything the modal doesn't manage (pinned, accent, …).
      ...(project ?? {}),
      id: project?.id ?? `app-${no}`,
      no,
      title: title.trim(),
      status,
      tagline: tagline.trim(),
      images,
      image: images[0],
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      links:
        status === "released"
          ? links.filter((l) => l.url.trim()).slice(0, MAX_LINKS)
          : project?.links,
      targetDate: status === "coming-soon" ? targetDate || undefined : project?.targetDate,
      progress:
        status === "coming-soon" && progress !== ""
          ? Math.min(100, Math.max(0, Number(progress)))
          : project?.progress,
      releasedAt: status === "released" ? releasedAt || undefined : project?.releasedAt,
    };
    onSave(saved);
  }

  return (
    <aside className="fixed inset-y-0 right-0 z-[60] w-[min(480px,100vw)] overflow-y-auto border-l border-rule bg-paper">
      <form
        role="dialog"
        aria-label={`Edit project ${no}`}
        onSubmit={submit}
        className="flex min-h-full flex-col"
      >
        {/* Head strip — the × is the only way out (besides Cancel). */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-rule bg-paper px-4 py-2.5">
          <span className="text-[15px] text-carbon">
            No. {String(no).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="flex h-8 w-8 items-center justify-center border border-rule text-[16px] leading-none text-ash hover:text-carbon"
          >
            ×
          </button>
        </div>

        <div className="space-y-5 p-4">
          {/* Title */}
          <div>
            <label className={LABEL}>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`mt-1.5 ${FIELD}`}
            />
          </div>

          {/* Status — DS filter-chip row: selected = square line box. */}
          <div>
            <label className={LABEL}>Status</label>
            <div className="mt-1.5 flex gap-1.5">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`border px-3 py-1.5 text-[13px] transition-colors ${
                    status === opt.value
                      ? "border-rule text-carbon"
                      : "border-transparent text-[#6b6b6b] hover:bg-paper-2"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={LABEL}>Short description</label>
            <textarea
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              rows={2}
              className={`mt-1.5 resize-none ${FIELD}`}
            />
          </div>

          {/* Images */}
          <div>
            <label className={LABEL}>Images</label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {images.map((url, i) => (
                <div
                  key={url + i}
                  className="relative h-16 w-24 overflow-hidden border border-rule"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      setImages((prev) => prev.filter((_, j) => j !== i))
                    }
                    aria-label="Remove image"
                    className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center bg-black/70 text-[11px] text-white"
                  >
                    ×
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-0 left-0 bg-black/70 px-1 font-mono text-[9px] text-white">
                      thumb
                    </span>
                  )}
                </div>
              ))}
              <label className="flex h-16 w-24 cursor-pointer items-center justify-center border border-rule font-mono text-[11px] text-ash hover:border-chev hover:text-carbon">
                {uploading ? "…" : "+ upload"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  multiple
                  className="hidden"
                  onChange={(e) => uploadFiles(e.target.files)}
                />
              </label>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className={LABEL}>Tags (comma separated)</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Next.js, Tailwind, …"
              className={`mt-1.5 ${FIELD}`}
            />
          </div>

          {/* ── Status-dependent secondary data ── */}
          {status === "released" && (
            <div className="border-t border-rule pt-4">
              <div className="flex items-center justify-between">
                <label className={LABEL}>Links (max {MAX_LINKS})</label>
                {links.length < MAX_LINKS && (
                  <button
                    type="button"
                    onClick={() =>
                      setLinks((prev) => [...prev, { type: "weblink", url: "" }])
                    }
                    className="rounded-[4px] bg-paper-2 px-2.5 py-1 font-mono text-[11px] text-ash hover:text-carbon"
                  >
                    +
                  </button>
                )}
              </div>
              <div className="mt-1.5 space-y-2">
                {links.length === 0 && (
                  <p className="text-[13px] text-ash">
                    No links yet — add App Store, Google Play, or a web link.
                  </p>
                )}
                {links.map((link, i) => (
                  <div key={i} className="flex gap-2">
                    <select
                      value={link.type}
                      onChange={(e) =>
                        setLinks((prev) =>
                          prev.map((l, j) =>
                            j === i
                              ? { ...l, type: e.target.value as LinkType }
                              : l,
                          ),
                        )
                      }
                      className="w-36 border border-rule bg-paper px-2 py-2 text-[13px] text-carbon outline-none focus:border-carbon"
                    >
                      {LINK_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {LINK_LABELS[t]}
                        </option>
                      ))}
                    </select>
                    <input
                      value={link.url}
                      onChange={(e) =>
                        setLinks((prev) =>
                          prev.map((l, j) =>
                            j === i ? { ...l, url: e.target.value } : l,
                          ),
                        )
                      }
                      placeholder="https://…"
                      className={FIELD}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setLinks((prev) => prev.filter((_, j) => j !== i))
                      }
                      aria-label="Remove link"
                      className="shrink-0 px-2 text-ash hover:text-carbon"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <label className={LABEL}>Release date</label>
                <input
                  type="date"
                  value={releasedAt}
                  onChange={(e) => setReleasedAt(e.target.value)}
                  className={`mt-1.5 ${FIELD}`}
                />
              </div>
            </div>
          )}

          {status === "coming-soon" && (
            <div className="grid grid-cols-2 gap-3 border-t border-rule pt-4">
              <div>
                <label className={LABEL}>Target date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className={`mt-1.5 ${FIELD}`}
                />
              </div>
              <div>
                <label className={LABEL}>Progress %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                  className={`mt-1.5 ${FIELD}`}
                />
              </div>
            </div>
          )}

          {error && <p className="text-[13px] text-flame">{error}</p>}
        </div>

        {/* Footer strip — sticky so Save is always reachable. */}
        <div className="sticky bottom-0 mt-auto flex items-center justify-end gap-2 border-t border-rule bg-paper px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[4px] bg-paper-2 px-4 py-2 text-[13px] text-ash hover:text-carbon"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading}
            className="rounded-[4px] bg-black px-5 py-2 text-[13px] font-semibold text-white hover:opacity-85 disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </form>
    </aside>
  );
}
