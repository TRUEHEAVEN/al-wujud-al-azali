import type { Character } from './character'
import type { Circle } from './circle'
import type { CombatState } from './combat'
import type { ISODateString } from './common'
import type { NarrativeEvent } from './narrative'
import type { TrialResult } from './trials'
import type { WorldNode } from './world'

export interface TimeState {
  year: number
  era: string
  ticks: number
  startedAt: ISODateString
}

export interface WorldState {
  currentNodeId: string | null
  nodes: WorldNode[]
  visitedNodeIds: string[]
}

export interface NarrativeState {
  activeEventId: string | null
  queue: NarrativeEvent[]
  flags: Record<string, boolean>
}

export interface CultivationState {
  mysteryBoostMultiplier: number
  canAscend: boolean
  availableTechniques: string[]
}

export interface SaveMeta {
  slot: number
  characterName: string
  circle: number
  playtimeSeconds: number
  updatedAt: ISODateString
}

export interface GameState {
  version: string
  createdAt: ISODateString
  updatedAt: ISODateString
  character: Character
  circles: Circle[]
  world: WorldState
  combat: CombatState | null
  narrative: NarrativeState
  cultivation: CultivationState
  trials: TrialResult[]
  time: TimeState
}
