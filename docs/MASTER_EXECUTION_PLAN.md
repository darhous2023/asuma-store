# Asuma Store — MASTER EXECUTION PLAN (Canonical)

> **This is the single source of truth for production execution.** It supersedes
> `PLAN.md` (the historical phased roadmap) for all implementation work.
> Do not create alternate copies (`plan-final.md`, `revised-plan.md`, etc.).

- **Plan revision date:** 2026-06-23
- **Status:** EXECUTION-IN-PROGRESS. Plan patched 2026-06-23: design-lab protected, Storefront deploy target 1–2, EXECUTION CONTROL PROTOCOL added.
- **Author of execution:** Claude Code (agent), under owner Ahmed Darhous.

---

## 0. CURRENT-STATE CHECKPOINT (pre-implementation)

| Item | Value |
|---|---|
| Repo (local) | `C:\Users\ahmed\Desktop\asuma-store` |
| Repo (remote) | `https://github.com/darhous2023/asuma-store` |
| Branch | `main` |
| Last commit before execution | `b2f0969` — *feat(storefront): Golden Noir styling for account, order, and 404 pages* |
| Working tree | clean (no uncommitted changes prior to this plan commit) |
| Last known **backend** deployment | `daa73749-db36-4936-b3ce-bc8b26ef89ab` — SUCCESS — 2026-06-23 21:42:55 +03:00 |
| Last known **storefront** deployment | `2f7b2060-eb09-4140-8472-39902547fb1e` — SUCCESS — 2026-06-23 19:11:38 +03:00 |
| Backend health | `GET /health` → 200 |
| Storefront | `/eg` → 200 |
| Checkpoint tag | `pre-final-execution-checkpoint-2026-06-23` (created on the plan commit) |
| Rollback point | reset/checkout to the checkpoint tag restores this exact state |

**Live infra (for reference, no secrets):** Backend `asuma-backend-production.up.railway.app` (:8080);
Storefront `asuma-storefront-production.up.railway.app`; Supabase PostgreSQL; Upstash Redis (`rediss://`,
4 modules: cache / event-bus / workflow-engine / locking); Supabase Storage (direct upload, no file-s3 module);
COD only; EGP; Arabic/English with RTL/LTR.

---

## 1. Planning Assumptions

### Confirmed (evidence in hand)
- **C1** Backend `/health` = 200; storefront `/eg` = 200.
- **C2** Store **read** APIs work with publishable key: regions, 25 published products, categories, collections, payment-providers all 200.
- **C3** Admin auth chain works **via direct API now**: `POST /auth/user/emailpass` → 200 (token) → `GET /admin/users/me` Bearer → 200 (`user_01KVQZEJPW4X8T30B79BEN89WD`).
- **C4** **`POST /store/carts` = 500 `unknown_error`, reproducible (2/2).** Hard blocker.
- **C5** CORS scoped correctly (no wildcards); same-origin admin returns correct ACAO + credentials.
- **C6** Footer "تواصل معنا" shows the **designer's** WhatsApp `201030002331` + email `ahmeddarhous@gmail.com`, not the store's.
- **C7** 5 footer `/content/*` links → 404; no `content/` route exists.
- **C8** Checkout review text says "Medusa Store's Privacy Policy" (`review/index.tsx:45`).
- **C9** No `admin` config key in `medusa-config.ts`; `apps/backend/src/admin/` holds only stubs; `@medusajs/admin-sdk@2.16.0` installed.
- **C10** No notification provider in backend deps (no order emails).
- **C11** `localhost:7001` in `onboarding.ts` and `product-onboarding-cta`.
- **C12** No `.env` tracked in git (only `.env.template`); no secrets in source.
- **C13** `next.config.js`: `images.unoptimized = true`; Supabase hostname allowlisted.
- **C14** Orphan Railway vars: `S3_*` (module removed), `MEDUSA_ADMIN_PASS`, `BUILD_TRIGGER` / `BUILD_TRIGGER_S3`.
- **C15** No product search UI exists anywhere in the storefront.

### NOT confirmed — must be proven during execution
- **U1** Root cause of Cart 500. Redis/workflow-engine is the *leading* hypothesis (cart creation runs `createCartWorkflow`, and `workflow-engine-redis` persists state to Redis every workflow). **No runtime stack trace captured yet.** Could also be region/sales-channel link, pricing/tax step, publishable-key→channel resolution, DB constraint, migration drift, or a Medusa bug. **No Redis/Variable/paid change before a runtime log proves cause.**
- **U2** Whether admin login is durably fixed at the **browser** level on the current deployment (works via API; refresh-loop symptom last seen before the new Redis). Must re-test in a clean browser before declaring resolved. May share a root cause with U1.
- **U3** Whether Medusa 2.16.0 officially supports rebranding the **login screen** logo / "Welcome to Medusa". Widgets/UI-routes are official + update-safe; full login rebrand may need a fork. Resolve against installed-version docs/source before choosing — no invented API.
- **U4** Exact Upstash request count on the new account (need owner dashboard / API key).
- **U5** Whether the publishable key is linked to the sales channel owning the 25 products.

