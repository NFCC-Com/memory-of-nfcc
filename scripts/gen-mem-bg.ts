import sharp from "sharp";

const W = 1600;
const H = 1000;

interface BgSpec {
  file: string;
  word: string;
  from: string;
  to: string;
  streak: string;
}

const SPECS: BgSpec[] = [
  { file: "nfcc-memory.jpg", word: "MEMORY", from: "#F7F6F3", to: "#E2E8E1", streak: "#FFFFFF" },
  { file: "nfcc-pindai.jpg", word: "PINDAI", from: "#FBF3DB", to: "#EFE0BC", streak: "#FFFFFF" },
  { file: "nfcc-unggah.jpg", word: "UNGGAH", from: "#E1F3FE", to: "#C9E2F3", streak: "#FFFFFF" },
  { file: "nfcc-arsip.jpg", word: "ARSIP", from: "#FDEBEC", to: "#F0D5D6", streak: "#FFFFFF" },
];

function svgFor(spec: BgSpec): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${spec.from}"/>
      <stop offset="1" stop-color="${spec.to}"/>
    </linearGradient>
    <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="90"/>
    </filter>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.7 0"/>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <g filter="url(#soft)" opacity="0.85">
    <ellipse cx="${W * 0.25}" cy="${H * 0.3}" rx="${W * 0.35}" ry="${H * 0.28}" fill="${spec.streak}" opacity="0.7"/>
    <ellipse cx="${W * 0.8}" cy="${H * 0.75}" rx="${W * 0.4}" ry="${H * 0.3}" fill="${spec.streak}" opacity="0.55"/>
  </g>
  <g opacity="0.5">
    <rect x="${W * -0.1}" y="${H * 0.55}" width="${W * 1.2}" height="70" fill="${spec.streak}" opacity="0.5" transform="skewX(-18)"/>
    <rect x="${W * -0.1}" y="${H * 0.68}" width="${W * 1.2}" height="34" fill="${spec.streak}" opacity="0.35" transform="skewX(-18)"/>
    <rect x="${W * -0.1}" y="${H * 0.2}" width="${W * 1.2}" height="22" fill="${spec.streak}" opacity="0.3" transform="skewX(-18)"/>
  </g>
  <text x="50%" y="56%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="190" letter-spacing="10" fill="#111111" fill-opacity="0.16">${spec.word}</text>
  <rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.09"/>
</svg>`;
}

for (const spec of SPECS) {
  const out = `public/mem/${spec.file}`;
  await sharp(Buffer.from(svgFor(spec))).jpeg({ quality: 82, mozjpeg: true }).toFile(out);
  console.log(`wrote ${out}`);
}
