import type { PathElement } from './path'

export const TechniqueCategory = {
  Active: 'active',
  Passive: 'passive',
  Embodiment: 'embodiment',
} as const

export type TechniqueCategory =
  (typeof TechniqueCategory)[keyof typeof TechniqueCategory]

export const TechniqueTarget = {
  Self: 'self',
  Ally: 'ally',
  Enemy: 'enemy',
  AllEnemies: 'all-enemies',
  Field: 'field',
} as const

export type TechniqueTarget = (typeof TechniqueTarget)[keyof typeof TechniqueTarget]

export interface TechniqueEffect {
  id: string
  kind: string
  value: number
  durationTurns?: number
  chance?: number
}

export interface Technique {
  id: string
  name: string
  description: string
  category: TechniqueCategory
  target: TechniqueTarget
  energyCost: number
  cooldownTurns: number
  effects: TechniqueEffect[]
  pathRequirement?: PathElement
  unlockCircle: number
}
