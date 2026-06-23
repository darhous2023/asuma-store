# Asuma Store — Operations Runbooks

> Quick-reference operational guides. See `docs/MASTER_EXECUTION_PLAN.md` for full architecture context.

---

## RB-1: Run Smoke Tests

**When:** after any deploy; before declaring a release ready; after incident recovery.

```bash
node scripts/smoke-test.js
# or with custom URLs:
node scripts/smoke-test.js https://asuma-backend-production.up.railway.app https://asuma-storefront-production.up.railway.app
```

Expected: `SMOKE TEST PASSED` — all green. Any failure is a deployment blocker.

---

## RB-2: Manual Deploy

Railway GitHub webhook is unreliable. Always deploy manually:

```bash
# Backend (after backend code or env var change):
railway deployment up --service asuma-backend

# Storefront (after storefront code change):
railway deployment up --service asuma-storefront
```

**After deploy:** wait for Railway to show SUCCESS, then run smoke tests.

---

## RB-3: Rollback

**Rollback storefront or backend to a previous deployment:**

1. Railway dashboard → project → service → Deployments tab
2. Find the last known-good deployment → click "Redeploy"
3. Wait for SUCCESS
4. Run smoke tests to confirm

**Rollback via git (code only, still requires deploy):**
```bash
git log --oneline        # find the target commit
git checkout <commit>    # or create a revert commit
railway deployment up --service <svc>
```

**Emergency: rollback to pre-execution checkpoint:**
```bash
git checkout pre-final-execution-checkpoint-2026-06-23
# review + apply changes as needed, then deploy
```

---

## RB-4: Redis Replacement

**Symptom:** Cart creation fails with `unknown_error`; backend logs show `ERR max requests limit exceeded` or `ECONNREFUSED`.

**Current Redis:** Railway internal plugin — `redis://...@redis.railway.internal:6379`

**If Railway Redis fails:**
1. Railway dashboard → project → Redis service → check health
2. If down: Railway → New Service → Database → Redis (provision new)
3. Copy new `REDIS_URL`
4. Railway → asuma-backend → Variables → update `REDIS_URL`
5. Deploy backend: `railway deployment up --service asuma-backend`
6. Test: `POST /store/carts` → should return 200

**Fallback option (Upstash pay-as-you-go):**
1. Create account at upstash.com → new Redis → enable pay-as-you-go
2. Copy `rediss://...` URL
3. Update `REDIS_URL` in Railway backend variables
4. Deploy + smoke test

---

## RB-5: Admin Recovery

**Symptom:** Cannot log in to admin panel.

**Step 1 — Verify API works:**
```bash
curl -X POST https://asuma-backend-production.up.railway.app/auth/user/emailpass \
  -H "Content-Type: application/json" \
  -d '{"email":"ahmeddarhous@gmail.com","password":"<current-password>"}'
```
If 200 → admin API works but browser issue. Clear cookies and retry Incognito.

**Step 2 — If API returns 401:**
Admin user exists (ID: `user_01KVQZEJPW4X8T30B79BEN89WD`). The password may have changed.
Try any recently rotated passwords.

**Step 3 — Reset password (Railway CLI, requires DB access):**
```bash
# Run from project root
railway run --service asuma-backend -- npx medusa user -e ahmeddarhous@gmail.com -p <new-password>
```

**Step 4 — If backend is unreachable:**
Follow RB-2 (deploy) and RB-4 (Redis check) first.

---

## RB-6: Database Backup & Restore

**Supabase automatic backups:** enabled on all projects (PITR on paid plans).

**View backups:**
Supabase dashboard → project → Database → Backups

**Manual backup (before any migration or secret rotation):**
Supabase → Database → Backups → "Create backup" button

**Restore:**
1. Supabase → Backups → select backup → Restore
2. This restores the full DB — all orders, products, customers, sessions
3. After restore: redeploy backend (sessions invalidated, Redis cleared)
4. Run smoke tests

---

## RB-7: Redis Usage Monitoring

**Check Railway Redis usage:**
Railway dashboard → project → Redis service → Metrics tab

**Signs of approaching limits (if not on Railway Redis):**
- Backend logs: `ERR max requests limit exceeded`
- Cart creation → 500

**Normal Redis usage:** BullMQ polls constantly (workflow-engine + event-bus). Expected: ~50-150k requests/day on Railway (no limit). Upstash free tier exhausts in ~3-5 days.

---

## RB-8: Incident Response Checklist

When the store is down or orders are failing:

1. **Check Railway:** both services healthy? Last deployment SUCCESS?
2. **Check Redis:** Redis service up? Logs show quota errors?
3. **Check Supabase:** dashboard → project → status → no outage?
4. **Run smoke test:** `node scripts/smoke-test.js` — which check fails?
5. **Read backend logs:** `railway logs --service asuma-backend --tail 100`
6. **Read storefront logs:** `railway logs --service asuma-storefront --tail 50`
7. **Rollback** if latest deploy is suspected cause (RB-3)
8. **Notify owner** with: what failed, when it started, current action

---

## RB-9: Adding/Updating Environment Variables

**Never commit secrets to git.**

```bash
# View current variables (names only — never print values)
railway variables --service asuma-backend
railway variables --service asuma-storefront

# Set a variable (Railway dashboard recommended for secrets)
# Dashboard: project → service → Variables → + New Variable
```

**After changing any variable:** deploy the affected service (RB-2) and run smoke tests (RB-1).

**Critical variable cross-reference:**

| Variable | Service | Purpose |
|---|---|---|
| `DATABASE_URL` | backend | Supabase Postgres (Session Pooler, SSL) |
| `REDIS_URL` | backend | Railway Redis internal |
| `JWT_SECRET` | backend | Token signing |
| `COOKIE_SECRET` | backend | Cookie signing |
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | storefront | Backend URL |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | storefront | Storefront API key |
| `NEXT_PUBLIC_BASE_URL` | storefront | Canonical base URL |
| `RESEND_API_KEY` | backend | Order notification emails (O2) |
| `NOTIFICATION_ADMIN_EMAIL` | backend | Where admin order alerts go |
| `NOTIFICATION_FROM_EMAIL` | backend | Sender address for emails |

---

## RB-10: Gate 12 — Secret Rotation (Pre-Launch)

> **Do this once, just before public launch. Each step individually.**

Order: JWT → Cookie → Redis password → DB password → Admin password → remove MEDUSA_ADMIN_PASS + S3 vars.

1. **JWT_SECRET:** generate 64-char random → update Railway backend → deploy → verify login works
2. **COOKIE_SECRET:** same → deploy → re-login (sessions invalidated, expected)
3. **Redis password:** Railway Redis → reset credentials → update `REDIS_URL` in backend → deploy → `POST /store/carts` → 200
4. **DB password:** Supabase → Database → Settings → reset password → update `DATABASE_URL` in backend → deploy → `/health` 200
5. **Admin password:** `railway run -- npx medusa user -e ahmeddarhous@gmail.com -p <new>` → verify login
6. **Remove vars:** `MEDUSA_ADMIN_PASS`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_REGION`, `BUILD_TRIGGER_S3` from backend; `BUILD_TRIGGER` from storefront
7. **Final smoke test:** `node scripts/smoke-test.js`
