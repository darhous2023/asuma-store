import { Metadata } from "next"
import { notFound } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Props = { params: Promise<{ countryCode: string; slug: string }> }

/* ── Content definitions ──────────────────────────────────────────────────── */

type Section = { heading: string; body: string[] }
type PageContent = {
  titleAr: string
  titleEn: string
  descriptionAr: string
  descriptionEn: string
  sectionsAr: Section[]
  sectionsEn: Section[]
}

const PAGES: Record<string, PageContent> = {
  about: {
    titleAr: "من نحن | أسومة ستور",
    titleEn: "About Us | Asuma Store",
    descriptionAr: "تعرّف على أسومة ستور — متجر الإكسسوارات والجمال الفاخر في القاهرة، مصر.",
    descriptionEn: "Learn about Asuma Store — luxury accessories and beauty, Cairo Egypt.",
    sectionsAr: [
      {
        heading: "قصتنا",
        body: [
          "أسومة ستور هو وجهتك المتميزة للإكسسوارات ومستحضرات التجميل الفاخرة في القاهرة، مصر.",
          "نؤمن بأن كل تفصيلة تصنع الفارق — من خامة المنتج إلى طريقة التغليف وصولًا إلى لحظة فتح الطرد.",
        ],
      },
      {
        heading: "ما نقدمه",
        body: [
          "إكسسوارات راقية · توكات وأكسسوارات الشعر · مستحضرات مكياج عالية الجودة · عطور مختارة · بوكسات هدايا فاخرة.",
          "كل منتج مختار بعناية ليعكس ذوقًا رفيعًا وجودة لا تُضاهى.",
        ],
      },
      {
        heading: "خدمة العملاء",
        body: [
          "نخدم عملاءنا في جميع أنحاء جمهورية مصر العربية بخدمة التوصيل حتى بابك والدفع عند الاستلام.",
          "للتواصل معنا: WhatsApp +20 103 316 3769 أو البريد الإلكتروني asmafarouq.89m@gmail.com",
        ],
      },
    ],
    sectionsEn: [
      {
        heading: "Our Story",
        body: [
          "Asuma Store is your premier destination for luxury accessories and beauty products in Cairo, Egypt.",
          "We believe every detail matters — from product quality to packaging, all the way to the unboxing moment.",
        ],
      },
      {
        heading: "What We Offer",
        body: [
          "Fine accessories · Hair accessories · Premium makeup · Curated fragrances · Luxury gift boxes.",
          "Every product is handpicked to reflect refined taste and unmatched quality.",
        ],
      },
      {
        heading: "Customer Service",
        body: [
          "We serve customers across Egypt with home delivery and Cash on Delivery payment.",
          "Contact us: WhatsApp +20 103 316 3769 or email asmafarouq.89m@gmail.com",
        ],
      },
    ],
  },

  contact: {
    titleAr: "تواصل معنا | أسومة ستور",
    titleEn: "Contact Us | Asuma Store",
    descriptionAr: "تواصل مع فريق أسومة ستور عبر واتساب أو البريد الإلكتروني.",
    descriptionEn: "Get in touch with Asuma Store via WhatsApp or email.",
    sectionsAr: [
      {
        heading: "كيف تتواصل معنا",
        body: [
          "نسعد بخدمتك في أي وقت. يمكنك التواصل معنا من خلال القنوات التالية:",
        ],
      },
      {
        heading: "واتساب",
        body: [
          "+20 103 316 3769",
          "متاحون من السبت إلى الخميس — 10 صباحًا حتى 10 مساءً.",
        ],
      },
      {
        heading: "البريد الإلكتروني",
        body: ["asmafarouq.89m@gmail.com"],
      },
      {
        heading: "الموقع",
        body: ["القاهرة، جمهورية مصر العربية."],
      },
    ],
    sectionsEn: [
      {
        heading: "How to Reach Us",
        body: [
          "We're happy to assist you at any time. You can reach us through the following channels:",
        ],
      },
      {
        heading: "WhatsApp",
        body: [
          "+20 103 316 3769",
          "Available Saturday–Thursday, 10 AM–10 PM.",
        ],
      },
      {
        heading: "Email",
        body: ["asmafarouq.89m@gmail.com"],
      },
      {
        heading: "Location",
        body: ["Cairo, Egypt."],
      },
    ],
  },

  "privacy-policy": {
    titleAr: "سياسة الخصوصية | أسومة ستور",
    titleEn: "Privacy Policy | Asuma Store",
    descriptionAr: "سياسة الخصوصية الخاصة بأسومة ستور وكيفية حماية بياناتك.",
    descriptionEn: "Asuma Store's privacy policy and how we protect your data.",
    sectionsAr: [
      {
        heading: "البيانات التي نجمعها",
        body: [
          "عند إتمام طلبك نجمع: الاسم، العنوان، رقم الهاتف، والبريد الإلكتروني (اختياري).",
          "نستخدم هذه البيانات فقط لإتمام عملية التوصيل والتواصل معك بشأن طلبك.",
        ],
      },
      {
        heading: "كيف نحمي بياناتك",
        body: [
          "لا نشارك بياناتك مع أي طرف ثالث خارج نطاق تنفيذ الطلب.",
          "لا نحتفظ ببيانات بطاقات الدفع — نظام الدفع الوحيد المتاح حاليًا هو الدفع عند الاستلام.",
        ],
      },
      {
        heading: "ملفات تعريف الارتباط (Cookies)",
        body: [
          "نستخدم ملفات تعريف ارتباط ضرورية لعمل سلة التسوق وتذكر تفضيلات اللغة فقط.",
        ],
      },
      {
        heading: "التواصل",
        body: [
          "لأي استفسار حول بياناتك: asmafarouq.89m@gmail.com",
        ],
      },
    ],
    sectionsEn: [
      {
        heading: "Data We Collect",
        body: [
          "When you place an order we collect: name, delivery address, phone number, and email (optional).",
          "We use this data solely to fulfil your order and communicate order status.",
        ],
      },
      {
        heading: "How We Protect Your Data",
        body: [
          "We do not share your data with third parties outside of order fulfilment.",
          "We do not store payment card details — the only payment method available is Cash on Delivery.",
        ],
      },
      {
        heading: "Cookies",
        body: [
          "We use only essential cookies required for cart functionality and language preference.",
        ],
      },
      {
        heading: "Contact",
        body: ["For any data queries: asmafarouq.89m@gmail.com"],
      },
    ],
  },

  "terms-of-use": {
    titleAr: "الشروط والأحكام | أسومة ستور",
    titleEn: "Terms of Use | Asuma Store",
    descriptionAr: "الشروط والأحكام الخاصة باستخدام متجر أسومة ستور.",
    descriptionEn: "Terms and conditions for using Asuma Store.",
    sectionsAr: [
      {
        heading: "قبول الشروط",
        body: [
          "باستخدامك لهذا المتجر فأنت توافق على الشروط والأحكام التالية.",
        ],
      },
      {
        heading: "المنتجات والأسعار",
        body: [
          "جميع الأسعار بالجنيه المصري وتشمل ضريبة القيمة المضافة إن وُجدت.",
          "نحتفظ بحق تعديل الأسعار أو توقف المنتجات دون إشعار مسبق.",
        ],
      },
      {
        heading: "الطلبات والتأكيد",
        body: [
          "يُعدّ الطلب مؤكدًا بعد تأكيد الاستلام من فريقنا عبر الهاتف أو الواتساب.",
          "نحتفظ بحق رفض أي طلب في حالات استثنائية.",
        ],
      },
      {
        heading: "المسؤولية",
        body: [
          "أسومة ستور غير مسؤول عن أي تأخير في التوصيل ناتج عن ظروف خارجة عن إرادتنا.",
        ],
      },
    ],
    sectionsEn: [
      {
        heading: "Acceptance of Terms",
        body: [
          "By using this store you agree to the following terms and conditions.",
        ],
      },
      {
        heading: "Products and Prices",
        body: [
          "All prices are in Egyptian Pounds and include applicable taxes.",
          "We reserve the right to modify prices or discontinue products without prior notice.",
        ],
      },
      {
        heading: "Orders and Confirmation",
        body: [
          "An order is confirmed after our team confirms receipt via phone or WhatsApp.",
          "We reserve the right to refuse any order in exceptional circumstances.",
        ],
      },
      {
        heading: "Liability",
        body: [
          "Asuma Store is not liable for delivery delays caused by circumstances beyond our control.",
        ],
      },
    ],
  },

  "shipping-policy": {
    titleAr: "سياسة الشحن والإرجاع | أسومة ستور",
    titleEn: "Shipping & Returns | Asuma Store",
    descriptionAr: "سياسة الشحن والتوصيل والإرجاع والاستبدال في أسومة ستور.",
    descriptionEn: "Asuma Store shipping, delivery, returns and exchange policy.",
    sectionsAr: [
      {
        heading: "التوصيل",
        body: [
          "نوصّل لجميع محافظات مصر. رسوم الشحن: 40 ج.م للشحن العادي — 80 ج.م للشحن السريع.",
          "مدة التوصيل: 2–5 أيام عمل للشحن العادي، 1–2 يوم عمل للشحن السريع (يُحدَّد المدة الفعلية عند التأكيد).",
        ],
      },
      {
        heading: "الدفع",
        body: [
          "الدفع عند الاستلام فقط (كاش) — لا نقبل دفع مسبق حاليًا.",
        ],
      },
      {
        heading: "الإرجاع والاستبدال",
        body: [
          "يمكن الإرجاع أو الاستبدال خلال 3 أيام من تاريخ الاستلام في حالة وجود عيب مصنعي أو خطأ في الطلب.",
          "شرط الإرجاع: المنتج غير مستخدم وفي عبوته الأصلية.",
          "لا يُقبل إرجاع منتجات المكياج والعطور بعد فتح الغلاف الأصلي لأسباب صحية.",
          "للمطالبة بالإرجاع: تواصل معنا عبر واتساب +20 103 316 3769 خلال مدة الإرجاع.",
        ],
      },
      {
        heading: "إلغاء الطلب",
        body: [
          "يمكن إلغاء الطلب قبل خروجه للتوصيل. تواصل معنا فورًا عبر واتساب لطلب الإلغاء.",
        ],
      },
    ],
    sectionsEn: [
      {
        heading: "Delivery",
        body: [
          "We deliver to all Egyptian governorates. Shipping fees: 40 EGP standard — 80 EGP express.",
          "Delivery time: 2–5 business days standard, 1–2 business days express (actual timing confirmed at order).",
        ],
      },
      {
        heading: "Payment",
        body: [
          "Cash on Delivery only — no pre-payment at this time.",
        ],
      },
      {
        heading: "Returns & Exchanges",
        body: [
          "Returns or exchanges accepted within 3 days of receipt for manufacturing defects or order errors.",
          "Return condition: unused product in original packaging.",
          "Makeup and fragrances cannot be returned after the original seal is broken for hygiene reasons.",
          "To request a return: contact us via WhatsApp +20 103 316 3769 within the return window.",
        ],
      },
      {
        heading: "Order Cancellation",
        body: [
          "Orders can be cancelled before dispatch. Contact us immediately via WhatsApp.",
        ],
      },
    ],
  },
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = PAGES[slug]
  if (!page) return { title: "404 | أسومة ستور" }
  return {
    title: page.titleAr,
    description: page.descriptionAr,
    alternates: { languages: { ar: page.titleAr, en: page.titleEn } },
  }
}

