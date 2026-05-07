import { motion } from 'framer-motion'
import type { MasteryStage } from '../types'

type MysteryCounterProps = {
  marks: number
  stage: MasteryStage
}

export function MysteryCounter({ marks, stage }: MysteryCounterProps) {
  const progress = Math.min(100, (marks % 1000) / 10)

  return (
    <div className="mystery-counter">
      <svg viewBox="0 0 48 48" className="mystery-ring" aria-hidden="true">
        <circle cx="24" cy="24" r="20" className="mystery-ring-bg" />
        <motion.circle
          cx="24"
          cy="24"
          r="20"
          className="mystery-ring-progress"
          strokeDasharray={126}
          animate={{ strokeDashoffset: 126 - (126 * progress) / 100 }}
        />
      </svg>
      <div>
        <p className="mystery-count">{marks.toLocaleString()} marks</p>
        <p className="mystery-stage">{stage}</p>
      </div>
    </div>
  )
}
