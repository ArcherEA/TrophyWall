# Deployment

Trophy Wall runs as **five pieces**: the API server, the sync worker, Postgres, Redis, and the static frontend.

- **Backend (API + worker + Postgres + Redis)** → **Render**, via [`render.yaml`](render.yaml) (auto-deploys on push to `main`).
- **Frontend (static SPA)** → **Vercel** (auto-deploys on push to `main`).

The code and config here are ready; the steps below are the one-time account/secret setup you do in each dashboard.

---

## 1. Backend on Render

1. Push this repo to GitHub (branch protection recommended — see §4).
2. Render dashboard → **New → Blueprint** → connect this repo. Render reads `render.yaml` and creates:
   - `trophywall-db` (Postgres)
   - `trophywall-redis` (Key Value / Redis)
   - `trophywall-api` (web service)
   - `trophywall-worker` (background worker)
3. When prompted, set the secrets marked `sync: false`:
   - **`STEAM_API_KEY`** — your key from <https://steamcommunity.com/dev/apikey> (on **both** the api and worker services).
   - **`CORS_ORIGIN`** — leave blank for now; set it after the frontend is deployed (step 3 below).
4. Deploy. On each deploy the API runs `prisma migrate deploy` (preDeploy) so the schema is applied automatically. `DATABASE_URL` and `REDIS_URL` are wired from the managed services by the blueprint.
5. Note the API URL, e.g. `https://trophywall-api.onrender.com`.

**Free-tier caveats:** free Postgres is deleted after 30 days; free web services cold-start after inactivity (first request is slow). Upgrade plans for anything real.

---

## 2. Frontend on Vercel

1. Vercel dashboard → **Add New → Project** → import this repo.
2. Set **Root Directory** = `frontend`. Vercel auto-detects Vite (build `pnpm build`, output `dist`).
3. Add env var **`VITE_API_URL`** = `https://trophywall-api.onrender.com/api` (your Render API URL + `/api`).
   - Vite inlines this at **build time**, so a change requires a redeploy.
4. Deploy. Note the URL, e.g. `https://trophywall.vercel.app`.

---

## 3. Wire CORS

Back in Render → `trophywall-api` → Environment → set **`CORS_ORIGIN`** to the Vercel URL (e.g. `https://trophywall.vercel.app`). Redeploy. The API restricts cross-origin requests to that origin (comma-separate for multiple).

---

## 4. Branch protection (makes CI a real gate)

GitHub → repo **Settings → Branches → Add rule** for `main`:

- Require a pull request before merging.
- Require status checks to pass → select **Backend** and **Frontend** (the CI jobs).

Now nothing merges to `main` unless CI is green, and both hosts auto-deploy from `main`.

---

## Continuous deployment (how it flows)

```
push / merge to main
   ├─ GitHub Actions CI (lint + test + build) — must pass
   ├─ Render  → rebuild api + worker, run prisma migrate deploy, restart
   └─ Vercel  → rebuild + publish the frontend
```

No separate deploy workflow needed — Render and Vercel each watch `main`.

---

## Environment variables reference

| Var                  | Where                | Notes                                          |
| -------------------- | -------------------- | ---------------------------------------------- |
| `DATABASE_URL`       | api, worker          | wired from Render Postgres                     |
| `REDIS_URL`          | api, worker          | wired from Render Key Value                    |
| `STEAM_API_KEY`      | api, worker (secret) | steamcommunity.com/dev/apikey                  |
| `STEAM_API_BASE_URL` | api, worker          | `https://api.steampowered.com`                 |
| `CORS_ORIGIN`        | api                  | the Vercel frontend URL (comma-sep for many)   |
| `NODE_ENV`           | api, worker          | `production` (enables JSON logs)               |
| `PORT`               | api                  | provided by Render automatically               |
| `VITE_API_URL`       | Vercel (frontend)    | Render API URL + `/api`; inlined at build time |
