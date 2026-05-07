import type { Foundation } from './foundation'
import type { MysteryMark } from './mystery'
import type { Path } from './path'

export interface CharacterStats {
  vitality: number
  strength: number
  agility: number
  insight: number
  will: number
  spirit: number
}

export interface Character {
  id: string
  name: string
  age: number
  circle: number
  path: Path | null
  foundation: Foundation
  mystery: MysteryMark
  mindSpace: number
  currentEnergy: number
  lifespan: number
  stats: CharacterStats
  techniques: string[]
  choiceAtDoors?: 'peace' | 'ascent'
}