### Contradictions to resolve
- **X1** Reads succeed but cart write fails → points specifically at the workflow path, to be confirmed not assumed.
- **X2** Admin login marked "resolved" in audit but unproven at browser level → treated here as **unproven**.

---

## 2. Final Definition of Done

**Commerce**
1. Real customer completes home → product → add to cart → Egypt address → shipping → COD → place order → confirmation, zero 500s.
2. `POST /store/carts` → 201; full cart lifecycle works.
3. Order persists in DB and appears in Admin.
4. Shipping + EGP prices render for Egypt.
5. Double-click place-order → single order.
6. Cart survives refresh + new-session reopen.

**Admin**
7. Login works in clean browser; survives logout/login, Incognito, **and a backend redeploy**.
8. Admin user not recreated unsafely each build; auth errors not silently swallowed.
9. Asuma identity applied to the max the **official, update-safe** method allows; any limitation documented.

**Content & links**
10. Zero user-visible dead links. Every link = Working / Intentionally-external / removed from UI.
11. Footer "تواصل معنا" shows **store** WhatsApp `01033163769` (`wa.me/201033163769`) + email `asmafarouq.89m@gmail.com`.
12. Designer block is the **last** footer element: `Designed & Developed by Ahmed Darhous` with designer links directly beneath the name, clearly the designer's — not under "تابعونا", not mixed with store contact.
13. About / Contact / Privacy / Terms / Shipping-Returns pages exist, real AR+EN, correct metadata, RTL/LTR.
14. No "Medusa" brand text anywhere user-facing (storefront + checkout).

**Search & notifications**
15. Product search is **fully implemented** and Medusa-backed (input, debounce, loading, empty, error, AR/EN, mobile, working product links, no-results) — OR every search reference removed. No half-built search.
16. Transactional notifications: at minimum a store-admin alert on new order, and a customer confirmation when email is available; Asuma-branded template; order creation **never** blocked by notification failure; notification failures logged.

**Infra & security**
17. No orphan/unused Railway variables; every variable justified in the table.
18. Gate 12 secrets rotated (staged); `MEDUSA_ADMIN_PASS` + stale `S3_*` removed; each rotation verified.
19. Security headers present; cookies secure+SameSite; no debug/source-map leakage in prod.
20. `localhost:7001` references gone or production-guarded.

**Quality & ops**
21. SEO: sitemap + robots valid (no dead/localhost), cart/checkout/account/admin `noindex`, OG/favicon.
22. Performance measured (real Lighthouse), evidence-based fixes only.
23. Observability: cart+checkout smoke tests; alert path for 500/Redis/down; backup + rollback + Redis-replacement + admin-recovery runbooks.
24. Full Test Matrix passes on Chrome + Edge + mobile viewport + Incognito.

**Visual preservation (hard requirement)**
25. Intro/Loader still present and working.
26. Hero + Three.js + GSAP + scroll reveals + custom cursor/glow **not deleted**.
27. Golden Noir palette, gold/ivory/obsidian language, Arabic typography preserved.
28. Performance improvements did **not** reduce visual quality.
29. Before/After visuals documented; **no visual regression** (VISUAL PRESERVATION GATE passed).

**Product images**
30. No working image changed/deleted; all Supabase URLs verified (no 403/broken); graceful fallback for missing images; verified post-deploy.

**Owner manual**
31. Handover documentation (Section 16) complete and usable by a non-specialist.

---

## 3. Critical Path

```
S0 Baseline/Freeze (read-only diagnostics may start immediately)
  → S1 Diagnose + prove Cart-500 cause + re-verify admin login (browser) + apply proven fix
    → S2 Full COD purchase journey passes + order visible in Admin
      → [MINIMUM SELLABLE STATE]
```
Everything after S2 hardens the store but is not on the path to the first valid order.

---

## 4. Master Station Map

| Station | Objective | Depends | Risk | Window | Gate |
|---|---|---|---|---|---|
| **S0** Freeze & Baseline | Snapshot + rollback point | — | Low | — | Baseline doc + checkpoint tag |
| **S1** Diagnose + Fix Critical | Prove Cart-500 cause; re-verify admin login; fix | S0 | High | A | cart 201 from prod |
| **S2** Restore Commerce Flow | End-to-end COD + order in Admin | S1 | High | A/B | one test order, zero 500s |
| **S3** Admin Reliability + Branding | Durable login + Asuma identity (official) | S2 | Med | B | login survives redeploy |
| **S4** Footer / Contacts / Designer | Store contacts; designer block last | S2 | Low | C | live footer correct |
| **S5** Content Pages + kill Medusa text | 5 AR/EN pages; no "Medusa" | S4 | Low | C | `/content/*` 200; no brand leak |
| **S6** Product Search | Real Medusa-backed search | S2 | Med | C | search works AR/EN/mobile |
| **S7** Order Notifications | Admin alert + customer email; non-blocking | S2 | Med | B | order email/log proven |
| **S8** Full Link & Interaction Audit | Zero dead links; kill localhost | S4,S5,S6 | Low | C | link audit all green |
| **S9** Infra/Config Cleanup | Remove orphan vars/config | S2,S3 | Med | D | services healthy post-clean |
| **S10** DB & Catalog Integrity | Fix orphans/mislinks; tag test data | S2 | Med | — | integrity pass, no data loss |
| **S11** Security & Gate 12 | Staged secret rotation + headers | S2–S9 | High | D | each rotation verified |
| **S12** Perf/Mobile/A11y + Visual Gate | Measure, optimize, preserve visuals | S5 | Med | C/D | VISUAL PRESERVATION GATE |
| **S13** SEO & Metadata | sitemap/robots/OG/structured/noindex | S5,S8 | Low | C | sitemap valid, noindex correct |
| **S14** Observability & Recovery | Smoke tests, alerts, runbooks | S2,S11 | Low | C/D | smoke pass; runbooks written |
| **S15** Final Production Validation | Full + negative + cross-browser | all | Med | E | entire matrix passes |
| **S16** Documentation & Handover | Owner manual + ops docs | all | Low | — | doc set complete |

