# Rapid

**Project root (canonical):** `~/Documents/rapid`

Mobile-first remittance super-app: **U.S. → Liberia** corridor. Monorepo with **React Native (Expo)**, **Node/Express API**, **PostgreSQL**, **React admin**, and hooks for **Reloadly**, **BaaS**, and **KYC** vendors.

## Structure

| Package | Description |
|--------|-------------|
| `apps/api` | Express REST API, Prisma schema (Phases 1–5), optional **Supabase** Postgres + Auth, compliance stubs |
| `apps/mobile` | Expo app — onboarding → send money → airtime → tabs |
| `apps/admin` | Vite/React operations dashboard |

## Prerequisites

- Node 20+
- Docker (for local Postgres + Redis) — optional if you use your own DB

## Supabase (hosted Postgres + Auth)

The API uses **Prisma** against any Postgres. Point `DATABASE_URL` at your Supabase database (pooler URL is fine for the Node server). Optionally enable **Supabase Auth** so `/auth/register` and `/auth/login` issue **Supabase access tokens**; `requireAuth` accepts those JWTs when `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are all set in [apps/api/.env.example](apps/api/.env.example). If they are unset, the API keeps the previous **HS256** `JWT_SECRET` behavior for local development.

1. Create a project at [supabase.com](https://supabase.com/dashboard).
2. **Settings → Database** — copy the Postgres URI. Prefer the **connection pooler** string for `DATABASE_URL` in production.
3. **Settings → API** — copy **Project URL**, **anon public**, and **service_role** (server-only; never ship to the mobile app or admin static bundle).
4. Paste into `apps/api/.env` (see `.env.example`).
5. From `apps/api`, run **`npx prisma db push`** (or `prisma migrate deploy`) against that database so the `User.supabaseUserId` column and rest of the schema exist.
6. **`npm run db:seed -w apps/api`** — seeds the admin user and, when Supabase env is present, links them to **Supabase Auth**.

**Security:** do not expose `SUPABASE_SERVICE_ROLE_KEY` to clients. If you turn on **Row Level Security** for tables exposed through Supabase Data API, add policies explicitly; this Express API connects as the database role from `DATABASE_URL` and does not use PostgREST for app queries.

## Quick start

```bash
cd ~/Documents/rapid
docker compose up -d
npm install
cp apps/api/.env.example apps/api/.env
cd apps/api && npx prisma migrate dev --name init && npm run db:seed && cd ../..
npm run api:dev
```

**Mobile:** use a real device or emulator; set `apps/mobile/app.json` → `expo.extra.apiUrl` to your machine LAN IP (not `localhost` on device).

```bash
cd apps/mobile && npm install && npx expo start
```

**Admin:**

```bash
cd apps/admin && npm install && npm run dev
# Login as API user with AdminProfile — paste JWT in localStorage key rapid_admin_token
```

**Deploy admin to Vercel (CLI, from repo root):**

```bash
cd ~/Documents/rapid
vercel login
vercel teams ls
npm run admin:vercel:link
npm run admin:vercel
```

During `vercel link`, pick your team and project (e.g. `rapid`). Set **`VITE_API_URL`** in the Vercel project settings to your API base URL.

**Git-connected deploys:** Use **Root Directory** either `.` (repo root; uses root `vercel.json` and `apps/admin/dist`) or `apps/admin` (uses `apps/admin/vercel.json`, which runs `npm ci` from the monorepo root). Either way, pushes to **`main`** should trigger a new Production build—if the live site still shows old copy, the last deploy failed or Git was not connected; check the **Deployments** tab in Vercel.

### If Vercel shows no new deployment after `git push`

1. **Git** — In Vercel → **Settings → Git**, confirm the repo is **bridgewest/rapid** and the **Production branch** is `main`. Re-connect GitHub if the integration was revoked.
2. **Monorepo “skip”** — Vercel can [skip builds for unchanged workspace apps](https://vercel.com/docs/monorepos#skipping-unaffected-projects). If you expect **every** push to redeploy the admin app (even when only `apps/mobile` or `apps/api` changed), open **Settings → Build & Deployment → Root Directory** and **disable “Skip deployments”** for that project (wording may be “Skip unaffected projects”).
3. **Root Directory** — If Root Directory is **`apps/admin`**, enable **“Include files outside the root directory in the Build Step”** when your install runs `cd ../.. && npm ci` (so the lockfile at the repo root is visible). If Root Directory is **`.`** (empty), root `vercel.json` must **not** set `framework: "vite"` (Vite lives under `apps/admin` only).
4. **Failed builds** — Open the latest row under **Deployments**; a red build still leaves the previous Production deploy live. Fix the error in the build log (common: `npm ci` lockfile mismatch, wrong **Output Directory**).

### If production still looks old (stale bundle)

Quick check: the browser tab title should be **Rapid — Operations Console** (see [apps/admin/index.html](apps/admin/index.html)). If you still see **Rapid Admin** or markdown text like “Wire your admin JWT”, Production is an old deploy.

1. **Vercel → Project → Settings → Domains** — confirm `rapid.vercel.app` is attached to this project (not another team/project).
2. **Settings → Git** — connect **bridgewest/rapid**, production branch **main**.
3. **Settings → General → Root Directory** — set to **`.`** *or* **`apps/admin`** to match one of the `vercel.json` layouts above. Do not leave a third path.
4. **Settings → General → Build & Development Settings** — if **Override** is enabled for Install, Build, or Output Directory, either align them with the chosen `vercel.json` or **turn overrides off** so the repo config is used.
5. **Deployments** — open the latest **Production** row: confirm it shows a recent **Git** commit (not only “Redeploy” of an old CLI build). Open the build log and fix errors until exit code **0**.
6. After a good deploy, **View page source** and look for `<meta name="rapid-build" content="…">` — it should match the short Git SHA of that deployment. The sidebar also shows **Build** with the same id.

## Product phases (schema)

- **Phase 1:** `REMITTANCE` — USD→LRD, 1.5% fee, BaaS placeholder  
- **Phase 2:** `AIRTIME` — Reloadly + margin + $0.75 flat  
- **Phase 3:** `BILL_PAY` — Reloadly bill pay (routes stubbed in architecture)  
- **Phase 4:** `PARTNER_ORDER` — `PartnerMerchant` model  
- **Phase 5:** `SAVINGS_*` — ledger-ready `Wallet` + transaction kinds  

`Transaction.transactionGroupId` + `parentTransaction` support **combo** sends.

## Compliance (stubs)

- Audit logging middleware pattern in `audit.ts`  
- AML flags at $3,000+  
- OFAC/sanctions stub in `services/compliance.ts` — replace with vendor  
- Limits on `UserProfile` (tier can tighten in application logic)

## API highlights

- `POST /auth/register` | `POST /auth/login` | `POST /auth/verify-otp` (dev code `123456`) — with Supabase env set, responses use **Supabase access tokens**; otherwise legacy JWT from `JWT_SECRET`  
- `GET /quotes/remittance` | `GET /quotes/airtime`  
- `POST /transactions/remittance` | `airtime` | `combo`  
- `GET /admin/*` — requires `AdminProfile` on user  

## License

Proprietary — Bridgewest / Rapid.
