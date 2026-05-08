import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CircleRing } from './CircleRing'
import { CosmicButton } from './CosmicButton'
import { EnergyBar } from './EnergyBar'
import { RuneText } from './RuneText'
import { useGameStore } from '../store/gameStore'
import {
  checkCircleAscension,
  getCircleProgress,
  getCultivationSummary,
  checkFoundationEvolution,
} from '../systems/cultivationEngine'
import {
  getCircleRequirement,
  BONE_TOTAL,
  CIRCLE_REQUIREMENTS,
} from '../data/cultivationData'
import { FoundationStage } from '../types'

type CultivationPanelProps = {
  onNotification?: (message: string, type: string) => void
}

const FOUNDATION_DESCRIPTIONS: Record<string, string> = {
  [FoundationStage.Egg]: 'A nascent egg, pulsing with potential. All cultivation begins in this fragile shell.',
  [FoundationStage.Crystalline]: 'The egg crystallizes into a geometric lattice. Each facet reflects a truth of your Path.',
  [FoundationStage.Patterned]: 'Intricate patterns etch themselves into the crystalline structure\u2014glyphs of power, memory, and destiny.',
  [FoundationStage.Shelled]: 'A hardened shell forms around the core. Your Foundation can now withstand the pressure of higher realms.',
  [FoundationStage.Dense]: 'The Foundation collapses inward, becoming impossibly dense. A singularity of cultivation that bends reality around it.',
}

const STAGE_ORDER: string[] = [
  FoundationStage.Egg,
  FoundationStage.Crystalline,
  FoundationStage.Patterned,
  FoundationStage.Shelled,
  FoundationStage.Dense,
]

