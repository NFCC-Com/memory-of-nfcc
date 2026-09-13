import { useState } from "react";
import { Check, Heart, Link2, Share2 } from "lucide-react";
import { likePhoto, sharePhoto, unlikePhoto } from "../lib/api.ts";
import { useLanguage } from "../lib/i18n.tsx";
import { Button } from "./ui/button.tsx";

interface Props {
  id: string;
  initialLiked: boolean;
  initialCount: number;
}

export default function LikeButton({ id, initialLiked, initialCount }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);
  const [pop, setPop] = useState(false);
  const [failed, setFailed] = useState(false);
  const { t } = useLanguage();

  async function toggle() {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    try {
      const res = liked ? await unlikePhoto(id) : await likePhoto(id);
      setLiked(res.liked);
      setCount(res.like_count);
      if (res.liked) {
        setPop(true);
        setTimeout(() => setPop(false), 250);
      }
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      type="button"
      size="sm"
      variant={failed ? "destructive" : liked ? "secondary" : "outline"}
      onClick={toggle}
      disabled={busy}
      aria-pressed={liked}
      aria-label={
        failed
          ? t.like.failedAria(count)
          : liked
            ? t.like.unlikeAria(count)
            : t.like.likeAria(count)
      }
      className={pop ? "scale-110" : "scale-100"}
    >
      <Heart fill={liked ? "currentColor" : "none"} aria-hidden />
      <span className="tabular-nums">{count}</span>
    </Button>
  );
}

export function ShareButton({ url }: { url: string }) {
  const [state, setState] = useState<"idle" | "shared" | "copied" | "failed">("idle");
  const { t } = useLanguage();

  async function onShare() {
    try {
      const res = await sharePhoto(url);
      setState(res === "copied" ? "copied" : res === "shared" ? "shared" : "idle");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 2000);
  }

  return (
    <Button type="button" size="sm" variant="outline" onClick={onShare} aria-live="polite">
      {state === "copied" ? (
        <>
          <Link2 aria-hidden /> {t.like.copied}
        </>
      ) : state === "shared" ? (
        <>
          <Check aria-hidden /> {t.like.sent}
        </>
      ) : state === "failed" ? (
        t.like.failed
      ) : (
        <>
          <Share2 aria-hidden /> {t.like.share}
        </>
      )}
    </Button>
  );
}
