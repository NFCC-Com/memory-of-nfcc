import { Elysia } from "elysia";
import { adminRoutes } from "./routes/admin.js";
import { publicRoutes } from "./routes/public.js";

const port = Number(process.env.PORT ?? 3001);

const app = new Elysia()
  .get("/api/health", () => ({ status: "ok" }))
  .use(publicRoutes)
  .use(adminRoutes);

// Vercel mengeksekusi file ini sebagai serverless function (VERCEL=1):
// jangan bind port di sana, cukup export app sebagai handler (pola resmi Elysia x Vercel).
if (!process.env.VERCEL) {
  app.listen(port);
  console.log(`API listening on http://localhost:${app.server?.port ?? port}`);
}

export default app;
