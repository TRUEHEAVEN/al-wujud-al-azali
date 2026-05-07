import type { Enemy } from './enemy'

export const CombatPhase = {
  Initiative: 'initiative',
  PlayerTurn: 'player-turn',
  EnemyTurn: 'enemy-turn',
  Resolution: 'resolution',
  End: 'end',
} as const

export type CombatPhase = (typeof CombatPhase)[keyof typeof CombatPhase]

export const DamageType = {
  Physical: 'physical',
  PathEnergy: 'path-energy',
  Soul: 'soul',
  Existential: 'existential',
} as const

export type DamageType = (typeof DamageType)[keyof typeof DamageType]

export interface CombatParticipant {
  id: string
  kind: 'player' | 'enemy'
  name: string
  hp: number
  maxHp: number
  energy: number
  statuses: string[]
}

export interface CombatFieldState {
  region: string
  environment: string
  modifiers: string[]
}

export interface CombatState {
  turn: number
  phase: CombatPhase
  participants: CombatParticipant[]
  enemies: Enemy[]
  field: CombatFieldState
  combatLog: string[]
  autoCombat: boolean
}
