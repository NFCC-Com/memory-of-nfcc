import type { IncomingMessage, ServerResponse } from "node:http";
import { app } from "./app.js";

// Vercel Node function catch-all: SATU function menangani seluruh /api/*
// dengan meneruskan request mentah ke Elysia (fetch berbasis Web Standard).
// Pola default-export instance saja tidak cukup di proyek ini — seluruh
// /api/* me-return halaman 404 platform karena tidak ada function yang
// cocok — jadi jembatan eksplisit ini yang dipakai.
export const config = { api: { bodyParser: false } };

function flatHeaders(req: IncomingMessage): [string, string][] {
  const out: [string, string][] = [];
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) out.push([key, item]);
    } else {
      out.push([key, value]);
    }
  }
  return out;
}

async function readBody(req: IncomingMessage): Promise<Buffer | undefined> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : (chunk as Buffer));
  }
  if (chunks.length > 0) return Buffer.concat(chunks);
  // Fallback: Vercel may have parsed body already (e.g. if bodyParser not fully disabled)
  const parsed = (req as unknown as { body?: unknown }).body;
  if (parsed === undefined || parsed === null) return undefined;
  if (typeof parsed === "string") return Buffer.from(parsed);
  if (Buffer.isBuffer(parsed)) return parsed;
  try {
    return Buffer.from(JSON.stringify(parsed));
  } catch {
    return undefined;
  }
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  try {
    const host =
      req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost";
    const proto = req.headers["x-forwarded-proto"] ?? "https";
    const url = `${proto}://${host}${req.url ?? "/"}`;
    const method = (req.method ?? "GET").toUpperCase();
    const body =
      method === "GET" || method === "HEAD" ? undefined : await readBody(req);
    console.error("DEBUG handler:", { method, url, body: body?.toString()?.slice(0, 200) });
    // Ensure content-type is passed for POST requests with body
    const headers = flatHeaders(req);
    const request = new Request(url, {
      method,
      headers,
      body: body ?? undefined,
    });
    console.error("DEBUG request:", { method: request.method, url: request.url, body: await request.clone().text() });
    console.error("DEBUG: calling app.fetch");
    const response = await app.fetch(request);
    console.error("DEBUG: response status:", response.status);
    res.statusCode = response.status;
    const cookies =
      typeof response.headers.getSetCookie === "function"
        ? response.headers.getSetCookie()
        : [];
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") return;
      res.setHeader(key, value);
    });
    if (cookies.length === 1) res.setHeader("set-cookie", cookies[0]);
    else if (cookies.length > 1) res.setHeader("set-cookie", cookies);
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (err) {
    console.error("API handler gagal:", err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("content-type", "application/json");
    }
    res.end(JSON.stringify({ error: "kesalahan server", detail: String(err?.message ?? err) }));
  }
}
