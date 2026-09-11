import { motion, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "../../../lib/utils.ts";

interface StickyCardProps {
  i: number;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
  /** Jarak tempel dari atas viewport (px). Naik per kartu agar tumpukan terlihat. */
  top?: number;
  children: ReactNode;
  className?: string;
}

function StickyCard_001({ i, progress, range, targetScale, top = 88, children, className }: StickyCardProps) {
  const container = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div ref={container} className="sticky" style={{ top: top + i * 14 }}>
      <motion.div
        style={reduceMotion ? undefined : { scale }}
        className={cn(
          "origin-top transform-gpu rounded-xl border border-[#EAEAEA] bg-white will-change-transform",
          className,
        )}
      >
        {children}
      </motion.div>
    </div>
  );
}

export { StickyCard_001 };

/**
 * Skiper 16 StickyCard_001 — diadaptasi dari Skiper UI untuk Vite + Tailwind v4.
 * Sumber: https://skiper-ui.com/v1/skiper16 (via `shadcn add @skiper-ui/skiper16`).
 * Perubahan dari aslinya: tanpa `"use client"`, tanpa Lenis (scroll bawaan agar
 * navigasi anchor #fitur/#galeri tetap mulus), ukuran responsif, dan token
 * warm-monochrome proyek (#EAEAEA, rounded-xl, tanpa gradasi).
 *
 * Lisensi Skiper UI (gratis): boleh dipakai/dimodifikasi untuk pribadi maupun
 * komersial dengan atribusi ke Skiper UI.
 */
