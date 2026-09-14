import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, Check, Copy, Loader2, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ShareButton } from "../components/LikeButton.tsx";
import Navbar from "../components/Navbar.tsx";
import Reveal from "../components/Reveal.tsx";
import { Button } from "../components/ui/button.tsx";
import { useLanguage } from "../lib/i18n.tsx";
import { getPeriod, getPhotos, uploadPhoto, type Period, type Photo } from "../lib/api.ts";
import { setPageMeta } from "../lib/seo.ts";

const PhotoWall = lazy(() => import("../components/PhotoWall.tsx"));

const MAX_BYTES = 8 * 1024 * 1024;

function SkeletonWall() {
  return (
    <div className="columns-2 gap-3 sm:columns-3" aria-hidden>
      {[300, 220, 340, 260, 200, 320].map((h, i) => (
        <div key={i} className="skeleton mb-3 break-inside-avoid rounded-xl border border-[#EAEAEA]" style={{ height: h }} />
      ))}
    </div>
  );
}

export default function EventPage() {
  const { slug = "" } = useParams();
  const { t } = useLanguage();
  const [period, setPeriod] = useState<Period | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const eventUrl = typeof window !== "undefined" ? `${window.location.origin}/p/${slug}` : `/p/${slug}`;

  // True setelah mount ini selesai restore (atau memutuskan tidak perlu).
  // Mencegah cleanup pra-restore (StrictMode/HMR remount) menimpa posisi
  // tersimpan dengan posisi mentah 0.
  const restoredRef = useRef(false);

  // Posisi scroll per event: native restoration gagal karena remount
  // me-render skeleton pendek dulu — simpan saat masih di halaman event,
  // pulihkan setelah data siap agar Back mendarat di posisi semula.
  // Guard pathname wajib: setelah pindah ke photo detail, browser
  // meng-clamp scroll (halaman pendek) dan cleanup/effect jalan di bawah
  // path baru — nilai clamp itu tidak boleh menimpa posisi tersimpan.
  useLayoutEffect(() => {
    const key = `wall-scroll:${slug}`;
    const eventPath = `/p/${slug}`;
    let prevRestoration: ScrollRestoration = "auto";
    let raf = 0;
    function persist() {
      if (window.location.pathname !== eventPath) return;
      try {
        if (!restoredRef.current && sessionStorage.getItem(key) !== null) return;
        sessionStorage.setItem(key, String(window.scrollY));
      } catch {
        // abaikan: mode privat
      }
    }
    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        persist();
      });
    }
    try {
      prevRestoration = history.scrollRestoration;
      history.scrollRestoration = "manual";
    } catch {
      // abaikan: browser lama
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      persist();
      try {
        history.scrollRestoration = prevRestoration;
      } catch {
        // abaikan: browser lama
      }
    };
  }, [slug]);

  useEffect(() => {
    if (loading) return;
    let y = 0;
    try {
      y = Number(sessionStorage.getItem(`wall-scroll:${slug}`) ?? 0);
    } catch {
      y = 0;
    }
    if (y > 0) window.scrollTo({ top: y, behavior: "instant" });
    restoredRef.current = true;
  }, [loading, slug]);

  useEffect(() => {
    if (period) {
      setPageMeta({
        title: `${period.name} — MEMORY of NFCC`,
        description: period.description || undefined,
        path: `/p/${slug}`,
        image: photos[0]?.image_url,
      });
    } else {
      setPageMeta({
        title: "MEMORY of NFCC — Arsip Visual Organisasi",
        path: `/p/${slug}`,
      });
    }
  }, [period, photos, slug]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([getPeriod(slug), getPhotos(slug)])
      .then(([p, ph]) => {
        if (!alive) return;
        setPeriod(p.period);
        setPhotos(ph.photos);
        setError("");
      })
      .catch((e: Error) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function pickFile(f: File | undefined) {
    if (!f) return;
    setFile(f);
  }

  async function onUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || uploading) return;
    if (file.size > MAX_BYTES) {
      toast.error(t.event.fileTooBig);
      return;
    }
    setUploading(true);
    try {
      const res = await uploadPhoto(slug, file);
      toast.success(res.message);
      setFile(null);
      setPhotos((await getPhotos(slug)).photos);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.event.uploadFailed);
    } finally {
      setUploading(false);
    }
  }

  if (loading)
    return (
      <div className="min-h-screen bg-white pt-[92px] sm:pt-[104px]">
        <Navbar />
        <div className="mx-auto max-w-5xl px-5 py-8">
          <div className="skeleton h-5 w-28 rounded-md" />
          <div className="skeleton mt-4 h-9 w-2/3 rounded-md" />
          <div className="skeleton mt-3 h-4 w-1/2 rounded-md" />
          <div className="mt-8 rounded-xl border border-[#EAEAEA] bg-white p-5">
            <div className="skeleton h-5 w-32 rounded-md" />
            <div className="skeleton mt-3 h-20 w-full rounded-md" />
          </div>
          <div className="mt-8">
            <SkeletonWall />
          </div>
          <p className="mt-6 text-center font-mono text-xs text-[#787774]" role="status">{t.event.loading}</p>
        </div>
      </div>
    );

  if (error || !period)
    return (
      <div className="min-h-screen bg-white pt-[92px] sm:pt-[104px]">
        <Navbar />
        <div className="mx-auto max-w-md px-5 py-24 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-[#EAEAEA] bg-[#F7F6F3] text-[#787774]">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="4" width="18" height="14" rx="3" />
              <circle cx="12" cy="11" r="3" />
              <path d="M3 16.5 8 12l4 3 3-2 6 3.5" />
            </svg>
          </div>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-[#111111]">{t.event.notFoundTitle}</h1>
          <p className="mt-2 text-sm text-[#787774]">{error || t.event.notFoundDefault}</p>
          <Button asChild size="default" className="mt-6">
            <Link to="/">
              <ArrowLeft aria-hidden className="size-3.5" /> {t.event.home}
            </Link>
          </Button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white pt-[92px] text-[#2F3437] sm:pt-[104px]">
      <Navbar />

      {/* Event Header */}
      <header className="border-b border-[#EAEAEA] bg-white">
        <div className="mx-auto max-w-5xl px-5 py-7 sm:py-8">
          <Reveal className="mb-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-[#787774] transition hover:text-[#111111]"
            >
              <ArrowLeft aria-hidden className="size-3.5" />
              {t.event.home}
            </Link>
          </Reveal>
          <Reveal className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-[#111111] sm:text-3xl">{period.name}</h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-medium font-mono ${
                period.status === "ACTIVE"
                  ? "bg-[#EDF3EC] text-[#346538]"
                  : "bg-[#F7F6F3] text-[#787774]"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${period.status === "ACTIVE" ? "bg-[#346538]" : "bg-[#787774]"}`} />
              {period.status === "ACTIVE" ? t.common.receiving : period.status}
            </span>
          </Reveal>
          {period.description && (
            <Reveal delay={80}>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#787774]">{period.description}</p>
            </Reveal>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">
        {/* Upload Form */}
        {period.status === "ACTIVE" ? (
          <Reveal className="mb-8">
            <form
              onSubmit={onUpload}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                pickFile(e.dataTransfer.files?.[0]);
              }}
              className={`rounded-xl border bg-white p-5 transition sm:p-6 ${
                dragOver ? "border-[#111111] bg-[#F7F6F3]" : "border-[#EAEAEA]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-[#111111]">{t.event.addPhoto}</h2>
                  <p className="mt-1 text-sm text-[#787774]">{t.event.addPhotoSub}</p>
                </div>
                <span className="hidden shrink-0 rounded-md border border-[#EAEAEA] bg-[#F7F6F3] px-2.5 py-1 font-mono text-xs text-[#787774] sm:inline-block">
                  JPG · 8MB
                </span>
              </div>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
                {preview ? (
                  <div className="relative shrink-0">
                    <div className="rounded-lg overflow-hidden border border-[#EAEAEA]">
                      <img src={preview} alt={t.event.previewAlt} className="max-h-44 w-auto object-contain" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      aria-label={t.event.removePreview}
                      className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border border-[#EAEAEA] bg-white text-[#787774] transition hover:bg-[#F7F6F3] hover:text-[#111111]"
                    >
                      <X aria-hidden className="size-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    aria-hidden
                    className={`hidden h-28 w-36 shrink-0 items-center justify-center rounded-lg border border-dashed text-[#787774] sm:flex ${
                      dragOver ? "border-[#111111] bg-white" : "border-[#EAEAEA] bg-[#F7F6F3]"
                    }`}
                  >
                    <Camera className="size-6 text-[#787774]" aria-hidden />
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-3 rounded-md border border-[#EAEAEA] bg-[#F7F6F3] px-3.5 py-2.5 text-sm transition hover:border-[#cccccc]">
                    <input
                      type="file"
                      accept="image/jpeg,.jpg,.jpeg"
                      capture="environment"
                      onChange={(e) => pickFile(e.target.files?.[0])}
                      className="sr-only"
                    />
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#111111] px-3 py-1 text-xs font-medium text-white">
                      <Camera className="size-3.5" aria-hidden /> {t.event.choosePhoto}
                    </span>
                    <span className="truncate text-xs font-mono text-[#787774]">
                      {file ? t.event.chosenFile(file.name, (file.size / 1024 / 1024).toFixed(1)) : t.event.dropHint}
                    </span>
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="submit"
                      disabled={!file || uploading}
                    >
                      {uploading ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 aria-hidden className="h-3.5 w-3.5 animate-spin" />
                          {t.event.uploading}
                        </span>
                      ) : (
                        t.event.upload
                      )}
                    </Button>
                    {file && !uploading && (
                      <span className="font-mono text-xs text-[#787774]">{t.event.optimizedNote}</span>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </Reveal>
        ) : (
          <Reveal className="mb-8">
            <p className="rounded-xl border border-[#EAEAEA] bg-[#F7F6F3] p-4 text-sm text-[#787774]">
              {t.event.closedNote}
            </p>
          </Reveal>
        )}

        {/* Photo Wall */}
        <Reveal>
          <div className="mt-8 mb-4 flex items-baseline justify-between border-b border-[#EAEAEA] pb-2">
            <h2 className="text-base font-semibold text-[#111111]">{t.event.wallTitle}</h2>
            <span className="font-mono text-xs text-[#787774] tabular-nums">{photos.length} {t.event.photosUnit}</span>
          </div>
          {photos.length === 0 ? (
            <div className="rounded-xl border border-[#EAEAEA] bg-[#F7F6F3] px-5 py-12 text-center">
              <p className="text-lg font-semibold text-[#111111]">{t.event.emptyTitle}</p>
              <p className="mt-1 font-mono text-xs text-[#787774]">{t.event.emptySub}</p>
            </div>
          ) : (
            <Suspense fallback={<SkeletonWall />}>
              <PhotoWall photos={photos} slug={slug} />
            </Suspense>
          )}
        </Reveal>

        {/* Share Section */}
        <Reveal delay={100} className="mt-12">
          <div className="rounded-xl border border-[#EAEAEA] bg-[#F7F6F3] p-5 sm:flex sm:items-center sm:gap-6 sm:p-6">
            <div className="shrink-0 rounded-lg border border-[#EAEAEA] bg-white p-2">
              <QRCodeSVG value={eventUrl} size={100} aria-label={`QR menuju ${eventUrl}`} />
            </div>
            <div className="mt-4 flex-1 sm:mt-0">
              <h2 className="font-semibold text-[#111111]">{t.event.inviteTitle}</h2>
              <p className="mt-0.5 font-mono text-xs break-all text-[#787774]">{eventUrl}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(eventUrl).then(() => {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    });
                  }}
                  aria-live="polite"
                >
                  {copied ? (
                    <>
                      <Check aria-hidden className="text-[#346538]" /> {t.event.copied}
                    </>
                  ) : (
                    <>
                      <Copy aria-hidden /> {t.event.copyLink}
                    </>
                  )}
                </Button>
                <ShareButton url={eventUrl} />
              </div>
            </div>
          </div>
        </Reveal>
      </main>

      <footer className="border-t border-[#EAEAEA] bg-white mt-16">
        <div className="mx-auto max-w-5xl px-5 py-6 font-mono text-xs text-[#787774]">
          MEMORY of NFCC — {period.name}
        </div>
      </footer>
    </div>
  );
}