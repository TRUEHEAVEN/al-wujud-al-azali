import type { NarrativeEvent } from './narrative'

export const HazardType = {
  PoisonSwamp: 'poison-swamp',
  VoidStorm: 'void-storm',
  BloodMist: 'blood-mist',
  DustWaste: 'dust-waste',
  BoneField: 'bone-field',
  ResonanceCrack: 'resonance-crack',
  EchoMaze: 'echo-maze',
  None: 'none',
} as const

export type HazardType = (typeof HazardType)[keyof typeof HazardType]

export interface HazardDefinition {
  id: HazardType
  name: string
  description: string
  minCircle: number
  regions: number[]
  effects: HazardEffect[]
  avoidable: boolean
  avoidEnergyCost: number
  avoidChanceBase: number
}

export interface HazardEffect {
  kind: HazardEffectKind
  value: number
  message: string
}

export const HazardEffectKind = {
  Damage: 'damage',
  EnergyDrain: 'energy-drain',
  MarksDrain: 'marks-drain',
  StatPenalty: 'stat-penalty',
  TimeSkip: 'time-skip',
  CombatStart: 'combat-start',
} as const

export type HazardEffectKind = (typeof HazardEffectKind)[keyof typeof HazardEffectKind]

export interface HazardResult {
  avoided: boolean
  damage: number
  energyLost: number
  marksLost: number
  timeSkipped: number
  combatTriggered: boolean
  messages: string[]
}

export const DiscoveryGameType = {
  Memory: 'memory',
  Resonance: 'resonance',
  GlyphMatch: 'glyph-match',
  VoidRiddle: 'void-riddle',
  None: 'none',
} as const

export type DiscoveryGameType = (typeof DiscoveryGameType)[keyof typeof DiscoveryGameType]

export interface DiscoveryGame {
  type: DiscoveryGameType
  id: string
  title: string
  description: string
  difficulty: number
  onSuccess: DiscoveryReward
  onFailure: DiscoveryReward
  gameData: Record<string, unknown>
}

export interface DiscoveryReward {
  marks: number
  energy?: number
  bonusMarks: number
  codexId?: string
  techniqueId?: string
  narrativeAdvance?: boolean
}

export interface LootItem {
  id: string
  name: string
  type: 'resource' | 'fragment' | 'relic' | 'consumable'
  description: string
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
  value: number
}

export const RegionMechanicType = {
  SafeCradle: 'safe-cradle',
  DangerFrontier: 'danger-frontier',
  PerceptionGate: 'perception-gate',
  EmbodimentTrial: 'embodiment-trial',
  DustCycle: 'dust-cycle',
} as const

export type RegionMechanicType = (typeof RegionMechanicType)[keyof typeof RegionMechanicType]

export interface RegionMechanics {
  circle: number
  name: string
  mechanic: RegionMechanicType
  description: string
  availableHazards: HazardType[]
  hiddenNodeChance: number
  lootMultiplier: number
  minigameTypes: DiscoveryGameType[]
  narrativeEvents: NarrativeEvent[]
}

export interface PerceptionField {
  level: number
  revealRadius: number
  hiddenNodesRevealed: string[]
  secretText: string
}

export const SixSenseLevel = {
  Dormant: 0,
  Stirring: 1,
  Awake: 2,
  Vast: 3,
  Infinite: 4,
} as const

export type SixSenseLevel = (typeof SixSenseLevel)[keyof typeof SixSenseLevel]
