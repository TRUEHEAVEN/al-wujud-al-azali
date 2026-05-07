import { SacredGeometry } from './SacredGeometry'

export function VoidBackground() {
  return (
    <div className="void-bg" aria-hidden="true">
      <div className="void-vignette" />
      <SacredGeometry />
      <div className="void-stars" />
      <div className="void-stars void-stars-far" />
      <div className="void-particles" />
      <div className="void-grain" />
    </div>
  )
}
