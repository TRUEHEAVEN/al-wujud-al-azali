import { motion } from 'framer-motion'

type CircleRingProps = {
  circle: number
  progress: number
}

export function CircleRing({ circle, progress }: CircleRingProps) {
  const clamped = Math.max(0, Math.min(100, progress))

  return (
    <div className="circle-ring-wrap">
      <svg viewBox="0 0 120 120" className="circle-ring" aria-hidden="true">
        <circle cx="60" cy="60" r="46" className="circle-ring-back" />
        <motion.circle
          cx="60"
          cy="60"
          r="46"
          className="circle-ring-front"
          strokeDasharray={289}
          animate={{ strokeDashoffset: 289 - (289 * clamped) / 100 }}
          transition={{ duration: 0.6 }}
        />
      </svg>
      <div className="circle-ring-label">
        <span>Circle</span>
        <strong>{circle}</strong>
      </div>
    </div>
  )
}
