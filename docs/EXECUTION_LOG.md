# Asuma Store — Execution Log

> Single source of execution truth. Updated after every station. See `MASTER_EXECUTION_PLAN.md` for the full plan.

---

## Session: 2026-06-23

---

## S0 — Freeze, Baseline & Safety

**Status:** COMPLETED  
**Date:** 2026-06-23  
**Commit:** `docs(s0): capture execution baseline and verification evidence` (see hash below after commit)

### Baseline Snapshot

| Item | Value |
|---|---|
| Branch | `main` |
| Pre-execution checkpoint tag | `pre-final-execution-checkpoint-2026-06-23` → commit `04b6a0b` |
| Current HEAD (after plan patch) | `58df45b` — `docs(plan): protect design archive and tighten execution deploy strategy` |
| Working tree | clean |
| Commits ahead of origin/main | 2 (plan commits, not pushed — no auto-deploy) |

### Live Service State

| Service | URL | Health | Last Deployment |
|---|---|---|---|
| Backend | `asuma-backend-production.up.railway.app` | `GET /health` → 200 OK | `daa73749` SUCCESS 2026-06-23 21:42:55 |
| Storefront | `asuma-storefront-production.up.railway.app` | `GET /eg` → 200 | `2f7b2060` SUCCESS 2026-06-23 19:11:38 |

### Published Products

- 25 products published (confirmed: `GET /store/products?limit=1` → `count: 25`)
- Sample product: "حلق لؤلؤ مطلي بالذهب"
- Publishable key: `pk_25df426…` (Railway `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`)

### Backend Variable Inventory

**Present variables (names only):**
`ADMIN_CORS`, `AUTH_CORS`, `BUILD_TRIGGER_S3`, `COOKIE_SECRET`, `DATABASE_URL`, `JWT_SECRET`, `MEDUSA_ADMIN_BACKEND_URL`, `MEDUSA_ADMIN_PASS`, `MEDUSA_FF_CACHING=true`, `MEDUSA_WORKER_MODE=shared`, `NODE_ENV=production`, `RAILWAY_*` (8 auto-vars), `REDIS_URL`, `S3_ACCESS_KEY_ID`, `S3_BUCKET`, `S3_REGION`, `S3_SECRET_ACCESS_KEY`, `STORE_CORS`

**Orphans to remove in S9:** `S3_ACCESS_KEY_ID`, `S3_BUCKET`, `S3_REGION`, `S3_SECRET_ACCESS_KEY`, `BUILD_TRIGGER_S3`, `MEDUSA_ADMIN_PASS`

**Storefront variables:** `BUILD_TRIGGER=2`, `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_DEFAULT_REGION`, `NEXT_PUBLIC_MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`, `NEXT_TELEMETRY_DISABLED=1`, `NODE_ENV=production`, `RAILWAY_*` (8 auto-vars), `REDIS_URL` *(unexpected — storefront should not need Redis directly)*

**Orphans to remove in S9:** `BUILD_TRIGGER`

**Note:** Storefront has `REDIS_URL` set — needs investigation in S9 (likely leftover from a template; storefront is Next.js and should not use Redis directly).

### S0 Gate

- [x] Checkpoint tag `pre-final-execution-checkpoint-2026-06-23` verified (annotated, points to `04b6a0b`)
- [x] Backend health 200
- [x] Storefront 200
- [x] 25 products published
- [x] Variable inventory captured (names, no values)
- [x] No code changes made
- [x] Backup required: YES before any migration (S1-E) or secret rotation (S11). Supabase PITR enabled by default on paid plan — owner must confirm or trigger a manual snapshot before S11.

**S0: COMPLETE**

---

## S1 — Diagnose & Fix Critical Failures

**Status:** DIAGNOSIS COMPLETE — BLOCKED ON OWNER ACTION (billing)  
**Date:** 2026-06-23

### Cart 500 Diagnosis (U1) — CONFIRMED

**Test:** `POST /store/carts` with `region_id=reg_01KVR04F83AG96VAKHB2A3DZ9H` and publishable key  
**Result:** HTTP 500 `{"code":"unknown_error","type":"unknown_error","message":"An unknown error occurred."}`  
**Reproducible:** Yes (2/2 in this session)

