import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Share2, Download, Loader2 } from "lucide-react";
import LikeButton, { ShareButton } from "../components/LikeButton.tsx";
import Navbar from "../components/Navbar.tsx";
import Reveal from "../components/Reveal.tsx";
import { Button } from "../components/ui/button.tsx";
import { getPhoto, type Photo } from "../lib/api.ts";

export default function PhotoPage() {
  const { slug = "", id = "" } = useParams();
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [liked, setLiked] = useState(false);
  const [error, setError] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/p/${slug}/photo/${id}` : "";

  useEffect(() => {
    let alive = true;
    getPhoto(id)
      .then((res) => {
        if (!alive) return;
        setPhoto(res.photo);
        setLiked(res.liked);
      })
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [id]);

  if (!photo && !error)
    return (
      <div className="min-h-screen bg-white pt-[92px] sm:pt-[104px]">
        <Navbar />
        <div className="mx-auto max-w-4xl px-5 py-16 flex flex-col items-center gap-4">
          <div className="skeleton aspect-[4/3] w-full max-w-2xl rounded-xl border border-[#EAEAEA]" aria-hidden />
          <p className="font-mono text-xs text-[#787774]" role="status">Memuat foto…</p>
        </div>
      </div>
    );

  if (error || !photo)
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
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-[#111111]">Foto tidak ditemukan</h1>
          <p className="mt-2 text-sm text-[#787774]">{error || "Foto ini mungkin sudah dihapus atau tidak tersedia."}</p>
          <Button asChild size="default" className="mt-6">
            <Link to={`/p/${slug}`}>
              <ArrowLeft aria-hidden className="size-3.5" /> Kembali ke dinding
            </Link>
          </Button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white pt-[92px] text-[#2F3437] sm:pt-[104px]">
      <Navbar />

      <header className="border-b border-[#EAEAEA] bg-white">
        <div className="mx-auto max-w-4xl px-5 py-4 flex items-center justify-between">
          <Link
            to={`/p/${slug}`}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium text-[#787774] transition hover:bg-[#F7F6F3] hover:text-[#2F3437]"
          >
            <ArrowLeft aria-hidden className="size-3.5" />
            <span>Kembali ke dinding</span>
          </Link>
          <div className="rounded-md border border-[#EAEAEA] bg-[#F7F6F3] px-2.5 py-1 font-mono text-xs text-[#787774] tabular-nums">
            {photo.width && photo.height ? `${photo.width}×${photo.height} · ` : ""}{photo.like_count} suka
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-8">
        {/* Photo Viewer */}
        <Reveal>
          <figure className="relative overflow-hidden rounded-xl border border-[#EAEAEA] bg-[#F7F6F3]">
            <div className="relative min-h-[300px] max-h-[75vh] flex items-center justify-center">
              <img
                src={photo.image_url}
                alt=""
                loading="eager"
                decoding="async"
                fetchPriority="high"
                onLoad={() => setImageLoaded(true)}
                className={`block max-h-[75vh] w-full object-contain transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="size-6 animate-spin text-[#787774]" aria-hidden />
                </div>
              )}
            </div>
          </figure>
        </Reveal>

        {/* Actions Bar */}
        <Reveal delay={80} className="mt-4">
          <div className="rounded-xl border border-[#EAEAEA] bg-white p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <LikeButton id={photo.id} initialLiked={liked} initialCount={photo.like_count} />
                <ShareButton url={shareUrl} />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  aria-label="Unduh foto"
                >
                  <a href={photo.image_url} download target="_blank" rel="noopener noreferrer">
                    <Download className="size-3.5 mr-1" aria-hidden /> Unduh
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl).then(() => {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    });
                  }}
                  aria-label="Salin tautan foto"
                >
                  <Share2 className="size-3.5 mr-1" aria-hidden />
                  {copied ? "Tersalin" : "Tautan"}
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </main>

      <footer className="border-t border-[#EAEAEA] bg-white mt-16">
        <div className="mx-auto max-w-4xl px-5 py-6 font-mono text-xs text-[#787774]">
          MEMORY of NFCC — Arsip Visual
        </div>
      </footer>
    </div>
  );
}