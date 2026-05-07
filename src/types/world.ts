import type { NarrativeEvent } from './narrative'

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
}
