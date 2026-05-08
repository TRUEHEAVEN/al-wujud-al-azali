import { motion } from 'framer-motion'
import { RuneText } from '../components/RuneText'

export function PeaceEndingScreen() {
  return (
    <motion.div
      className="screen screen-peace-ending"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="ending-content">
        <RuneText text="You chose Peace." />
        <p className="ending-description">
          The door opens to a serene meadow. The sun sets in golden hues.
          You live a full life, surrounded by love and simple joys.
          When your time comes, you return to the ash from which all things come.
        </p>
        <p className="ending-description">
          Your story ends here, but the universe continues its eternal dream.
        </p>
      </div>
    </motion.div>
  )
}