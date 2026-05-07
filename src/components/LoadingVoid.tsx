import { motion } from 'framer-motion'

type LoadingVoidProps = {
  text?: string
}

export function LoadingVoid({ text = 'Listening to the silence...' }: LoadingVoidProps) {
  return (
    <div className="loading-void" role="status" aria-live="polite">
      <motion.div
        className="loading-orb"
        animate={{ scale: [0.9, 1.08, 0.9], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.2, repeat: Infinity }}
      />
      <p>{text}</p>
    </div>
  )
}