---

## 5. Detailed Execution Stations

> Conventions: read-only diagnostics first; small logical commits; **deploys are batched into Windows (Section 6), not per commit**; no `|| true` masking; real data never deleted; no secret values printed; protected visuals never removed.

### S0 — Freeze, Baseline & Safety (read-only diagnostics allowed)
- **Objective:** snapshot state + rollback point; begin diagnosis without waiting on backup.
- **Allowed immediately (no backup needed):** runtime logs, network inspection, safe API tests, code reading, **read-only `SELECT`**, CORS/cookie inspection, runtime diagnosis.
- **Backup is a precondition only before:** migrations, high-risk data changes, schema edits, secret/DB-credential rotation, any operation that can affect data.
- **Evidence:** last commit, both deployments, variable **names**, build/start commands, domains, masked Redis/DB prefixes, product/order/user counts.
- **Changes:** none (this plan file + checkpoint tag only).
- **Gate:** baseline + checkpoint tag exist. **Backup confirmation required before any S1-E migration or any S11 rotation, not before diagnostics.**

### S1 — Reproduce & Diagnose Critical Failures (then fix, evidence-led)
- **Objective:** prove Cart-500 cause and confirm/deny admin-login regression; apply the proven fix.
- **Admin login (browser, U2):** clean/Incognito login; capture `POST /auth/user/emailpass` (status, Set-Cookie attrs / token-in-body), then `GET /admin/users/me` (status, credential carried); compare to known-200 direct API.
- **Cart 500 (U1):** reproduce `POST /store/carts` while reading backend **runtime logs** for the same timestamp; extract stack trace + failing module. Logs via `railway logs`; if CLI exposes build-only logs → short Owner Action to copy runtime logs from Railway dashboard.
- **Decision Tree (fix chosen by evidence, never assumed):**
  - **A** `max requests limit exceeded` / Upstash quota → provision unlimited Redis (A1 Upstash pay-as-you-go, or A2 Railway Redis plugin); update `REDIS_URL`; redeploy backend; retest.
  - **B** `ECONNREFUSED`/TLS/`ETIMEDOUT` → connectivity/TLS fix in `REDIS_URL`; redeploy; retest (no paid upgrade unless quota also shown).
  - **C** workflow-engine/BullMQ error w/o Redis quota/conn → confirm Redis health; inspect `workflow-engine-redis` options; (isolation only, non-prod) try `workflow-engine-inmemory` to localize — **not** a prod fix.
  - **D** region/sales-channel/publishable-key error → `SELECT`-verify links; correct via Admin API (non-destructive).
  - **E** Postgres constraint/migration error → read migration status; apply missing migration deliberately (own sub-gate, **backup required first**).
  - **F** other/Medusa bug → capture trace; match to 2.16.0 issues; documented workaround or escalate with evidence. No guess-patching.
- **Gate (hard):** S2 forbidden until `POST /store/carts` → 201 from production.

### S2 — Restore Core Commerce Flow
- **Objective:** prove full COD journey + order in Admin.
- **API + UI walkthrough:** create cart (eg) → add Asuma line → eg address → shipping (`so_…`) → payment-collection + session (`pp_system_default`) → complete; mirror in UI desktop + mobile.
- **Scenarios:** add/update-qty/remove/re-add; Cairo/Giza + other governorate shipping price; EGP format; empty cart; invalid address; refresh mid-flow; reopen new session; **double-click = single order**; out-of-stock note (`manage_inventory:false`).
- **Data:** creates one **tagged test order** (identified for S10 handling, never blindly deleted).
- **Gate:** all commerce scenarios pass.

### S3 — Admin Reliability & Branding
- **Reliability:** login persistence across logout/login, Incognito, **redeploy**; inspect Build Command `medusa user … || true` for duplicate/conflicting auth-identity risk and error-masking (read-only auth-identity count); make it idempotent/safe or remove + document recovery; never swallow meaningful auth errors.
- **Branding (U3-gated):** verify 2.16.0 official capability **before** choosing. Apply favicon/title/logo where officially supported (widgets/config); **document** what is not officially changeable (e.g. login-screen logo) — no fragile fork/patch without separate owner approval.
- **Gate:** durable login proven post-redeploy.

