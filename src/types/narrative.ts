import type { PathArchetype } from './path'

export type NarrativeTrigger =
  | 'game-start'
  | 'node-enter'
  | 'combat-win'
  | 'combat-lose'
  | 'circle-ascend'
  | 'discovery'
  | 'manual'

export const NarrativeEffectType = {
  MarksGain: 'marks:gain',
  MarksGainSmall: 'marks:gain:small',
  EnergyGain: 'energy:gain',
  EnergyLose: 'energy:lose',
  CombatStart: 'combat:start',
  CombatStartBoss: 'combat:start:boss',
  EvasionCheck: 'evasion:check',
  NarrativeAdvance: 'narrative:advance',
  FoundationStrengthen: 'foundation:strengthen',
  StoryAdvance: 'story:advance',
  StoryAlter: 'story:alter',
  TechniqueUnlock: 'technique:unlock',
  FlagSet: 'flag:set',
  CodexUnlock: 'codex:unlock',
  TimeAdvance: 'time:advance',
  LifespanChange: 'lifespan:change',
  CircleAdvance: 'circle:advance',
  Heal: 'heal',
  Damage: 'damage',
} as const

export type NarrativeEffectType = (typeof NarrativeEffectType)[keyof typeof NarrativeEffectType]

export interface NarrativeEffect {
  type: NarrativeEffectType
  value?: number
  target?: string
}

export interface NarrativeChoice {
  id: string
  text: string
  tags: string[]
  nextSceneId?: string
  effects: string[]
  conditionFlags?: Record<string, boolean>
  hideIfFlags?: Record<string, boolean>
  archetypeWeight?: Partial<Record<PathArchetype, number>>
}

export type NarrativeMood = 'calm' | 'intense' | 'amused' | 'terrifying' | 'voiceless' | 'triumphant' | 'somber' | 'mysterious'

export interface NarrativeScene {
  id: string
  speaker?: string
  text: string
  mood?: NarrativeMood
  conditionFlags?: Record<string, boolean>
  hideIfFlags?: Record<string, boolean>
  archetypeVariant?: Partial<Record<PathArchetype, string>>
}

export interface NarrativeEvent {
  id: string
  trigger: NarrativeTrigger
  triggerSource?: string
  scenes: NarrativeScene[]
  choices: NarrativeChoice[]
  minCircle?: number
  maxCircle?: number
  archetypeFilter?: PathArchetype[]
  onceOnly?: boolean
  flagOnComplete?: string
  codexOnView?: string
}

export interface CodexEntry {
  id: string
  category: 'lore' | 'path' | 'technique' | 'region' | 'character' | 'cosmic'
  title: string
  subtitle?: string
  text: string
  unlockCondition: {
    trigger?: NarrativeTrigger
    flag?: string
    circle?: number
    archetype?: PathArchetype
    nodeType?: string
    marks?: number
  }
  relatedEntryIds: string[]
}
