import type { NarrativeEvent } from './narrative'
import type { HazardType, DiscoveryGame } from './exploration'
import type { InventoryItem } from './gameState'

export const WorldNodeType = {
  Safe: 'safe',
  Danger: 'danger',
  Discovery: 'discovery',
  Boss: 'boss',
  Story: 'story',
} as const

export type WorldNodeType = (typeof WorldNodeType)[keyof typeof WorldNodeType]

export interface WorldNode {
  id: string
  type: WorldNodeType
  region: string
  name: string
  description: string
  connections: string[]
  events: NarrativeEvent[]
  visited: boolean
  hazard?: HazardType
  hidden: boolean
  perceptionRequired: number
  discoveryGame?: DiscoveryGame
  loot?: InventoryItem[]
  combatModifiers?: string[]
}
