export function SacredGeometry() {
  return (
    <div className="sacred-geometry" aria-hidden="true">
      <svg className="mandala mandala-outer" viewBox="0 0 400 400">
        <circle cx="200" cy="200" r="168" />
        <circle cx="200" cy="200" r="122" />
        <polygon points="200,46 332,123 332,277 200,354 68,277 68,123" />
      </svg>
      <svg className="mandala mandala-inner" viewBox="0 0 400 400">
        <circle cx="200" cy="200" r="92" />
        <polygon points="200,90 286,248 114,248" />
        <line x1="200" y1="108" x2="200" y2="292" />
        <line x1="120" y1="154" x2="280" y2="246" />
        <line x1="280" y1="154" x2="120" y2="246" />
      </svg>
    </div>
  )
}
