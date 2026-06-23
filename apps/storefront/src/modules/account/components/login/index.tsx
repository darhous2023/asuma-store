import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)

  return (
    <div
      className="w-full max-w-sm flex flex-col items-center p-8"
      style={{ backgroundColor: "var(--carbon)", border: "1px solid var(--gold-border)" }}
      data-testid="login-page"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div style={{ width: "24px", height: "1px", background: "var(--gold-border)" }} />
        <h1
          className="font-display font-light italic uppercase"
          style={{ color: "var(--ivory)", letterSpacing: "0.18em", fontSize: "1.3rem" }}
        >
          تسجيل الدخول
        </h1>
        <div style={{ width: "24px", height: "1px", background: "var(--gold-border)" }} />
      </div>
      <p className="text-center text-sm mb-8" style={{ color: "var(--ivory-muted)" }}>
        ادخل إلى حسابك في أسومة ستور
      </p>

      {message?.state === "verification_required" && (
        <div
          className="w-full mb-6 text-center text-sm p-4"
          style={{ backgroundColor: "var(--carbon-2)", border: "1px solid var(--gold-border)", color: "var(--ivory-dim)" }}
          data-testid="login-verification-message"
        >
          تم إرسال رابط التحقق إلى <strong style={{ color: "var(--gold)" }}>{message.email}</strong>. يرجى التحقق من بريدك الإلكتروني ثم تسجيل الدخول.
        </div>
      )}

      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="البريد الإلكتروني"
            name="email"
            type="email"
            title="أدخل بريد إلكتروني صحيح"
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label="كلمة المرور"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        <ErrorMessage
          error={message?.state === "error" ? message.error : null}
          data-testid="login-error-message"
        />
        <SubmitButton data-testid="sign-in-button" className="w-full mt-6">
          دخول
        </SubmitButton>
      </form>

      <span className="text-center text-sm mt-6" style={{ color: "var(--ivory-muted)" }}>
        ليس لديك حساب؟{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="transition-colors duration-200"
          style={{ color: "var(--gold)", textDecoration: "underline" }}
          data-testid="register-button"
        >
          إنشاء حساب
        </button>
      </span>
    </div>
  )
}

export default Login
