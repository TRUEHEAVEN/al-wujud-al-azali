import type { CSSProperties } from 'react'

type PortraitFrameProps = {
  name: string
  auraColor?: string
}

export function PortraitFrame({ name, auraColor = '#c9a84c' }: PortraitFrameProps) {
  return (
    <div className="portrait-frame" style={{ '--aura-color': auraColor } as CSSProperties}>
      <div className="portrait-core">{name.slice(0, 1).toUpperCase()}</div>
      <p className="portrait-name">{name}</p>
    </div>
  )
}
