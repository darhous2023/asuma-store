"use client"

import { useActionState } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)

  return (
    <div
      className="w-full max-w-sm flex flex-col items-center p-8"
      style={{ backgroundColor: "var(--carbon)", border: "1px solid var(--gold-border)" }}
      data-testid="register-page"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div style={{ width: "24px", height: "1px", background: "var(--gold-border)" }} />
        <h1
          className="font-display font-light italic uppercase"
          style={{ color: "var(--ivory)", letterSpacing: "0.18em", fontSize: "1.3rem" }}
        >
          إنشاء حساب
        </h1>
        <div style={{ width: "24px", height: "1px", background: "var(--gold-border)" }} />
      </div>
      <p className="text-center text-sm mb-6" style={{ color: "var(--ivory-muted)" }}>
        انضم إلى أسومة ستور واستمتع بتجربة تسوق مميزة
      </p>

      {message?.state === "verification_required" && (
        <div
          className="w-full mb-4 text-center text-sm p-4"
          style={{ backgroundColor: "var(--carbon-2)", border: "1px solid var(--gold-border)", color: "var(--ivory-dim)" }}
          data-testid="register-verification-message"
        >
          تم إرسال رابط التحقق إلى <strong style={{ color: "var(--gold)" }}>{message.email}</strong>. يرجى التحقق من بريدك ثم تسجيل الدخول.
        </div>
      )}

      <form className="w-full flex flex-col" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="الاسم الأول"
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label="اسم العائلة"
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
          <Input
            label="البريد الإلكتروني"
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label="رقم الهاتف"
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label="كلمة المرور"
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
        </div>
        <ErrorMessage
          error={message?.state === "error" ? message.error : null}
          data-testid="register-error"
        />
        <span className="text-center text-xs mt-6" style={{ color: "var(--ivory-muted)" }}>
          بإنشاء حساب، أنت توافق على{" "}
          <LocalizedClientLink
            href="/content/privacy-policy"
            className="transition-colors duration-200"
            style={{ color: "var(--gold)", textDecoration: "underline" }}
          >
            سياسة الخصوصية
          </LocalizedClientLink>{" "}
          و{" "}
          <LocalizedClientLink
            href="/content/terms-of-use"
            className="transition-colors duration-200"
            style={{ color: "var(--gold)", textDecoration: "underline" }}
          >
            شروط الاستخدام
          </LocalizedClientLink>
        </span>
        <SubmitButton className="w-full mt-6" data-testid="register-button">
          إنشاء حساب
        </SubmitButton>
      </form>

      <span className="text-center text-sm mt-6" style={{ color: "var(--ivory-muted)" }}>
        لديك حساب بالفعل؟{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="transition-colors duration-200"
          style={{ color: "var(--gold)", textDecoration: "underline" }}
        >
          تسجيل الدخول
        </button>
      </span>
    </div>
  )
}

export default Register
