import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Photo } from "../lib/api.ts";
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
  const ratio = photo.width && photo.height ? `${photo.width} / ${photo.height}` : undefined;

  return (
    <figure className="group break-inside-avoid overflow-hidden rounded-xl border border-[#EAEAEA] bg-white transition hover:border-[#cccccc]">
      <Link to={`/p/${slug}/photo/${photo.id}`} className="block overflow-hidden" aria-label={`Buka foto ${index + 1}`}>
        <div className="overflow-hidden bg-[#F7F6F3]" style={ratio ? { aspectRatio: ratio } : undefined}>
          {failed ? (
            <div className={cn("flex w-full items-center justify-center", !ratio && "aspect-[4/5]")}>
              <span className="px-4 py-10 text-center font-mono text-[11px] text-[#787774]">foto tak termuat</span>
            </div>
          ) : (
            <img
              src={photo.image_url}
              alt={`Foto ${index + 1} dari arsip ${slug}`}
              loading={index < 6 ? "eager" : "lazy"}
              decoding="async"
              onError={() => setFailed(true)}
              className={cn("h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]", !ratio && "aspect-[4/5]")}
            />
          )}
        </div>
      </Link>
      <figcaption className="flex items-center gap-2 border-t border-[#EAEAEA] bg-white p-2">
        <LikeButton id={photo.id} initialLiked={false} initialCount={photo.like_count} />
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
