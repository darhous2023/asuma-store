import { clx } from "@modules/common/components/ui"

type AsumaLogoProps = {
  className?: string
  size?: number
  showText?: boolean
}

export default function AsumaLogo({ className, size = 36, showText = true }: AsumaLogoProps) {
  return (
    <div className={clx("flex items-center gap-x-3", className)}>
      {/* Triangle / arch monogram */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer arch triangle */}
        <path
          d="M24 5 L43 41 H5 Z"
          stroke="#C9A96E"
          strokeWidth="1.4"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Inner horizontal bar (letter A crossbar) */}
        <line x1="14" y1="32" x2="34" y2="32" stroke="#C9A96E" strokeWidth="1.2" />
        {/* Center vertical serif tick at apex */}
        <line x1="24" y1="5" x2="24" y2="10" stroke="#C9A96E" strokeWidth="1" opacity="0.5" />
      </svg>

      {showText && (
        <span
          className="font-display tracking-[0.2em] text-gold uppercase"
          style={{ fontSize: "1rem", letterSpacing: "0.2em", lineHeight: 1 }}
        >
          Asuma
        </span>
      )}
    </div>
  )
}
