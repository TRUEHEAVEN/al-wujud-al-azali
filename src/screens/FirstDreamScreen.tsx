import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { RuneText } from '../components/RuneText'
import { CosmicButton } from '../components/CosmicButton'

const INTRO_SCENES = [
  {
    text: "In the beginning, there was only the void. And the void dreamed.",
    duration: 4000
  },
  {
    text: "The universe is old beyond memory. Stars have been born and died a thousand times.",
    duration: 5000
  },
  {
    text: "You were born into ash. The remnants of gods long forgotten.",
    duration: 4000
  },
  {
    text: "But in the silence between breaths, something stirs. A whisper from the eternal.",
    duration: 5000
  },
  {
    text: "The dream descends. You fall through dimensions, through layers of reality.",
    duration: 4500
  },
  {
    text: "You stand in a place that is not a place. Before you: two doors.",
    duration: 4000
  }
]

export function FirstDreamScreen() {
  const [currentScene, setCurrentScene] = useState(0)
  const [showSkip, setShowSkip] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentScene < INTRO_SCENES.length - 1) {
        setCurrentScene(prev => prev + 1)
      } else {
        // Transition to the two doors scene
        navigate('/doors')
      }
    }, INTRO_SCENES[currentScene].duration)

    // Show skip button after first scene
    if (currentScene > 0) {
      setShowSkip(true)
    }

    return () => clearTimeout(timer)
  }, [currentScene, navigate])

  const handleSkip = () => {
    navigate('/doors')
  }

  return (
    <motion.div
      className="screen screen-first-dream"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Cosmic background with particles */}
      <div className="dream-background">
        <motion.div
          className="dream-particles"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%']
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        />
      </div>

      {/* Scene content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScene}
          className="dream-scene"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 1.5 }}
        >
          <div className="dream-text-container">
            <RuneText text={INTRO_SCENES[currentScene].text} />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Skip button */}
      <AnimatePresence>
        {showSkip && (
          <motion.div
            className="skip-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CosmicButton onClick={handleSkip} size="small">
              Skip Intro
            </CosmicButton>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}