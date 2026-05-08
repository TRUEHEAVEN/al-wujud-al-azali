import { motion, type HTMLMotionProps } from 'framer-motion'
import { type PropsWithChildren } from 'react'

type CosmicButtonProps = PropsWithChildren<
  HTMLMotionProps<'button'> & {
    glow?: 'soft' | 'strong'
    size?: 'small' | 'medium' | 'large'
  }
>

export function CosmicButton({
  children,
  className,
  glow = 'soft',
  size = 'medium',
  ...props
}: CosmicButtonProps) {
  const mergedClass = [
    'cosmic-button',
    `cosmic-button-${glow}`,
    `cosmic-button-${size}`,
    className
  ]
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
