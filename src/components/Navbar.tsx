import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEvents } from "../lib/useEvents.ts";
import { Button } from "./ui/button.tsx";
import { cn } from "../lib/utils.ts";

const Navbar001Lazy = lazy(() =>
  import("./ui/skiper-ui/skiper13.tsx").then((m) => ({
    default: m.Navbar_001,
  })),
);

function preloadMenu() {
  void import("./ui/skiper-ui/skiper13.tsx");
}

const GLOBAL_LINKS = [
  { label: "Fitur", hash: "fitur" },
  { label: "Galeri", hash: "galeri" },
  { label: "Cara kerja", hash: "cara-kerja" },
  { label: "Arsip", hash: "arsip" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const links = GLOBAL_LINKS.map((l) => ({
    label: l.label,
    href: pathname === "/" ? `#${l.hash}` : `/#${l.hash}`,
  }));
  const [open, setOpen] = useState(false);
  const events = useEvents();
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeMenu = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }
    function onDown(e: PointerEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <>
      <div className="fixed inset-x-0 top-3 z-40 mx-auto w-full max-w-3xl px-3 sm:top-4">
        <header
          ref={headerRef}
          className="relative w-full rounded-2xl bg-white/80 text-[#111111] shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md"
        >
          <div className="flex w-full items-center justify-between px-4 py-3 sm:px-5">
            <Link
              to="/"
              className="flex min-w-0 shrink-0 items-center gap-2.5 text-[15px] font-semibold tracking-tight text-[#111111]"
              aria-label="MEMORY of NFCC — beranda"
            >
              <span className="truncate">MEMORY of NFCC</span>
            </Link>

            <Button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              onMouseEnter={preloadMenu}
              onFocus={preloadMenu}
              aria-expanded={open}
              aria-controls="skiper13-menu"
              aria-label={open ? "Tutup menu" : "Buka menu"}
              className="h-9 gap-2 rounded-full bg-transparent px-3.5 text-sm font-semibold uppercase tracking-widest text-[#111111] hover:bg-[#F7F6F3] hover:text-[#111111]"
            >
              <span className="relative block size-5" aria-hidden>
                <Menu
                  className={cn(
                    "absolute inset-0 size-5 transition-all duration-200",
                    open
                      ? "rotate-90 scale-75 opacity-0"
                      : "rotate-0 scale-100 opacity-100",
                  )}
                />
                <X
                  className={cn(
                    "absolute inset-0 size-5 transition-all duration-200",
                    open
                      ? "rotate-0 scale-100 opacity-100"
                      : "-rotate-90 scale-75 opacity-0",
                  )}
                />
              </span>
              <span className="hidden sm:inline">Menu</span>
            </Button>
          </div>

          <Suspense fallback={null}>
            <Navbar001Lazy
              open={open}
              onClose={closeMenu}
              links={links}
              events={events}
              showEvents
            />
          </Suspense>
        </header>
      </div>
    </>
  );
}
