import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlyphPanel } from './GlyphPanel'
import { CosmicButton } from './CosmicButton'
import { RuneText } from './RuneText'
import type { NarrativeScene, NarrativeChoice, NarrativeMood } from '../types/narrative'

export interface ResolvedNarrativeEvent {
  eventId: string
  scenes: NarrativeScene[]
  choices: NarrativeChoice[]
  flagOnComplete?: string
  codexOnView?: string
}

interface NarrativeOverlayProps {
  event: ResolvedNarrativeEvent
  onChoice: (choiceId: string) => void
  onDismiss: () => void
}

function moodLabel(mood: NarrativeMood): string {
  switch (mood) {
    case 'calm': return 'Calm'
    case 'intense': return 'Intense'
    case 'amused': return 'Amused'
    case 'terrifying': return 'Terrifying'
    case 'voiceless': return 'Voiceless'
    case 'triumphant': return 'Triumphant'
    case 'somber': return 'Somber'
    case 'mysterious': return 'Mysterious'
  }
}

function moodColor(mood: NarrativeMood): string {
  switch (mood) {
    case 'calm': return 'var(--spirit-blue)'
    case 'intense': return 'var(--blood-red)'
    case 'amused': return 'var(--gold-primary)'
    case 'terrifying': return '#ff4444'
    case 'voiceless': return 'var(--glyph-glow)'
    case 'triumphant': return 'var(--gold-bright)'
    case 'somber': return '#8b7355'
    case 'mysterious': return '#9b30ff'
  }
}

export function NarrativeOverlay({ event, onChoice, onDismiss }: NarrativeOverlayProps) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
  const scene = event.scenes[currentSceneIndex] ?? event.scenes[0]
  const isLastScene = currentSceneIndex >= event.scenes.length - 1
  const hasChoices = event.choices.length > 0 && isLastScene

  const advanceScene = useCallback(() => {
    if (currentSceneIndex < event.scenes.length - 1) {
      setCurrentSceneIndex((i) => i + 1)
    }
  }, [currentSceneIndex, event.scenes.length])

  const prevScene = useCallback(() => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex((i) => i - 1)
    }
  }, [currentSceneIndex])

  const mood = scene.mood ?? 'voiceless'
  const color = moodColor(mood)

  return (
    <motion.div
      className="narrative-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="narrative-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      />

      <div className="narrative-container">
        <GlyphPanel title="Narrative">
          <div className="narrative-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${event.eventId}-${scene.id}`}
                className="narrative-scene"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {(scene.speaker || moodLabel(mood)) && (
                  <div className="narrative-header">
                    {scene.speaker && (
                      <span className="narrative-speaker" style={{ color }}>
                        {scene.speaker}
                      </span>
                    )}
                    <span className="narrative-mood" style={{ color }}>
                      {moodLabel(mood)}
                    </span>
                  </div>
                )}

                <div className="narrative-text-container">
                  <RuneText text={scene.text} />
                </div>
              </motion.div>
            </AnimatePresence>

            {hasChoices ? (
              <motion.div
                className="narrative-choices"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                {event.choices.map((choice) => (
                  <CosmicButton
                    key={choice.id}
                    onClick={() => onChoice(choice.id)}
                    glow="soft"
                    className="narrative-choice-btn"
                  >
                    {choice.text}
                  </CosmicButton>
                ))}
              </motion.div>
            ) : (
              !isLastScene && (
                <div className="narrative-actions">
                  {currentSceneIndex > 0 && (
                    <CosmicButton onClick={prevScene} size="small" glow="soft">
                      Back
                    </CosmicButton>
                  )}
                  <CosmicButton onClick={advanceScene} glow="soft">
                    Continue
                  </CosmicButton>
                </div>
              )
            )}

            <div className="narrative-footer">
              <span className="narrative-scene-counter">
                {currentSceneIndex + 1} / {event.scenes.length}
              </span>
              {isLastScene && !hasChoices && (
                <CosmicButton onClick={onDismiss} size="small" glow="soft">
                  Dismiss
                </CosmicButton>
              )}
            </div>
          </div>
        </GlyphPanel>
      </div>
    </motion.div>
  )
}