### S4 — Footer, Contacts & Designer Credit
- **Store contact (Col 4):** WhatsApp `+20 103 316 3769` → `https://wa.me/201033163769`; email `asmafarouq.89m@gmail.com` → `mailto:asmafarouq.89m@gmail.com`.
- **Designer block (last element):** `Designed & Developed by Ahmed Darhous` with designer links **directly beneath the name**, visually subordinate, unmistakably the designer's; not under "تابعونا"; not mixed with store contact.
- **Copyright:** keep `© 2026 Asuma Store · جميع الحقوق محفوظة`.
- **External links:** `target="_blank" rel="noopener noreferrer"`.
- **Constraint:** preserve current footer design; do **not** rebuild from scratch.
- **File:** `apps/storefront/src/modules/layout/templates/footer/index.tsx` (+ checkout minimal footer for consistency).
- **Gate:** live footer correct in AR/RTL + LTR, desktop + mobile.

### S5 — Content Pages & Eliminate Residual Medusa Text
- **Pages (AR+EN, RTL/LTR):** About, Contact, Privacy Policy, Terms, Shipping-&-Returns (+ COD note / FAQ if useful).
- **Approach:** static content via app-router (simplest stable; Medusa 2.16.0 has no core CMS pages module). Path to verify: `apps/storefront/src/app/[countryCode]/(main)/content/[slug]/page.tsx`.
- **Brand cleanup:** `review/index.tsx:45` "Medusa Store" → "أسومة ستور".
- **Business Policy Input Gate (see Section 15):** legal copy stays **draft** until owner confirms shipping time/cost, governorates, returns window, non-returnable items, cancellation, official contacts. No invented binding policy.
- **Gate:** all `/content/*` = 200; no "Medusa" text.

### S6 — Product Search (DECISION: IMPLEMENT)
- **Decision:** implement a real Medusa-backed product search (not UI-only, not removed).
- **Scope:** search input (nav + mobile), debounce, loading state, results list with working product links, empty/no-results state, error state, AR/EN, mobile, RTL.
- **Backend:** use Medusa store products query (`q` param) via the storefront data layer; no new paid search service required for launch.
- **Gate:** search returns correct products, handles no-results/error, works AR/EN + mobile.

### S7 — Order Notifications (DECISION: IMPLEMENT simplest stable)
- **Decision:** implement the simplest stable transactional notification path; do not leave out-of-scope.
- **Scope:** store-admin alert on new order; customer confirmation when email present; Asuma-branded template; **order creation never blocked** by send failure; notification failures logged clearly.
- **Provider:** prefer a free/low-cost provider (e.g. Resend free tier or SMTP) configured in backend `modules`. Prepare all code/config; the only owner step is providing the provider API key / verifying sender domain (Owner Action).
- **Gate:** test order produces a logged/sent notification in production; failure path proven non-blocking.

### S8 — Full Link & Interaction Audit
- **Crawl:** header/footer/logo/categories/products/cart/checkout/account/policies/contact/social/designer/WhatsApp/email/CTAs/forms/images/fonts/canonical/OG/sitemap/robots/404.
- **Eliminate:** 404s, unexpected 401/500, `#`/`javascript:void(0)`, action-less buttons, `localhost` refs (`onboarding.ts`, `product-onboarding-cta`), old Render/Vercel domains, routes without pages, empty success messages, unconnected forms, unsafe external links.
- **Gate:** every link Working / Intentionally-external / removed-from-UI.

### S9 — Configuration & Infrastructure Cleanup
- **Remove proven-unused** Railway vars (grep code+runtime = none): `S3_ACCESS_KEY_ID/SECRET/BUCKET/REGION`, `BUILD_TRIGGER`, `BUILD_TRIGGER_S3`. (`MEDUSA_ADMIN_PASS` removal deferred to S11.)
- Resolve code↔Railway drift; confirm no Render/Vercel leftovers; review `|| true` usage.
- **Gate:** both services healthy after each removal (health + cart smoke).

### S10 — Database & Catalog Integrity
- **Read-only first:** product↔channel, prices (EGP), `manage_inventory` semantics, region↔provider, shipping↔zone, draft demos, duplicate auth identities, orphans, broken images, test orders.
- **Corrections via Admin API only** (additive/reversible): relink channel, add missing price, fix image URL. **No DELETE/DROP/TRUNCATE.** Test orders **tagged**, not purged.
- **Gate:** no product without price/channel; images resolve; test data labeled.

### S11 — Security Hardening & Gate 12
- **Headers:** HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, CSP-where-safe (verify Supabase images + fonts not blocked); ensure prod source maps off.
- **Rotations (staged, one at a time, verify between each; backup before DB/Redis credential changes):** `JWT_SECRET`, `COOKIE_SECRET` (invalidates sessions — expected), DB password (`DATABASE_URL`), Redis creds (`REDIS_URL`), admin password; then **remove** `MEDUSA_ADMIN_PASS` (after a confirmed working manual login) and stale `S3_*`.
- **Gate:** each rotation individually verified; site fully up.

