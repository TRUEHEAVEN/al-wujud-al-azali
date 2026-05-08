import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GlyphPanel } from '../components/GlyphPanel'
import { VoidBackground } from '../components/VoidBackground'
import { RuneText } from '../components/RuneText'
import { listSaves } from '../systems/saveSystem'

// Ancient lore quotes for cycling
const LORE_QUOTES = [
  "In the beginning, there was only the void. And the void dreamed.",
  "The Path is not chosen. The Path chooses you.",
  "Every circle is a prison. Every ascension is a breaking.",
  "The Silent Author writes in blood and starlight.",
  "Mortality is the first illusion. The Path is the first truth.",
  "You are not the first to walk this road. You will not be the last.",
  "The universe remembers every step. Every choice. Every death.",
]

export function MainMenuScreen() {
  const [currentQuote, setCurrentQuote] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Cycle through quotes every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % LORE_QUOTES.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const handleNewGame = () => {
    setIsTransitioning(true)
    // Transition will be handled by routing
  }

  const handleContinue = () => {
    setIsTransitioning(true)
    // Transition will be handled by routing
  }

  const saves = listSaves()

  return (
    <motion.section
      className="screen screen-main-menu"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 1.5 }}
    >
      <VoidBackground />

      {/* Animated cosmic mandala overlay */}
      <motion.div
        className="cosmic-mandala"
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 400 400">
          <circle cx="200" cy="200" r="180" fill="none" stroke="var(--gold-primary)" strokeWidth="1" opacity="0.1" />
          <circle cx="200" cy="200" r="140" fill="none" stroke="var(--gold-dim)" strokeWidth="1" opacity="0.15" />
          <circle cx="200" cy="200" r="100" fill="none" stroke="var(--gold-muted)" strokeWidth="1" opacity="0.2" />
          <polygon points="200,20 350,120 350,280 200,380 50,280 50,120" fill="none" stroke="var(--gold-primary)" strokeWidth="1" opacity="0.08" />
        </svg>
      </motion.div>

      {/* Title Section */}
      <motion.div
        className="title-section"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1.5 }}
      >
        <h1 className="main-title-arabic">الوجود الأزلي</h1>
        <h2 className="main-title-english">AL-WUJUD AL-AZALI</h2>
        <p className="subtitle">The Eternal Existence</p>
      </motion.div>

      {/* Lore Quote */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuote}
          className="lore-quote"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 1.5 }}
        >
          <RuneText text={`"${LORE_QUOTES[currentQuote]}"`} />
        </motion.div>
      </AnimatePresence>

      {/* Menu Options */}
      <motion.div
        className="menu-container"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <GlyphPanel title="Choose Your Path">
          <nav className="menu-list" aria-label="Main navigation">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <NavLink to="/first-dream" className="menu-link cosmic-button" onClick={handleNewGame}>
                New Game
              </NavLink>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <NavLink to="/game" className="menu-link cosmic-button" onClick={handleContinue}>
                Continue
              </NavLink>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <NavLink to="/codex" className="menu-link cosmic-button">
                Codex
              </NavLink>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <NavLink to="/settings" className="menu-link cosmic-button">
                Settings
              </NavLink>
            </motion.div>
          </nav>
        </GlyphPanel>

        {/* Save Previews */}
        {saves.length > 0 && (
          <GlyphPanel title="Saved Paths">
            <div className="save-previews">
              {saves.map((save) => (
                <motion.div
                  key={save.slot}
                  className="save-preview"
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5 + save.slot * 0.1 }}
                >
                  <div className="save-info">
                    <h4>Slot {save.slot}</h4>
                    <p className="character-name">{save.characterName}</p>
                    <p className="circle-level">Circle {save.circle}</p>
                    <p className="playtime">{formatPlaytime(save.playtimeSeconds)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlyphPanel>
        )}
      </motion.div>

      {/* Transition overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="transition-overlay"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            <div className="collapse-point" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}

const formatPlaytime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}
