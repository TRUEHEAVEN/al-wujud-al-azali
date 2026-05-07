import { motion } from 'framer-motion'
import { FoundationStage, type FoundationStage as FoundationStageType } from '../types'

type FoundationDisplayProps = {
  stage: FoundationStageType
  integrity: number
}

const stageClassMap: Record<FoundationStageType, string> = {
  [FoundationStage.Egg]: 'foundation-egg',
  [FoundationStage.Crystalline]: 'foundation-crystalline',
  [FoundationStage.Patterned]: 'foundation-patterned',
  [FoundationStage.Shelled]: 'foundation-shelled',
  [FoundationStage.Dense]: 'foundation-dense',
}

export function FoundationDisplay({ stage, integrity }: FoundationDisplayProps) {
  return (
    <div className="foundation-display">
      <motion.div
        className={`foundation-core ${stageClassMap[stage]}`}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 3.2, repeat: Infinity }}
      />
      <p className="foundation-stage">{stage}</p>
      <p className="foundation-integrity">Integrity: {integrity}%</p>
    </div>
  )
}
