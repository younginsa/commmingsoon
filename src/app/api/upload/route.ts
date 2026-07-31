import { promises as fs } from "node:fs";
import path from "node:path";
import { isAuthed } from "@/lib/auth";
import { hasBlob } from "@/lib/store";

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB
const OK_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

function fileName(contentType: string) {
  const ext = contentType === "image/jpeg" ? "jpg" : contentType.split("/")[1];
  return `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
}

/** GET → which upload path the admin client should use. */
export async function GET() {
  return Response.json({ mode: hasBlob() ? "blob" : "local" });
}

/**
 * POST — two protocols on one route:
 *
 *  - JSON { contentType, size } → presigned Blob URL. The server mints a
 *    short-lived, size- and type-scoped upload URL (authenticates via the
 *    store's OIDC identity or a legacy read-write env secret — the SDK
 *    resolves either). The browser then PUTs the file straight to Blob
 *    storage, so Vercel's 4.5MB function body limit never applies.
 *
 *  - multipart form → local dev fallback, writes public/uploads/.
 */
export async function POST(request: Request) {
  if (!(await isAuthed())) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";

  // ---- Presigned Blob upload ------------------------------------------
  if (contentType.includes("application/json")) {
    if (!hasBlob()) {
      return Response.json(
        { error: "Blob store not connected (Vercel → Storage → Blob)" },
        { status: 400 },
      );
    }
    try {
      const { contentType: fileType, size } = await request.json();
      if (!OK_TYPES.includes(fileType)) {
        return Response.json(
          { error: "png/jpeg/webp/gif only" },
          { status: 400 },
        );
      }
      if (typeof size !== "number" || size <= 0 || size > MAX_BYTES) {
        return Response.json({ error: "max 20MB" }, { status: 400 });
      }

      const { issueSignedToken, presignUrl } = await import("@vercel/blob");
      const pathname = fileName(fileType);
      const signed = await issueSignedToken({
        pathname,
        operations: ["put"],
        allowedContentTypes: OK_TYPES,
        maximumSizeInBytes: MAX_BYTES,
      });
      const { presignedUrl } = await presignUrl(signed, {
        operation: "put",
        pathname,
        access: "public",
        allowedContentTypes: OK_TYPES,
        maximumSizeInBytes: MAX_BYTES,
      });
      return Response.json({ presignedUrl });
    } catch (e) {
      return Response.json(
        { error: e instanceof Error ? e.message : "presign failed" },
        { status: 500 },
      );
    }
  }

  // ---- Local dev fallback ----------------------------------------------
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

  const name = path.basename(fileName(file.type));
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(dir + "/" + name, Buffer.from(await file.arrayBuffer()));
  return Response.json({ url: `/uploads/${name}` });
}
