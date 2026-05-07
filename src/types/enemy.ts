import type { PathElement } from './path'

export const EnemyTier = {
  Mortal: 'mortal',
  Seeker: 'seeker',
  Forged: 'forged',
  Ascendant: 'ascendant',
  Boss: 'boss',
} as const

export type EnemyTier = (typeof EnemyTier)[keyof typeof EnemyTier]

export const EnemyAiProfile = {
  Aggressive: 'aggressive',
  Defensive: 'defensive',
  Tactical: 'tactical',
  Berserker: 'berserker',
  Mysterious: 'mysterious',
} as const

export type EnemyAiProfile =
  (typeof EnemyAiProfile)[keyof typeof EnemyAiProfile]

export interface Enemy {
  id: string
  name: string
  tier: EnemyTier
  circle: number
  pathType: PathElement
  marks: number
  maxHp: number
  abilities: string[]
  aiProfile: EnemyAiProfile
  lore: string
}
