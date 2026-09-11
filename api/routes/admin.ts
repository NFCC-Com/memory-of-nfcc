import { Elysia, t } from "elysia";
import {
  createEvent,
  deleteEvent,
  deletePhotoRow,
  getAdminByEmail,
  isEventStatus,
  listEvents,
  listPhotosAdmin,
  setPhotoStatus,
  updateEvent,
} from "../db/queries.ts";
import { isAllowed } from "../middleware/rate-limit.ts";
import {
  clearSessionCookie,
  createSession,
  destroySession,
  getSessionUser,
  sessionCookie,
  SESSION_COOKIE,
  verifyPassword,
} from "../services/session.ts";
import { deletePhoto } from "../services/storage.ts";

async function requireAdmin(cookie: Record<string, { value?: string }>, set: { status?: number | string }) {
  const user = await getSessionUser(cookie[SESSION_COOKIE]?.value as string | undefined);
  if (!user) {
    (set as { status: number }).status = 401;
    return null;
  }
  return user;
}

export const adminRoutes = new Elysia()
  .post(
    "/api/admin/login",
    async ({ body, set, request }) => {
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
      if (!isAllowed(`admin-login:${ip}`, 10)) {
        set.status = 429;
        return { error: "terlalu banyak percobaan, coba lagi nanti" };
      }
      const admin = await getAdminByEmail(body.email.trim().toLowerCase());
      if (!admin || !(await verifyPassword(admin.password_hash, body.password))) {
        set.status = 401;
        return { error: "email atau kata sandi salah" };
      }
      const { token, expiresAt } = await createSession(admin.id);
      set.headers["set-cookie"] = sessionCookie(token, expiresAt);
      return { user: { id: admin.id, email: admin.email } };
    },
    { body: t.Object({ email: t.String(), password: t.String() }) },
  )
  .post("/api/admin/logout", async ({ cookie, set }) => {
    await destroySession(cookie[SESSION_COOKIE]?.value as string | undefined);
    set.headers["set-cookie"] = clearSessionCookie();
    return { ok: true };
  })
  .get("/api/admin/me", async ({ cookie, set }) => {
    const user = await requireAdmin(cookie as never, set);
    if (!user) return { error: "belum login" };
    return { user };
  })
  .get("/api/admin/events", async ({ cookie, set }) => {
    if (!(await requireAdmin(cookie as never, set))) return { error: "belum login" };
    return { events: await listEvents() };
  })
  .post(
    "/api/admin/events",
    async ({ body, cookie, set }) => {
      if (!(await requireAdmin(cookie as never, set))) return { error: "belum login" };
      const status = body.status ?? "UPCOMING";
      if (!isEventStatus(status)) {
        set.status = 400;
        return { error: "status tidak valid" };
      }
      try {
        const event = await createEvent({
          name: body.name.trim(),
          slug: body.slug.trim().toLowerCase(),
          description: body.description?.trim() ?? "",
          status,
        });
        set.status = 201;
        return { event };
      } catch {
        set.status = 400;
        return { error: "gagal membuat event (slug mungkin sudah dipakai)" };
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        slug: t.String({ minLength: 1 }),
        description: t.Optional(t.String()),
        status: t.Optional(t.String()),
      }),
    },
  )
  .patch(
    "/api/admin/events/:id",
    async ({ params, body, cookie, set }) => {
      if (!(await requireAdmin(cookie as never, set))) return { error: "belum login" };
      if (body.status !== undefined && !isEventStatus(body.status)) {
        set.status = 400;
        return { error: "status tidak valid" };
      }
      const event = await updateEvent(params.id, {
        name: body.name?.trim() || undefined,
        description: body.description?.trim(),
        status: body.status as never,
      });
      if (!event) {
        set.status = 404;
        return { error: "event tidak ditemukan" };
      }
      return { event };
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        description: t.Optional(t.String()),
        status: t.Optional(t.String()),
      }),
    },
  )
  .delete("/api/admin/events/:id", async ({ params, cookie, set }) => {
    if (!(await requireAdmin(cookie as never, set))) return { error: "belum login" };
    await deleteEvent(params.id);
    return { ok: true };
  })
  .get("/api/admin/photos", async ({ cookie, set, query }) => {
    if (!(await requireAdmin(cookie as never, set))) return { error: "belum login" };
    return { photos: await listPhotosAdmin(query.status) };
  })
  .patch(
    "/api/admin/photos/:id",
    async ({ params, body, cookie, set }) => {
      if (!(await requireAdmin(cookie as never, set))) return { error: "belum login" };
      if (body.status !== "APPROVED" && body.status !== "REJECTED") {
        set.status = 400;
        return { error: "status harus APPROVED atau REJECTED" };
      }
      const photo = await setPhotoStatus(params.id, body.status);
      if (!photo) {
        set.status = 404;
        return { error: "foto tidak ditemukan" };
      }
      return { photo };
    },
    { body: t.Object({ status: t.String() }) },
  )
  .delete("/api/admin/photos/:id", async ({ params, cookie, set }) => {
    if (!(await requireAdmin(cookie as never, set))) return { error: "belum login" };
    const photo = await deletePhotoRow(params.id);
    if (!photo) {
      set.status = 404;
      return { error: "foto tidak ditemukan" };
    }
    try {
      await deletePhoto(photo.storage_key);
    } catch {
      // row sudah terhapus; file yatim dibersihkan manual bila perlu
    }
    return { ok: true };
  });
