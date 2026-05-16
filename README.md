# DukorPay

**Project root (canonical):** `~/Documents/dukorpay`

Mobile-first remittance super-app: **U.S. → Liberia** corridor. Monorepo with **React Native (Expo)**, **Node/Express API**, **PostgreSQL**, **React admin**, and hooks for **Reloadly**, **BaaS**, and **KYC** vendors.

## Structure

| Package | Description |
|--------|-------------|
| `apps/api` | Express REST API, Prisma schema (Phases 1–5), compliance stubs |
| `apps/mobile` | Expo app — onboarding → send money → airtime → tabs |
| `apps/admin` | Vite/React operations dashboard |

## Prerequisites

- Node 20+
- Docker (for local Postgres + Redis) — optional if you use your own DB

## Quick start

```bash
cd ~/Documents/dukorpay
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
# Login as API user with AdminProfile — paste JWT in localStorage key dukorpay_admin_token
```

**Deploy admin to Vercel (CLI, from repo root):**

```bash
cd ~/Documents/dukorpay
vercel login
vercel teams ls
npm run admin:vercel:link
npm run admin:vercel
```

During `vercel link`, pick your team and project (e.g. `dukorpay`). Set **`VITE_API_URL`** in the Vercel project settings to your API base URL.

**Git-connected deploys:** Use **Root Directory** either `.` (repo root; uses root `vercel.json` and `apps/admin/dist`) or `apps/admin` (uses `apps/admin/vercel.json`, which runs `npm install` from the monorepo root). Either way, pushes to **`main`** should trigger a new Production build—if the live site still shows old copy, the last deploy failed or Git was not connected; check the **Deployments** tab in Vercel.

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

- `POST /auth/register` | `POST /auth/login` | `POST /auth/verify-otp` (dev code `123456`)  
- `GET /quotes/remittance` | `GET /quotes/airtime`  
- `POST /transactions/remittance` | `airtime` | `combo`  
- `GET /admin/*` — requires `AdminProfile` on user  

## License

Proprietary — Bridgewest / DukorPay.
