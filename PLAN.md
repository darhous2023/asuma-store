# خطة تنفيذ أسومة ستور — الكاملة

> **آخر تحديث:** 2026-06-23  
> **المطور:** Ahmed Darhous  
> **صاحبة الموقع:** Asmaa Farouk  
> **الاستضافة:** Railway فقط (Backend + Storefront) — render.yaml وvercel.json = dead config من الخطة الأصلية  
> **الـ Live URLs:**  
> - Storefront: `https://asuma-storefront-production.up.railway.app`  
> - Backend/Admin: `https://asuma-backend-production.up.railway.app`

---

## الوضع الحالي

| المرحلة | الحالة |
|---|---|
| Phase 1 — التأسيس التجاري المصري | ✅ مكتمل |
| Phase 2 — كتالوج المنتجات (25 منتج + COD) | ✅ مكتمل |
| Phase 3 — الهوية البصرية (nav/hero/footer/logo) | ⚠️ 70% — فيه bugs |
| Phase 3 — الـ Animations (Loader/Cursor/Three.js/GSAP) | ❌ مكسور (packages ناقصة) |
| Phase 4 — Operations والإشعارات | ❌ لم يبدأ |
| Phase 5 — Domain وتصليب الإنتاج | ❌ لم يبدأ |
| Gate 12 — تدوير الأسرار | ⏳ مؤجل عن قصد — آخر خطوة |

---

## تحديثات مضافة على الخطة

- **سنة الفوتر**: `new Date().getFullYear()` — مطبّق بالفعل ✅
- **تأكيد الـ Animations على اللايف**: بعد كل deploy يتم فتح Browser Console للتحقق من غياب أخطاء `three`/`gsap` وظهور الـ canvas
- **ADMIN_CORS**: يُضاف ضمن مراجعة إعدادات الدومين في Phase 5 (`ADMIN_CORS=https://api.asumastore.com`)
- **Resend compatibility**: قبل تثبيت أي package في Phase 4، نتحقق من `@medusajs/notification-resend` مع Medusa 2.16 من الـ changelog الرسمي
- **Lint / Typecheck / Build**: بعد كل مرحلة تنفيذية: `pnpm --filter @dtc/storefront build` محليًا قبل أي push

---

## قاعدة Deploy

**المشكلة السابقة:** كنا بنعمل `git push` + `railway deployment up` في نفس الوقت → deploy مكرر → فشل.

**القاعدة من الآن:**
1. `git push origin main` فقط — ننتظر الـ GitHub auto-deploy على Railway
2. لو الـ auto-deploy اتأخر أكتر من 5 دقايق بس، نستخدم `railway deployment up --service asuma-storefront`
3. أبدًا مش الاتنين مع بعض

---

## 🔴 الإصلاح العاجل — شرط مسبق لكل حاجة

> **وقت التنفيذ:** ~15 دقيقة | **commit واحد**

### 1. إضافة `three` و`gsap` لـ dependencies

**الملف:** `apps/storefront/package.json`

المشكلة: الـ packages موجودة في الكود كـ dynamic imports لكن مش مسجّلة في `dependencies` → تشتغل محليًا لكن تفشل في الإنتاج.

```json
"dependencies": {
  "three": "^0.177.0",
  "gsap": "^3.12.7"
}
```

ثم: `pnpm install` لتحديث الـ lockfile.

---

### 2. تصحيح الاسم العربي

الاسم الصحيح: **أسومة ستور** (مش "متجر عصومة")

الملفات:
- `apps/storefront/src/modules/home/components/hero/index.tsx` — h1
- `apps/storefront/src/locales/ar.json` — storeName
- `apps/storefront/src/locales/en.json` — storeName
- `apps/storefront/src/app/[countryCode]/(main)/page.tsx` — metadata title

---

### 3. تأكيد اللايف بعد الـ Deploy

