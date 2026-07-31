import { promises as fs } from "node:fs";
import path from "node:path";
import { isAuthed } from "@/lib/auth";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const OK_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

/**
 * POST multipart form { file } → { url }. Admin only.
 * Vercel Blob in production; public/uploads/ in local dev.
 */
export async function POST(request: Request) {
  if (!(await isAuthed())) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "no file" }, { status: 400 });
  }
  if (!OK_TYPES.has(file.type)) {
    return Response.json({ error: "png/jpeg/webp/gif only" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "max 8MB" }, { status: 400 });
  }

  const ext = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`uploads/${name}`, file, { access: "public" });
    return Response.json({ url: blob.url });
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(dir + "/" + name, Buffer.from(await file.arrayBuffer()));
  return Response.json({ url: `/uploads/${name}` });
}
