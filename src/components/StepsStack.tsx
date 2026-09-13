import { useScroll } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "../lib/i18n.tsx";
import { StickyCard_001 } from "./ui/skiper-ui/skiper16.tsx";

const IMG = [
  "https://res.cloudinary.com/drjrvrdnw/image/upload/v1789098542/background4_vrwiel.png",
  "https://res.cloudinary.com/drjrvrdnw/image/upload/v1789098518/backround2_ijndvk.png",
  "https://res.cloudinary.com/drjrvrdnw/image/upload/v1789098535/backgroun_mnfcc_uceplr.png",
  "https://res.cloudinary.com/drjrvrdnw/image/upload/v1789098523/background3_tnggbw.png",
];

type OrgMember = { name: string; role: "Leader" | "Vice Lead" | "EC" | "Staff" };

type OrgCard = {
  n: string;
  title: string;
  img: string;
  members: OrgMember[];
};

const CARDS: OrgCard[] = [
  {
    n: "Pimpinan",
    title: "Leader & Vice Lead",
    img: IMG[0],
    members: [
      { name: "Ferdiansyah", role: "Leader" },
      { name: "Nizar Kurnia Alfaizi", role: "Vice Lead" },
    ],
  },
  {
    n: "Humas",
    title: "Public Relation",
    img: IMG[1],
    members: [
      { name: "Tri Nurjulyanti", role: "EC" },
      { name: "Muhammad Raihan", role: "Staff" },
    ],
  },
  {
    n: "Riset",
    title: "Research & Education",
    img: IMG[2],
    members: [
      { name: "Aria Fatah Anom", role: "EC" },
      { name: "Robbanie Hilally Kurniadien", role: "Staff" },
      { name: "Rafa Al Razzak", role: "Staff" },
      { name: "Hudzaifah Ar Rantisi", role: "Staff" },
      { name: "Adit Hermansyah", role: "Staff" },
    ],
  },
  {
    n: "Sekretaris",
    title: "Secretary",
    img: IMG[3],
    members: [
      { name: "Amarsya Swastika Aulia", role: "EC" },
      { name: "Muhammad Radifah Hibatillah", role: "Staff" },
    ],
  },
];

export default function StepsStack() {
  const container = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  const total = CARDS.length;

  return (
    <div ref={container} className="relative mx-auto max-w-2xl">
      <p className="mb-6 text-center font-mono text-xs text-[#787774]" aria-hidden>
        {t.orgStack.header}
      </p>
      <div className="flex flex-col gap-5 pb-10">
        {CARDS.map((s, i) => {
          const targetScale = 1 - (total - i - 1) * 0.06;
          return (
            <StickyCard_001
              key={s.n}
              i={i}
              progress={scrollYProgress}
              range={[i / total, 1]}
              targetScale={targetScale}
              top={88}
              className="overflow-hidden rounded-2xl border border-[#EAEAEA] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
            >
              <div className="relative flex min-h-[380px] flex-col overflow-hidden sm:min-h-[440px]">
                <img
                  src={s.img}
                  alt={t.orgStack.cards[i].alt}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/5" />
                <div className="relative flex items-center justify-between p-6 pb-0 sm:px-8 sm:pt-7">
                  <span className="rounded-full bg-white/15 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                    {s.n}
                  </span>
                  <span className="font-mono text-[11px] tabular-nums text-white/70">
                    {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                  </span>
                </div>
                <div className="relative mt-auto p-6 sm:p-8 sm:pt-0">
                  <h3 className="max-w-md text-3xl font-extrabold uppercase leading-[0.95] tracking-tighter text-white sm:text-4xl">
                    {s.title}
                  </h3>
                  <p className="mt-2.5 max-w-md text-sm leading-relaxed text-white/85">{t.orgStack.cards[i].desc}</p>
                  <ul className="mt-5 space-y-2" aria-label={`Anggota ${s.title}`}>
                    {s.members.map((m) => (
                      <li
                        key={m.name}
                        className="flex items-center justify-between gap-3 rounded-lg border border-white/20 bg-white/10 px-3.5 py-2 backdrop-blur-sm"
                      >
                        <span className="min-w-0 truncate text-sm font-medium text-white">
                          {m.name}
                        </span>
                        <span className="shrink-0 rounded-full bg-white/15 px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.15em] text-white">
                          {m.role}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-white/70">{t.orgStack.cards[i].meta}</p>
                </div>
              </div>
            </StickyCard_001>
          );
        })}
      </div>
      <p className="pb-2 text-center font-mono text-[11px] text-[#787774]">
        Efek kartu tumpuk:{" "}
        <a
          href="https://skiper-ui.com/v1/skiper16"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-[#EAEAEA] underline-offset-2 transition hover:text-[#111111]"
        >
          Skiper UI
        </a>
      </p>
    </div>
  );
}
