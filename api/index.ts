import { Elysia } from "elysia";
import { adminRoutes } from "./routes/admin.ts";
import { publicRoutes } from "./routes/public.ts";

const port = Number(process.env.PORT ?? 3001);

const app = new Elysia()
  .get("/api/health", () => ({ status: "ok" }))
  .use(publicRoutes)
  .use(adminRoutes)
  .listen(port);

console.log(`API listening on http://localhost:${app.server?.port ?? port}`);

export default app;
