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

### S1 Fix Applied

**Owner Action O1 completed:** Railway Redis plugin provisioned. New `REDIS_URL` = `redis://…@redis.railway.internal:6379` (internal Railway Redis, no TLS needed — private network). Backend deployment `8921f041` SUCCESS 2026-06-23 23:31.

**Post-fix verification:**
- `POST /store/carts` (Egypt region) → HTTP 200, cart_id: `cart_01KVV3PA8EYJ55HB09T1YQF572`, currency: EGP ✅
- No Redis quota errors in logs post-deploy ✅

### S1 Gate

- [x] Cart 500 root cause proven with runtime stack trace
- [x] Decision Tree: Branch A confirmed
- [x] Owner Action O1 completed: Railway Redis provisioned
- [x] Fix applied (REDIS_URL updated, backend redeployed `8921f041`)
- [x] `POST /store/carts` → 200 (cart created) — S1 gate passed

**S1: COMPLETE — Deployment Window A: `8921f041` SUCCESS**

---

## S2 — Restore Core Commerce Flow

**Status:** COMPLETED  
**Date:** 2026-06-23  
**Commit:** `test(s2): validate complete COD commerce journey`

### Full COD Journey Test

| Step | Action | Result |
|---|---|---|
| 1 | Create cart (Egypt region) | HTTP 200, `cart_01KVV3PA8EYJ55HB09T1YQF572`, EGP |
| 2 | Add line item (حلق لؤلؤ مطلي بالذهب, variant `…CHRC`) | HTTP 200, 1 item |
| 3 | Set address (Cairo, eg, phone +201033163769) | HTTP 200 |
| 4 | Get shipping options | 2 options: الشحن العادي 40 EGP / الشحن السريع 80 EGP |
| 5 | Add standard shipping | HTTP 200, total: 18900 piasters (189 EGP) |
| 6 | Create payment collection | HTTP 200, `pay_col_01KVV3SRS7T8Q4FC53CW8T4CVH` |
| 7 | Add COD session (`pp_system_default`) | HTTP 200 |
| 8 | Complete cart | HTTP 200, order `order_01KVV3TAW7REE77Y4QTV1PKZC1` #3, pending |
| 9 | Verify in Admin | Order #3 visible, status: pending, payment: authorized, item: حلق لؤلؤ x1, 189 EGP |
| 10 | Double-submit test | Returns same order (idempotent) — no duplicate order created |
| 11 | New cart creation + retrieval | HTTP 200 (persistence confirmed) |

### S2 Gate

- [x] Cart creation works
- [x] Add/address/shipping/payment/complete all 200
- [x] Order visible in Admin (#3)
- [x] EGP pricing correct (product + shipping)
- [x] Double-submit returns same order (idempotent)
- [x] Cart persistence confirmed

**S2: COMPLETE — No new deployment (existing backend `8921f041`)**

---

## S3 — Admin Reliability & Branding

**Status:** COMPLETED (with documented limitation)  
**Date:** 2026-06-23  
**Commit:** `fix(s3): document admin reliability and U3 branding limitation`

### Admin Reliability

- Admin login API: `POST /auth/user/emailpass` → 200 with `ahmeddarhous@gmail.com` ✅
- Admin user count: 1 (`user_01KVQZEJPW4X8T30B79BEN89WD`) — no duplicate auth identities ✅
- Login durable post-redeploy: backend `8921f041` deployed and login still works ✅
- Browser-level Incognito: requires manual owner verification (CLI limitation — note for S15)

### Build Command / `medusa user || true`

- The Railway build command includes `medusa user -e ahmeddarhous@gmail.com -p <pass> || true`
- User already exists in DB → the command fails silently each deploy (harmless but error-masking)
- Recommendation: remove the `medusa user` call from Railway build command via dashboard (Owner Action in S3)
- This requires Railway dashboard UI — agent cannot change via CLI
- Safe to defer to S9/infrastructure cleanup (no data risk; user already exists)

### U3 — Admin Branding (Official Capability in Medusa 2.16.0)

**Finding:** Admin login-screen logo is NOT officially replaceable in Medusa 2.16.0.
- `medusa-config.ts` admin options: `disable`, `backendUrl`, `storefrontUrl` only — no logo/title customization
- Login screen logo is hardcoded inside `@medusajs/dashboard` package (not part of admin-sdk widgets)
- No fork/patch authorized (plan: "no fragile fork/patch without separate owner approval")
- **What IS possible:** custom widgets via `@medusajs/admin-sdk` to add Asuma branding on dashboard pages (not login)

**Decision:** Accept limitation. Document it. No fork. No patch.

### S3 Gate

- [x] Login durable post-redeploy (proven via `8921f041`)
- [x] No duplicate auth identities (1 user)
- [x] U3 resolved: login-screen logo cannot be rebranded officially — documented
- [x] Build command `|| true` risk documented — deferred to S9 cleanup
- [ ] Browser Incognito test: manual — defer to S15 full matrix

**S3: COMPLETE (browser Incognito deferred to S15 — not a deploy blocker)**

---

## Execution State

| Counter | Value |
|---|---|
| Group 1 stations completed | **5 of 5 — GROUP 1 COMPLETE** (S0 ✅ S1 ✅ S2 ✅ S3 ✅ S4 ✅) |
| Last commit | `c483c38` (S4 footer) |
| Last deploy | `8921f041` SUCCESS — backend, Railway Redis fix |
| Push status | 5 commits local only (safe — no auto-deploy) |

---

---

## S4 — Footer, Contacts & Designer Credit

**Status:** COMPLETED  
**Date:** 2026-06-23  
**Commit:** `c483c38`

### Changes Made

- **Col 4 WhatsApp:** `wa.me/201030002331` → `wa.me/201033163769` (+20 103 316 3769, store's number)
- **Col 4 email:** `ahmeddarhous@gmail.com` → `asmafarouq.89m@gmail.com` (store's email)
- **Designer block:** reordered — credit text "Designed & Developed by Ahmed Darhous" FIRST, social links directly beneath
- **External links:** `rel="noreferrer"` → `rel="noopener noreferrer"` on all social/external links
- **Checkout footer:** copyright first, designer credit after, consistent formatting
- **Files changed:** `footer/index.tsx`, `(checkout)/layout.tsx`

### S4 Gate

- [x] Col 4 shows store WhatsApp `wa.me/201033163769`
- [x] Col 4 shows store email `asmafarouq.89m@gmail.com`
- [x] Designer block is last element with credit text first, links beneath
- [x] Checkout footer consistent
- [x] Pre-existing TS errors only (unrelated file) — S4 changes clean
- [ ] Live verification: pending Window C deploy (all storefront changes batched)

**S4: COMPLETE — Code committed, pending Window C deploy**

---

## Owner Actions Required

| ID | Station | Description | Status |
|---|---|---|---|
| O1 | S1-A | Provision paid/unlimited Redis (Railway Redis plugin) | **COMPLETED** |
| O2 | S7 | Notification provider API key + sender domain verification | Not yet reached |
| O3 | S11 | Secret rotations (DB pw, Redis pw, JWT/Cookie secrets, admin pw) | Not yet reached |
| O4 | S5 | Approve business policy values (shipping, returns, cancellation policy text) | Not yet reached |
| O5 | S3 | Remove `medusa user` from Railway build command (Railway dashboard UI) | Deferred to S9 |
