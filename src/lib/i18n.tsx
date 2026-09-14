import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "id" | "en";

const STORAGE_KEY = "lang";

interface LocalStrings {
  nav: {
    menu: string;
    openMenu: string;
    closeMenu: string;
    home: string;
    mainMenu: string;
    eventsTitle: string;
    links: { hash: string; label: string }[];
  };
  hero: {
    title: string;
    sub: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trust: string[];
  };
  stats: {
    photos: string;
    activities: string;
    accounts: string;
  };
  galeri: {
    eyebrow: string;
    title: string;
    sub: string;
    openArchive: string;
    openPhotoAria: (i: number) => string;
    photoAlt: (i: number) => string;
  };
  manifesto: {
    eyebrow: string;
    text: string;
    sectionLabel: string;
  };
  kolektif: {
    eyebrow: string;
    title: string;
    sub: string;
    features: { title: string; desc: string }[];
  };
  zfitur: {
    eyebrow: string;
    title: string;
    items: { n: string; title: string; desc: string; meta: string; alt: string }[];
  };
  org: {
    eyebrow: string;
    title: string;
    sub: string;
  };
  orgStack: {
    header: string;
    cards: { desc: string; meta: string; alt: string }[];
  };
  arsip: {
    title: string;
    sub: string;
    activitiesUnit: string;
  };
  events: {
    eyebrow: string;
    title: string;
    sub: string;
    loading: string;
    emptyTitle: string;
    emptySub: string;
    loadFailed: string;
    retry: string;
    back: string;
    openLabel: string;
  };
  common: {
    active: string;
    upcoming: string;
    done: string;
    receiving: string;
  };
  quotes: {
    eyebrow: string;
    title: string;
    items: string[];
  };
  faq: {
    title: string;
    items: { q: string; a: string }[];
  };
  cta: {
    title: string;
    sub: string;
    exploreDemo: string;
    haveCode: string;
    codePlaceholder: string;
    codeLabel: string;
    open: string;
  };
  footer: {
    left: string;
    right: string;
  };
  wall: {
    openPhotoAria: (i: number) => string;
    photoAlt: (i: number) => string;
    failedToLoad: string;
  };
  like: {
    likeAria: (count: number) => string;
    unlikeAria: (count: number) => string;
    failedAria: (count: number) => string;
    share: string;
    copied: string;
    sent: string;
    failed: string;
  };
  event: {
    loading: string;
    notFoundTitle: string;
    notFoundDefault: string;
    home: string;
    addPhoto: string;
    addPhotoSub: string;
    previewAlt: string;
    removePreview: string;
    choosePhoto: string;
    dropHint: string;
    chosenFile: (name: string, size: string) => string;
    fileTooBig: string;
    uploading: string;
    upload: string;
    uploadFailed: string;
    optimizedNote: string;
    closedNote: string;
    wallTitle: string;
    photosUnit: string;
    emptyTitle: string;
    emptySub: string;
    inviteTitle: string;
    copyLink: string;
    copied: string;
  };
  photo: {
    loading: string;
    notFoundTitle: string;
    notFoundDefault: string;
    backWall: string;
    likesUnit: string;
    download: string;
    downloadLabel: string;
    copyLinkLabel: string;
    copied: string;
    linkLabel: string;
    footer: string;
  };
  notFound: {
    title: string;
    sub: string;
    back: string;
  };
}

