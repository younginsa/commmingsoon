"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LoginModal } from "@/components/LoginModal";
import { SECTIONS, SECTION_ORDER } from "@/types/project";

const NAV_H = 64;

/**
 * Sticky nav with two skins: ink over the dark hero, DS paper once the light
 * catalog reaches it (always paper on /admin). Items follow the DS 내비항목
 * 3-state — rest gray text, hover = surface fill, active = ink text in a
 * square 1px --line box.
 *
 * < md the menu collapses into a hamburger so nothing gets cut off.
 * The count chip doubles as the admin door: click → password modal; once
 * authed it reads "3/59 · logout" and a Project menu appears.
 */
export function TopNav({
  released,
  total,
  forceLight = false,
}: {
  released: number;
  total: number;
  forceLight?: boolean;
}) {
  const [scrolledLight, setScrolledLight] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const light = forceLight || scrolledLight || menuOpen;
  const onAdmin = pathname === "/admin";

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then((d) => setAuthed(Boolean(d.authed)))
      .catch(() => {});
  }, []);

  // Close the mobile menu on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (forceLight) return;
    const sections = SECTION_ORDER.map((s) =>
      document.getElementById(s),
    ).filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const onScroll = () => {
      setScrolledLight(sections[0].getBoundingClientRect().top <= NAV_H);
      let current: string | null = null;
      for (const el of sections) {
        if (el.getBoundingClientRect().top <= NAV_H + 80) current = el.id;
      }
      setActive(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [forceLight]);

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    setAuthed(false);
    setMenuOpen(false);
    if (onAdmin) router.push("/");
    else router.refresh();
  }

  const itemCls = (isActive: boolean) =>
    `inline-flex min-h-9 items-center border px-2.5 text-[15px] transition-colors ${
      isActive
        ? light
          ? "border-rule text-carbon"
          : "border-hairline text-white"
        : light
          ? "border-transparent text-[#6b6b6b] hover:bg-paper-2 hover:text-carbon"
          : "border-transparent text-mist hover:bg-surface-2 hover:text-white"
    }`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        light
          ? "border-rule bg-paper/95 backdrop-blur-xl"
          : "border-white/5 bg-ink/95 backdrop-blur-xl"
      }`}
    >
      <nav className="mx-auto flex h-14 max-w-[1600px] items-center gap-2 px-4 md:h-16 md:px-8">
        <Link
          href="/#top"
          onClick={() => setMenuOpen(false)}
          className={`mr-auto flex min-h-11 items-center gap-1.5 text-sm font-black tracking-tight md:text-base ${
            light ? "text-carbon" : "text-white"
          }`}
        >
          <span>JOHN BURN</span>
          <span className={light ? "text-carbon" : "text-flame"}>·</span>
          <span className={light ? "text-ash" : "text-mist"}>ARCHIVE</span>
        </Link>

        {/* ── Desktop items ── */}
        <div className="hidden items-center gap-2 md:flex">
          {SECTION_ORDER.map((status) => (
            <Link
              key={status}
              href={`/#${status}`}
              className={itemCls(!onAdmin && active === status)}
            >
              {SECTIONS[status].label}
            </Link>
          ))}

          {authed && (
            <Link href="/admin" className={itemCls(onAdmin)}>
              Project
            </Link>
          )}

          {/* Count chip = admin door. */}
          <span
            className={`ml-1 inline-flex shrink-0 items-center rounded-full border font-mono text-xs ${
              light ? "border-rule text-ash" : "border-hairline text-mist"
            }`}
          >
            <button
              type="button"
              onClick={authed ? undefined : () => setShowLogin(true)}
              className={`py-1 pl-3 ${authed ? "cursor-default pr-3" : "pr-3 hover:opacity-70"}`}
              aria-label={authed ? undefined : "Admin login"}
            >
              {released}/{total}
            </button>
            {authed && (
              <button
                type="button"
                onClick={logout}
                className={`border-l py-1 pr-3 pl-2.5 hover:opacity-70 ${
                  light ? "border-rule" : "border-hairline"
                }`}
              >
                logout
              </button>
            )}
          </span>
        </div>

        {/* ── Hamburger (mobile) ── */}
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-11 w-11 flex-col items-center justify-center gap-[5px] md:hidden"
        >
          {/* Two bars → × when open. */}
          <span
            className={`h-px w-5 transition-transform ${
              light ? "bg-carbon" : "bg-white"
            } ${menuOpen ? "translate-y-[3px] rotate-45" : ""}`}
          />
          <span
            className={`h-px w-5 transition-transform ${
              light ? "bg-carbon" : "bg-white"
            } ${menuOpen ? "-translate-y-[3px] -rotate-45" : ""}`}
          />
        </button>
      </nav>

      {/* ── Mobile menu panel ── */}
      {menuOpen && (
        <div
          className={`border-t md:hidden ${
            light ? "border-rule bg-paper" : "border-hairline bg-ink"
          }`}
        >
          {SECTION_ORDER.map((status) => (
            <Link
              key={status}
              href={`/#${status}`}
              onClick={() => setMenuOpen(false)}
              className={`flex min-h-12 items-center justify-between border-b px-4 text-[15px] ${
                light
                  ? "border-rule text-carbon"
                  : "border-hairline text-white"
              } ${!onAdmin && active === status ? "underline underline-offset-3" : ""}`}
            >
              {SECTIONS[status].label}
              <span className="hchev text-chev" />
            </Link>
          ))}

          {authed && (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className={`flex min-h-12 items-center justify-between border-b px-4 text-[15px] ${
                light ? "border-rule text-carbon" : "border-hairline text-white"
              } ${onAdmin ? "underline underline-offset-3" : ""}`}
            >
              Project
              <span className="hchev text-chev" />
            </Link>
          )}

          {/* Admin row: login or logout. */}
          <button
            type="button"
            onClick={() => {
              if (authed) logout();
              else {
                setMenuOpen(false);
                setShowLogin(true);
              }
            }}
            className={`flex min-h-12 w-full items-center justify-between px-4 font-mono text-xs ${
              light ? "text-ash" : "text-mist"
            }`}
          >
            <span>
              {released}/{total}
            </span>
            <span>{authed ? "logout" : "admin login"}</span>
          </button>
        </div>
      )}

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={() => {
            setShowLogin(false);
            setAuthed(true);
            router.refresh();
          }}
        />
      )}
    </header>
  );
}
