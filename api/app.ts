import { Elysia } from "elysia";
import { adminRoutes } from "./routes/admin.js";
import { publicRoutes } from "./routes/public.js";

// Modul bersama: dipakai Bun lokal (api/index.ts) dan Vercel
// (api/[[...route]].ts). Jangan listen di sini — Vercel mengeksekusi
// sebagai serverless function dan hanya memakai default export.
export const app = new Elysia()
  .get("/api/health", () => ({ status: "ok", v: 2 }))
  .use(publicRoutes)
  .use(adminRoutes);

export default app;
