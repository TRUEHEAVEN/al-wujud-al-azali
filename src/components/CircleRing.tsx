import { motion } from 'framer-motion'

type CircleRingProps = {
  circle: number
  progress: number
  size?: 'small' | 'medium' | 'large'
}

export function CircleRing({ circle, progress, size = 'medium' }: CircleRingProps) {
  const clamped = Math.max(0, Math.min(100, progress))

  const sizeClasses = {
    small: 'circle-ring-small',
    medium: 'circle-ring-medium',
    large: 'circle-ring-large'
  }

  return (
    <div className={`circle-ring-wrap ${sizeClasses[size]}`}>
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
