import { Elysia, t } from "elysia";
import sharp, { type Metadata } from "sharp";
import {
  countLikes,
  createLike,
  createPhoto,
  deleteLike,
  getApprovedPhoto,
  getPeriodBySlug,
  getPhotoAny,
  hasLiked,
  listApprovedPhotos,
  listPublicPeriods,
} from "../db/queries.ts";
import { isAllowed } from "../middleware/rate-limit.ts";
import { reviewImage } from "../services/moderation.ts";
import { getPhotoBytes, photoKey, publicUrlFor, putPhoto } from "../services/storage.ts";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const MAX_DIMENSION = 6000;
const OUTPUT_MAX_EDGE = 2048;

const ALLOWED: Record<string, { ext: string; mime: string }> = {
  jpeg: { ext: "jpg", mime: "image/jpeg" },
  jpg: { ext: "jpg", mime: "image/jpeg" },
};

function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function ensureVisitorId(cookie: Record<string, { value?: string; set: (o: object) => void }>): string {
  let id = cookie.visitor_id?.value;
  if (!id) {
    id = crypto.randomUUID();
    cookie.visitor_id.set({
      value: id,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 365 * 24 * 3600,
    });
  }
  return id;
}

export const publicRoutes = new Elysia()
  .get("/api/periods", async () => {
    const periods = await listPublicPeriods();
    return { periods };
  })
  .get("/api/periods/:slug", async ({ params, set }) => {
    const period = await getPeriodBySlug(params.slug);
    if (!period) {
      set.status = 404;
      return { error: "event tidak ditemukan" };
    }
    return { period };
  })
  .get("/api/periods/:slug/photos", async ({ params, set, cookie }) => {
    const period = await getPeriodBySlug(params.slug);
    if (!period) {
      set.status = 404;
      return { error: "event tidak ditemukan" };
    }
    const visitorId = ensureVisitorId(cookie as never);
    const photos = await listApprovedPhotos(period.id, visitorId);
    return { photos };
  })
  .get("/api/photos/:id", async ({ params, set, cookie }) => {
    const photo = await getApprovedPhoto(params.id);
    if (!photo) {
      set.status = 404;
      return { error: "foto tidak ditemukan" };
    }
    const visitorId = cookie.visitor_id?.value as string | undefined;
    return { photo, liked: visitorId ? await hasLiked(photo.id, visitorId) : false };
  })
  .get("/api/photos/:id/file", async ({ params, set }) => {
    const photo = await getPhotoAny(params.id);
    if (!photo || photo.status !== "APPROVED") {
      set.status = 404;
      return { error: "foto tidak ditemukan" };
    }
    try {
      const { bytes, contentType } = await getPhotoBytes(photo.storage_key);
      // Bytes foto tidak pernah berubah untuk satu id — aman di-cache
      // browser/CDN selamanya. Path error (404) tidak memakai header ini.
      return new Response(bytes, {
        headers: {
          "content-type": contentType ?? photo.mime_type ?? "image/jpeg",
          "cache-control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      set.status = 404;
      return { error: "file tidak ditemukan" };
    }
  })
  .post(
    "/api/periods/:slug/photos",
    async ({ params, body, set, request }) => {
      if (!isAllowed(`upload:${clientIp(request)}`, 10)) {
        set.status = 429;
        return { error: "terlalu banyak upload, coba lagi sebentar" };
      }
      const period = await getPeriodBySlug(params.slug);
      if (!period) {
        set.status = 404;
        return { error: "event tidak ditemukan" };
      }
      if (period.status !== "ACTIVE") {
        set.status = 403;
        return { error: "event tidak sedang menerima foto" };
      }
      const file = (body as { photo?: unknown }).photo;
      if (!(file instanceof File)) {
        set.status = 400;
        return { error: "file foto wajib diisi" };
      }
      if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
        set.status = 413;
        return { error: "ukuran file maksimal 8MB" };
      }

      const input = Buffer.from(await file.arrayBuffer());
      let meta: Metadata;
      try {
        meta = await sharp(input).metadata();
      } catch {
        set.status = 400;
        return { error: "file bukan gambar yang valid" };
      }
      const allowed = meta.format ? ALLOWED[meta.format] : undefined;
      if (!allowed || !meta.width || !meta.height) {
        set.status = 400;
        return { error: "format harus JPG/JPEG" };
      }
      if (meta.width > MAX_DIMENSION || meta.height > MAX_DIMENSION) {
        set.status = 400;
        return { error: `dimensi maksimal ${MAX_DIMENSION}px` };
      }

      const pipeline = sharp(input).rotate().resize({
        width: OUTPUT_MAX_EDGE,
        height: OUTPUT_MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      });
      const processed = await pipeline
        .jpeg({ quality: 82, mozjpeg: true })
        .toBuffer({ resolveWithObject: true });

      // MVP: auto-approve. Ganti reviewImage() bila moderasi manual/provider dipasang.
      const mod = await reviewImage(processed.data, allowed.mime);
      const status = mod.decision === "approved" ? "APPROVED" : "PENDING";

      const photoId = crypto.randomUUID();
      const key = photoKey(period.slug, photoId, allowed.ext);
      try {
        await putPhoto(key, processed.data, allowed.mime);
      } catch {
        set.status = 502;
        return { error: "gagal menyimpan foto, coba lagi" };
      }
      const photo = await createPhoto({
        id: photoId,
        periodId: period.id,
        storageKey: key,
        imageUrl: publicUrlFor(key, photoId),
        width: processed.info.width,
        height: processed.info.height,
        mimeType: allowed.mime,
        status,
      });
      set.status = 201;
      return {
        photo,
        message: status === "APPROVED" ? "foto tampil di wall" : "foto diterima, menunggu persetujuan admin",
      };
    },
    { body: t.Object({ photo: t.Any() }) },
  )
  .post("/api/photos/:id/like", async ({ params, set, cookie, request }) => {
    if (!isAllowed(`like:${clientIp(request)}`, 30)) {
      set.status = 429;
      return { error: "terlalu banyak permintaan, coba lagi sebentar" };
    }
    const photo = await getApprovedPhoto(params.id);
    if (!photo) {
      set.status = 404;
      return { error: "foto tidak ditemukan" };
    }
    const visitorId = ensureVisitorId(cookie as never);
    await createLike(photo.id, visitorId);
    return { liked: true, like_count: await countLikes(photo.id) };
  })
  .delete("/api/photos/:id/like", async ({ params, set, cookie, request }) => {
    if (!isAllowed(`like:${clientIp(request)}`, 30)) {
      set.status = 429;
      return { error: "terlalu banyak permintaan, coba lagi sebentar" };
    }
    const photo = await getApprovedPhoto(params.id);
    if (!photo) {
      set.status = 404;
      return { error: "foto tidak ditemukan" };
    }
    const visitorId = ensureVisitorId(cookie as never);
    await deleteLike(photo.id, visitorId);
    return { liked: false, like_count: await countLikes(photo.id) };
  });
