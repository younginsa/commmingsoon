import { promises as fs } from "node:fs";
import path from "node:path";
import {
  handleUpload,
  type HandleUploadBody,
} from "@vercel/blob/client";
import { isAuthed } from "@/lib/auth";

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB
const OK_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

const hasBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

/** GET → which upload path the admin client should use. */
export async function GET() {
  return Response.json({ mode: hasBlob() ? "blob" : "local" });
}

/**
 * POST — two protocols on one route:
 *
 *  - JSON body → @vercel/blob client-upload handshake. The browser uploads
 *    straight to Blob storage, so Vercel's 4.5MB function body limit never
 *    applies. We only mint the short-lived client token here (admin only).
 *
 *  - multipart form → local dev fallback, writes public/uploads/.
 */
export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  // ---- Blob client-upload handshake ------------------------------------
  if (contentType.includes("application/json")) {
    if (!hasBlob()) {
      return Response.json(
        { error: "Blob store not connected (Vercel → Storage → Blob)" },
        { status: 400 },
      );
    }
    try {
      const body = (await request.json()) as HandleUploadBody;
      const jsonResponse = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async () => {
          if (!(await isAuthed())) throw new Error("unauthorized");
          return {
            allowedContentTypes: OK_TYPES,
            maximumSizeInBytes: MAX_BYTES,
            addRandomSuffix: true,
          };
        },
        // Fires from Blob's side after upload; nothing to sync — the client
        // sends the final URL with the project save.
        onUploadCompleted: async () => {},
      });
      return Response.json(jsonResponse);
    } catch (e) {
      const message = e instanceof Error ? e.message : "upload failed";
      return Response.json(
        { error: message },
        { status: message === "unauthorized" ? 401 : 400 },
      );
    }
  }

  // ---- Local dev fallback ----------------------------------------------
  if (!(await isAuthed())) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  if (process.env.VERCEL) {
    // Read-only filesystem in production — never try to write it.
    return Response.json(
      { error: "Blob store not connected (Vercel → Storage → Blob)" },
      { status: 400 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "no file" }, { status: 400 });
  }
  if (!OK_TYPES.includes(file.type)) {
    return Response.json({ error: "png/jpeg/webp/gif only" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "max 20MB" }, { status: 400 });
  }

  const ext = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(dir + "/" + name, Buffer.from(await file.arrayBuffer()));
  return Response.json({ url: `/uploads/${name}` });
}
