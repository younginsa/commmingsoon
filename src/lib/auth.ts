import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Single-password admin auth.
 *
 * The session cookie holds an HMAC of a fixed label keyed by ADMIN_PASSWORD —
 * so it can't be forged without the password, and changing the password
 * invalidates every session. No user table, no JWT library.
 */

export const AUTH_COOKIE = "jb_admin";

/**
 * ADMIN_PASSWORD env var, with a dev-only fallback so `npm run dev` works
 * out of the box. In production the env var is mandatory — no fallback,
 * no login without it.
 */
function adminPassword(): string | null {
  return (
    process.env.ADMIN_PASSWORD ??
    (process.env.NODE_ENV === "development" ? "59apps-dev" : null)
  );
}

function expectedToken(): string | null {
  const password = adminPassword();
  if (!password) return null;
  return createHmac("sha256", password).update("jb-archive-admin-v1").digest("hex");
}

/** Token for a login attempt; null when the password is wrong or unset. */
export function tokenForPassword(attempt: string): string | null {
  const password = adminPassword();
  if (!password || !attempt) return null;
  const a = Buffer.from(attempt);
  const b = Buffer.from(password);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return expectedToken();
}

export async function isAuthed(): Promise<boolean> {
  const expected = expectedToken();
  if (!expected) return false;
  const cookieStore = await cookies();
  const got = cookieStore.get(AUTH_COOKIE)?.value;
  if (!got || got.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(got), Buffer.from(expected));
}
