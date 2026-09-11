import { useEffect, useRef, useState, type CSSProperties } from "react";

interface TextAnimateProps {
  children: string;
  className?: string;
  /** Jeda sebelum kata pertama (ms). */
  delay?: number;
  /** Jeda antar kata (ms). */
  stagger?: number;
  as?: "h1" | "h2" | "p" | "span";
}

/**
 * TextAnimate tulisan tangan ala Magic UI — varian blurInUp per kata.
 * GPU-only (opacity/filter/transform), jalan sekali saat masuk viewport,
 * diam total saat prefers-reduced-motion atau IntersectionObserver tak ada.
 */
export default function TextAnimate({
  children,
  className = "",
  delay = 0,
  stagger = 45,
  as = "span",
}: TextAnimateProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(
    () =>
      typeof IntersectionObserver === "undefined" ||
      (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches),
  );

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  const words = children.split(" ");
  const Tag = as as "span";

  function wordStyle(i: number): CSSProperties {
    return visible
      ? {
          opacity: 1,
          filter: "blur(0)",
          transform: "translateY(0)",
          transitionDelay: `${delay + i * stagger}ms`,
        }
      : { transitionDelay: "0ms" };
  }

  return (
    <Tag ref={ref} className={className} aria-label={children}>
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          aria-hidden
          className="animate-blur-in-word inline-block will-change-transform"
          style={wordStyle(i)}
        >
          {w}
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}

