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

export const StatusEffectKind = {
  Buff: 'buff',
  Debuff: 'debuff',
  HealOverTime: 'heal-over-time',
  Shield: 'shield',
  Stun: 'stun',
  Dot: 'dot',
} as const

export type StatusEffectKind = (typeof StatusEffectKind)[keyof typeof StatusEffectKind]

export interface StatusEffect {
  id: string
  name: string
  kind: StatusEffectKind
  value: number
  turnsRemaining: number
  sourceId: string
}

export interface CombatParticipant {
  id: string
  kind: 'player' | 'enemy'
  name: string
  hp: number
  maxHp: number
  energy: number
  statuses: StatusEffect[]
  shield: number
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
  cooldowns: Record<string, number>
}
