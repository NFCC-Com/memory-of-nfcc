import { useScroll } from "framer-motion";
import { useRef } from "react";
import { StickyCard_001 } from "./ui/skiper-ui/skiper16.tsx";

const IMG = [
  "https://res.cloudinary.com/drjrvrdnw/image/upload/v1789098542/background4_vrwiel.png",
  "https://res.cloudinary.com/drjrvrdnw/image/upload/v1789098518/backround2_ijndvk.png",
  "https://res.cloudinary.com/drjrvrdnw/image/upload/v1789098535/backgroun_mnfcc_uceplr.png",
  "https://res.cloudinary.com/drjrvrdnw/image/upload/v1789098523/background3_tnggbw.png",
];

const CARDS = [
  {
    n: "NFCC",
    title: "Arsip visual organisasi",
    desc: "Setiap kegiatan meninggalkan jejak. MEMORY of NFCC menjaganya tetap hidup dan mudah dibuka kembali.",
    meta: "milik bersama · selamanya",
    img: IMG[0],
    alt: "Latar visual kartu arsip NFCC",
  },
  {
    n: "01",
    title: "Pindai QR",
    desc: "QR di lokasi kegiatan membuka arsip. Tanpa aplikasi, tanpa akun.",
    meta: "/p/:slug · tanpa akun",
    img: IMG[1],
    alt: "Latar visual kartu pindai QR",
  },
  {
    n: "02",
    title: "Unggah momen",
    desc: "Jepret dari kamera HP atau pilih galeri. JPEG otomatis teroptimasi.",
    meta: "JPEG · kompresi otomatis",
    img: IMG[2],
    alt: "Latar visual kartu unggah momen",
  },
  {
    n: "03",
    title: "Jadi memori",
    desc: "Foto terverifikasi masuk dinding kolektif NFCC.",
    meta: "hanya APPROVED yang tampil",
    img: IMG[3],
    alt: "Latar visual kartu jadi memori",
  },
];

export default function StepsStack() {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  const total = CARDS.length;

  return (
    <div ref={container} className="relative mx-auto max-w-2xl">
      <p className="mb-6 text-center font-mono text-xs text-[#787774]" aria-hidden>
        gulir — kartu menumpuk
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
                  alt={s.alt}
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
                  <p className="mt-2.5 max-w-md text-sm leading-relaxed text-white/85">{s.desc}</p>
                  <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-white/70">{s.meta}</p>
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