**Runtime log evidence (extracted from `railway logs --service asuma-backend`):**

```
ReplyError: ERR max requests limit exceeded. Limit: 500000, Usage: 500006.
  at createCartWorkflow → create-cart → create-carts
  (node_modules/@medusajs/core-flows/dist/cart/workflows/create-carts.js)
```

**Decision Tree: Branch A confirmed — Upstash Redis free tier exhausted (again)**

- Limit: 500,000 requests/month
- Current usage: 500,006 (6 over limit)
- Cause: BullMQ `workflow-engine-redis` + `RedisEventBusService:events-queue` poll Redis multiple times per second, draining the free tier within days of account creation
- Path: `POST /store/carts` → `createCartWorkflow` → workflow-engine-redis (BullMQ `evalsha`) → Redis quota exceeded → `unknown_error`
- This is the SECOND Upstash free-tier account to be exhausted (same pattern as prior session)

**Conclusion: Free-tier Redis is not viable for production Medusa 2.x with BullMQ.**

### Admin Login (U2)

- Direct API auth chain confirmed working (per session summary C3)
- Browser-level re-verification: pending (will test in S3 context after Redis is fixed)
- Admin auth attempt with `admin@asuma.store` failed — email may differ; not a blocker for S0/S1 diagnosis

### Required Fix: Redis Replacement

**Decision Tree A — Redis upgrade required. Two options:**

| Option | Description | Cost | What owner must do |
|---|---|---|---|
| **A1 — Upstash Pay-As-You-Go** | Enable pay-as-you-go on current/new Upstash account | ~$0.20 per 100k requests; ~$5–20/mo estimated for Medusa BullMQ polling | Upstash dashboard → upgrade to pay-as-you-go → provide new `REDIS_URL` (or confirm same URL is now unlimited) |
| **A2 — Railway Redis Plugin** | Add Redis plugin from Railway's service catalog | Included in Railway Hobby ($5/mo) or Pro plans; variable size | Railway project → New Service → Database → Redis → copy `REDIS_URL` to backend service |

**Recommendation: A2 (Railway Redis)** — managed by Railway, persistent, no per-request quota, already in the same project. Simpler operations.

### OWNER ACTION REQUIRED — O1 (S1-A)

> **Billing/provisioning required — agent cannot proceed without this.**

Choose one option:

**Option A2 (Recommended):** In Railway dashboard → your project → `+ New Service` → `Database` → `Redis` → connect it → copy the generated `REDIS_URL` value → update `REDIS_URL` in the backend service variables.

**Option A1:** In Upstash console → your Redis → upgrade from free to pay-as-you-go (or create a new database with pay-as-you-go enabled) → the `REDIS_URL` stays the same OR provide the new URL.

**After owner action:** Agent will update `REDIS_URL` in Railway backend variables (if A2), redeploy backend, and retest `POST /store/carts`.

### S1 Gate

- [x] Cart 500 root cause proven with runtime stack trace
- [x] Decision Tree: Branch A confirmed
- [ ] **BLOCKED:** Redis replacement requires owner billing action
- [ ] Fix applied (waiting for owner action)
- [ ] `POST /store/carts` → 201 (waiting for fix)

**S1: DIAGNOSIS COMPLETE — WAITING ON OWNER ACTION O1**

---

## Execution State

| Counter | Value |
|---|---|
| Group 1 stations completed | 1 of 5 (S0 only; S1 in progress, blocked) |
| Group 1 blocked on | Owner Action O1 (Redis billing/provisioning) |
| Last commit | `58df45b` (plan patch) |
| Last deploy | None in this session |
| Push status | 2 commits local only (safe — no auto-deploy) |

---

## Owner Actions Required

| ID | Station | Description | Status |
|---|---|---|---|
| O1 | S1-A | Provision paid/unlimited Redis (Railway Redis plugin recommended) and provide `REDIS_URL` | **PENDING** |
| O2 | S7 | Notification provider API key + sender domain verification | Not yet reached |
| O3 | S11 | Secret rotations (DB pw, Redis pw, JWT/Cookie secrets, admin pw) | Not yet reached |
| O4 | S5 | Approve business policy values (shipping, returns, cancellation policy text) | Not yet reached |