### S12 — Performance, Mobile, Accessibility + VISUAL PRESERVATION GATE
- **Measure first (real):** Lighthouse desktop + mobile; LCP/CLS/INP; bundle; Three.js/GSAP cost; loader; cursor on touch; image weight; fonts; repeated API/Redis calls; hydration warnings.
- **Optimize without deleting** (PRESERVE FIRST → OPTIMIZE SECOND → ADD IF USEFUL → NEVER DELETE BY DEFAULT): lazy load, dynamic import, reduced quality on low-end, `prefers-reduced-motion`, touch guard, asset compression, conditional render, pause off-viewport animation. Keep full experience on capable devices.
- **A11y:** keyboard nav, focus states, alt text, contrast, screen-reader labels, RTL form behavior.
- **VISUAL PRESERVATION GATE (mandatory):** Before/After comparison of Homepage Desktop, Homepage Mobile, Product listing, Product page, Cart, Checkout, Footer, Intro/Loader, Animations, RTL/LTR. Any radical removal/simplification requires strong evidence + separate Owner Approval.

### S13 — SEO, Metadata & Discoverability
- `app/sitemap.ts` (published products/categories only — no drafts/localhost/old domains), `app/robots.ts`, canonical per page, OG/Twitter, structured data (Organization/Product/Breadcrumb), `noindex` on cart/checkout/account/admin, favicon.
- **Gate:** sitemap/robots valid; private routes noindex.

### S14 — Observability, Operations & Recovery
- Smoke tests (cart 201 + full COD, kept in `scripts/`); storefront health route if useful; alert path (free first: Railway notifications / external uptime ping on `/health` + storefront + a synthetic non-completing cart probe); Redis + Supabase + Railway usage monitoring.
- Runbooks: backup/restore, rollback, Redis replacement, admin recovery, incident checklist.
- **Gate:** smoke pass; runbooks exist.

### S15 — Final Production Validation
- Execute full Test Matrix (Section 10) incl. negative + cross-browser (Chrome/Edge/mobile/Incognito) from production.
- **Launch gate:** nothing ships if any row fails; failures loop back to the owning station.

### S16 — Documentation & Handover (Owner Manual — mandatory)
- Architecture + services map; local + Railway setup; variable reference (no secrets); deploy + rollback; backup/restore; Redis replacement; admin recovery; **simple owner manual:** add/edit product, upload images, change price, manage inventory, publish/hide, manage orders, track COD, customers, shipping prices, contact info locations, policy pages, review logs, handle Redis/backend downtime; known limitations; troubleshooting matrix; emergency + launch + post-launch checklists.

---

## 6. Deployment Windows Strategy

**Rule:** `LOCAL VERIFY → BATCH RELATED CHANGES → BUILD ONCE → DEPLOY ONCE → PRODUCTION GATE`.
No deploy after each text/link/component/commit/sub-station. Small commits accumulate locally; deploys are few and grouped. A station deploys separately **only** if it needs immediate production proof (e.g. the Cart-500 fix).

| Window | Included Stations | Service | Preconditions | Expected Deploys | Production Tests |
|---|---|---|---|---|---|
| **A — Critical Backend Recovery** | S1 (+ any S2 backend fix) | Backend | Cart-500 cause proven; backend builds locally/safe-env | **1** (max 2 if a second distinct backend cause emerges) | cart 201; admin login; full COD |
| **B — Backend Completion** | S3 branding, S7 notifications, remaining S2 backend fixes | Backend | Window A stable | **1** | admin branding; order notification; login durable |
| **C — Storefront Completion Batch** | S4 footer, S5 content + Medusa-text, S6 search, S8 links, S12 perf/a11y, S13 SEO, S14 health route, security headers, CSP, source-map prod config, safe image config, mobile/a11y improvements | Storefront | local build + type checks + lint/tests + route checks + link audit + visual comparison + image checks + security-header config review + VISUAL PRESERVATION GATE | **1 main completion deploy** (+ max 1 corrective deploy only if a proven production-only failure appears that cannot be reproduced locally) | footer, content, search, links, SEO, visual gate, security headers, images |
| **D — Infrastructure & Security** | S9 var cleanup, S11 secrets (staged rotations only) | Backend | Windows A–C stable; backup before DB/Redis rotation | Backend **2–3** (staged rotations); Storefront **0** (all storefront changes already in Window C) | health, login (new secret), cart after each rotation |
| **E — Final Release Candidate** | S15 validation; deploy only to fix a proven failure | Both | All stations complete | **0–1 each** | full regression matrix |

**Expected total deploys (target):** Backend ≈ **4–6** (A:1, B:1, D:2–3, E:0–1); **Storefront ≈ 1–2** (C:1 main completion deploy + max 1 corrective for a proven production-only failure; all other storefront changes are batched into the single Window C deploy). Goal: fewest deploys consistent with safety; secret rotations are the only intentionally-staged multi-deploy step. No standalone Storefront deploy for security headers, CSP, or image config unless a genuine technical blocker prevents batching.

---

## 7. File Change Map

*(create/verify rows are not asserted to exist yet)*

