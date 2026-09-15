import type { IncomingMessage, ServerResponse } from "node:http";
import { app } from "./app.js";

// Jembatan Node <-> Elysia untuk Vercel functions. Tanpa `export const
// config` (kunci api.bodyParser membuat build gagal) dan tanpa dependensi
// selain modul app — setiap file endpoint mengimpor bridgeHandler.
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

export async function bridgeHandler(
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
    // Body HARUS lewat sebagai ArrayBuffer utuh. Konversi ke string UTF-8
    // merusak byte biner multipart (upload JPEG jadi invalid di Sharp), dan
    // checker per-file Vercel menolak Uint8Array generik sebagai BodyInit.
    const bodyBuffer: ArrayBuffer | undefined = body
      ? (body.buffer.slice(
          body.byteOffset,
          body.byteOffset + body.byteLength,
        ) as ArrayBuffer)
      : undefined;
    const request = new Request(url, {
      method,
      headers: flatHeaders(req),
      body: bodyBuffer ?? undefined,
    });
    const response = await app.fetch(request);
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
    res.end(JSON.stringify({ error: "kesalahan server" }));
  }
}

export default bridgeHandler;
