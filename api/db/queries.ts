import { sql } from "./client.js";

export interface Period {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: "UPCOMING" | "ACTIVE" | "CLOSED" | "ARCHIVED";
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  period_id: string;
  storage_key: string;
  image_url: string;
  width: number | null;
  height: number | null;
  mime_type: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: string;
  moderated_at: string | null;
  like_count: number;
}

export async function getPeriodBySlug(slug: string): Promise<Period | null> {
  const rows = await sql`select * from periods where slug = ${slug} limit 1`;
  return (rows[0] as Period | undefined) ?? null;
}

export async function listPublicPeriods(): Promise<Period[]> {
  const rows = await sql`
    select * from periods
    where status in ('UPCOMING', 'ACTIVE', 'CLOSED')
    order by case status when 'ACTIVE' then 0 when 'UPCOMING' then 1 else 2 end, created_at desc
  `;
  return rows as Period[];
}

export async function listApprovedPhotos(
  periodId: string,
  visitorId?: string,
): Promise<(Photo & { liked: boolean })[]> {
  const rows = await sql`
    select p.*,
      (select count(*)::int from photo_likes l where l.photo_id = p.id) as like_count,
      ${visitorId ? sql`exists(select 1 from photo_likes l where l.photo_id = p.id and l.visitor_id = ${visitorId})` : sql`false`} as liked
    from photos p
    where p.period_id = ${periodId} and p.status = 'APPROVED'
    order by p.created_at desc
  `;
  return rows as (Photo & { liked: boolean })[];
}

export async function getApprovedPhoto(id: string): Promise<Photo | null> {
  const rows = await sql`
    select p.*, (select count(*)::int from photo_likes l where l.photo_id = p.id) as like_count
    from photos p
    where p.id = ${id} and p.status = 'APPROVED'
    limit 1
  `;
  return (rows[0] as Photo | undefined) ?? null;
}

export async function getPhotoAny(id: string): Promise<Photo | null> {
  const rows = await sql`select *, 0 as like_count from photos where id = ${id} limit 1`;
  return (rows[0] as Photo | undefined) ?? null;
}

export async function createPhoto(input: {
  id: string;
  periodId: string;
  storageKey: string;
  imageUrl: string;
  width: number;
  height: number;
  mimeType: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}): Promise<Photo> {
  const rows = await sql`
    insert into photos (id, period_id, storage_key, image_url, width, height, mime_type, status, moderated_at)
    values (${input.id}, ${input.periodId}, ${input.storageKey}, ${input.imageUrl}, ${input.width}, ${input.height}, ${input.mimeType}, ${input.status}, case when ${input.status} = 'APPROVED' then now() else null end)
    returning *, 0 as like_count
  `;
  return rows[0] as Photo;
}

export async function countLikes(photoId: string): Promise<number> {
  const rows = await sql`select count(*)::int as n from photo_likes where photo_id = ${photoId}`;
  return (rows[0] as { n: number }).n;
}

/** Returns true bila like baru dibuat, false bila sudah pernah like. */
export async function createLike(photoId: string, visitorId: string): Promise<boolean> {
  try {
    await sql`insert into photo_likes (photo_id, visitor_id) values (${photoId}, ${visitorId})`;
    return true;
  } catch (e) {
    if ((e as { code?: string })?.code === "23505") return false;
    throw e;
  }
}

export async function deleteLike(photoId: string, visitorId: string): Promise<void> {
  await sql`delete from photo_likes where photo_id = ${photoId} and visitor_id = ${visitorId}`;
}

export async function hasLiked(photoId: string, visitorId: string): Promise<boolean> {
  const rows =
    await sql`select 1 from photo_likes where photo_id = ${photoId} and visitor_id = ${visitorId} limit 1`;
  return rows.length > 0;
}

/* ---------- Admin ---------- */

export interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
}

export async function getAdminByEmail(email: string): Promise<AdminUser | null> {
  const rows = await sql`select * from admin_users where email = ${email} limit 1`;
  return (rows[0] as AdminUser | undefined) ?? null;
}

export async function listEvents(): Promise<Period[]> {
  const rows = await sql`select * from periods order by created_at desc`;
  return rows as Period[];
}

export async function createEvent(input: {
  name: string;
  slug: string;
  description: string;
  status: Period["status"];
}): Promise<Period> {
  const rows = await sql`
    insert into periods (name, slug, description, status)
    values (${input.name}, ${input.slug}, ${input.description}, ${input.status})
    returning *
  `;
  return rows[0] as Period;
}

const EVENT_STATUSES = ["UPCOMING", "ACTIVE", "CLOSED", "ARCHIVED"] as const;

export function isEventStatus(s: string): s is Period["status"] {
  return (EVENT_STATUSES as readonly string[]).includes(s);
}

export async function updateEvent(
  id: string,
  input: { name?: string; description?: string; status?: Period["status"] },
): Promise<Period | null> {
  const rows = await sql`
    update periods set
      name = coalesce(${input.name ?? null}, name),
      description = coalesce(${input.description ?? null}, description),
      status = coalesce(${input.status ?? null}, status),
      updated_at = now()
    where id = ${id}
    returning *
  `;
  return (rows[0] as Period | undefined) ?? null;
}

export async function deleteEvent(id: string): Promise<void> {
  await sql`delete from periods where id = ${id}`;
}

export async function listPhotosAdmin(status?: string): Promise<(Photo & { slug: string })[]> {
  const rows =
    status === "PENDING" || status === "APPROVED" || status === "REJECTED"
      ? await sql`
          select p.*, per.slug from photos p
          join periods per on per.id = p.period_id
          where p.status = ${status} order by p.created_at desc limit 200
        `
      : await sql`
          select p.*, per.slug from photos p
          join periods per on per.id = p.period_id
          order by p.created_at desc limit 200
        `;
  return rows as (Photo & { slug: string })[];
}

export async function setPhotoStatus(
  id: string,
  status: "APPROVED" | "REJECTED",
): Promise<Photo | null> {
  const rows = await sql`
    update photos set status = ${status}, moderated_at = now()
    where id = ${id} returning *, 0 as like_count
  `;
  return (rows[0] as Photo | undefined) ?? null;
}

export async function deletePhotoRow(id: string): Promise<Photo | null> {
  const rows = await sql`delete from photos where id = ${id} returning *, 0 as like_count`;
  return (rows[0] as Photo | undefined) ?? null;
}
