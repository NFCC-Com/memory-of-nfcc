# DESIGN.md — Memory Photo Wall (MVP)

Sumber kebenaran token visual. Setiap warna, ukuran font, dan spacing di `src/` harus merujuk ke token di sini.
Stack: React + Vite + TS + Tailwind v4 (`@tailwindcss/vite`) + shadcn/ui (`new-york`, `neutral`). Tanpa Next.js, tanpa lib UI tambahan.

## 1. Prinsip

- Warm monochrome dulu: putih + abu hangat + teks charcoal. Warna pastel hanya untuk makna semantik (badge/status).
- Photo-first: foto natural aspect ratio, tidak di-stretch/crop paksa. Lihat [PhotoWall](src/components/PhotoWall.tsx).
- Flat editorial: border `1px solid #EAEAEA`, radius `8–16px` (`rounded-lg`/`rounded-xl`/`rounded-2xl`), tanpa `shadow-md/lg/xl`, tanpa gradient dekoratif, tanpa glassmorphism kecuali blur halus navbar.
- Simplicity > abstraksi: pola eksisting di `src/index.css`, `src/components/ui/button.tsx` menang atas ide baru.

## 2. Warna (token di `src/index.css` `@theme`)

| Token | Nilai | Pakai untuk |
|---|---|---|
| `--color-canvas` | `#FFFFFF` | Background page (`bg-white`) |
| `--color-surface` | `#F7F6F3` | Section selingan, placeholder foto, hover halus |
| `--color-border` | `#EAEAEA` | Semua border/divider kartu |
| `--color-text` | `#2F3437` | Body text |
| `--color-text-muted` | `#787774` | Sub-headline, meta mono, caption |
| `--color-ink` | `#111111` | Headline, CTA solid, ikon |
| `--color-ink-hover` | `#333333` | Hover CTA (`hover:bg-[#333333]`) |
| Pastel hijau | bg `#EDF3EC` / text `#346538` | Badge `Aktif`, notice sukses |
| Pastel kuning | bg `#FBF3DB` / text `#956400` | Badge `Segera` |
| Pastel merah | bg `#FDEBEC` / text `#9F2F2D` | Badge destructive, notice error |
| Pastel biru | bg `#E1F3FE` / text `#1F6C9F` | Info sekunder (cadangan) |

Larangan: hero/section besar berwarna primer solid, neon, gradient dekoratif. Satu-satunya overlay gelap yang diizinkan adalah fungsional: `bg-black/60` di CTA box dan `from-black/70 via-black/20` di kartu [StepsStack](src/components/StepsStack.tsx) demi legibilitas teks di atas foto.

## 3. Tipografi

- Sans (body/UI/button): `Geist, -apple-system, "Segoe UI", Roboto, sans-serif` (`--font-sans`). Body `line-height: 1.6`, anti-aliased.
- Mono (meta/badge/angka): `Geist Mono, ui-monospace, SF Mono` (`--font-mono`). Contoh: `font-mono text-xs`, `text-[11px] uppercase tracking-[0.2em]`, `tabular-nums`.
- Hero headline: `font-extrabold uppercase leading-[0.95] tracking-tighter text-balance text-[#111111]`, `text-4xl sm:text-6xl lg:text-7xl`, `max-w-4xl center`. Lihat [Landing](src/pages/Landing.tsx).
- Section title: `text-2xl sm:text-4xl font-semibold tracking-tight text-[#111111]`, sub `text-base text-[#787774] max-w-xl mx-auto`.
- Body tidak pernah `#000000` murni; sekunder selalu `#787774`.
- Dilarang: Inter/Roboto/Open Sans, emoji sebagai ikon (pakai `lucide-react` + SVG inline).

## 4. Layout & spacing

