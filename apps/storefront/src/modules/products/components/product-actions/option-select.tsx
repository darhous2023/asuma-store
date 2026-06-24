import { HttpTypes } from "@medusajs/types"
import { clx } from "@modules/common/components/ui"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  const filteredOptions = (option.values ?? []).map((v) => v.value)

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm" style={{ color: "var(--ivory-muted, #7A6A5A)" }}>اختر {title}</span>
      <div
        className="flex flex-wrap justify-between gap-2"
        data-testid={dataTestId}
      >
        {filteredOptions.map((v) => {
          return (
            <button
              onClick={() => updateOption(option.id, v)}
              key={v}
              className={clx(
                "text-small-regular h-11 rounded-rounded p-2 flex-1 transition-all duration-150",
              )}
              style={{
                border: `1px solid ${v === current ? "var(--gold, #C9A96E)" : "var(--gold-border, rgba(201,169,110,0.25))"}`,
                backgroundColor: v === current ? "rgba(201,169,110,0.1)" : "transparent",
                color: v === current ? "var(--gold, #C9A96E)" : "var(--ivory, #F5F0E8)",
              }}
              disabled={disabled}
              data-testid="option-button"
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
