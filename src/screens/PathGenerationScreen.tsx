import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RuneText } from '../components/RuneText'
import type { TrialResult } from './TrialsScreen'

export function PathGenerationScreen() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isGenerating, setIsGenerating] = useState(true)

  const trialResults = location.state?.trialResults as TrialResult[] | undefined

  useEffect(() => {
    if (!trialResults) {
      // No trial results, redirect back
      navigate('/trials')
      return
    }

    // Simulate path generation
    const timer = setTimeout(() => {
      setIsGenerating(false)
      // Navigate to character creation with generated path
      setTimeout(() => {
        navigate('/character-creation', { state: { trialResults } })
      }, 3000)
    }, 4000)

    return () => clearTimeout(timer)
  }, [trialResults, navigate])

  if (!trialResults) {
    return null
  }

  return (
    <motion.div
      className="screen screen-path-generation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="generation-content">
        {isGenerating ? (
          <>
            <RuneText text="Analyzing your essence..." />
            <div className="generation-spinner" />
            <p className="generation-description">
              The trials have revealed fragments of your Path.
              The universe weaves them into form...
            </p>
          </>
        ) : (
          <>
            <RuneText text="Your Path emerges from the void!" />
            <div className="path-reveal-particles" />
            <p className="generation-description">
              A unique Path has been forged from your choices.
              Prepare to see who you truly are...
            </p>
          </>
        )}
      </div>
    </motion.div>
  )
}