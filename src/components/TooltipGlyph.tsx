import { useState, type PropsWithChildren } from 'react'

type TooltipGlyphProps = PropsWithChildren<{
  label: string
  text: string
}>

export function TooltipGlyph({ label, text, children }: TooltipGlyphProps) {
  const [open, setOpen] = useState(false)

  return (
    <span
      className="tooltip-glyph"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span className="tooltip-anchor" tabIndex={0} aria-label={label}>
        {children}
      </span>
      {open ? <span className="tooltip-bubble">{text}</span> : null}
    </span>
  )
}