| File/Path | Current Role | Expected Change | Station | Window | Risk |
|---|---|---|---|---|---|
| `apps/backend/medusa-config.ts` | modules + http/CORS | Possible workflow/redis fix (S1) or admin branding (S3) or notification module (S7) — to verify | S1/S3/S7 | A/B | Med |
| Railway `REDIS_URL` (backend) | Redis connection | Conditional change iff S1 evidence = Redis | S1 | A | High |
| `apps/backend/src/admin/*` | admin SDK stubs | Possible branding asset/widget — to verify method | S3 | B | Med |
| Backend Build Command (Railway) | build+migrate+`medusa user … \|\| true` | Make user-step safe / not error-masking | S3 | B | Med |
| `apps/backend` notification module/config | none | Add provider + templates | S7 | B | Med |
| `apps/storefront/src/modules/layout/templates/footer/index.tsx` | footer | store contacts; designer block last; safe rel | S4 | C | Low |
| `apps/storefront/src/app/[countryCode]/(checkout)/layout.tsx` | checkout footer | designer-signature consistency | S4 | C | Low |
| `apps/storefront/src/modules/checkout/components/review/index.tsx` | review text | "Medusa Store" → "أسومة ستور" | S5 | C | Low |
| `apps/storefront/src/app/[countryCode]/(main)/content/[slug]/page.tsx` *(create/verify)* | — | AR/EN content pages | S5 | C | Low |
| Search components (nav/input/results) *(create/verify)* | — | Medusa-backed search | S6 | C | Med |
| `apps/storefront/src/lib/data/onboarding.ts` | onboarding redirect | remove/guard `localhost:7001` | S8 | C | Low |
| `apps/storefront/src/modules/products/components/product-onboarding-cta/index.tsx` | onboarding CTA | remove/guard `localhost:7001` | S8 | C | Low |
| `apps/storefront/src/modules/layout/components/cursor/index.tsx` | custom cursor | touch + reduced-motion guard (preserve cursor) | S12 | C/D | Low |
| `apps/storefront/next.config.js` | next config | security headers; image optimization (evidence-led); source-maps off | S11/S12 | D | Med |
| `apps/storefront/src/app/sitemap.ts`, `robots.ts` *(create)* | — | SEO files | S13 | C | Low |
| `scripts/*` *(create)* | — | smoke tests | S14 | C/D | Low |
| `docs/*` | this plan + handover | plan (now) + handover docs (S16) | S0/S16 | — | Low |
| `design-lab/*` | **PROTECTED design-reference archive** | **DO NOT DELETE, UNTRACK, MOVE, RENAME, REWRITE, OR CLEAN.** Preserve unchanged. Not part of any infrastructure/housekeeping cleanup. Not included in production runtime (already excluded from build). Any future archival or repository separation requires separate explicit Owner Approval. | — | — | None |

---

## 8. Railway Change Map (no secret values)

| Service | Setting/Variable | Current | Planned | Reason | Rollback | Verify |
|---|---|---|---|---|---|---|
| backend | `REDIS_URL` | rediss:// (Upstash) | Conditional (S1) | only if evidence = Redis | restore prior | cart 201 |
| backend | `MEDUSA_ADMIN_PASS` | present | remove (S11) | not needed post-stable login | re-add | login works |
| backend | `S3_ACCESS_KEY_ID/SECRET/BUCKET/REGION` | present (module removed) | remove (S9) after grep-proof | orphaned | re-add | health 200 |
| backend | `BUILD_TRIGGER_S3` | present | remove (S9) | leftover | re-add | build ok |
| storefront | `BUILD_TRIGGER` | `2` | remove (S9) | leftover | re-add | build ok |
| storefront | `NEXT_TELEMETRY_DISABLED` | `1` | keep | harmless | — | — |
| backend | `JWT_SECRET` / `COOKIE_SECRET` | present | rotate (S11) | Gate 12 | restore | login post-rotate |
| backend | `DATABASE_URL` | present | rotate pw (S11) | Gate 12 | restore | health 200 |
| backend | notification key (new) | absent | add (S7) | order emails | unset | order notification |
| backend | `ADMIN_CORS/STORE_CORS/AUTH_CORS` | scoped correct | keep (verify) | already correct | — | CORS headers |
| backend | Build Command | build+migrate+user | safer user-step (S3) | reliability | restore | login durable |

---

## 9. Database & Redis Change Map

| Operation | Type | Station | Allowed? | Guard |
|---|---|---|---|---|
| Verify links/prices/identities/orders | Read-only SELECT | S1,S10,S3 | Yes (no backup needed) | none |
| Relink product→channel; add price; fix image URL | Data correction via Admin API | S10 | Yes (additive) | confirm real vs test |
| Apply missing migration (only if S1-E) | Migration | S1-E | Yes, gated | **backup required** + sub-gate |
| Change `REDIS_URL` / rotate DB pw | Service/config change | S1,S11 | Yes, staged | **backup before DB/Redis pw**; verify+rollback each |
| Delete orders/products/customers/auth identities | Destructive | — | **No** (owner-only, post-launch, with backup) | excluded |

---

## 10. Test Matrix

