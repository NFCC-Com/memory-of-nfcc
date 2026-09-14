import { useCallback, useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, Check, Copy, Download, Images, Loader2, LogOut, Plus, X } from "lucide-react";
import { toast } from "sonner";
import {
  adminCreateEvent,
  adminDeleteEvent,
  adminDeletePhoto,
  adminEvents,
  adminLogout,
  adminMe,
  adminPhotos,
  adminSetPhoto,
  adminUpdateEvent,
  type AdminEvent,
  type AdminPhoto,
} from "../lib/api.ts";
import Reveal from "../components/Reveal.tsx";
import { setPageMeta } from "../lib/seo.ts";
import { Button } from "../components/ui/button.tsx";

const STATUSES = ["UPCOMING", "ACTIVE", "CLOSED", "ARCHIVED"] as const;

type EventStatus = AdminEvent["status"];
type PhotoStatus = AdminPhoto["status"];

function EventBadge({ status }: { status: EventStatus }) {
  const styles: Record<EventStatus, string> = {
    ACTIVE: "bg-[#EDF3EC] text-[#346538] border border-[#EDF3EC]",
    UPCOMING: "bg-[#FBF3DB] text-[#956400] border border-[#FBF3DB]",
    CLOSED: "bg-[#F7F6F3] text-[#787774] border border-[#EAEAEA]",
    ARCHIVED: "bg-[#F7F6F3] text-[#787774] border border-[#EAEAEA]",
  };
  const dots: Record<EventStatus, string> = {
    ACTIVE: "bg-[#346538]",
    UPCOMING: "bg-[#956400]",
    CLOSED: "bg-[#787774]",
    ARCHIVED: "bg-[#787774]",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium ${styles[status]}`}>
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${dots[status]}`} />
      {status}
    </span>
  );
}

