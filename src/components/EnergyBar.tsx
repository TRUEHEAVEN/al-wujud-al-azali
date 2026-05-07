import { motion } from 'framer-motion'

type EnergyBarProps = {
  value: number
  max: number
  label?: string
}

export function EnergyBar({ value, max, label = 'Path Energy' }: EnergyBarProps) {
  const safeMax = Math.max(1, max)
  const percent = Math.max(0, Math.min(100, (value / safeMax) * 100))

  return (
    <div className="energy-bar-wrap">
      <div className="energy-bar-meta">
        <span>{label}</span>
        <span>
          {value}/{max}
        </span>
      </div>
      <div className="energy-bar-track">
        <motion.div
          className="energy-bar-fill"
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