- ✓ الـ Loader يظهر وينهي نفسه
- ✓ الـ cursor الذهبي يتتبع الماوس
- ✓ Three.js sphere خلف العنوان
- ✓ المنتجات تظهر بـ fade-up عند الـ scroll

---

## 🎭 فجوة التصميم — ردم الفرق بين الـ Preview والـ Live

> **وقت التنفيذ:** ~3–4 ساعات

### 1. إعادة تصميم الـ Loader / Intro

**الملف:** `apps/storefront/src/modules/layout/components/loader/index.tsx`

التسلسل المطلوب:

```
[مرحلة 1 — rain]
  particles ذهبية تمطر من الأعلى (~80 فريم)

[مرحلة 2 — coalesce]
  الـ particles تتجمع وتكوّن شكل "A" أو دائرة ذهبية

[مرحلة 3 — reveal text]
  ASUMA STORE          ← Cormorant Italic، كبير، ivory
  By Asmaa Farouk      ← Space Grotesk، أصغر، gold-dim، italic
  [خط ذهبي رفيع]
  progress bar في أسفل الشاشة

[أسفل الشاشة — دائم طول الـ loader]
  "Designed by Ahmed Darhous"  ← 9px، opacity 35%، ivory-muted

[مرحلة 4 — fade out]
  كل حاجة تختفي → الـ loader يتشال
```

**ملاحظة مهمة:** Ahmed Darhous هو المطور، مش صاحب الموقع. يظهر صغير جدًا في الأسفل — مش في الواجهة الرئيسية.

---

### 2. Custom Cursor

**الملف:** `apps/storefront/src/modules/layout/components/cursor/index.tsx`

بعد إضافة الـ packages هيشتغل. التحقق:
- Spotlight ذهبي 350px (`mix-blend-mode: screen`)
- Ring معدني 20px يتتبع بـ lag (~12% lerp)
- يتكبّر عند hover على links وbuttons

---

### 3. Three.js Hero Sphere

**الملف:** `apps/storefront/src/modules/home/components/hero-canvas/index.tsx`

- 200 outer gold particles (r=1.5–2.3) + 80 inner bright (r=0.6–0.9)
- يدور ببطء + parallax بالماوس
- `z-index: 0` — يظهر خلف النص مش فوقه

---

### 4. GSAP ScrollTrigger

**الملف:** `apps/storefront/src/modules/layout/components/scroll-reveal/index.tsx`

- كل عنصر class `.reveal` يظهر بـ `opacity:0 → 1` + `translateY(40px → 0)`
- يشمل: product cards + section headers
- يحترم `prefers-reduced-motion`

---

### 5. Product Card — Golden Noir

**الملف:** `apps/storefront/src/modules/products/components/product-preview/index.tsx`

```
خلفية: carbon (#0D0B08)
border: 1px solid var(--gold-border)  ← يظهر عند hover
اسم المنتج: ivory، Cormorant
السعر: gold (#C9A96E)
صورة: aspect-ratio ثابت + overlay خفيف عند hover
wrapper: class "reveal" للـ GSAP
```

---

### 6. Store Page

**الملف:** `apps/storefront/src/app/[countryCode]/(main)/store/page.tsx`

```
section header: "المتجر" بـ Cormorant + gold divider
فلترة: tabs أفقية بالفئات (إكسسوارات / شعر / مكياج / عطور / هدايا)
grid: Golden Noir product cards
```

---

### 7. Product Details Page

**الملف:** `apps/storefront/src/modules/products/templates/index.tsx`

```
layout: grid 60/40 (صورة يسار | تفاصيل يمين)
اسم: Cormorant Italic كبير، ivory
سعر: gold، كبير
زر "أضف للسلة": gold border style (زي CTA الهيرو)
وصف: ivory-dim، مساحة بيضاء فاخرة
```

---

## 🎨 Phase 3 — المتبقي من الهوية البصرية

> **وقت التنفيذ:** ~2 ساعات

