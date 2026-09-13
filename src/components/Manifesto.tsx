import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "../lib/i18n.tsx";

function Word({
  progress,
  range,
  children,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  children: string;
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const blur = useTransform(progress, range, ["blur(6px)", "blur(0px)"]);
  return (
    <motion.span style={{ opacity, filter: blur }} className="inline-block">
      {children}&nbsp;
    </motion.span>
  );
}

export default function Manifesto() {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { t } = useLanguage();
  const TEXT = t.manifesto.text;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.45"],
  });
  const words = TEXT.split(" ");

  return (
    <section aria-label={t.manifesto.sectionLabel} className="mx-auto max-w-4xl px-5 py-16 sm:py-24">
      <p className="mb-6 text-center font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#787774]">
        {t.manifesto.eyebrow}
      </p>
      <p ref={ref} className="text-center text-2xl font-semibold leading-snug tracking-tight text-[#111111] sm:text-4xl sm:leading-tight">
        {reduce
          ? TEXT
          : words.map((w, i) => (
              <Word key={`${w}-${i}`} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
                {w}
              </Word>
            ))}
      </p>
    </section>
  );
}
