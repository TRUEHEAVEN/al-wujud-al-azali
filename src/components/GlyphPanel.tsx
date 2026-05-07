import { type PropsWithChildren } from 'react'

type GlyphPanelProps = PropsWithChildren<{
  title?: string
  className?: string
}>

export function GlyphPanel({ title, className, children }: GlyphPanelProps) {
  const panelClass = className ? `glyph-panel ${className}` : 'glyph-panel'

  return (
    <section className={panelClass}>
      {title ? <h2 className="glyph-panel-title">{title}</h2> : null}
      <div className="glyph-panel-content">{children}</div>
    </section>
  )
}
