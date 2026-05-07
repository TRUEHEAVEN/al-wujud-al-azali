import { motion } from 'framer-motion'

type RuneTextProps = {
  text: string
  className?: string
  delayStep?: number
}

export function RuneText({ text, className, delayStep = 0.02 }: RuneTextProps) {
  return (
    <span className={className ?? 'rune-text'}>
      {text.split('').map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: index * delayStep }}
          className="rune-char"
        >
          {char}
        </motion.span>
      ))}
    </span>
  )
}
