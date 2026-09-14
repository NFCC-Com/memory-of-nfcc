# Environment Vercel: production, staging, preview

Alur branch: `fitur/*` → PR (preview) → `staging` (staging) → `main` (production).

| Tujuan   | Branch    | URL                                | DB / env            |
| -------- | --------- | ---------------------------------- | ------------------- |
| Produksi | `main`    | domain produksi                    | Neon prod, R2 prod  |
| Staging  | `staging` | `<project>-git-staging-*.vercel.app` | Neon dev, R2 dev / sama |
| Review   | PR / branch lain | `<project>-git-<branch>-*.vercel.app` | Neon dev |

## 1. Dashboard (sekali saja)

1. Vercel → project → Settings → Git → Production Branch = `main`.
2. Settings → Git → Preview Deployments: biarkan aktif untuk PR dan branch non-produksi.
3. (Opsional) Settings → Domains: pasang domain produksi ke `main`, subdomain `staging.*` ke branch `staging`.
4. Settings → Deployment Protection: pertimbangkan password/Vercel Auth untuk Preview bila arsip belum siap publik.

## 2. Env vars per environment (Settings → Environment Variables)

Jangan taruh secret di `VITE_*`, jangan commit `.env`.

| Key | Production (`main`) | Preview (`staging`, PR) |
| --- | --- | --- |
| `DATABASE_URL` | Neon branch prod | Neon branch dev |
| `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET_NAME` / `R2_PUBLIC_URL` | bucket prod | bucket dev (atau sama) |
| `MODERATION_API_KEY` | prod | dev / sama |
| `SESSION_SECRET` | random prod (beda dari staging) | random staging |
| `PORT` | tidak perlu di Vercel | tidak perlu di Vercel |

Setelah ubah env: redeploy (Vercel → Deployments → Redeploy) agar berlaku.

## 3. Cara pakai

```bash
git checkout -b fitur/xyz
# ... kerja, commit ...
git push -u origin fitur/xyz
# buka PR → dapat URL preview untuk review

git checkout staging; git merge fitur/xyz; git push origin staging
# cek di URL staging, anggap sebagai production

git checkout main; git merge staging; git push origin main
# deploy produksi jalan otomatis
```

## 4. Checklist sebelum merge ke `main`

- `bun run build` + `bun run lint` hijau.
- Buka langsung `/events` dan `/p/:slug` di URL staging (bukan dari klik) — memastikan rewrite SPA ok.
- Upload 1 foto + 1 like di staging — memastikan API + R2 + Neon staging ok.
