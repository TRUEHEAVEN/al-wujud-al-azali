import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlyphPanel } from './GlyphPanel'
import { CosmicButton } from './CosmicButton'
import { RuneText } from './RuneText'
import type { DiscoveryGame, DiscoveryReward } from '../types/exploration'
import { DiscoveryGameType } from '../types/exploration'

interface DiscoveryOverlayProps {
  game: DiscoveryGame
  onResolve: (reward: DiscoveryReward, success: boolean, message: string) => void
  onDismiss: () => void
}

export function DiscoveryOverlay({ game, onResolve, onDismiss }: DiscoveryOverlayProps) {
  const [phase, setPhase] = useState<'intro' | 'playing' | 'result'>('intro')
  const [memorySequence, setMemorySequence] = useState<number[]>([])
  const [playerSequence, setPlayerSequence] = useState<number[]>([])
  const [memoryPhase, setMemoryPhase] = useState<'showing' | 'input'>('showing')
  const [showIndex, setShowIndex] = useState(-1)
  const [resonanceValue, setResonanceValue] = useState(0.5)
  const [glyphRotations, setGlyphRotations] = useState<number[]>([])
  const [resultData, setResultData] = useState<{
    success: boolean
    reward: DiscoveryReward
    message: string
  } | null>(null)

  const generateMemorySequence = useCallback(() => {
    const length = (game.gameData.sequenceLength as number) ?? 5
    const seq: number[] = []
    for (let i = 0; i < length; i++) {
      seq.push(Math.floor(Math.random() * 4))
    }
    setMemorySequence(seq)
    setMemoryPhase('showing')
    setShowIndex(-1)

    let idx = 0
    const interval = setInterval(() => {
      if (idx >= seq.length) {
        clearInterval(interval)
        setTimeout(() => {
          setMemoryPhase('input')
          setShowIndex(-1)
        }, 400)
        return
      }
      setShowIndex(idx)
      idx += 1
    }, 800)
  }, [game])

  const handleStartGame = useCallback(() => {
    setPhase('playing')
    if (game.type === DiscoveryGameType.Memory) {
      generateMemorySequence()
      setPlayerSequence([])
    } else if (game.type === DiscoveryGameType.Resonance) {
      setResonanceValue(0.5)
    } else if (game.type === DiscoveryGameType.GlyphMatch) {
      const count = (game.gameData.pieceCount as number) ?? 4
      const rots: number[] = []
      for (let i = 0; i < count; i++) {
        rots.push(Math.floor(Math.random() * 4) * 90)
      }
      setGlyphRotations(rots)
    }
  }, [game, generateMemorySequence])

  const handleMemoryInput = useCallback(
    (idx: number) => {
      const next = [...playerSequence, idx]
      setPlayerSequence(next)
      if (next.length === memorySequence.length) {
        const success = next.every((v, i) => v === memorySequence[i])
        const reward = success ? game.onSuccess : game.onFailure
        const message = success
          ? 'The pattern burns into your memory! The ancient cultivator\'s legacy is yours.'
          : 'The pattern fades before you can capture it. A fragment remains.'
        setResultData({ success, reward, message })
        setPhase('result')
      }
    },
    [playerSequence, memorySequence, game],
  )

  const handleResonanceSubmit = useCallback(() => {
    const target = (game.gameData.harmonicTarget as number) ?? 0.72
    const tolerance = (game.gameData.tolerance as number) ?? 0.08
    const success = Math.abs(resonanceValue - target) <= tolerance
    const reward = success ? game.onSuccess : game.onFailure
    const message = success
      ? 'Your energy harmonizes perfectly! The resonance amplifies your Path.'
      : 'The frequency wobbles. You extract partial resonance.'
    setResultData({ success, reward, message })
    setPhase('result')
  }, [resonanceValue, game])

  const handleGlyphSubmit = useCallback(() => {
    const aligned = Math.random() < 0.4 + game.difficulty * 0.1
    const reward = aligned ? game.onSuccess : game.onFailure
    const message = aligned
      ? 'The glyph pieces snap into alignment! Ancient knowledge floods your mind.'
      : 'The glyph shatters further. You salvage what you can.'
    setResultData({ success: aligned, reward, message })
    setPhase('result')
  }, [game])

  const handleRiddleChoice = useCallback(
    (idx: number) => {
      const correct = game.gameData.correctIndex as number
      const success = idx === correct
      const reward = success ? game.onSuccess : game.onFailure
      const message = success
        ? '"Nothing" is the answer. The void acknowledges your wisdom.'
        : 'The void remains silent. Wrong answer.'
      setResultData({ success, reward, message })
      setPhase('result')
    },
    [game],
  )

  const handleCollectReward = useCallback(() => {
    if (resultData) {
      onResolve(resultData.reward, resultData.success, resultData.message)
    }
  }, [resultData, onResolve])

  return (
    <motion.div
      className="discovery-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="discovery-backdrop" />
      <div className="discovery-container">
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div
              key="intro"
              className="discovery-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <GlyphPanel title={game.title}>
                <div className="discovery-intro">
                  <RuneText text={game.title} />
                  <p className="discovery-description">{game.description}</p>
                  <div className="discovery-info">
                    <span className="discovery-difficulty">
                      Difficulty: {'\u2605'.repeat(Math.min(game.difficulty, 5))}
                    </span>
                    <span className="discovery-reward-preview">
                      Up to {game.onSuccess.marks} Marks
                    </span>
                  </div>
                  <div className="discovery-actions">
                    <CosmicButton onClick={handleStartGame} glow="strong">
                      Begin
                    </CosmicButton>
                    <CosmicButton onClick={onDismiss} glow="soft" size="small">
                      Skip
                    </CosmicButton>
                  </div>
                </div>
              </GlyphPanel>
            </motion.div>
          )}

          {phase === 'playing' && (
            <motion.div
              key="playing"
              className="discovery-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <GlyphPanel title={game.title}>
                <div className="discovery-game-area">
                  {game.type === DiscoveryGameType.Memory && (
                    <div className="mini-game memory-game">
                      <p className="game-instruction">
                        {memoryPhase === 'showing'
                          ? 'Watch the sequence...'
                          : 'Repeat the pattern!'}
                      </p>
                      <div className="memory-grid">
                        {[0, 1, 2, 3].map((idx) => (
                          <motion.button
                            key={idx}
                            className={`memory-cell ${showIndex === idx && memoryPhase === 'showing' ? 'active' : ''} ${memoryPhase === 'input' && playerSequence.includes(idx) ? 'selected' : ''}`}
                            animate={
                              showIndex === idx && memoryPhase === 'showing'
                                ? { scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }
                                : {}
                            }
                            onClick={() =>
                              memoryPhase === 'input' && handleMemoryInput(idx)
                            }
                            disabled={memoryPhase !== 'input'}
                          >
                            {idx + 1}
                          </motion.button>
                        ))}
                      </div>
                      <p className="game-progress">
                        {playerSequence.length} / {memorySequence.length}
                      </p>
                    </div>
                  )}

                  {game.type === DiscoveryGameType.Resonance && (
                    <div className="mini-game resonance-game">
                      <p className="game-instruction">
                        Tune the resonance to the harmonic frequency.
                      </p>
                      <div className="resonance-slider-wrap">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={Math.floor(resonanceValue * 100)}
                          onChange={(e) =>
                            setResonanceValue(parseInt(e.target.value) / 100)
                          }
                          className="resonance-slider"
                        />
                        <span className="resonance-label">
                          {(resonanceValue * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="resonance-wave">
                        <div
                          className="resonance-wave-fill"
                          style={{ height: `${resonanceValue * 100}%` }}
                        />
                      </div>
                      <CosmicButton onClick={handleResonanceSubmit} glow="strong">
                        Lock In Resonance
                      </CosmicButton>
                    </div>
                  )}

                  {game.type === DiscoveryGameType.GlyphMatch && (
                    <div className="mini-game glyph-game">
                      <p className="game-instruction">
                        Rotate each fragment to align the glyph.
                      </p>
                      <div className="glyph-pieces-grid">
                        {glyphRotations.map((rot, idx) => (
                          <motion.button
                            key={idx}
                            className="glyph-piece"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              const next = [...glyphRotations]
                              next[idx] = (rot + 90) % 360
                              setGlyphRotations(next)
                            }}
                          >
                            <span
                              className="glyph-piece-inner"
                              style={{ transform: `rotate(${rot}deg)` }}
                            >
                              {'\u2736'}
                            </span>
                            <span className="glyph-piece-label">
                              {rot}&deg;
                            </span>
                          </motion.button>
                        ))}
                      </div>
                      <CosmicButton onClick={handleGlyphSubmit} glow="strong">
                        Align Glyph
                      </CosmicButton>
                    </div>
                  )}

                  {game.type === DiscoveryGameType.VoidRiddle && (
                    <div className="mini-game riddle-game">
                      <p className="game-instruction">
                        "What exists before existence, and remains after annihilation?"
                      </p>
                      <div className="riddle-choices">
                        {(game.gameData.answers as string[]).map(
                          (answer, idx) => (
                            <CosmicButton
                              key={idx}
                              className="riddle-answer-btn"
                              onClick={() => handleRiddleChoice(idx)}
                              glow="soft"
                            >
                              {answer}
                            </CosmicButton>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </GlyphPanel>
            </motion.div>
          )}

          {phase === 'result' && resultData && (
            <motion.div
              key="result"
              className="discovery-content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
            >
              <GlyphPanel title={resultData.success ? 'Discovery!' : 'Partial Discovery'}>
                <div className="discovery-result">
                  <div
                    className={`discovery-result-icon ${resultData.success ? 'success' : 'failure'}`}
                  >
                    {resultData.success ? '\u2728' : '\u{1F4AB}'}
                  </div>
                  <p className="discovery-result-message">{resultData.message}</p>
                  <div className="discovery-result-rewards">
                    <span className="reward-item">
                      {'\u2728'} {resultData.reward.marks} Mystery Marks
                    </span>
                    {resultData.reward.bonusMarks > 0 && (
                      <span className="reward-item bonus">
                        {'\u2B50'} +{resultData.reward.bonusMarks} Bonus Marks
                      </span>
                    )}
                    {resultData.reward.energy && resultData.reward.energy > 0 && (
                      <span className="reward-item">
                        {'\u{1F4A0}'} +{resultData.reward.energy} Path Energy
                      </span>
                    )}
                    {resultData.reward.codexId && resultData.success && (
                      <span className="reward-item">
                        {'\u{1F4DC}'} Codex Entry Unlocked!
                      </span>
                    )}
                    {resultData.reward.techniqueId && resultData.success && (
                      <span className="reward-item">
                        {'\u2694\uFE0F'} Technique Fragment gained
                      </span>
                    )}
                  </div>
                  <CosmicButton onClick={handleCollectReward} glow="strong">
                    Collect Rewards
                  </CosmicButton>
                </div>
              </GlyphPanel>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
