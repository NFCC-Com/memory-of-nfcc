import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Quote,
} from "lucide-react";
import Navbar from "../components/Navbar.tsx";
import Reveal from "../components/Reveal.tsx";
import TextAnimate from "../components/TextAnimate.tsx";
import { Button } from "../components/ui/button.tsx";
import { useLanguage } from "../lib/i18n.tsx";

const StepsStack = lazy(() => import("../components/StepsStack.tsx"));
const Manifesto = lazy(() => import("../components/Manifesto.tsx"));

function StepsStackFallback() {
  return (
    <div className="mx-auto max-w-2xl space-y-5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-60 rounded-xl border border-[#EAEAEA] bg-white sm:h-64"
        >
          <div className="skeleton h-full w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}
import { getPeriods, getPhotos, type Period, type Photo } from "../lib/api.ts";
import type { Strings } from "../lib/i18n.tsx";

const DEMO_SLUG = "demo-2026";
const CTA_BG =
  "https://res.cloudinary.com/drjrvrdnw/image/upload/v1789100226/backround2_1_ls0ssp.png";

const HERO_IMGS = [
  "https://res.cloudinary.com/drjrvrdnw/image/upload/v1789151437/download_2_grz04v.jpg",
  "https://res.cloudinary.com/drjrvrdnw/image/upload/v1789151438/download_wax3p3.jpg",
  "https://res.cloudinary.com/drjrvrdnw/image/upload/v1789151566/download_2_xo3kpv.jpg",
  "https://res.cloudinary.com/drjrvrdnw/image/upload/v1789151545/Motivation_message___Typography_design_distortion_blur_effect_tddgpn.jpg",
  "https://res.cloudinary.com/drjrvrdnw/image/upload/v1789151545/nosialgia_fg7keq.jpg",
  "https://res.cloudinary.com/drjrvrdnw/image/upload/v1789151442/download_1_mzqwcz.jpg",
];

const ZIMGS = [
  "https://res.cloudinary.com/drjrvrdnw/image/upload/v1789098542/background4_vrwiel.png",
  "https://res.cloudinary.com/drjrvrdnw/image/upload/v1789098518/backround2_ijndvk.png",
  "https://res.cloudinary.com/drjrvrdnw/image/upload/v1789098523/background3_tnggbw.png",
];

function statusBadge(status: Period["status"], c: Strings["common"]) {
  if (status === "ACTIVE")
    return { cls: "bg-[#EDF3EC] text-[#346538]", label: c.active };
  if (status === "UPCOMING")
    return { cls: "bg-[#FBF3DB] text-[#956400]", label: c.upcoming };
  return { cls: "bg-[#F7F6F3] text-[#787774]", label: c.done };
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="13"
      height="13"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="text-[#346538]"
    >
      <path d="m3 8.5 3.5 3.5L13 4.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2.5 8h11m0 0L10 4.5M13.5 8 10 11.5" />
    </svg>
  );
}

export default function Landing() {
  const nav = useNavigate();
  const { t } = useLanguage();
  const [slug, setSlug] = useState("");
  const [live, setLive] = useState<Photo[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [statsReady, setStatsReady] = useState(false);
  useEffect(() => {
    let alive = true;
    void Promise.allSettled([
      getPhotos(DEMO_SLUG).then((res) => {
        if (alive) setLive(res.photos.slice(0, 12));
      }),
      getPeriods().then((res) => {
        if (alive) setPeriods(res.periods);
      }),
    ]).then(() => {
      if (alive) setStatsReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  function goToSlug(e: React.FormEvent) {
    e.preventDefault();
    const s = slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-");
    if (s) nav(`/p/${encodeURIComponent(s)}`);
  }

  return (
    <div className="min-h-screen bg-white text-[#2F3437]">
      <Navbar />

      {/* Offset untuk navbar floating fixed (~72px) + ruang napas 20–32px */}
      <main id="top" className="relative scroll-pt-24 pt-[92px] sm:pt-[104px]">
        {/* Hero Section — kolase foto hidup, latar full-bleed */}
        <section className="relative overflow-hidden pt-14 pb-16 sm:pt-20 sm:pb-24">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <img
              src="https://res.cloudinary.com/drjrvrdnw/image/upload/v1789151967/Gemini_Generated_Image_z6o16cz6o16cz6o1_vclaj8.jpg"
              alt=""
              loading="eager"
              decoding="async"
              className="h-full w-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-white/60" />
          </div>
          <div className="relative mx-auto max-w-5xl px-5">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
            <div className="text-center lg:text-left">
              <TextAnimate
                as="h1"
                delay={100}
                className="mt-8 block text-4xl font-extrabold uppercase leading-[0.95] tracking-tighter text-balance text-[#111111] sm:text-6xl lg:text-7xl"
              >
                {t.hero.title}
              </TextAnimate>

              <Reveal delay={160}>
                <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-balance text-[#787774] sm:text-lg lg:mx-0">
                  {t.hero.sub}
                </p>
              </Reveal>

              {/* CTA Group */}
              <Reveal delay={240} className="mt-12">
                <div className="flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-7 lg:justify-start">
                  <Button
                    asChild
                    size="lg"
                    className="min-w-[180px] transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <a href="#galeri">{t.hero.ctaPrimary}</a>
                  </Button>
                  <Link
                    to={`/p/${DEMO_SLUG}`}
                    className="skiper-link py-1 text-sm font-medium text-[#111111]"
                  >
                    {t.hero.ctaSecondary} <span aria-hidden>→</span>
                  </Link>
                </div>
              </Reveal>

              {/* Trust Badges */}
              <Reveal delay={320} className="mt-10">
                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-mono text-[#787774] lg:justify-start">
                  {t.hero.trust.map((c) => (
                    <span key={c} className="inline-flex items-center gap-1.5">
                      <CheckIcon /> {c}
                    </span>
                  ))}
                </div>
              </Reveal>
            </div>

            <div
              aria-hidden
              className="mask-fade-y mx-auto grid max-h-[440px] w-full max-w-md grid-cols-2 gap-3 overflow-hidden sm:max-h-[520px] lg:max-h-[560px] lg:max-w-none"
            >
              <div className="animate-marquee-y flex flex-col gap-3">
                {[
                  ...HERO_IMGS.filter((_, i) => i % 2 === 0),
                  ...HERO_IMGS.filter((_, i) => i % 2 === 0),
                ].map((src, i) => (
                  <img
                    key={`kiri-${i}`}
                    src={src}
                    alt=""
                    loading={i < 2 ? "eager" : "lazy"}
                    decoding="async"
                    className="h-44 w-full rounded-xl border border-[#EAEAEA] bg-[#F7F6F3] object-cover sm:h-56"
                  />
                ))}
              </div>
              <div className="animate-marquee-y-slow mt-10 flex flex-col gap-3">
                {[
                  ...HERO_IMGS.filter((_, i) => i % 2 === 1),
                  ...HERO_IMGS.filter((_, i) => i % 2 === 1),
                ].map((src, i) => (
                  <img
                    key={`kanan-${i}`}
                    src={src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-44 w-full rounded-xl border border-[#EAEAEA] bg-[#F7F6F3] object-cover sm:h-56"
                  />
                ))}
              </div>
            </div>
          </div>
          </div>
        </section>

        {/* Stats Strip — angka riil dari API */}
        <section
          aria-label="Ringkasan arsip"
          className="border-b border-[#EAEAEA] bg-white"
        >
          <Reveal className="mx-auto flex max-w-5xl items-center justify-center gap-8 px-5 py-5 sm:gap-14">
            <div className="text-center">
              <p className="text-2xl font-semibold tabular-nums tracking-tight text-[#111111] sm:text-3xl">
                {statsReady ? (
                  live.length
                ) : (
                  <span
                    aria-hidden
                    className="skeleton mx-auto block h-8 w-12 rounded-md sm:h-9"
                  />
                )}
              </p>
              <p className="mt-0.5 font-mono text-[11px] uppercase tracking-widest text-[#787774]">
                {t.stats.photos}
              </p>
            </div>
            <div aria-hidden className="h-10 w-px bg-[#EAEAEA]" />
            <div className="text-center">
              <p className="text-2xl font-semibold tabular-nums tracking-tight text-[#111111] sm:text-3xl">
                {statsReady ? (
                  periods.length
                ) : (
                  <span
                    aria-hidden
                    className="skeleton mx-auto block h-8 w-12 rounded-md sm:h-9"
                  />
                )}
              </p>
              <p className="mt-0.5 font-mono text-[11px] uppercase tracking-widest text-[#787774]">
                {t.stats.activities}
              </p>
            </div>
            <div aria-hidden className="h-10 w-px bg-[#EAEAEA]" />
            <div className="text-center">
              <p className="text-2xl font-semibold tabular-nums tracking-tight text-[#111111] sm:text-3xl">
                0
              </p>
              <p className="mt-0.5 font-mono text-[11px] uppercase tracking-widest text-[#787774]">
                {t.stats.accounts}
              </p>
            </div>
          </Reveal>
        </section>

        {/* Galeri pratinjau — foto APPROVED nyata */}
        {live.length > 0 && (
          <section
            id="galeri"
            aria-label="Pratinjau dinding"
            className="border-y border-[#EAEAEA] bg-[#F7F6F3] py-16 sm:py-24 scroll-mt-24"
          >
            <div className="mx-auto max-w-5xl px-5">
              <Reveal className="mb-10 text-center">
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#787774]">
                  {t.galeri.eyebrow}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#111111] sm:text-4xl">
                  {t.galeri.title}
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-base text-[#787774]">
                  {t.galeri.sub}
                </p>
              </Reveal>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {live.slice(0, 8).map((p, i) => (
                  <Reveal key={p.id} delay={(i % 4) * 60}>
                    <Link
                      to={`/p/${DEMO_SLUG}/photo/${p.id}`}
                      aria-label={t.galeri.openPhotoAria(i)}
                      className="group block overflow-hidden rounded-xl border border-[#EAEAEA] bg-white transition duration-200 hover:border-[#111111]"
                    >
                      <img
                        src={p.image_url}
                        alt={t.galeri.photoAlt(i)}
                        loading="lazy"
                        decoding="async"
                        className="aspect-square w-full object-cover transition duration-200 group-hover:scale-[1.03]"
                      />
                    </Link>
                  </Reveal>
                ))}
              </div>
              <Reveal className="mt-8 text-center">
                <Button asChild size="lg" className="min-w-[180px]">
                  <Link to={`/p/${DEMO_SLUG}`}>{t.galeri.openArchive}</Link>
                </Button>
              </Reveal>
            </div>
          </section>
        )}

        {/* Manifesto — scroll blur reveal ala Skiper */}
        <Suspense fallback={null}>
          <Manifesto />
        </Suspense>

        {/* Features — editorial kolektif */}
        <section
          id="fitur"
          aria-label="Fitur utama"
          className="mx-auto max-w-5xl px-5 py-16 sm:py-24 scroll-mt-24"
        >
          <Reveal className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#787774]">
              {t.kolektif.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tighter text-balance text-[#111111] sm:text-5xl sm:leading-[1.02]">
              {t.kolektif.title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#787774]">
              {t.kolektif.sub}
            </p>
          </Reveal>
          <Reveal className="rounded-2xl border border-[#EAEAEA] bg-[#F7F6F3] p-3 sm:p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {t.kolektif.features.map((f, i) => (
                <article
                  key={f.title}
                  className="flex h-full flex-col rounded-xl border border-[#EAEAEA] bg-white p-6 transition duration-200 hover:border-[#d8d8d8] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:p-7"
                >
                  <p className="font-mono text-xs tabular-nums text-[#787774]" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <div aria-hidden className="mt-3 h-px w-8 bg-[#EAEAEA]" />
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-[#111111]">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#787774]">
                    {f.desc}
                  </p>
                </article>
              ))}
            </div>
          </Reveal>
        </section>

        {/* Z-Pattern — tiga langkah dengan visual bergantian */}
        <section
          aria-label="Cara berkontribusi"
          className="mx-auto max-w-5xl px-5 py-16 sm:py-24 scroll-mt-24"
        >
          <Reveal className="mb-12 text-center">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#787774]">
              {t.zfitur.eyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#111111] sm:text-4xl">
              {t.zfitur.title}
            </h2>
          </Reveal>
          <div className="flex flex-col gap-12 sm:gap-16">
            {t.zfitur.items.map((z, i) => (
              <div
                key={z.n}
                className="grid items-center gap-6 md:grid-cols-2 md:gap-10"
              >
                <Reveal className={i % 2 === 1 ? "md:order-2" : ""}>
                  <div className="overflow-hidden rounded-xl border border-[#EAEAEA] bg-[#F7F6F3]">
                    <img
                      src={ZIMGS[i]}
                      alt={z.alt}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[16/10] w-full object-cover"
                    />
                  </div>
                </Reveal>
                <Reveal delay={80} className={i % 2 === 1 ? "md:order-1" : ""}>
                  <p className="font-mono text-xs tabular-nums text-[#787774]">
                    {z.n}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight text-[#111111] sm:text-2xl">
                    {z.title}
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-[#787774] sm:text-base">
                    {z.desc}
                  </p>
                  <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[#787774]">
                    {z.meta}
                  </p>
                </Reveal>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works — Skiper16 sticky card stack */}
        <section
          id="cara-kerja"
          className="border-t border-[#EAEAEA] bg-[#F7F6F3] py-16 sm:py-24 scroll-mt-24"
        >
          <div className="mx-auto max-w-5xl px-5">
            <Reveal className="text-center mb-10">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#787774]">
                {t.org.eyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#111111] sm:text-4xl">
                {t.org.title}
              </h2>
              <p className="mt-2 text-base text-[#787774] max-w-xl mx-auto">
                {t.org.sub}
              </p>
            </Reveal>
            <Suspense fallback={<StepsStackFallback />}>
              <StepsStack />
            </Suspense>
          </div>
        </section>

        {/* Arsip Kegiatan */}
        {periods.length > 0 && (
          <section
            id="arsip"
            aria-label="Arsip kegiatan"
            className="mx-auto max-w-5xl px-5 py-16 sm:py-24 scroll-mt-24"
          >
            <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-[#111111] sm:text-4xl">
                  {t.arsip.title}
                </h2>
                <p className="mt-2 max-w-xl text-base text-[#787774]">
                  {t.arsip.sub}
                </p>
              </div>
              <span className="font-mono text-xs text-[#787774] tabular-nums">
                {periods.length} {t.arsip.activitiesUnit}
              </span>
            </Reveal>
            <div className="grid gap-3 sm:grid-cols-2">
              {periods.slice(0, 6).map((ev, i) => {
                const badge = statusBadge(ev.status, t.common);
                return (
                  <Reveal key={ev.id} delay={i * 50}>
                    <Link
                      to={`/p/${ev.slug}`}
                      className="group flex h-full items-center justify-between gap-3 rounded-xl border border-[#EAEAEA] bg-white p-5 transition duration-200 hover:border-[#cccccc] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-[#111111]">
                          {ev.name}
                        </span>
                        <span className="mt-0.5 block truncate font-mono text-xs text-[#787774]">
                          /p/{ev.slug}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span
                          className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-medium ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                        <span
                          aria-hidden
                          className="text-[#787774] transition-transform duration-200 group-hover:translate-x-1"
                        >
                          →
                        </span>
                      </span>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </section>
        )}

        {/* Kutipan kolektif — suara arsip tanpa nama, bukan testimoni individu */}
        <section
          aria-label="Kenapa kolektif"
          className="mx-auto max-w-5xl px-5 py-16 sm:py-24"
        >
          <Reveal className="mb-10 text-center">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#787774]">
              {t.quotes.eyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#111111] sm:text-4xl">
              {t.quotes.title}
            </h2>
          </Reveal>
          <div className="grid gap-3 md:grid-cols-3">
            {t.quotes.items.map((q, i) => (
              <Reveal key={q} delay={i * 60}>
                <figure className="h-full rounded-xl border border-[#EAEAEA] bg-white p-6">
                  <Quote aria-hidden className="size-5 text-[#787774]" />
                  <blockquote className="mt-4 leading-relaxed text-[#2F3437]">
                    {q}
                  </blockquote>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section
          aria-label="Pertanyaan umum"
          className="border-t border-[#EAEAEA] bg-[#F7F6F3]"
        >
          <div className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
            <Reveal className="mb-8 text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-[#111111] sm:text-4xl">
                {t.faq.title}
              </h2>
            </Reveal>
            <div>
              {t.faq.items.map((f) => (
                <Reveal key={f.q}>
                  <details className="group border-b border-[#EAEAEA] py-4 first:border-t">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-[#111111] [&::-webkit-details-marker]:hidden">
                      {f.q}
                      <Plus
                        aria-hidden
                        className="size-4 shrink-0 text-[#787774] transition-transform duration-200 group-open:rotate-45"
                      />
                    </summary>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#787774]">
                      {f.a}
                    </p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Box */}
        <section id="mulai" className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl text-center">
              <img
                src={CTA_BG}
                alt=""
                aria-hidden
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div aria-hidden className="absolute inset-0 bg-black/60" />
              <div className="relative p-8 sm:p-14">
                <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {t.cta.title}
                </h2>
                <p className="mt-3 mx-auto max-w-md text-sm sm:text-base text-white/75 leading-relaxed">
                  {t.cta.sub}
                </p>
                <div className="mt-6 flex justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-black hover:bg-white/80"
                  >
                    <Link
                      to={`/p/${DEMO_SLUG}`}
                      className="flex items-center gap-2"
                    >
                      {t.cta.exploreDemo}
                      <ArrowIcon />
                    </Link>
                  </Button>
                </div>
                <div className="mx-auto mt-8 max-w-md border-t border-white/15 pt-6">
                  <p className="font-mono text-xs text-white/60">
                    {t.cta.haveCode}
                  </p>
                  <form onSubmit={goToSlug} className="mt-2.5 flex gap-1.5">
                    <input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder={t.cta.codePlaceholder}
                      aria-label={t.cta.codeLabel}
                      autoComplete="off"
                      spellCheck={false}
                      className="flex-1 rounded-md border border-white/20 bg-white/10 px-3.5 py-2 text-sm text-white outline-none backdrop-blur-sm transition placeholder:text-white/50 focus:border-white/60"
                    />
                    <Button
                      type="submit"
                      disabled={!slug.trim()}
                      size="default"
                      className="shrink-0 bg-white text-black hover:bg-white/80"
                    >
                      {t.cta.open}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <footer className="border-t border-[#EAEAEA] bg-white">
          <div className="mx-auto flex max-w-5xl flex-col gap-2 px-5 py-8 font-mono text-xs text-[#787774] sm:flex-row sm:justify-between">
            <span>{t.footer.left}</span>
            <span>{t.footer.right}</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
