import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RuneText } from '../components/RuneText'

export function DoorsScreen() {
  const [hoveredDoor, setHoveredDoor] = useState<'peace' | 'ascent' | null>(null)
  const navigate = useNavigate()

  const handlePeace = () => {
    // Peace ending - beautiful short scene
    navigate('/peace-ending')
  }

  const handleAscent = () => {
    // Dramatic transition to the trial begins
    navigate('/trials')
  }

  return (
    <motion.div
      className="screen screen-doors"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Doors container */}
      <div className="doors-container">
        {/* Peace Door */}
        <motion.div
          className="door door-peace"
          onHoverStart={() => setHoveredDoor('peace')}
          onHoverEnd={() => setHoveredDoor(null)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePeace}
        >
          <div className="door-frame">
            <div className="door-content">
              <h2 className="door-title">Peace</h2>
              <div className="door-light peace-light" />
              <p className="door-description">
                Rest. Live. Become ash.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Ascent Door */}
        <motion.div
          className="door door-ascent"
          onHoverStart={() => setHoveredDoor('ascent')}
          onHoverEnd={() => setHoveredDoor(null)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAscent}
        >
          <div className="door-frame">
            <div className="door-content">
              <h2 className="door-title">Ascent</h2>
              <div className="door-light ascent-light" />
              <p className="door-description">
                Rise. Break. Transcend.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Atmospheric overlay based on hovered door */}
      <motion.div
        className="atmospheric-overlay"
        animate={{
          background: hoveredDoor === 'peace'
            ? 'radial-gradient(circle, rgb(255 255 255 / 15%) 0%, transparent 70%)'
            : hoveredDoor === 'ascent'
            ? 'radial-gradient(circle, rgb(255 217 128 / 20%) 0%, transparent 70%)'
            : 'transparent'
        }}
        transition={{ duration: 0.8 }}
      />

      {/* Central text */}
      <motion.div
        className="doors-text"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1.5 }}
      >
        <RuneText text="Choose your Path. The choice is eternal." />
      </motion.div>
    </motion.div>
  )
}