export function CultivationPanel({ onNotification }: CultivationPanelProps) {
  const character = useGameStore((s) => s.character)
  const ascendCircle = useGameStore((s) => s.ascendCircle)
  const forgeBoneMax = useGameStore((s) => s.forgeBoneMax)
  const evolveFoundationAction = useGameStore((s) => s.evolveFoundationAction)
  const refineMasteryStage = useGameStore((s) => s.refineMasteryStage)

  const [showAscensionRitual, setShowAscensionRitual] = useState(false)
  const [ritualStep, setRitualStep] = useState(0)
  const [ritualInProgress, setRitualInProgress] = useState(false)

  const summary = useMemo(() => getCultivationSummary(character), [character])
  const ascensionCheck = useMemo(() => checkCircleAscension(character), [character])

  const nextReq = useMemo(() => {
    if (character.circle >= 9) return null
    return getCircleRequirement(character.circle + 1) ?? null
  }, [character.circle])

  const notify = (message: string, type = 'info') => {
    onNotification?.(message, type)
  }

  const handleForgeBones = () => {
    const result = forgeBoneMax()
    notify(result.message, result.success ? 'achievement' : 'info')
  }

  const handleEvolveFoundation = () => {
    const result = evolveFoundationAction()
    if (result.evolved) {
      notify(`Foundation evolved to ${result.newStage}!`, 'stage')
    }
  }

  const handleRefineMastery = () => {
    const result = refineMasteryStage()
    if (result.stageAdvanced) {
      notify(`Mastery advanced to ${result.newStage}!`, 'stage')
    }
  }

  const startAscensionRitual = () => {
    setShowAscensionRitual(true)
    setRitualStep(0)
    setRitualInProgress(true)
  }

  const completeAscension = () => {
    const ascended = ascendCircle()
    if (ascended) {
      notify(`Circle ${ascended.circle} attained \u2014 ${ascended.circle <= 9 ? CIRCLE_REQUIREMENTS[ascended.circle - 1].name : 'Unknown'}`, 'stage')
      refineMasteryStage()
      handleEvolveFoundation()
    }
    setShowAscensionRitual(false)
    setRitualInProgress(false)
    setRitualStep(0)
  }

  const ritualPhrases = [
    'The void stirs...',
    'Marks coalesce into golden threads...',
    'Your Foundation trembles with anticipation...',
    'The Path opens before you...',
    'Reality bends to your will...',
    'You are becoming...',
    'ASCEND.',
  ]

  const BoneGrid = useMemo(() => {
    const bones = character.mystery.bones
    const total = BONE_TOTAL
    const rows = 16
    const cols = 13

    return (
      <div className="bone-grid">
        <div className="bone-grid-header">
          <span className="bone-count">
            {bones.toLocaleString()} / {total.toLocaleString()}
          </span>
          <span className="bone-label">Mystery Bones</span>
        </div>
        <div
          className="bone-grid-visual"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: '2px',
          }}
        >
          {Array.from({ length: rows * cols }).map((_, i) => {
            if (i >= total) return <div key={i} className="bone-dot-empty" />
            return (
              <div
                key={i}
                className={`bone-dot ${i < bones ? 'bone-dot-forged' : 'bone-dot-unforged'}`}
              />
            )
          })}
        </div>
      </div>
    )
  }, [character.mystery.bones])

  const foundationCheck = useMemo(() => checkFoundationEvolution(character), [character])

  const ritualContent = (
    <motion.div
      className="ascension-ritual"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
    >
      <RuneText text="CIRCLE ASCENSION RITUAL" />
      <div className="ritual-circle-visual">
        <CircleRing
          circle={character.circle + 1}
          progress={ritualStep * (100 / ritualPhrases.length)}
          size="large"
        />
      </div>
      <motion.p
        className="ritual-phrase"
        key={ritualStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {ritualPhrases[Math.min(ritualStep, ritualPhrases.length - 1)]}
      </motion.p>
      {ritualStep < ritualPhrases.length ? (
        <CosmicButton
          onClick={() => setRitualStep((s) => s + 1)}
          glow="strong"
        >
          Continue...
        </CosmicButton>
      ) : (
        <CosmicButton onClick={completeAscension} glow="hard">
          Embrace the Next Circle
        </CosmicButton>
      )}
    </motion.div>
  )

  return (
    <div className="cultivation-panel">
      <AnimatePresence mode="wait">
        {showAscensionRitual ? (
          <motion.div
            key="ritual"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {ritualContent}
          </motion.div>
        ) : (
          <motion.div
            key="overview"
            className="cultivation-overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="cultivation-top-bar">
              <div className="circle-progress-section">
                <CircleRing
                  circle={character.circle}
                  progress={summary.circleProgress.percentage}
                  size="large"
                />
                <div className="circle-progress-info">
                  <span className="circle-name">
                    Circle {character.circle}
                    {CIRCLE_REQUIREMENTS[character.circle - 1] && (
                      <span className="circle-subtitle">
                        {' \u2014 '}
                        {CIRCLE_REQUIREMENTS[character.circle - 1].name}
                      </span>
                    )}
                  </span>
                  <div className="circle-marks-progress">
                    <EnergyBar
                      value={summary.circleProgress.current}
                      max={summary.circleProgress.target}
                    />
                    <span className="marks-progress-label">
                      {summary.circleProgress.current.toLocaleString()} /{' '}
                      {summary.circleProgress.target.toLocaleString()} Marks
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {nextReq && (
              <div className="ascension-requirements">
                <h4>Next Circle Requirements</h4>
                <div className="req-grid">
                  <div
                    className={`req-item ${summary.totalMarks >= nextReq.minMarks ? 'req-met' : 'req-unmet'}`}
                  >
                    <span className="req-label">Marks</span>
                    <span className="req-value">
                      {summary.totalMarks.toLocaleString()} /{' '}
                      {nextReq.minMarks.toLocaleString()}
                    </span>
                  </div>
                  <div
                    className={`req-item ${character.mystery.bones >= nextReq.minBones ? 'req-met' : 'req-unmet'}`}
                  >
                    <span className="req-label">Bones</span>
                    <span className="req-value">
                      {character.mystery.bones} / {nextReq.minBones}
                    </span>
                  </div>
                  <div className={`req-item req-met`}>
                    <span className="req-label">Mastery</span>
                    <span className="req-value">
                      {character.mystery.masteryStage} /{' '}
                      {nextReq.minMasteryStage}
                    </span>
                  </div>
                  {nextReq.foundationStage && (
                    <div
                      className={`req-item ${STAGE_ORDER.indexOf(character.foundation.stage) >= STAGE_ORDER.indexOf(nextReq.foundationStage) ? 'req-met' : 'req-unmet'}`}
                    >
                      <span className="req-label">Foundation</span>
                      <span className="req-value">
                        {character.foundation.stage} /{' '}
                        {nextReq.foundationStage}
                      </span>
                    </div>
                  )}
                </div>

                {ascensionCheck.can ? (
                  <CosmicButton
                    onClick={startAscensionRitual}
                    glow="hard"
                    className="ascend-btn"
                  >
                    Ascend to Circle {character.circle + 1}
                    {' \u2014 '}
                    {nextReq.name}
                  </CosmicButton>
                ) : (
                  <div className="ascend-locked">
                    <RuneText text="ASCENSION LOCKED" />
                    <ul className="unmet-list">
                      {ascensionCheck.unmetReasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="cultivation-details">
              <div className="cultivation-section">
                <h4>Mastery Stage</h4>
                <div className="mastery-info">
                  <span className="mastery-stage-badge">
                    {character.mystery.masteryStage}
                  </span>
                  <span className="mastery-marks">
                    Total Marks:{' '}
                    {summary.totalMarks.toLocaleString()}
                  </span>
                  <span className="mastery-multiplier">
                    Boost: {character.mystery.boostMultiplier}x
                  </span>
                </div>
                <CosmicButton
                  onClick={handleRefineMastery}
                  glow="soft"
                  size="small"
                >
                  Refine Mark Essence
                </CosmicButton>
              </div>

              <div className="cultivation-section">
                <h4>Foundation</h4>
                <div className="foundation-info">
                  <div className="foundation-stage-evolution">
                    {STAGE_ORDER.map((stage) => (
                      <div
                        key={stage}
                        className={`foundation-stage-dot ${STAGE_ORDER.indexOf(stage) <= STAGE_ORDER.indexOf(character.foundation.stage) ? 'stage-reached' : 'stage-locked'}`}
                      >
                        <span className="stage-dot" />
                        <span className="stage-label">{stage}</span>
                      </div>
                    ))}
                  </div>
                  <p className="foundation-desc">
                    {FOUNDATION_DESCRIPTIONS[character.foundation.stage] ??
                      'An unknown Foundation stage.'}
                  </p>
                  <span className="foundation-integrity">
                    Integrity: {character.foundation.integrity}%
                  </span>
                </div>
                {foundationCheck.canEvolve && (
                  <CosmicButton
                    onClick={handleEvolveFoundation}
                    glow="medium"
                    size="small"
                  >
                    Evolve to {foundationCheck.nextStage}
                  </CosmicButton>
                )}
                {!foundationCheck.canEvolve && foundationCheck.nextStage && (
                  <p className="foundation-requirement-hint">
                    {foundationCheck.requirement}
                  </p>
                )}
              </div>

              <div className="cultivation-section">
                <h4>Bone Forging</h4>
                {BoneGrid}
                <div className="bone-actions">
                  <span className="bone-cost">
                    1 Bone = 10,000 Marks
                  </span>
                  <CosmicButton
                    onClick={handleForgeBones}
                    glow="medium"
                    size="small"
                    disabled={character.mystery.bones >= BONE_TOTAL}
                  >
                    Forge Bones
                  </CosmicButton>
                </div>
              </div>

              <div className="cultivation-section">
                <h4>Circle Bonuses</h4>
                <div className="circle-bonuses">
                  <div className="bonus-item">
                    <label>Lifespan</label>
                    <span>{character.lifespan.toLocaleString()} years</span>
                  </div>
                  <div className="bonus-item">
                    <label>Mind Space</label>
                    <span>{character.mindSpace}</span>
                  </div>
                  <div className="bonus-item">
                    <label>Six Sense</label>
                    <span>
                      {character.circle >= 5
                        ? 'Infinite'
                        : character.circle >= 4
                          ? 'Vast'
                          : character.circle >= 3
                            ? 'Awake'
                            : character.circle >= 2
                              ? 'Stirring'
                              : 'Dormant'}
                    </span>
                  </div>
                </div>
                {CIRCLE_REQUIREMENTS[character.circle - 1] && (
                  <div className="current-unlocks">
                    <h5>Current Circle Unlocks</h5>
                    <ul className="unlock-list">
                      {CIRCLE_REQUIREMENTS[character.circle - 1].unlocks.map(
                        (u, i) => (
                          <li key={i}>{u}</li>
                        ),
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
