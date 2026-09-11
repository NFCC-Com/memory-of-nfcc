const hits = new Map<string, number[]>();

/**
 * Rate limit sederhana per instance (cukup untuk MVP).
 * Catatan: tidak shared antar serverless instance di Vercel —
 * bila abuse jadi masalah, pindah ke tabel Postgres.
 */
export function isAllowed(key: string, limit: number, windowMs = 60_000): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  const list = (hits.get(key) ?? []).filter((t) => t > windowStart);
  if (list.length >= limit) {
    hits.set(key, list);
    return false;
  }
  list.push(now);
  hits.set(key, list);
  if (hits.size > 10_000) hits.clear();
  return true;
}
