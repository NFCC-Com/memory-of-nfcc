export interface Period {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: "UPCOMING" | "ACTIVE" | "CLOSED" | "ARCHIVED";
}

export interface Photo {
  id: string;
  period_id: string;
  image_url: string;
  width: number | null;
  height: number | null;
  like_count: number;
  /** Status suka visitor ini — diisi endpoint list, absen di respons lain. */
  liked?: boolean;
}

export class ApiUnreachableError extends Error {
  constructor() {
    super("Tidak bisa menghubungi API. Pastikan API berjalan (`bun run dev:api`).");
    this.name = "ApiUnreachableError";
  }
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  // Tanpa timeout, fetch yang menggantung membuat skeleton tampil selamanya.
  // Gagal-cepat 20 detik agar berubah menjadi state error yang bisa di-retry.
  const timeout =
    typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function"
      ? AbortSignal.timeout(20000)
      : undefined;
  try {
    res = await fetch(path, timeout ? { ...init, signal: timeout } : init);
  } catch {
    throw new ApiUnreachableError();
  }
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error ?? `Permintaan gagal (${res.status})`);
  return data as T;
}

export const getPeriod = (slug: string) => req<{ period: Period }>(`/api/periods/${slug}`);

export const getPeriods = () => req<{ periods: Period[] }>(`/api/periods`);

export const getPhotos = (slug: string) =>
  req<{ photos: Photo[] }>(`/api/periods/${slug}/photos`);

export const getPhoto = (id: string) => req<{ photo: Photo; liked: boolean }>(`/api/photos/${id}`);

export function uploadPhoto(slug: string, file: File) {
  const fd = new FormData();
  fd.append("photo", file);
  return req<{ photo: Photo; message: string }>(`/api/periods/${slug}/photos`, {
    method: "POST",
    body: fd,
  });
}

export const likePhoto = (id: string) =>
  req<{ liked: boolean; like_count: number }>(`/api/photos/${id}/like`, { method: "POST" });

export const unlikePhoto = (id: string) =>
  req<{ liked: boolean; like_count: number }>(`/api/photos/${id}/like`, { method: "DELETE" });

export async function sharePhoto(url: string): Promise<"shared" | "copied" | "dismissed"> {  if (navigator.share) {
    try {
      await navigator.share({ title: "Memory Photo Wall", url });
      return "shared";
    } catch {
      return "dismissed";
    }
  }
  await navigator.clipboard.writeText(url);
  return "copied";
}

/* ---------- Admin ---------- */

export interface AdminEvent extends Period {
  created_at: string;
}

export interface AdminPhoto extends Photo {
  status: "PENDING" | "APPROVED" | "REJECTED";
  slug: string;
}

const adminReq = <T>(path: string, init?: RequestInit) => req<T>(path, init);

export const adminLogin = (email: string, password: string) =>
  adminReq<{ user: { id: string; email: string } }>("/api/admin/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

export const adminLogout = () => adminReq<{ ok: boolean }>("/api/admin/logout", { method: "POST" });

export const adminMe = () => adminReq<{ user: { id: string; email: string } }>("/api/admin/me");

export const adminEvents = () => adminReq<{ events: AdminEvent[] }>("/api/admin/events");

export const adminCreateEvent = (input: { name: string; slug: string; description: string; status: string }) =>
  adminReq<{ event: AdminEvent }>("/api/admin/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });

export const adminUpdateEvent = (id: string, input: { name?: string; description?: string; status?: string }) =>
  adminReq<{ event: AdminEvent }>(`/api/admin/events/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });

export const adminDeleteEvent = (id: string) =>
  adminReq<{ ok: boolean }>(`/api/admin/events/${id}`, { method: "DELETE" });

export const adminPhotos = (status?: string) =>
  adminReq<{ photos: AdminPhoto[] }>(`/api/admin/photos${status ? `?status=${status}` : ""}`);

export const adminSetPhoto = (id: string, status: "APPROVED" | "REJECTED") =>
  adminReq<{ photo: Photo }>(`/api/admin/photos/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status }),
  });

export const adminDeletePhoto = (id: string) =>
  adminReq<{ ok: boolean }>(`/api/admin/photos/${id}`, { method: "DELETE" });
