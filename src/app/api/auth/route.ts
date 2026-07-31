import { cookies } from "next/headers";
import { AUTH_COOKIE, isAuthed, tokenForPassword } from "@/lib/auth";

/** GET → session status. The nav uses this to decide what to render. */
export async function GET() {
  return Response.json({ authed: await isAuthed() });
}

/** POST { password } → set the session cookie. */
export async function POST(request: Request) {
  let password = "";
  try {
    ({ password = "" } = await request.json());
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }

  const token = tokenForPassword(password);
  if (!token) {
    return Response.json({ error: "wrong password" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return Response.json({ authed: true });
}

/** DELETE → logout. */
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
  return Response.json({ authed: false });
}