- Lebar konten: `max-w-5xl` (landing/event), `max-w-3xl` (FAQ), `max-w-2xl` (stack kartu), `max-w-3xl` (navbar floating).
- Ritme vertikal: section `py-16 sm:py-24`, hero `pt-14 sm:pt-20 pb-16 sm:pb-24` + jeda internal `mt-8 / mt-6 / mt-12 / mt-10` (badge → headline → sub → CTA → trust), antar-kartu `gap-3` / `gap-5`.
- **Aturan navbar (wajib, semua pages):** [Navbar](src/components/Navbar.tsx:59) adalah `fixed inset-x-0 top-3 sm:top-4`, tinggi ±60px (tepi bawah ±72px). Token offset universal: `pt-[92px] sm:pt-[104px]` (±72px navbar + 20–32px napas). Bentuk navbar JANGAN diubah; yang diatur selalu page wrapper.
  - Landing: `main#top.relative.scroll-pt-24.pt-[92px].sm:pt-[104px]` — jangan hapus.
  - EventPage & PhotoPage: offset di wrapper terluar `min-h-screen` (bukan di header/main) agar ketiga state — loading, error, sukses — ikut turun seragam.
  - Anchor section (`#galeri`, `#fitur`, `#cara-kerja`, `#arsip`) wajib `scroll-mt-24` agar tidak tertutup navbar.
  - `Admin`/`Login` tidak memakai navbar — tidak perlu offset.
- Padding horizontal standar: `px-5`, navbar `px-3` luar + `px-4 sm:px-5` dalam.
- Footer: `border-t border-[#EAEAEA]`, `font-mono text-xs text-[#787774]`.

## 5. Komponen

- **Button** ([button.tsx](src/components/ui/button.tsx)): `rounded-md text-sm font-medium`, `active:scale-[0.98]`, `disabled:opacity-40`. Varian: `default/primary` (`bg-[#111111] text-white hover:bg-[#333333]`), `outline` (`border-[#EAEAEA] bg-white hover:bg-[#F7F6F3]`), `ghost`, `secondary/destructive` pastel merah. Ukuran: `sm h-8`, `default h-9`, `lg h-11 px-6 text-base` untuk CTA hero.
- **Toast** (`sonner`, `<Toaster>` di [App](src/App.tsx)): SEMUA notifikasi lewat toast — sukses/error upload, aksi admin, login gagal. Monokrom (`bg-white`, `border #EAEAEA`, teks `#111111`, `bottom-center`) agar selaras sistem; tanpa `richColors`.
- **Tile dinding** ([PhotoWall](src/components/PhotoWall.tsx)): `[content-visibility:auto]` + `[contain-intrinsic-size:auto_420px]` agar ratusan tile offscreen tidak di-render/di-fetch; `LikeButton` di-`key` per `photo.id` dengan `initialLiked` dari flag `liked` API; gagal load transien di-retry maks 2x saat tile terlihat (404 permanen tetap di fallback).
- **Navbar + menu (Skiper13):** bar `rounded-2xl bg-white/80 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.08)]`; panel menu `absolute top-[calc(100%+8px)] rounded-2xl bg-white/95 backdrop-blur-md`, link `text-2xl sm:text-3xl font-extrabold uppercase tracking-tighter`, item `hover:translate-x-2 hover:bg-[#F7F6F3]`. Lihat [skiper13.tsx](src/components/ui/skiper-ui/skiper13.tsx).
- **Hero (Landing):** section full-bleed (`relative overflow-hidden`, latar `absolute inset-0` selebar viewport) + konten `max-w-5xl`; grid `lg:grid-cols-[1.05fr_0.95fr]` — teks rata tengah di mobile, rata kiri di desktop; section `pt-14 sm:pt-20 pb-16 sm:pb-24` + latar foto Cloudinary tetap (`opacity-25` + wash `bg-white/60`, `aria-hidden`, eager); badge tunggal `Terkurasi pengurus`; headline via [TextAnimate](src/components/TextAnimate.tsx) (`blurInUp` per kata, `text-4xl sm:text-6xl lg:text-7xl`); kolase 6 foto tetap Cloudinary (`HERO_IMGS`, bukan DB — selalu tampil walau API kosong); CTA primer `size lg min-w-[180px] hover:-translate-y-0.5` (GPU, 200ms); link sekunder `.skiper-link py-1`.
- **Z-pattern (`Cara berkontribusi`):** 3 baris selang-seling (`md:grid-cols-2`, gambar `md:order-2` pada baris genap), visual `aspect-[16/10] rounded-xl border`, teks bernomor mono `01–03`.
- **Galeri pratinjau (`#galeri`):** pengganti Arus memori; grid `grid-cols-2 sm:grid-cols-4`, foto `aspect-square object-cover`, `hover:border-[#111111]` + `group-hover:scale-[1.03]`, alt bernomor; CTA `Buka Arsip Demo`. Sembunyi total saat API kosong.
- **Kutipan kolektif:** 3 kartu `rounded-xl border bg-white p-6` + ikon `Quote` lucide, tanpa nama (bukan testimoni individu — larangan data palsu).
- **Sticky stack (Skiper16):** [skiper16.tsx](src/components/ui/skiper-ui/skiper16.tsx) `sticky top: 88 + i*14`, `motion.div origin-top transform-gpu will-change-transform rounded-xl border-[#EAEAEA] bg-white`. Kartu isi di [StepsStack](src/components/StepsStack.tsx): `rounded-2xl border border-[#EAEAEA] shadow-[0_2px_12px_rgba(0,0,0,0.06)] min-h-[380px] sm:min-h-[440px]`, header badge `rounded-full bg-white/15 backdrop-blur-sm`, judul `text-3xl sm:text-4xl font-extrabold uppercase tracking-tighter text-white`. Hover kartu umum: `.card-hover` → `0 2px 8px rgba(0,0,0,0.04)` + `translateY(-1px)`.
- **Marquee vertikal:** `.animate-marquee-y` (36s) + `.animate-marquee-y-slow` (52s reverse) + `.mask-fade-y`; khusus kolase hero yang duplikatnya disembunyikan dari AT.
- **Bento fitur & arsip:** `rounded-xl border-[#EAEAEA] bg-white p-5/p-6`, ikon `h-10 w-10 rounded-lg border bg-[#F7F6F3]`, hover `hover:border-[#cccccc] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]`.
- **FAQ:** tanpa box, `border-b border-[#EAEAEA] py-4`, ikon `Plus rotate-45 saat open`.
- **Input/file:** `rounded-md border-white/20 bg-white/10` (di atas foto) atau `border-[#EAEAEA] bg-[#F7F6F3]`; `::file-selector-button` konsisten di `index.css:170`.