function PhotoBadge({ status }: { status: PhotoStatus }) {
  const styles: Record<PhotoStatus, string> = {
    PENDING: "bg-[#FBF3DB] text-[#956400] border border-[#FBF3DB]",
    APPROVED: "bg-[#EDF3EC] text-[#346538] border border-[#EDF3EC]",
    REJECTED: "bg-[#FDEBEC] text-[#9F2F2D] border border-[#FDEBEC]",
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[11px] font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  busy,
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  busy: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl border border-[#EAEAEA] bg-white p-5 sm:p-6"
      >
        <h2 id="confirm-title" className="font-semibold tracking-tight text-[#111111]">
          {title}
        </h2>
        <p id="confirm-desc" className="mt-1.5 text-sm leading-relaxed text-[#787774]">
          {message}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" autoFocus onClick={onClose}>
            Batal
          </Button>
          <Button type="button" variant="destructive" size="sm" disabled={busy} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

function QrDownload({ url, slug }: { url: string; slug: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  function onDownload() {
    const svg = wrapRef.current?.querySelector("svg");
    if (!svg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = `qr-${slug}.svg`;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  return (
    <div ref={wrapRef} className="group relative shrink-0">
      <QRCodeSVG value={url} size={80} className="rounded-md border border-[#EAEAEA] p-1" />
      <button
        type="button"
        onClick={onDownload}
        aria-label={`Unduh QR ${slug}`}
        className="absolute inset-0 flex items-center justify-center rounded-md bg-white/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100"
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-[#111111] text-white">
          <Download aria-hidden className="size-4" />
        </span>
      </button>
    </div>
  );
}

export default function Admin() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<"events" | "photos">("photos");
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [photos, setPhotos] = useState<AdminPhoto[]>([]);
  const [photoFilter, setPhotoFilter] = useState("PENDING");
  const [busy, setBusy] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ kind: "event" | "photo"; id: string; name: string } | null>(null);
  const copyTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  useEffect(() => {
    setPageMeta({
      title: "Admin — MEMORY of NFCC",
      path: "/admin",
      noindex: true,
    });
  }, []);

  function onTabKeys(e: React.KeyboardEvent) {
    const order = ["photos", "events"] as const;
    const i = order.indexOf(tab);
    let next: (typeof order)[number] | null = null;
    if (e.key === "ArrowRight") next = order[(i + 1) % order.length];
    else if (e.key === "ArrowLeft") next = order[(i + order.length - 1) % order.length];
    if (!next) return;
    e.preventDefault();
    setTab(next);
    document.getElementById(`tab-${next}`)?.focus();
  }

  function onCopy(id: string, url: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopiedId(null), 2000);
    });
  }

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const loadEvents = useCallback(async () => {
    setEvents((await adminEvents()).events);
  }, []);
  const loadPhotos = useCallback(async () => {
    setPhotos((await adminPhotos(photoFilter)).photos);
  }, [photoFilter]);

  useEffect(() => {
    adminMe()
      .then(() => setReady(true))
      .catch(() => nav("/login"));
  }, [nav]);

  useEffect(() => {
    if (!ready) return;
    loadEvents().catch((e: Error) => toast.error(e.message));
    loadPhotos().catch((e: Error) => toast.error(e.message));
  }, [ready, loadEvents, loadPhotos]);

  if (!ready)
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 bg-white font-mono text-xs text-[#787774]">
        <Loader2 aria-hidden className="size-4 animate-spin" />
        Memeriksa sesi…
      </div>
    );

  async function run(fn: () => Promise<void>, okMsg: string, errMsg: string) {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
      toast.success(okMsg);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : errMsg);
    } finally {
      setBusy(false);
    }
  }

  function onCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    void run(
      async () => {
        await adminCreateEvent({ name, slug, description, status: "UPCOMING" });
        setName("");
        setSlug("");
        setDescription("");
        await loadEvents();
      },
      "Event dibuat.",
      "Gagal membuat event",
    );
  }

  function onStatus(id: string, status: string) {
    void run(
      async () => {
        await adminUpdateEvent(id, { status });
        await loadEvents();
      },
      "Status event diperbarui.",
      "Gagal mengubah status",
    );
  }

  function onDeleteEvent(id: string, name: string) {
    setPendingDelete({ kind: "event", id, name });
  }

  function onModerate(id: string, status: "APPROVED" | "REJECTED") {
    void run(
      async () => {
        await adminSetPhoto(id, status);
        await loadPhotos();
      },
      status === "APPROVED" ? "Foto disetujui." : "Foto ditolak.",
      "Gagal memoderasi",
    );
  }

  function onDeletePhoto(id: string, name: string) {
    setPendingDelete({ kind: "photo", id, name });
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    if (target.kind === "event") {
      void run(
        async () => {
          await adminDeleteEvent(target.id);
          await loadEvents();
        },
        "Event dihapus.",
        "Gagal menghapus event",
      );
    } else {
      void run(
        async () => {
          await adminDeletePhoto(target.id);
          await loadPhotos();
        },
        "Foto dihapus.",
        "Gagal menghapus foto",
      );
    }
  }

  return (
    <div className="min-h-screen bg-white text-[#2F3437]">
      <main>
        <div className="mx-auto max-w-5xl px-5 py-8">
          <Reveal className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAEAEA] pb-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#111111]">Dashboard Pengelola</h1>
              <p className="mt-0.5 font-mono text-xs text-[#787774]">Kurasi foto & administrasi acara.</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => adminLogout().then(() => nav("/login"))}
            >
              <LogOut aria-hidden className="size-3.5" />
              Keluar
            </Button>
          </Reveal>

          <Reveal delay={80} className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div role="tablist" aria-label="Bagian dashboard" onKeyDown={onTabKeys} className="inline-flex rounded-md border border-[#EAEAEA] bg-[#F7F6F3] p-1">
              {(["photos", "events"] as const).map((t) => (
                <button
                  key={t}
                  id={`tab-${t}`}
                  role="tab"
                  type="button"
                  onClick={() => setTab(t)}
                  aria-selected={tab === t}
                  aria-controls={`panel-${t}`}
                  tabIndex={tab === t ? 0 : -1}
                  className={`inline-flex items-center gap-1.5 rounded-sm px-4 py-1.5 text-xs font-medium transition ${
                    tab === t
                      ? "bg-white text-[#111111] shadow-xs"
                      : "text-[#787774] hover:text-[#111111]"
                  }`}
                >
                  {t === "photos" ? <Images aria-hidden className="size-3.5" /> : <CalendarDays aria-hidden className="size-3.5" />}
                  {t === "photos" ? `Foto (${photos.length})` : `Event (${events.length})`}
                </button>
              ))}
            </div>

            {tab === "photos" && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#787774]">Status:</span>
                <select
                  value={photoFilter}
                  onChange={(e) => setPhotoFilter(e.target.value)}
                  aria-label="Filter status foto"
                  className="rounded-md border border-[#EAEAEA] bg-white px-3 py-1 text-xs font-mono text-[#2F3437] outline-none focus:border-[#111111]"
                >
                  {["PENDING", "APPROVED", "REJECTED", ""].map((s) => (
                    <option key={s} value={s}>
                      {s === "" ? "SEMUA" : s}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </Reveal>

          {tab === "photos" && (
            <section role="tabpanel" id="panel-photos" aria-labelledby="tab-photos" className="mt-6">
              {photos.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[#EAEAEA] bg-[#F7F6F3] p-12 text-center font-mono text-xs text-[#787774]">
                  Tidak ada foto {photoFilter || "pada sistem"}.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {photos.map((p) => (
                    <div key={p.id} className="overflow-hidden rounded-xl border border-[#EAEAEA] bg-white p-2 transition hover:border-[#cccccc]">
                      <div className="overflow-hidden rounded-lg bg-[#F7F6F3]">
                        <img src={p.image_url} alt={`Foto dari arsip /p/${p.slug}`} loading="lazy" decoding="async" className="block max-h-60 w-full object-cover" />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 p-2 pt-3">
                        <span className="font-mono text-xs text-[#787774]">
                          /p/{p.slug}
                        </span>
                        <PhotoBadge status={p.status} />
                        <span className="flex-1" />
                        {p.status === "PENDING" && (
                          <>
                            <Button type="button" size="sm" variant="default" disabled={busy} onClick={() => onModerate(p.id, "APPROVED")}>
                              <Check aria-hidden className="size-3.5" />
                              Setujui
                            </Button>
                            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => onModerate(p.id, "REJECTED")}>
                              <X aria-hidden className="size-3.5" />
                              Tolak
                            </Button>
                          </>
                        )}
                        <Button type="button" size="sm" variant="destructive" disabled={busy} onClick={() => onDeletePhoto(p.id, `/p/${p.slug}`)}>
                          Hapus
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {tab === "events" && (
            <section role="tabpanel" id="panel-events" aria-labelledby="tab-events" className="mt-6">
              <form onSubmit={onCreateEvent} className="grid gap-3 rounded-xl border border-[#EAEAEA] bg-[#F7F6F3] p-5 sm:grid-cols-2">
                <div>
                  <label className="font-mono text-xs text-[#787774]">Nama Event</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Mis. Resepsi Dimas & Nina"
                    className="mt-1 w-full rounded-md border border-[#EAEAEA] bg-white px-3 py-2 text-sm outline-none placeholder:text-[#787774] focus:border-[#111111]"
                  />
                </div>
                <div>
                  <label className="font-mono text-xs text-[#787774]">Slug URL (/p/:slug)</label>
                  <input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                    placeholder="dimas-nina"
                    pattern="[a-z0-9-]+"
                    className="mt-1 w-full rounded-md border border-[#EAEAEA] bg-white px-3 py-2 font-mono text-sm outline-none placeholder:text-[#787774] focus:border-[#111111]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-mono text-xs text-[#787774]">Deskripsi Singkat</label>
                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Deskripsi acara untuk tamu..."
                    className="mt-1 w-full rounded-md border border-[#EAEAEA] bg-white px-3 py-2 text-sm outline-none placeholder:text-[#787774] focus:border-[#111111]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" disabled={busy}>
                    <Plus aria-hidden className="size-3.5" />
                    Buat Event Baru
                  </Button>
                </div>
              </form>

              <div className="mt-6 grid gap-3">
                {events.map((ev) => {
                  const url = `${window.location.origin}/p/${ev.slug}`;
                  return (
                    <div key={ev.id} className="flex flex-col gap-4 rounded-xl border border-[#EAEAEA] bg-white p-5 sm:flex-row sm:items-center">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-[#111111]">{ev.name}</span>
                          <EventBadge status={ev.status} />
                        </div>
                        <Link to={`/p/${ev.slug}`} className="font-mono text-xs text-[#787774] hover:text-[#111111]">
                          /p/{ev.slug}
                        </Link>
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          {STATUSES.map((s) => (
                            <button
                              key={s}
                              type="button"
                              disabled={busy}
                              onClick={() => onStatus(ev.id, s)}
                              aria-pressed={ev.status === s}
                              className={`rounded-md px-2.5 py-1 font-mono text-[11px] font-medium transition disabled:opacity-40 ${
                                ev.status === s
                                  ? "bg-[#111111] text-white"
                                  : "border border-[#EAEAEA] bg-white text-[#787774] hover:border-[#cccccc] hover:text-[#111111]"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                          <Button type="button" size="sm" variant="destructive" disabled={busy} onClick={() => onDeleteEvent(ev.id, ev.name)}>
                            Hapus
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <QrDownload url={url} slug={ev.slug} />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={busy}
                          onClick={() => onCopy(ev.id, url)}
                          aria-live="polite"
                        >
                          {copiedId === ev.id ? (
                            <>
                              <Check aria-hidden className="size-3.5 text-[#346538]" />
                              Disalin
                            </>
                          ) : (
                            <>
                              <Copy aria-hidden className="size-3.5" />
                              Salin
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <p className="mt-12 text-center font-mono text-xs text-[#787774]">
            <Link to="/" className="inline-flex items-center gap-1 transition hover:text-[#111111]">
              <ArrowLeft aria-hidden className="size-3" />
              Kembali ke beranda
            </Link>
          </p>

          {pendingDelete && (
            <ConfirmDialog
              title={pendingDelete.kind === "event" ? "Hapus event?" : "Hapus foto?"}
              message={
                pendingDelete.kind === "event"
                  ? `Hapus "${pendingDelete.name}" beserta semua fotonya? Tindakan ini tidak bisa dibatalkan.`
                  : `Hapus foto dari arsip ${pendingDelete.name} secara permanen? Tindakan ini tidak bisa dibatalkan.`
              }
              confirmLabel="Hapus"
              busy={busy}
              onClose={() => setPendingDelete(null)}
              onConfirm={confirmDelete}
            />
          )}
        </div>
      </main>
    </div>
  );
}