| ID | Area | Scenario | Expected | Gate |
|---|---|---|---|---|
| T01 | Cart | `POST /store/carts` (eg) | 201 | S1 |
| T02 | Cart | add/update/remove/re-add | correct totals | S2 |
| T03 | Checkout | address→shipping→COD→review→place | order created | S2 |
| T04 | Checkout | double-click place order | single order | S2 |
| T05 | Checkout | refresh / reopen new session | cart persists | S2 |
| T06 | Order | appears in Admin | visible | S2 |
| T07 | Shipping | Cairo vs other governorate | correct EGP | S2 |
| T08 | Admin | login clean browser + Incognito | dashboard, no loop | S3 |
| T09 | Admin | login survives redeploy | persists | S3 |
| T10 | Footer | store WA/email; designer block last | correct | S4 |
| T11 | Content | `/content/*` all 200 | render | S5 |
| T12 | Brand | no "Medusa" user-facing | absent | S5 |
| T13 | Search | query → results / no-results / error (AR/EN/mobile) | works | S6 |
| T14 | Notify | new order → admin alert + customer email; failure non-blocking | proven | S7 |
| T15 | Links | full crawl | no dead/localhost | S8 |
| T16 | Security | headers + new admin pw + old secret dead | enforced | S11 |
| T17 | Perf | Lighthouse mobile+desktop | measured, no severe regress | S12 |
| T18 | Visual | Before/After core pages | no regression | S12 |
| T19 | SEO | sitemap/robots valid; private noindex | valid | S13 |
| T20 | Neg | wrong login / invalid route / empty cart / out-of-stock / broken-image fallback / expired session | graceful | S15 |
| T21 | Cross-browser | Chrome/Edge/mobile/Incognito | consistent | S15 |
| T22 | Infra | backend+storefront restart; Redis/DB reconnect | recovers, no crash loop | S15 |

---

## 11. Visual Preservation Gate

**Protected Visual Assets (never delete by default):** Intro/Loading experience; Asuma monogram/logo animation; Hero visual; Three.js effects; GSAP motion; scroll reveals; custom cursor + glow; Golden Noir palette; gold/ivory/obsidian language; Arabic typography; desktop premium experience; mobile visual identity; current footer visual quality; existing transitions/micro-interactions; `design-lab/` design-reference archive.

**Rule:** `PRESERVE FIRST — OPTIMIZE SECOND — ADD IF USEFUL — NEVER DELETE BY DEFAULT`.
If an element hurts performance: measure → do not delete → apply lazy load / dynamic import / reduced quality on low-end / `prefers-reduced-motion` / mobile-specific optimization / touch guard / compression / conditional render / pause off-viewport → keep full version on capable devices. Any radical removal needs strong evidence + separate Owner Approval.

**Gate comparison set (Before/After):** Homepage Desktop, Homepage Mobile, Product listing, Product page, Cart, Checkout, Footer, Intro/Loader, Animations, RTL/LTR. **No visual regression permitted.**

---

## 12. Commit Strategy

Small, focused, conventional commits accumulate locally; **commits are not 1:1 with deploys**. Examples:
```
fix(backend): <cause> — restore cart creation
feat(backend): order notifications (non-blocking)
feat(admin): apply Asuma branding (official method)
fix(footer): store contacts + isolate designer credit block
feat(content): bilingual policy pages + drop Medusa text
feat(search): Medusa-backed product search
fix(links): remove localhost and dead references
perf(motion): optimize animations without visual removal
feat(security): security headers
feat(seo): sitemap, robots, OG, structured data
docs: operations and owner handover
```
Run local build + tests + link/visual checks once per batch, then one Window deploy.

---

## 13. Deployment Strategy

- Backend before storefront when both change (storefront depends on backend).
- Each deploy is **manual** (`railway deployment up --service <svc>`; GitHub auto-deploy unreliable / "GitHub Repo not found" observed) and followed by its Window's production tests before proceeding.
- **Stop-the-line:** any failed health/gate → halt, rollback that change, do not stack further commits.
- Secret rotations: Railway-side, one at a time, verified between each; never batched.
- **Internal gates auto-advance** (Section 14): on passing acceptance, proceed automatically; do not pause for routine approval.

---

## 14. Gate Behaviour (internal, auto-advance)

On passing a station's acceptance criteria: record result, proceed to the next station automatically. **Stop only for:**
- An Owner Action the agent cannot perform (payment, OTP, email/domain verification, provider key).
- Real risk of data loss / a destructive migration.
- A secret the agent cannot access safely.
- A business decision that cannot be inferred (e.g. binding policy values).
- Any risk to a Protected Visual Asset.
- A conflict requiring an owner decision.

Do **not** stop merely to send a progress report or ask "should I continue?".

---

## 15. EXECUTION CONTROL PROTOCOL

- Execution continues automatically within each group of five stations — no confirmation needed between stations.
- An independent commit is created after each completed station (pattern: `fix/feat/test/chore/docs(sN): message`).
- A commit does NOT trigger a deploy; deploys follow Section 6 Deployment Windows only.
- `docs/MASTER_EXECUTION_PLAN.md` station status and `docs/EXECUTION_LOG.md` are updated after each station.
- Execution STOPS after every five fully-completed stations, sends a comprehensive 10-section report, and waits for Owner Approval before the next group.
- A station is NOT counted as complete unless: all objectives achieved, all Acceptance Criteria passed, plan updated, execution log updated, commit created, hash recorded.
- **Context/Compaction protocol:** before any context-window compression, update `docs/MASTER_EXECUTION_PLAN.md` + `docs/EXECUTION_LOG.md` with full current state; create commit if station is complete; resume from first incomplete item post-compaction; do not lose the five-station group counter.