### 1. تصحيح موضع Footer

**الملف:** `apps/storefront/src/modules/layout/templates/footer/index.tsx`

المطلوب:
- الأعمدة + الأيقونات تفضل زي ما هي (كويسة)
- الـ bottom bar: يسار = `© 2024 أسومة ستور` | يمين = `designed by Ahmed Darhous` (10px، opacity 40%)
- المطور في أقصى يمين آخر سطر — مش في عمود منفصل ولا بارز

---

### 2. RTL Tailwind

استبدال physical spacing بـ logical properties في الكومبوننتس الرئيسية:

| قديم | جديد |
|---|---|
| `ml-*` / `mr-*` | `ms-*` / `me-*` |
| `pl-*` / `pr-*` | `ps-*` / `pe-*` |

**الملفات المتأثرة:**
- `modules/layout/templates/nav/index.tsx`
- `modules/layout/components/side-menu/index.tsx`
- `modules/products/components/product-preview/index.tsx`
- `app/[countryCode]/(checkout)/` — form fields

**الهدف:** العربي يتقلب تلقائيًا بـ `dir="rtl"` بدون تعديل يدوي.

---

### 3. i18n Binding

**الملفات:** `hero/index.tsx` + `footer/index.tsx`

النصوص الحالية hardcoded عربي (مثلاً "إكسسوارات · شعر · مكياج") مش بتتغير مع اللغة.

المطلوب: ربطها بـ `ar.json` / `en.json` عبر الـ i18n hook الموجود.

---

## 🛒 Phase 4 — Operations والإشعارات

> **وقت التنفيذ:** ~3–4 ساعات (بدون الـ WhatsApp)

### 1. اختبار COD بصري على اللايف

خطوات الاختبار:
1. فتح الـ storefront → منتج → Add to Cart
2. Checkout → عنوان مصري → اختيار الشحن
3. الـ payment method = COD (نتأكد إن "For testing purposes only" **مش ظاهرة**)
4. Place Order → صفحة تأكيد

---

### 2. صور المنتجات الحقيقية

هذا **محتوى** يقدمه صاحب الموقع (مش كود):
1. رفع الصور على Supabase Storage bucket `asuma-products`
2. تحديث الـ 25 منتج من Admin Panel برابط الصورة الجديدة
3. الصور الحالية هي placeholders ملونة مؤقتة

---

### 3. إيميل تأكيد الطلب — Resend

**الملف:** `apps/backend/medusa-config.ts`

```
1. تثبيت @medusajs/notification-resend في apps/backend
2. إضافة RESEND_API_KEY في Railway Backend env vars
3. تفعيل الـ module في medusa-config.ts
4. Template: شكرًا لطلبك · رقم الطلب · المنتجات · إجمالي · وقت التوصيل
```

---

### 4. نشرة بريدية — Resend

**نفس RESEND_API_KEY** — اقتصاد في الـ setup.

```
Frontend:
  - input email + زر "اشترك في العروض" في الـ footer
  - apps/storefront/src/modules/layout/templates/footer/index.tsx

Backend:
  - endpoint: POST /store/newsletter/subscribe
  - يحفظ الإيميل في Resend Audience
  - يبعت إيميل ترحيبي أوتوماتيك (فيه كود خصم مثلاً)
  - لاحقًا: campaigns يدوية من Resend dashboard
```

---

### 5. رسالة WhatsApp ترحيبية عند الشراء — مؤجّل

**شرط مسبق لم يتوفر بعد:** WhatsApp Business API account على Meta (أو WATI/Twilio).

الفكرة بعد التوفر:
```
بمجرد تأكيد الطلب → webhook على الـ backend →
رسالة واتس للعميل: "أهلاً [الاسم]، طلبك #[رقم] وصلنا وبيتجهز!"
```

---

## 🌐 Phase 5 — Domain وتصليب الإنتاج

> **شرط مسبق:** يجب أن يكون الدومين مشترى ومتاح

