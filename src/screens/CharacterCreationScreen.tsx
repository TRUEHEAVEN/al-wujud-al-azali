import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CosmicButton } from '../components/CosmicButton'
import { RuneText } from '../components/RuneText'
import { GlyphPanel } from '../components/GlyphPanel'
import { generatePathFromTrials } from '../utils/pathGenerator'
import type { TrialResult } from './TrialsScreen'
import type { Path } from '../types/path'
import type { Character } from '../types/character'
import { FoundationStage } from '../types/foundation'
import { MasteryStage } from '../types/mystery'
import { useGameStore } from '../store/gameStore'

export function CharacterCreationScreen() {
  const location = useLocation()
  const navigate = useNavigate()
  const { createCharacter } = useGameStore()

  const [generatedPath, setGeneratedPath] = useState<Path | null>(null)
  const [characterName, setCharacterName] = useState('')
  const [isGenerating, setIsGenerating] = useState(true)

  const trialResults = location.state?.trialResults as TrialResult[] | undefined

  useEffect(() => {
    if (!trialResults) {
      navigate('/trials')
      return
    }

    // Generate path from trial results
    const path = generatePathFromTrials(trialResults)
    setGeneratedPath(path)
    setIsGenerating(false)
  }, [trialResults, navigate])

  const handleCreateCharacter = () => {
    if (!generatedPath || !characterName.trim()) return

    // Create character with generated path
    const character: Character = {
      id: `char-${Date.now()}`,
      name: characterName.trim(),
      age: 15, // Starting age
      circle: 1,
      path: generatedPath,
      foundation: {
        stage: FoundationStage.Egg,
        pattern: 'unformed',
        shell: 'none',
        weight: 1,
        chainUnlocked: false,
        integrity: 100,
        cracked: false,
      },
      mystery: {
        count: 0,
        masteryStage: MasteryStage.Formation,
        bones: 0,
        boostMultiplier: 1,
        refinedTotal: 0,
      },
      mindSpace: 100,
      currentEnergy: 100,
      lifespan: 80, // Base human lifespan
      stats: {
        vitality: 10,
        strength: 10,
        agility: 10,
        insight: 10,
        will: 10,
        spirit: 10
      },
      techniques: generatedPath.techniques,
      choiceAtDoors: 'ascent'
    }

    createCharacter(character)
    navigate('/game')
  }

  if (!trialResults) {
    return null
  }

  if (isGenerating) {
    return (
      <motion.div
        className="screen screen-character-creation"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="creation-content">
          <RuneText text="Forging your destiny..." />
          <div className="creation-spinner" />
          <p className="creation-description">
            Your trials have revealed the threads of fate.
            Weaving them into your unique Path...
          </p>
        </div>
      </motion.div>
    )
  }

  if (!generatedPath) {
    return (
      <motion.div
        className="screen screen-character-creation"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="creation-content">
          <RuneText text="Path Generation Failed" />
          <p className="creation-description">
            Something went wrong in the path generation process.
            Please try the trials again.
          </p>
          <CosmicButton onClick={() => navigate('/trials')}>
            Return to Trials
          </CosmicButton>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="screen screen-character-creation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="creation-layout">
        <div className="path-display-section">
          <GlyphPanel title="Your Path">
            <div className="path-header">
              <h2 className="path-name" style={{ color: generatedPath.auraColor }}>
                {generatedPath.name}
              </h2>
              <p className="path-concept">{generatedPath.concept}</p>
            </div>

            <div className="path-details">
              <div className="path-attribute">
                <span className="attribute-label">Element:</span>
                <span className="attribute-value">{generatedPath.element}</span>
              </div>
              <div className="path-attribute">
                <span className="attribute-label">Archetype:</span>
                <span className="attribute-value">{generatedPath.archetype}</span>
              </div>
              <div className="path-attribute">
                <span className="attribute-label">Emotion:</span>
                <span className="attribute-value">{generatedPath.emotion}</span>
              </div>
            </div>

            <div className="path-description">
              <p>{generatedPath.description}</p>
              <p className="path-philosophy">{generatedPath.philosophy}</p>
            </div>

            <div className="path-traits">
              <h3>Passive Traits</h3>
              <div className="traits-list">
                {generatedPath.passiveTraits.map(trait => (
                  <div key={trait.id} className="trait-item">
                    <span className="trait-name">{trait.name}</span>
                    <span className="trait-value">+{trait.value}</span>
                    <p className="trait-description">{trait.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="starting-techniques">
              <h3>Starting Techniques</h3>
              <div className="techniques-list">
                {generatedPath.techniques.map(technique => (
                  <span key={technique} className="technique-tag">
                    {technique.replace('-', ' ')}
                  </span>
                ))}
              </div>
            </div>
          </GlyphPanel>
        </div>

        <div className="character-setup-section">
          <GlyphPanel title="Character Setup">
            <div className="character-form">
              <div className="name-input-group">
                <label htmlFor="character-name">Cultivator Name</label>
                <input
                  id="character-name"
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder="Enter your name..."
                  className="name-input"
                  maxLength={30}
                />
              </div>

              <div className="character-preview">
                <h3>Starting Attributes</h3>
                <div className="stats-preview">
                  <div className="stat-item">
                    <span>Vitality:</span> <span>10</span>
                  </div>
                  <div className="stat-item">
                    <span>Strength:</span> <span>10</span>
                  </div>
                  <div className="stat-item">
                    <span>Agility:</span> <span>10</span>
                  </div>
                  <div className="stat-item">
                    <span>Insight:</span> <span>10</span>
                  </div>
                  <div className="stat-item">
                    <span>Will:</span> <span>10</span>
                  </div>
                  <div className="stat-item">
                    <span>Spirit:</span> <span>10</span>
                  </div>
                </div>

                <div className="foundation-preview">
                  <h4>Foundation</h4>
                  <p>Formation Stage - Egg Type</p>
                  <p>100 Integrity, 50 Stability</p>
                </div>
              </div>

              <div className="creation-actions">
                <CosmicButton
                  onClick={handleCreateCharacter}
                  disabled={!characterName.trim()}
                  className="create-button"
                >
                  Begin Cultivation
                </CosmicButton>
                <CosmicButton
                  onClick={() => navigate('/trials')}
                  glow="soft"
                >
                  Retake Trials
                </CosmicButton>
              </div>
            </div>
          </GlyphPanel>
        </div>
      </div>
    </motion.div>
  )
}