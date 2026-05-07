import { motion, type HTMLMotionProps } from 'framer-motion'
import { type PropsWithChildren } from 'react'

type CosmicButtonProps = PropsWithChildren<
  HTMLMotionProps<'button'> & {
    glow?: 'soft' | 'strong'
  }
>

export function CosmicButton({
  children,
  className,
  glow = 'soft',
  ...props
}: CosmicButtonProps) {
  const mergedClass = ['cosmic-button', `cosmic-button-${glow}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      className={mergedClass}
      {...props}
    >
      <span className="cosmic-button-ripple" aria-hidden="true" />
      <span className="cosmic-button-label">{children}</span>
    </motion.button>
  )
}
