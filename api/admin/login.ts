import type { IncomingMessage, ServerResponse } from "node:http";
import { app } from "../app.js";

// Eksperimen isolasi: satu file subdir dengan bridge inline (tanpa modul
// bersama, tanpa config export). Bila deploy ini success dan POST login
// sampai ke Elysia, berarti file subdir boleh dipakai.
async function readBody(req: IncomingMessage): Promise<Buffer | undefined> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : (chunk as Buffer));
  }
  return chunks.length > 0 ? Buffer.concat(chunks) : undefined;
}

export default async function loginHandler(
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
    const request = new Request(url, { method, headers: req.headers as Record<string, string>, body: body ?? undefined });
    const response = await app.fetch(request);
    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
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
