# AGENTS.md — Memory Photo Wall (MVP)

Anonymous event photo sharing: scan QR → open `/p/:slug` → upload → moderated → public wall. Multi-event, reusable. MVP only — not a social platform.

## Current repo state (verified 2026-09-10)

- Bare Vite + React 19 + TS template. `src/App.tsx` is still demo content.
- **Missing:** Tailwind, shadcn/ui, Magic UI, `api/`, Elysia, Neon, R2, Sharp, `components.json`, `.env.example`. `.env` is empty.
- Scripts: `bun run dev` (vite), `bun run build` (`tsc -b && vite build`), `bun run lint` (`oxlint`). No test runner configured.
- Always inspect `package.json`, `vite.config.ts`, `src/` before changing config. Do not restructure working code to match a diagram.

## Commands

- Install/run with Bun: `bun install`, `bun run dev`, `bun run build`, `bun run lint`.
- Verify after each phase: `bun run build` (typecheck) + `bun run lint`. No tests yet — do not add a framework unprompted.
- First task only: wire Elysia + `GET /api/health` → `{"status":"ok"}`. Stop after verifying frontend + API. Do NOT add Neon/R2/auth/upload/likes/admin in that step.

## Stack — hard constraints

- Frontend: React + Vite + TS + Tailwind + shadcn/ui only. No Next.js. Magic UI only for purposeful photo/landing polish (transitions, empty/loading); shadcn for buttons/dialogs/inputs/forms/toasts/admin. Never add overlapping UI libs; plain HTML beats a new component.
- Backend: ElysiaJS on Bun + TS, Vercel-compatible (no local disk, no in-memory state, no WebSocket/workers; persist in Neon/R2).
- DB: Neon Postgres via serverless driver + parameterized SQL only. **No ORM ever** (no Drizzle/Prisma/Sequelize/TypeORM). SQL lives in `api/db/`; schema changes via numbered `api/db/migrations/*.sql`. Never interpolate user input.
- Storage: binaries in Cloudflare R2 only, never Postgres. Postgres holds metadata/status/storage_key.
- Images: Sharp server-side is authoritative. Algos: `Browser → Elysia validate → Sharp → moderate → R2 → Neon`.

## Data + API contracts

- `periods(id,name,slug,description,status,start_date,end_date,created_at,updated_at)`, status `UPCOMING|ACTIVE|CLOSED|ARCHIVED`. Public route `/p/:slug`; QR = plain link, no in-app scanner.
- `photos(id,period_id,storage_key,image_url,width,height,mime_type,status,created_at,moderated_at)`, status `PENDING|APPROVED|REJECTED`. Public APIs return `APPROVED` only, ever.
- Likes: `photo_likes(id,photo_id,visitor_id,created_at)` + `UNIQUE(photo_id,visitor_id)`. No `photo_shares` table.
- Public: `GET /api/periods/:slug`, `GET /api/periods/:slug/photos`, `GET /api/photos/:id`, `POST /api/periods/:slug/photos`, `POST|DELETE /api/photos/:id/like`.
- Admin (`/login`, `/admin` — no public nav links to these): `POST /api/admin/login|logout`, `GET /api/admin/me`, `GET|POST /api/admin/events`, `PATCH|DELETE /api/admin/events/:id`, `GET /api/admin/photos`, `PATCH|DELETE /api/admin/photos/:id`. Enforce server-session auth server-side; frontend guards are not auth.

## Security invariants (do not weaken)

- Backend validation wins; never trust filename/extension/client MIME/dims — decode with Sharp, enforce **JPEG only** + size/dimension limits. Normalize uploads to JPEG (quality 82, max edge 2048, no enlargement). Preserve aspect ratio, never stretch/crop to fit.
- Moderation: MVP is **auto-approve** via `api/services/moderation.ts` (returns approved). To require manual review, return pending there — contract unchanged, `PENDING` stays hidden from public APIs.
- Likes: server-generated secure-random `visitor_id` in HttpOnly cookie; never accept it from body; never use raw IP as identity. Basic rate-limit anonymous endpoints; no Redis for MVP.
- Admin: email/password + Argon2id + server sessions in Postgres + HttpOnly cookies. Store hashed session tokens, hashed passwords. No JWT/OAuth/public registration.
- Secrets (`DATABASE_URL`, `R2_*`, `MODERATION_API_KEY`, `SESSION_SECRET`) never in `VITE_*`, never logged/exposed. Keep `.env.example` (no real values); never commit `.env`.

## UX rules

- Public is anonymous: no register/profile/login button. Can view/upload/like/share only.
- Upload: native `<input type="file" accept="image/*" capture="environment">` + preview + feedback. No custom camera.
- Wall: responsive masonry, natural aspect ratios, photo-first. No stretched images, no forced cards, no SaaS-dashboard chrome (gradients/glass/shadows/fake stats).
- Sharing: Web Share API + copy-link fallback to `/p/:slug/photo/:id`, client-side only, no tracking.
- Admin UI stays minimal: event CRUD + status transitions + QR/URL view; photo approve/reject/delete. No analytics/charts/roles/CMS.

## Style / workflow

- Simplicity > abstraction: small functions, explicit flow, minimal deps. Before adding a dep, check native/browser APIs and existing deps first.
- Do not: generate fake data/placeholder core logic, add unrequested features/animations/screens, or rewrite working code. Implement incrementally in order: health → Neon/migrations → events → upload → R2 → Sharp → moderation → wall → likes → share → admin auth → admin UI → hardening → Vercel.
