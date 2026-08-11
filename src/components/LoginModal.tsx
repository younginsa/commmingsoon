"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Admin login popover — anchored top-right under the nav, like Chrome's
 * "Save password?" prompt. No backdrop, no blur; the page stays visible.
 */
export function LoginModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (res.ok) onSuccess();
    else setError(res.status === 401 ? "Wrong password." : "Login failed.");
  }

  // Portal to <body> so the popover escapes the nav bar's stacking context.
  // Solid paper background — the popover floats over both the dark hero and
  // the light catalog, so it can't rely on the page behind it for contrast.
  return createPortal(
    <div
      role="dialog"
      aria-label="Admin login"
      className="fixed top-16 right-4 z-[60] w-[min(320px,calc(100vw-32px))] border border-rule bg-paper shadow-[0_8px_32px_rgba(0,0,0,0.25)] md:top-[72px] md:right-8"
    >
      <div className="flex items-center justify-between border-b border-rule px-3.5 py-2">
        <span className="text-[14px] text-[#6b6b6b]">Admin</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-[4px] bg-paper-2 px-2.5 py-0.5 text-[12px] text-ash hover:text-carbon"
        >
          Esc
        </button>
      </div>

      <form onSubmit={submit} className="p-3.5">
        <label className="block font-mono text-[11px] tracking-[0.08em] text-[#6b6b6b] uppercase">
          Password
        </label>
        <div className="mt-1.5 flex gap-1.5">
          <input
            ref={inputRef}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-rule bg-paper px-2.5 py-1.5 text-[14px] text-carbon outline-none focus:border-carbon"
            autoComplete="current-password"
          />
          <button
            type="submit"
            disabled={busy || !password}
            className="shrink-0 rounded-[4px] bg-black px-3.5 text-[13px] font-semibold text-white transition hover:opacity-85 disabled:opacity-40"
          >
            {busy ? "…" : "Log in"}
          </button>
        </div>
        {error && <p className="mt-2 text-[12px] text-flame">{error}</p>}
      </form>
    </div>,
    document.body,
  );
}