export default async function ContentPage({ params }: Props) {
  const { slug } = await params
  const page = PAGES[slug]
  if (!page) return notFound()

  return (
    <div style={{ backgroundColor: "var(--obsidian)", minHeight: "calc(100vh - 72px)" }}>
      <div
        className="content-container py-16 mx-auto"
        style={{ maxWidth: "760px" }}
      >
        {/* ── Header ── */}
        <div className="mb-12">
          <div
            aria-hidden="true"
            style={{
              width: "32px",
              height: "1px",
              background: "var(--gold)",
              marginBottom: "1.5rem",
            }}
          />
          <h1
            className="font-display font-light italic mb-3"
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              color: "var(--ivory)",
              letterSpacing: "0.02em",
              lineHeight: 1.2,
            }}
          >
            {page.titleAr.split("|")[0].trim()}
          </h1>
          <p
            className="font-sans"
            style={{ color: "var(--ivory-muted)", fontSize: "0.85rem", letterSpacing: "0.06em" }}
          >
            {page.titleEn.split("|")[0].trim()}
          </p>
          <div
            aria-hidden="true"
            style={{
              height: "1px",
              background: "linear-gradient(90deg, var(--gold-border), transparent)",
              marginTop: "2rem",
            }}
          />
        </div>

        {/* ── Arabic content ── */}
        <div className="mb-16" dir="rtl" lang="ar">
          {page.sectionsAr.map((section) => (
            <div key={section.heading} className="mb-10">
              <h2
                className="font-sans mb-4"
                style={{
                  color: "var(--gold)",
                  fontSize: "0.75rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
              >
                {section.heading}
              </h2>
              {section.body.map((para, i) => (
                <p
                  key={i}
                  className="font-sans leading-relaxed mb-3"
                  style={{
                    color: "var(--ivory-dim)",
                    fontSize: "0.95rem",
                    lineHeight: 1.8,
                  }}
                >
                  {para}
                </p>
              ))}
            </div>
          ))}
        </div>

        {/* ── Divider ── */}
        <div
          aria-hidden="true"
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, var(--gold-border), transparent)",
            marginBottom: "4rem",
          }}
        />

        {/* ── English content ── */}
        <div className="mb-16" dir="ltr" lang="en">
          <p
            className="font-sans mb-8"
            style={{
              color: "var(--ivory-muted)",
              fontSize: "0.7rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            English
          </p>
          {page.sectionsEn.map((section) => (
            <div key={section.heading} className="mb-10">
              <h2
                className="font-sans mb-4"
                style={{
                  color: "var(--gold)",
                  fontSize: "0.75rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
              >
                {section.heading}
              </h2>
              {section.body.map((para, i) => (
                <p
                  key={i}
                  className="font-sans leading-relaxed mb-3"
                  style={{
                    color: "var(--ivory-dim)",
                    fontSize: "0.95rem",
                    lineHeight: 1.8,
                  }}
                >
                  {para}
                </p>
              ))}
            </div>
          ))}
        </div>

        {/* ── Back link ── */}
        <div style={{ borderTop: "1px solid var(--gold-border)", paddingTop: "2rem" }}>
          <LocalizedClientLink
            href="/"
            className="font-sans text-sm transition-colors duration-200"
            style={{ color: "var(--gold-dark)" }}
          >
            ← العودة للرئيسية
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
