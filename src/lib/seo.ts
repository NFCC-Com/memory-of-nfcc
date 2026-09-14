// SEO/GEO runtime helper untuk SPA.
//
// BrowserRouter tidak me-render <head> per route di server, jadi setiap
// halaman memanggil setPageMeta() agar <title>, description, canonical,
// dan tag Open Graph/Twitter selalu sinkron dengan route aktif.
//
// Domain-agnostik: canonical + og:url dibangun dari window.location.origin
// sehingga aman di preview Vercel maupun domain produksi.

export interface PageMeta {
  title: string;
  description?: string;
  /** Path route aktif, mis. `/events`. Canonical = origin + path. */
  path?: string;
  /** URL gambar absolut untuk og:image. Default: visual CTA landing. */
  image?: string;
  /** true untuk halaman non-publik (login/admin): noindex, nofollow. */
  noindex?: boolean;
}

const DEFAULT_IMAGE =
  "https://res.cloudinary.com/drjrvrdnw/image/upload/v1789100226/backround2_1_ls0ssp.png";

function setMetaName(name: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setMetaProperty(property: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[property="${property}"]`,
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(url: string): void {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", url);
}

export function setPageMeta({ title, description, path, image, noindex }: PageMeta): void {
  if (typeof document === "undefined") return;
  document.title = title;
  if (description) {
    setMetaName("description", description);
    setMetaProperty("og:description", description);
    setMetaName("twitter:description", description);
  }
  setMetaProperty("og:title", title);
  setMetaName("twitter:title", title);
  const url = path ? `${window.location.origin}${path}` : window.location.href;
  setMetaProperty("og:url", url);
  setCanonical(url);
  const img = image ?? DEFAULT_IMAGE;
  setMetaProperty("og:image", img);
  setMetaName("twitter:image", img);
  setMetaName("robots", noindex ? "noindex, nofollow" : "index, follow");
}