## 6. Motion

- Hanya GPU: `transform`, `opacity`, `filter`. Dilarang menganimasikan `top/left/width/height`.
- Reveal on scroll ([Reveal.tsx](src/components/Reveal.tsx) + `.reveal` di `index.css:30`): `translateY(12px)+opacity 600ms cubic-bezier(0.16,1,0.3,1)` via `IntersectionObserver`, sekali tampil.
- Entrance: `.animate-blur-fade` (600ms) dan `.animate-fade-up` (500ms); stagger grid `.stagger-enter` (`--index * 80ms`).
- Skiper13 menu: `opacity+height+y` 400ms `[0.16,1,0.3,1]`, stagger anak 60ms; Skiper16: `scale` via `useTransform(progress, range, [1, targetScale])`.
- TextAnimate: basis `.animate-blur-in-word` (opacity/filter/translateY 550ms) + delay inline per kata (`delay + i * stagger`); jalan sekali via IntersectionObserver; diam saat reduced-motion.
- `prefers-reduced-motion: reduce` mematikan semua animasi (lihat `index.css:208`). `MotionConfig reducedMotion="user"` + `useReducedMotion()` wajib di komponen framer-motion.
- Focus: `:focus-visible { outline: 2px solid #111111; offset 2px; radius 6px }`.

## 7. Responsif, aksesibilitas & QA

- Breakpoint: mobile dulu; `sm:` untuk 2–3 kolom, hero membesar, CTA horizontal. Cek visual 375 / 768 / 1280px.
- Semua gambar foto: `loading lazy` (kecuali 6 pertama `eager`), `decoding async`, `alt` bermakna atau `""` dekoratif; fallback `foto tak termuat` di PhotoWall.
- Kontras: body `#2F3437` di putih, muted `#787774` hanya untuk teks sekunder ≥12px; badge pastel memakai pasangan bg/text di tabel §2.
- Verifikasi tiap perubahan: `bun run build` + `bun run lint` hijau; tidak ada token di luar §2–§3 tanpa update file ini dulu.