### Five-Station Groups
| Group | Stations | Report trigger |
|---|---|---|
| Group 1 | S0, S1, S2, S3, S4 | Stop + report + wait after S4 |
| Group 2 | S5, S6, S7, S8, S9 | Stop + report + wait after S9 |
| Group 3 | S10, S11, S12, S13, S14 | Stop + report + wait after S14 |
| Final | S15, S16 | Final report after S16 |

### Exceptional stops (before group of 5 is complete)
Only stop for: payment/billing, OTP, email/domain verification, inaccessible secret, real data-loss risk, destructive migration, binding business decision, protected visual asset at risk, explicit Owner Approval required by plan.
**Do not stop for:** normal errors, test failures, build failures, missing packages, code issues, context size, task length — diagnose, fix, continue.

### design-lab absolute protection
`design-lab/` is a protected design-reference archive. **Never delete, untrack, move, rename, rewrite, or clean its files.** Not part of any cleanup station. Any archival requires separate Owner Approval.

---

## 16. Unavoidable Owner Actions (minimal, timed)

1. **(S0/S1-E/S11 — before destructive/migration/rotation only)** Confirm/trigger a Supabase DB backup (Database → Backups → confirm PITR/daily or "Backup now"). *Needs DB creds.*
2. **(S1, if `railway logs` lacks runtime)** Copy ~20 runtime-log lines around the failing `POST /store/carts` from Railway dashboard.
3. **(S1-A, only if evidence = Redis quota)** Enable billing on chosen Redis (Upstash pay-as-you-go, or add Railway Redis plugin). Agent then updates `REDIS_URL` + redeploys.
4. **(S7)** Provide notification-provider API key and/or verify sender domain (e.g. Resend). Agent has all code/config ready.
5. **(S11)** Perform provider-side password resets you don't want the agent to see (Supabase DB, Redis); hand over new URLs or set the Railway vars yourself; approve the new admin password.
6. **(S5/S15)** Provide/approve **Business Policy values** before legal copy is final: shipping time, shipping cost, governorates covered, returns/exchange window, non-returnable items, open-before-receipt, refusal-on-delivery, cancellation cases, official contact data.
7. **(S3)** If full login-screen rebrand needs a fork (U3), decide accept-limitation vs authorize-fork.

Everything else (code, content drafts, non-secret Railway vars, deploys, tests, docs) the agent executes.

---

## 17. Final Launch Checklist

- [ ] Cart 201; full COD order completes (T01–T07)
- [ ] Order visible in Admin (T06)
- [ ] Admin login durable: Incognito + post-redeploy (T08–T09)
- [ ] Admin shows Asuma identity (or limitation documented)
- [ ] Footer store WA `wa.me/201033163769` + email `asmafarouq.89m@gmail.com`; designer block last (T10)
- [ ] 5 content pages live AR+EN (T11); no "Medusa" text (T12)
- [ ] Product search works (T13)
- [ ] Order notifications proven non-blocking (T14)
- [ ] Link audit clean; no localhost/dead links (T15)
- [ ] Orphan vars removed; variable table reconciled
- [ ] Catalog integrity clean; test data labeled
- [ ] Gate 12 secrets rotated + verified; `MEDUSA_ADMIN_PASS`/`S3_*` removed (T16)
- [ ] Security headers; cookies secure/SameSite; no source-map leak
- [ ] Lighthouse run; no severe regressions (T17)
- [ ] VISUAL PRESERVATION GATE passed; no regression (T18)
- [ ] sitemap/robots valid; private noindex; OG/favicon (T19)
- [ ] Smoke tests + alerting + runbooks (S14)
- [ ] Full + negative + cross-browser matrix passes (T20–T22)
- [ ] Owner handover docs complete (S16)

---

## 18. Post-Launch Verification

**Immediately:** `/health` 200; home + a product + synthetic non-completing cart 201; Admin login; Redis + Supabase usage baseline-normal; no 500s.
**After first real order:** order in Admin with correct EGP totals + COD + shipping; address captured; no duplicate; admin notification received; re-check Redis request trend (no creep toward limits).

---

## 19. Out-of-Scope

**In scope (must not be dropped):** Search, order notifications, contact links, policies, SEO basics, monitoring, owner documentation, mobile, visual preservation.

**Legitimately out of scope:**
- Card payments (COD-only by business decision; Stripe code stays dormant).
- Custom domain (until owner provides one).
- New real product photography (until owner supplies images; placeholders remain).
- Optional paid services not required for launch.
- New features not requested (wishlist/reviews) — provided no UI implies they work.

---

## 20. Final Verdict

- Covers everything blocking sales: yes (S1→S2 target Cart-500 with evidence-gated fix).
- Covers all audit findings: yes (cart→S1/S2; contacts→S4; dead links→S5/S8; Medusa text→S5; admin branding→S3; localhost→S8; orphan vars→S9; secrets→S11; SEO→S13; perf/cursor→S12; design-lab→PROTECTED-PRESERVE-ONLY; search→S6; notifications→S7).
- Unproven assumptions baked in: none — U1/U2/U3 are diagnosis-gated, not assumed.
- First station: S0. Last station: S16.
- Likely remaining after completion: order photography, card payments, custom domain — all explicitly out-of-scope by decision, not by omission.