### 1. ربط Custom Domain على Railway

```
Railway → Storefront Service → Settings → Custom Domain
  → asumastore.com (أو ما يتفق عليه)

Railway → Backend Service → Custom Domain
  → api.asumastore.com
```

---

### 2. تحديث CORS في Railway Backend env vars

```
STORE_CORS=https://asumastore.com,https://www.asumastore.com
AUTH_CORS=https://api.asumastore.com,https://asumastore.com
MEDUSA_ADMIN_BACKEND_URL=https://api.asumastore.com
```

وفي Railway Storefront env vars:
```
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.asumastore.com
NEXT_PUBLIC_BASE_URL=https://asumastore.com
```

---

### 3. تنظيف Dead Configs

- حذف أو تعديل `render.yaml` — Render = الخطة الأصلية المتروكة
- حذف أو تعديل `apps/storefront/vercel.json` — Vercel = الخطة الأصلية المتروكة
- إزالة env vars مؤقتة من Railway: `BUILD_TRIGGER`، `NEXT_TELEMETRY_DISABLED`
- إزالة أمر إنشاء اليوزر من start command الـ backend (بيفشل بصمت كل restart)

---

## 🔐 Gate 12 — تدوير الأسرار

> ⚠️ **لا تنفّذ إلا بعد:** Domain مربوط ✓ | كل الـ features شغّالة ✓ | CORS محدث ✓  
> بعد تدوير الـ secrets، الـ backend بيعمل restart وكل الـ sessions الحالية تنقطع.

### الترتيب الصحيح:

**1. JWT_SECRET + COOKIE_SECRET**
```bash
openssl rand -hex 64  # للـ JWT_SECRET
openssl rand -hex 64  # للـ COOKIE_SECRET
```
تحديث في Railway Backend env vars → Redeploy.

**2. Supabase Database Password**
```
Supabase → Settings → Database → Reset Password
تحديث DATABASE_URL في Railway فورًا
```

**3. Upstash Redis Password**
```
Upstash Console → Reset Password
تحديث REDIS_URL في Railway
```

**4. Admin Password + حذف MEDUSA_ADMIN_PASS**
```
Admin Panel → تغيير الـ password
Railway → حذف MEDUSA_ADMIN_PASS من env vars نهائيًا
```

**5. تأكيد نهائي بعد Redeploy**
- ✓ `/health` = 200
- ✓ Admin login يشتغل
- ✓ Storefront يعرض المنتجات
- ✓ COD يكمل طلب كامل

---

## ⭐ ما بعد الإطلاق — اختياري

| البند | الأولوية |
|---|---|
| Error Monitoring — Sentry | عالي |
| Analytics — Google Analytics أو Plausible | عالي |
| Sitemap XML + OpenGraph image مخصصة | متوسط |
| VAT 14% — Tax Region لمصر (لو البيع رسمي) | حسب الحاجة |
| بوابة دفع إلكتروني — Paymob أو Stripe | لاحقًا |

---

## ترتيب التنفيذ الكامل

```
🔴 إصلاح عاجل     → 🎭 فجوة التصميم → 🎨 Phase 3 متبقي
        ↓
🛒 Phase 4         → 🌐 Phase 5       → 🔐 Gate 12
```

---

## المعرفات الجوهرية (للرجوع إليها)

```
Railway Project ID:      0a2c9cea-444d-4003-ac8a-031d43d457fc
Backend Service ID:      a1cbad48-6e5d-450c-80d7-869a8e30c368
Storefront Service ID:   6029815e-95ed-43a1-91dd-f58d3ffb1c5a
Egypt Region:            reg_01KVR04F83AG96VAKHB2A3DZ9H
Sales Channel:           sc_01KVQAHT4AHWP7NH0RG64FY6QW
Publishable Key (token): pk_25df426e...
Admin:                   ahmeddarhous@gmail.com
```