const STRINGS: Record<Lang, LocalStrings> = {
  id: {
    nav: {
      menu: "Menu",
      openMenu: "Buka menu",
      closeMenu: "Tutup menu",
      home: "MEMORY of NFCC — beranda",
      mainMenu: "Menu utama",
      eventsTitle: "Daftar Acara",
      links: [
        { hash: "fitur", label: "Fitur" },
        { hash: "galeri", label: "Galeri" },
        { hash: "cara-kerja", label: "Cara kerja" },
        { hash: "arsip", label: "Arsip" },
      ],
    },
    hero: {
      title: "Semua lensa. Satu memori.",
      sub: "Satu kegiatan, satu tautan, satu QR. Anggota memindai dari ponsel, mengunggah momen, dan foto menjadi arsip kolektif NFCC.",
      ctaPrimary: "Explore Memories",
      ctaSecondary: "Lihat Arsip",
      trust: ["Terkurasi pengurus"],
    },
    stats: {
      photos: "Foto terarsip",
      activities: "Kegiatan",
      accounts: "Akun dibutuhkan",
    },
    galeri: {
      eyebrow: "Pratinjau",
      title: "Dinding yang hidup",
      sub: "Foto terverifikasi dari arsip kegiatan — yang terbaru dari banyak lensa.",
      openArchive: "Buka Arsip",
      openPhotoAria: (i) => `Buka foto ${i + 1} dari arsip`,
      photoAlt: (i) => `Foto ${i + 1} dari arsip`,
    },
    manifesto: {
      eyebrow: "Mengapa mengarsipkan",
      text: "Satu kegiatan dilihat dari banyak lensa. MEMORY of NFCC mengumpulkan setiap sudut pandang anggota menjadi satu arsip visual milik bersama.",
      sectionLabel: "Manifesto arsip",
    },
    kolektif: {
      eyebrow: "Kolektif",
      title: "Dibuat untuk kolektif",
      sub: "Fokus pada kontribusi mudah dan arsip yang rapi untuk organisasi.",
      features: [
        {
          title: "Satu QR per Kegiatan",
          desc: "Setiap kegiatan punya tautan /p/:slug dan kode QR siap cetak untuk lokasi acara.",
        },
        {
          title: "Kontribusi Anggota",
          desc: "Siapa pun di NFCC bisa melihat, mengunggah, menyukai, dan membagikan. Tanpa akun.",
        },
        {
          title: "Kurasi Pengurus",
          desc: "Hanya foto berstatus APPROVED yang tampil di dinding publik.",
        },
        {
          title: "Dinding Kolektif",
          desc: "Foto terverifikasi langsung tampil di galeri bersama.",
        },
        {
          title: "Kamera HP",
          desc: "Jepret dari kamera bawaan. JPEG otomatis teroptimasi sebelum tersimpan.",
        },
        {
          title: "Arsip Organisasi",
          desc: "Dokumentasi kegiatan tersimpan aman dan bisa dibuka kembali kapan saja.",
        },
      ],
    },
    zfitur: {
      eyebrow: "Cara berkontribusi",
      title: "Semudah memindai",
      items: [
        {
          n: "01",
          title: "Pindai QR di lokasi",
          desc: "Satu kode QR membuka arsip kegiatan langsung di ponsel. Tanpa aplikasi, tanpa akun, tanpa antre.",
          meta: "/p/:slug · siap cetak",
          alt: "Visual langkah pindai QR",
        },
        {
          n: "02",
          title: "Jepret dari kamera HP",
          desc: "Pilih dari galeri atau jepret langsung. JPEG otomatis teroptimasi sebelum tersimpan di arsip.",
          meta: "JPEG · maks sisi 2048px",
          alt: "Visual langkah unggah momen",
        },
        {
          n: "03",
          title: "Terkurasi sebelum tampil",
          desc: "Pengurus menyaring setiap foto. Hanya yang disetujui masuk dinding kolektif NFCC.",
          meta: "hanya APPROVED yang tampil",
          alt: "Visual langkah kurasi pengurus",
        },
      ],
    },
    org: {
      eyebrow: "Periode 2026/2027",
      title: "Struktur organisasi",
      sub: "Empat simpul — pimpinan, humas, riset & edukasi, sekretaris.",
    },
    orgStack: {
      header: "Struktur 2026/2027 — gulir, kartu menumpuk",
      cards: [
        {
          desc: "Penanggung jawab arah dan keputusan organisasi Periode 2026/2027.",
          meta: "Periode 2026/2027 · 2 orang",
          alt: "Latar visual kartu pimpinan 2026/2027",
        },
        {
          desc: "Menjaga komunikasi dan relasi organisasi ke dalam dan ke luar.",
          meta: "EC + Staff · 2 orang",
          alt: "Latar visual kartu Public Relation 2026/2027",
        },
        {
          desc: "Mengolah pengetahuan dan program edukasi internal organisasi.",
          meta: "EC + 4 Staff · 5 orang",
          alt: "Latar visual kartu Research and Education 2026/2027",
        },
        {
          desc: "Menjaga administrasi, arsip, dan alur kerja harian organisasi.",
          meta: "EC + Staff · 2 orang",
          alt: "Latar visual kartu Secretary 2026/2027",
        },
      ],
    },
    arsip: {
      title: "Jelajahi arsip",
      sub: "Setiap kegiatan punya dindingnya sendiri. Pilih untuk membuka.",
      activitiesUnit: "kegiatan",
    },
    events: {
      eyebrow: "Arsip",
      title: "Semua kegiatan",
      sub: "Setiap kegiatan punya dindingnya sendiri. Pilih untuk membuka.",
      loading: "Memuat daftar kegiatan…",
      emptyTitle: "Belum ada kegiatan.",
      emptySub: "Arsip kegiatan akan muncul di sini setelah pengurus menambahkannya.",
      loadFailed: "Gagal memuat daftar kegiatan. Periksa koneksi lalu coba lagi.",
      retry: "Coba lagi",
      back: "Kembali ke Beranda",
      openLabel: "Buka",
    },
    common: {
      active: "Aktif",
      upcoming: "Segera",
      done: "Selesai",
      receiving: "Menerima foto",
    },
    quotes: {
      eyebrow: "Kenapa kolektif",
      title: "Banyak lensa, satu cerita",
      items: [
        "Momen terbaik sering luput dari kamera panitia — tapi tidak dari puluhan kamera anggota.",
        "Setiap sudut pandang melengkapi yang lain sampai arsip terasa utuh.",
        "Dibuka kembali kapan saja, oleh siapa saja yang memegang tautannya.",
      ],
    },
    faq: {
      title: "Sering ditanyakan",
      items: [
        {
          q: "Bagaimana cara mengunggah foto?",
          a: "Pindai kode QR di lokasi kegiatan untuk membuka arsip, lalu pilih foto dari galeri atau jepret langsung dari kamera HP.",
        },
        {
          q: "Apakah perlu membuat akun?",
          a: "Tidak. Siapa pun yang memiliki tautan kegiatan bisa melihat, mengunggah, menyukai, dan membagikan foto.",
        },
        {
          q: "Format foto apa saja yang diterima?",
          a: "JPEG/JPG hingga 8MB. Setiap foto otomatis dioptimasi (maksimal sisi 2048px, kualitas 82) sebelum tersimpan.",
        },
        {
          q: "Kenapa fotoku belum tampil di dinding?",
          a: "Foto menunggu kurasi pengurus. Hanya foto berstatus APPROVED yang tampil di dinding publik.",
        },
        {
          q: "Siapa yang bisa melihat arsip?",
          a: "Arsip bersifat publik — siapa pun yang memiliki tautan /p/:slug dapat membukanya kapan saja.",
        },
      ],
    },
    cta: {
      title: "Ada kegiatan NFCC berikutnya?",
      sub: "Tempel QR di lokasi dan biarkan setiap anggota mengabadikan momen dari sudut pandangnya.",
      exploreDemo: "Jelajahi Arsip",
      haveCode: "Punya kode kegiatan?",
      codePlaceholder: "Kode kegiatan (mis. nama-kegiatan)",
      codeLabel: "Kode kegiatan",
      open: "Buka",
    },
    footer: {
      left: "MEMORY of NFCC — Arsip visual organisasi",
      right: "Kontribusi anggota · Terkurasi",
    },
    wall: {
      openPhotoAria: (i) => `Buka foto ${i + 1}`,
      photoAlt: (i) => `Foto ${i + 1} dari arsip`,
      failedToLoad: "foto tak termuat",
    },
    like: {
      likeAria: (c) => `Suka foto (${c})`,
      unlikeAria: (c) => `Batal suka (${c})`,
      failedAria: (c) => `Gagal menyimpan suka, tekan untuk coba lagi (${c})`,
      share: "Bagikan",
      copied: "Disalin",
      sent: "Terkirim",
      failed: "Gagal",
    },
    event: {
      loading: "Memuat event…",
      notFoundTitle: "Event tidak ditemukan",
      notFoundDefault: "Periksa kembali QR atau tautan yang digunakan.",
      home: "Beranda",
      addPhoto: "Tambah fotomu",
      addPhotoSub: "Hanya format JPEG/JPG, maks 8MB. Foto langsung tampil di galeri.",
      previewAlt: "Pratinjau foto yang akan diunggah",
      removePreview: "Hapus pratinjau",
      choosePhoto: "Pilih foto",
      dropHint: "atau seret foto ke area ini",
      chosenFile: (name, size) => `${name} (${size}MB)`,
      fileTooBig: "File maksimal 8MB — pilih foto yang lebih kecil.",
      uploading: "Mengunggah…",
      upload: "Upload foto",
      uploadFailed: "Upload gagal",
      optimizedNote: "Format JPEG otomatis dioptimasi.",
      closedNote: "Event ini sedang tidak menerima unggahan foto baru.",
      wallTitle: "Dinding Foto",
      photosUnit: "foto",
      emptyTitle: "Belum ada foto.",
      emptySub: "Jadilah yang pertama mengunggah momen acara ini.",
      inviteTitle: "Ajak Tamu Lain",
      copyLink: "Salin tautan",
      copied: "Tautan disalin",
    },
    photo: {
      loading: "Memuat foto…",
      notFoundTitle: "Foto tidak ditemukan",
      notFoundDefault: "Foto ini mungkin sudah dihapus atau tidak tersedia.",
      backWall: "Kembali ke dinding",
      likesUnit: "suka",
      download: "Unduh",
      downloadLabel: "Unduh foto",
      copyLinkLabel: "Salin tautan foto",
      copied: "Tersalin",
      linkLabel: "Tautan",
      footer: "MEMORY of NFCC — Arsip Visual",
    },
    notFound: {
      title: "Halaman tidak ditemukan",
      sub: "Tautan salah atau halaman sudah tidak tersedia.",
      back: "Kembali ke Beranda",
    },
  },
  en: {
    nav: {
      menu: "Menu",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      home: "MEMORY of NFCC — home",
      mainMenu: "Main menu",
      eventsTitle: "Events",
      links: [
        { hash: "fitur", label: "Features" },
        { hash: "galeri", label: "Gallery" },
        { hash: "cara-kerja", label: "How it works" },
        { hash: "arsip", label: "Archive" },
      ],
    },
    hero: {
      title: "Every lens. One memory.",
      sub: "One activity, one link, one QR. Members scan from their phones, upload moments, and photos become the collective NFCC archive.",
      ctaPrimary: "Explore Memories",
      ctaSecondary: "View Archive",
      trust: ["Curated by admins"],
    },
    stats: {
      photos: "Archived photos",
      activities: "Activities",
      accounts: "Accounts needed",
    },
    galeri: {
      eyebrow: "Preview",
      title: "A living wall",
      sub: "Verified photos from the event archive — the latest from many lenses.",
      openArchive: "Open Archive",
      openPhotoAria: (i) => `Open photo ${i + 1} from the archive`,
      photoAlt: (i) => `Photo ${i + 1} from the archive`,
    },
    manifesto: {
      eyebrow: "Why archive",
      text: "One activity seen through many lenses. MEMORY of NFCC gathers every member's perspective into one shared visual archive.",
      sectionLabel: "Archive manifesto",
    },
    kolektif: {
      eyebrow: "Collective",
      title: "Built for the collective",
      sub: "Easy contributions and a tidy archive for the organization.",
      features: [
        {
          title: "One QR per Activity",
          desc: "Every activity gets a /p/:slug link and a print-ready QR code for the venue.",
        },
        {
          title: "Member Contributions",
          desc: "Anyone in NFCC can view, upload, like, and share. No account needed.",
        },
        {
          title: "Curated by Admins",
          desc: "Only APPROVED photos appear on the public wall.",
        },
        {
          title: "Collective Wall",
          desc: "Verified photos appear instantly in the shared gallery.",
        },
        {
          title: "Phone Camera",
          desc: "Shoot from the built-in camera. JPEGs are auto-optimized before saving.",
        },
        {
          title: "Organization Archive",
          desc: "Activity documentation stored safely and reopenable anytime.",
        },
      ],
    },
    zfitur: {
      eyebrow: "How to contribute",
      title: "As easy as scanning",
      items: [
        {
          n: "01",
          title: "Scan the on-site QR",
          desc: "One QR code opens the activity archive right on your phone. No app, no account, no queue.",
          meta: "/p/:slug · print-ready",
          alt: "Visual for the scan QR step",
        },
        {
          n: "02",
          title: "Shoot from your phone",
          desc: "Pick from your gallery or shoot directly. JPEGs are auto-optimized before entering the archive.",
          meta: "JPEG · max edge 2048px",
          alt: "Visual for the upload moment step",
        },
        {
          n: "03",
          title: "Curated before showing",
          desc: "Admins review every photo. Only approved ones join the NFCC collective wall.",
          meta: "only APPROVED photos show",
          alt: "Visual for the admin curation step",
        },
      ],
    },
    org: {
      eyebrow: "Period 2026/2027",
      title: "Organization structure",
      sub: "Four nodes — leadership, public relations, research & education, secretariat.",
    },
    orgStack: {
      header: "Structure 2026/2027 — scroll, cards stack",
      cards: [
        {
          desc: "Responsible for the organization's direction and decisions for Period 2026/2027.",
          meta: "Period 2026/2027 · 2 people",
          alt: "Leadership card visual 2026/2027",
        },
        {
          desc: "Keeps the organization's communication and relations, inside and out.",
          meta: "EC + Staff · 2 people",
          alt: "Public Relation card visual 2026/2027",
        },
        {
          desc: "Develops knowledge and the organization's internal education programs.",
          meta: "EC + 4 Staff · 5 people",
          alt: "Research and Education card visual 2026/2027",
        },
        {
          desc: "Keeps the organization's administration, archives, and daily workflow.",
          meta: "EC + Staff · 2 people",
          alt: "Secretary card visual 2026/2027",
        },
      ],
    },
    arsip: {
      title: "Explore the archive",
      sub: "Every activity has its own wall. Pick one to open.",
      activitiesUnit: "activities",
    },
    events: {
      eyebrow: "Archive",
      title: "All events",
      sub: "Every activity has its own wall. Pick one to open.",
      loading: "Loading events…",
      emptyTitle: "No events yet.",
      emptySub: "Event archives will appear here once admins add them.",
      loadFailed: "Failed to load events. Check your connection and try again.",
      retry: "Retry",
      back: "Back to Home",
      openLabel: "Open",
    },
    common: {
      active: "Active",
      upcoming: "Upcoming",
      done: "Done",
      receiving: "Accepting photos",
    },
    quotes: {
      eyebrow: "Why collective",
      title: "Many lenses, one story",
      items: [
        "The best moments often escape the committee camera — but not dozens of member cameras.",
        "Every perspective completes the others until the archive feels whole.",
        "Reopened anytime, by anyone holding the link.",
      ],
    },
    faq: {
      title: "Frequently asked",
      items: [
        {
          q: "How do I upload a photo?",
          a: "Scan the QR code at the activity venue to open the archive, then pick a photo from your gallery or shoot directly from your phone camera.",
        },
        {
          q: "Do I need an account?",
          a: "No. Anyone with the activity link can view, upload, like, and share photos.",
        },
        {
          q: "Which photo formats are accepted?",
          a: "JPEG/JPG up to 8MB. Every photo is auto-optimized (max edge 2048px, quality 82) before saving.",
        },
        {
          q: "Why isn't my photo on the wall yet?",
          a: "Photos await admin curation. Only APPROVED photos appear on the public wall.",
        },
        {
          q: "Who can see the archive?",
          a: "Archives are public — anyone with the /p/:slug link can open them anytime.",
        },
      ],
    },
    cta: {
      title: "Have a next NFCC activity?",
      sub: "Stick a QR at the venue and let every member capture moments from their own angle.",
      exploreDemo: "Explore Archive",
      haveCode: "Have an activity code?",
      codePlaceholder: "Activity code (e.g. event-slug)",
      codeLabel: "Activity code",
      open: "Open",
    },
    footer: {
      left: "MEMORY of NFCC — Organization visual archive",
      right: "Member contributions · Curated",
    },
    wall: {
      openPhotoAria: (i) => `Open photo ${i + 1}`,
      photoAlt: (i) => `Photo ${i + 1} from the archive`,
      failedToLoad: "photo failed to load",
    },
    like: {
      likeAria: (c) => `Like photo (${c})`,
      unlikeAria: (c) => `Unlike (${c})`,
      failedAria: (c) => `Failed to save like, press to retry (${c})`,
      share: "Share",
      copied: "Copied",
      sent: "Sent",
      failed: "Failed",
    },
    event: {
      loading: "Loading event…",
      notFoundTitle: "Event not found",
      notFoundDefault: "Double-check the QR or link you used.",
      home: "Home",
      addPhoto: "Add your photo",
      addPhotoSub: "JPEG/JPG only, max 8MB. Photos appear in the gallery instantly.",
      previewAlt: "Preview of the photo to upload",
      removePreview: "Remove preview",
      choosePhoto: "Choose photo",
      dropHint: "or drag a photo into this area",
      chosenFile: (name, size) => `${name} (${size}MB)`,
      fileTooBig: "Max file size is 8MB — pick a smaller photo.",
      uploading: "Uploading…",
      upload: "Upload photo",
      uploadFailed: "Upload failed",
      optimizedNote: "JPEG format auto-optimized.",
      closedNote: "This event is not accepting new photo uploads right now.",
      wallTitle: "Photo Wall",
      photosUnit: "photos",
      emptyTitle: "No photos yet.",
      emptySub: "Be the first to upload a moment from this event.",
      inviteTitle: "Invite Other Guests",
      copyLink: "Copy link",
      copied: "Link copied",
    },
    photo: {
      loading: "Loading photo…",
      notFoundTitle: "Photo not found",
      notFoundDefault: "This photo may have been deleted or is unavailable.",
      backWall: "Back to wall",
      likesUnit: "likes",
      download: "Download",
      downloadLabel: "Download photo",
      copyLinkLabel: "Copy photo link",
      copied: "Copied",
      linkLabel: "Link",
      footer: "MEMORY of NFCC — Visual Archive",
    },
    notFound: {
      title: "Page not found",
      sub: "Wrong link or the page is no longer available.",
      back: "Back to Home",
    },
  },
};

export type Strings = LocalStrings;

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Strings;
}

const Ctx = createContext<LangCtx>({ lang: "id", setLang: () => {}, t: STRINGS.id });

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "id") return saved;
  } catch {
    /* storage unavailable — fall through to default */
  }
  return "id";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore persistence failures */
    }
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);

  return <Ctx.Provider value={{ lang, setLang, t: STRINGS[lang] }}>{children}</Ctx.Provider>;
}

export function useLanguage(): LangCtx {
  return useContext(Ctx);
}
