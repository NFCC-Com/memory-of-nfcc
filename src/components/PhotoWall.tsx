import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Photo } from "../lib/api.ts";
import { useLanguage } from "../lib/i18n.tsx";
import LikeButton, { ShareButton } from "./LikeButton.tsx";
import { cn } from "../lib/utils.ts";

interface PhotoWallProps {
  photos: Photo[];
  slug: string;
}

function useColumnCount() {
  const [n, setN] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(min-width: 640px)").matches ? 3 : 2,
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const onChange = (e: MediaQueryListEvent) => setN(e.matches ? 3 : 2);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return n;
}

function PhotoTile({ photo, slug, index }: { photo: Photo; slug: string; index: number }) {
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const figRef = useRef<HTMLElement>(null);
  const { t } = useLanguage();
  const ratio = photo.width && photo.height ? `${photo.width} / ${photo.height}` : undefined;

  // Gagal load transien (timeout/429 saat burst 193 request) tidak boleh
  // mengunci tile abu-abu selamanya: coba lagi maks 2x saat tile terlihat.
  // 404 permanen tetap berhenti di fallback setelah budget habis.
  useEffect(() => {
    if (!failed || attempt >= 2) return;
    const el = figRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setFailed(false);
            setAttempt((n) => n + 1);
            io.disconnect();
          }
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [failed, attempt]);

  return (
    <figure
      ref={figRef}
      className="group break-inside-avoid overflow-hidden rounded-xl border border-[#EAEAEA] bg-white transition hover:border-[#cccccc] [content-visibility:auto] [contain-intrinsic-size:auto_420px]"
    >
      <Link to={`/p/${slug}/photo/${photo.id}`} className="block overflow-hidden" aria-label={t.wall.openPhotoAria(index)}>
        <div className="overflow-hidden bg-[#F7F6F3]" style={ratio ? { aspectRatio: ratio } : undefined}>
          {failed ? (
            <div className={cn("flex w-full items-center justify-center", !ratio && "aspect-[4/5]")}>
              <span className="px-4 py-10 text-center font-mono text-[11px] text-[#787774]">{t.wall.failedToLoad}</span>
            </div>
          ) : (
            <img
              key={attempt}
              src={photo.image_url}
              alt={t.wall.photoAlt(index)}
              loading={index < 6 ? "eager" : "lazy"}
              decoding="async"
              onError={() => setFailed(true)}
              className={cn("h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]", !ratio && "aspect-[4/5]")}
            />
          )}
        </div>
      </Link>
      <figcaption className="flex items-center gap-2 border-t border-[#EAEAEA] bg-white p-2">
        <LikeButton key={photo.id} id={photo.id} initialLiked={photo.liked ?? false} initialCount={photo.like_count} />
        <ShareButton url={`${window.location.origin}/p/${slug}/photo/${photo.id}`} />
      </figcaption>
    </figure>
  );
}

export default function PhotoWall({ photos, slug }: PhotoWallProps) {
  const colCount = useColumnCount();

  const cols: Photo[][] = Array.from({ length: colCount }, () => []);
  photos.forEach((p, i) => {
    cols[i % colCount].push(p);
  });
  let seen = 0;

  return (
    <div className="grid grid-cols-2 items-start gap-3 sm:grid-cols-3">
      {cols.map((col, ci) => {
        const start = seen;
        seen += col.length;
        return (
          <div key={ci} className="flex min-w-0 flex-col gap-3">
            {col.map((p, j) => (
              <PhotoTile key={p.id} photo={p} slug={slug} index={start + j} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
