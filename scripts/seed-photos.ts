import { sql } from "../api/db/client.js";

console.log("Starting 200 photo seed...");

// 1. Ensure demo-2026 period exists
let period = (await sql`select id, slug from periods where slug = 'demo-2026'`)[0];
if (!period) {
  const inserted = await sql`
    insert into periods (name, slug, description, status)
    values ('Demo Event 2026', 'demo-2026', 'Galeri foto resmi event demo', 'ACTIVE')
    returning id, slug
  `;
  period = inserted[0];
  console.log("Created period: demo-2026");
} else {
  console.log("Found existing period: demo-2026 (id:", period.id, ")");
}

// 2. Curated high-res Unsplash event, party, celebration, festival, and concert photo IDs
const UNSPLASH_IDS = [
  "1519741497674-611481863552", // wedding flowers
  "1492684223066-81342ee5ff30", // concert crowd
  "1511795409834-ef04bbd61622", // banquet dinner
  "1465847899084-d164df4dedc6", // friends cheering
  "1527529482837-4698179dc6ce", // party dance
  "1514525253161-7a46d19cd819", // neon party
  "1530103862676-de8c9debad1d", // balloons
  "1516450360452-9312f5e86fc7", // club dj
  "1520854221256-17451cc331bf", // girls laughing
  "1523301343968-6a6ebf63c672", // toast glasses
  "1528605248644-14dd04022da1", // picnic table
  "1519671482749-fd09be7ccebf", // birthday cake
  "1501286353178-1ec881214838", // rock concert
  "1533174072545-7a4b6ad7a6c3", // festival lights
  "1470225620780-dba8ba36b745", // dj console
  "1522158634372-223a52e2e1bb", // live music
  "1506157786151-b8491531f063", // outdoor festival
  "1520523839898-507125ef538a", // sparklers
  "1517457373958-b7bdd4587205", // conference
  "1529156069898-49953e39b3ac", // happy friends
  "1531058020387-3be344556be6", // party drinks
  "1524368535928-5b5e00ddc76b", // concert hands
  "1526772662000-3f88f10405ff", // polaroids
  "1521967906867-14ec9d64bee8", // friends smiling
  "1545128485-c400e7702796", // wedding couple
  "1509198397868-475647b2a1e5", // gamer festival
  "1561489413-985b06da5bee", // party rooftop
  "1571260899385-28e4695eb730", // crowd festival
  "1540039155733-5bb30b53aa14", // live performance
  "1583939003579-730e3918a45a", // happy moments
];

const ASPECT_RATIOS = [
  { width: 800, height: 1000 },
  { width: 800, height: 1200 },
  { width: 1000, height: 800 },
  { width: 900, height: 1200 },
  { width: 800, height: 800 },
  { width: 1000, height: 1250 },
  { width: 800, height: 1066 },
];

const TOTAL = 200;
console.log(`Generating ${TOTAL} photos for period ${period.id}...`);

// Insert in chunks of 25 for optimal performance
const CHUNK_SIZE = 25;
let insertedCount = 0;

for (let i = 0; i < TOTAL; i += CHUNK_SIZE) {
  const chunkCount = Math.min(CHUNK_SIZE, TOTAL - i);
  const rows = [];

  for (let j = 0; j < chunkCount; j++) {
    const idx = i + j;
    const ratio = ASPECT_RATIOS[idx % ASPECT_RATIOS.length];
    
    // Mix unsplash and picsum for varied, beautiful high-quality photography
    const isUnsplash = idx % 2 === 0;
    let imageUrl = "";
    if (isUnsplash) {
      const unsplashId = UNSPLASH_IDS[idx % UNSPLASH_IDS.length];
      imageUrl = `https://images.unsplash.com/photo-${unsplashId}?auto=format&fit=crop&w=${ratio.width}&h=${ratio.height}&q=80`;
    } else {
      imageUrl = `https://picsum.photos/seed/event-${idx + 1}/${ratio.width}/${ratio.height}`;
    }

    const id = crypto.randomUUID();
    const storageKey = `seed/demo-2026/${id}.jpg`;
    
    // Status distribution: 190 APPROVED, 7 PENDING, 3 REJECTED
    let status: "APPROVED" | "PENDING" | "REJECTED" = "APPROVED";
    if (idx === 193 || idx === 194 || idx === 195 || idx === 196 || idx === 197 || idx === 198 || idx === 199) {
      status = "PENDING";
    } else if (idx === 190 || idx === 191 || idx === 192) {
      status = "REJECTED";
    }

    // Stagger timestamp over last 3 days
    const minutesAgo = (TOTAL - idx) * 15; // every 15 minutes
    const createdAt = new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();

    rows.push({
      id,
      periodId: period.id,
      storageKey,
      imageUrl,
      width: ratio.width,
      height: ratio.height,
      mimeType: "image/jpeg",
      status,
      createdAt,
    });
  }

  // Insert chunk
  for (const r of rows) {
    await sql`
      insert into photos (id, period_id, storage_key, image_url, width, height, mime_type, status, created_at, moderated_at)
      values (${r.id}, ${r.periodId}, ${r.storageKey}, ${r.imageUrl}, ${r.width}, ${r.height}, ${r.mimeType}, ${r.status}, ${r.createdAt}::timestamptz, case when ${r.status} = 'APPROVED' then ${r.createdAt}::timestamptz else null end)
    `;

    // Seed some initial likes for approved photos
    if (r.status === "APPROVED") {
      const likeCount = Math.floor(Math.random() * 24);
      for (let l = 0; l < likeCount; l++) {
        const visitorId = `visitor-seed-${Math.random().toString(36).slice(2, 10)}`;
        try {
          await sql`
            insert into photo_likes (photo_id, visitor_id)
            values (${r.id}, ${visitorId})
          `;
        } catch {
          // ignore duplicate
        }
      }
    }
  }

  insertedCount += chunkCount;
  console.log(`Inserted ${insertedCount}/${TOTAL} photos...`);
}

const totalInDb = await sql`select count(*)::int as count from photos where period_id = ${period.id}`;
console.log(`\nDone! Total photos in demo-2026: ${totalInDb[0].count}`);
