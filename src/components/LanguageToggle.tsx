import type { Lang } from "../lib/i18n.tsx";
import { cn } from "../lib/utils.ts";

export function LanguageToggle({
  lang,
  onChange,
  tone = "light",
  className,
}: {
  lang: Lang;
  onChange: (l: Lang) => void;
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div
      role="group"
      aria-label="Language / Bahasa"
      className={cn(
        "inline-flex items-center rounded-full border p-0.5",
        dark ? "border-white/15 bg-white/10" : "border-[#EAEAEA] bg-[#F7F6F3]",
        className,
      )}
    >
      {(["id", "en"] as Lang[]).map((l) => {
        const active = lang === l;
        return (
          <button
            key={l}
            type="button"
            onClick={() => onChange(l)}
            aria-pressed={active}
            className={cn(
              "rounded-full px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.12em] transition-all duration-200",
              active
                ? "bg-white text-[#111111] shadow-[0_1px_4px_rgba(0,0,0,0.25)]"
                : dark
                  ? "text-white/55 hover:text-white"
                  : "text-[#787774] hover:text-[#111111]",
            )}
          >
            {l === "id" ? "ID" : "ENG"}
          </button>
        );
      })}
    </div>
  );
}
