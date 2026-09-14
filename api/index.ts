import { app } from "./app.js";

const port = Number(process.env.PORT ?? 3001);

// Bun lokal (`bun run dev:api`): bind port.
// Vercel mengeksekusi file ini sebagai serverless function (VERCEL=1):
// jangan bind port di sana, cukup export app sebagai handler.
if (!process.env.VERCEL) {
  app.listen(port);
  console.log(`API listening on http://localhost:${app.server?.port ?? port}`);
}

export default app;
