import {
  AnimatePresence,
  MotionConfig,
  motion,
  type Variants,
} from "framer-motion";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import type { Period } from "../../../lib/api.ts";
import type { Lang } from "../../../lib/i18n.tsx";
import { cn } from "../../../lib/utils.ts";

export interface NavLink {
  href: string;
  label: string;
}

interface Navbar001Props {
  open: boolean;
  onClose: () => void;
  links: NavLink[];
  events: Period[];
  showEvents: boolean;
  lang: Lang;
  onLangChange: (l: Lang) => void;
  menuLabel: string;
  eventsTitle: string;
}

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

function statusStyle(status: Period["status"]) {
  if (status === "ACTIVE")
    return { cls: "bg-[#EDF3EC] text-[#346538]", label: "Aktif" };
  if (status === "UPCOMING")
    return { cls: "bg-[#FBF3DB] text-[#956400]", label: "Segera" };
  return { cls: "bg-[#F7F6F3] text-[#787774]", label: "Selesai" };
}

function Navbar_001({
  open,
  onClose,
  links,
  events,
  showEvents,
  lang,
  onLangChange,
  menuLabel,
  eventsTitle,
}: Navbar001Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
  }, [open]);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {open && (
          <motion.div
            key="skiper13-panel"
            id="skiper13-menu"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={menuLabel}
            initial={{ opacity: 0, height: 0, y: -12 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 top-[calc(100%+12px)] z-40 flex flex-col gap-3"
          >
            {/* BLOCK 2 — NAVIGATION: kartu terang terpisah */}
            <section className="overflow-hidden rounded-2xl border border-[#EAEAEA] bg-white/95 text-[#2F3437] shadow-[0_16px_50px_rgba(0,0,0,0.12)] backdrop-blur-md">
              <div className="no-scrollbar max-h-[calc(100dvh-320px)] overflow-y-auto">
                <div className="flex flex-col gap-6 px-4 py-5 sm:px-5">
                  <motion.nav
                    aria-label={menuLabel}
                    variants={listVariants}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col gap-1"
                  >
                    {links.map((l, i) => (
                      <motion.a
                        key={l.href}
                        href={l.href}
                        onClick={onClose}
                        variants={itemVariants}
                        className="group flex items-baseline gap-4 rounded-xl px-2 py-3 transition-all duration-200 hover:translate-x-2 hover:bg-[#F7F6F3]"
                      >
                        <span className="font-mono text-xs tabular-nums text-[#787774]">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-2xl font-extrabold uppercase leading-none tracking-tighter text-[#111111] sm:text-3xl">
                          {l.label}
                        </span>
                      </motion.a>
                    ))}
                  </motion.nav>

                  {showEvents && events.length > 0 && (
                    <motion.div
                      variants={listVariants}
                      initial="hidden"
                      animate="show"
                      className="min-w-0 border-t border-[#EAEAEA] pt-5"
                    >
                      <motion.p
                        variants={itemVariants}
                        className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#787774]"
                      >
                        {eventsTitle} · {events.length}
                      </motion.p>
                      <div className="mt-2 flex flex-col gap-0.5">
                        {events.slice(0, 8).map((ev) => {
                          const badge = statusStyle(ev.status);
                          return (
                            <motion.div key={ev.id} variants={itemVariants}>
                              <Link
                                to={`/p/${ev.slug}`}
                                onClick={onClose}
                                className="group flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition hover:bg-[#F7F6F3]"
                              >
                                <span className="min-w-0">
                                  <span className="block truncate text-sm font-medium text-[#2F3437]">
                                    {ev.name}
                                  </span>
                                  <span className="block truncate font-mono text-[11px] text-[#787774]">
                                    /p/{ev.slug}
                                  </span>
                                </span>
                                <span
                                  className={`shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-medium ${badge.cls}`}
                                >
                                  {badge.label}
                                </span>
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </section>

            {/* BLOCK 3 — LANGUAGE */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{
                duration: 0.35,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.08,
              }}
              aria-label={lang === "id" ? "Bahasa" : "Language"}
              className="overflow-hidden rounded-2xl border border-[#EAEAEA] bg-white/95 p-1.5 shadow-[0_16px_50px_rgba(0,0,0,0.12)] backdrop-blur-md"
            >
              <div
                role="group"
                aria-label={lang === "id" ? "Bahasa" : "Language"}
                className="grid grid-cols-2 gap-1.5"
              >
                {(["id", "en"] as Lang[]).map((l) => {
                  const active = lang === l;
                  return (
                    <button
                      key={l}
                      type="button"
                      onClick={() => onLangChange(l)}
                      aria-pressed={active}
                      className={cn(
                        "rounded-xl py-2.5 font-mono text-sm font-semibold uppercase tracking-[0.2em] transition-all duration-200",
                        active
                          ? " text-black"
                          : "text-[#787774] hover:bg-[#F7F6F3] hover:text-[#111111]",
                      )}
                    >
                      {l === "id" ? "ID" : "ENG"}
                    </button>
                  );
                })}
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}

export { Navbar_001 };

/**
 * Skiper 13 Navbar_001 — tiga blok terpisah dengan gap: [HEADER bar] + 12px +
 * [NAVIGATION card] + 12px + [LANGUAGE card]. Kedua kartu terang
 * (bg-white/95 + blur) selaras warm monochrome dengan tipografi uppercase besar; wrapper luar
 * transparan dan absolute overlay sehingga menu tidak mendorong konten.
 * Tautan uppercase stagger + daftar acara. Item registry-nya Pro
 * (butuh lisensi) sehingga pola ini ditulis ulang untuk Vite + Tailwind v4.
 *
 * Lisensi Skiper UI (gratis): boleh dipakai/dimodifikasi untuk pribadi maupun
 * komersial dengan atribusi ke Skiper UI.
 */
