import type { NarrativeEvent, NarrativeScene, NarrativeChoice, CodexEntry } from '../types/narrative'
import type { GameState } from '../types/gameState'

export interface NarrativeContext {
  pathArchetype?: string
  circle: number
  marks: number
  flags: Record<string, boolean>
  usedEventIds: Set<string>
  hasKilledBoss: boolean
  kills: number
}

export interface ResolvedNarrativeEvent {
  eventId: string
  scenes: NarrativeScene[]
  choices: NarrativeChoice[]
  flagOnComplete?: string
  codexOnView?: string
}

export function buildNarrativeContext(state: GameState): NarrativeContext {
  return {
    pathArchetype: state.character.path?.archetype,
    circle: state.character.circle,
    marks: state.character.mystery.count,
    flags: state.narrative.flags,
    usedEventIds: new Set(Object.keys(state.narrative.flags).filter((k) => k.startsWith('event-'))),
    hasKilledBoss: state.narrative.flags['has-killed-boss'] ?? false,
    kills: state.world.visitedNodeIds.length,
  }
}

export function filterScenes(
  scenes: NarrativeScene[],
  context: NarrativeContext,
): NarrativeScene[] {
  return scenes
    .filter((scene) => {
      // Filter by condition flags
      if (scene.conditionFlags) {
        for (const [flag, value] of Object.entries(scene.conditionFlags)) {
          if (context.flags[flag] !== value) return false
        }
      }
      // Filter by hide flags
      if (scene.hideIfFlags) {
        for (const [flag, value] of Object.entries(scene.hideIfFlags)) {
          if (context.flags[flag] === value) return false
        }
      }
      return true
    })
    .map((scene) => {
      // Apply archetype variant text
      if (scene.archetypeVariant && context.pathArchetype) {
        const variant = scene.archetypeVariant[context.pathArchetype]
        if (variant) {
          return { ...scene, text: variant }
        }
      }
      return scene
    })
}

export function filterChoices(
  choices: NarrativeChoice[],
  context: NarrativeContext,
): NarrativeChoice[] {
  return choices
    .filter((choice) => {
      if (choice.conditionFlags) {
        for (const [flag, value] of Object.entries(choice.conditionFlags)) {
          if (context.flags[flag] !== value) return false
        }
      }
      if (choice.hideIfFlags) {
        for (const [flag, value] of Object.entries(choice.hideIfFlags)) {
          if (context.flags[flag] === value) return false
        }
      }
      return true
    })
    .map((choice) => {
      // Boost weight for archetype-matched choices
      if (choice.archetypeWeight && context.pathArchetype) {
        const weight = choice.archetypeWeight[context.pathArchetype]
        if (weight && weight >= 3) {
          return { ...choice, text: `${choice.text} \u2728` }
        }
      }
      return choice
    })
}

export function resolveNarrativeEvent(
  event: NarrativeEvent,
  context: NarrativeContext,
): ResolvedNarrativeEvent | null {
  if (event.onceOnly && context.usedEventIds.has(`event-${event.id}`)) {
    return null
  }
  if (event.minCircle && context.circle < event.minCircle) return null
  if (event.maxCircle && context.circle > event.maxCircle) return null
  if (event.archetypeFilter && context.pathArchetype && !event.archetypeFilter.includes(context.pathArchetype as never)) {
    return null
  }

  const filteredScenes = filterScenes(event.scenes, context)
  const filteredChoices = filterChoices(event.choices, context)

  if (filteredScenes.length === 0) return null

  return {
    eventId: event.id,
    scenes: filteredScenes,
    choices: filteredChoices,
    flagOnComplete: event.flagOnComplete,
    codexOnView: event.codexOnView,
  }
}

export function selectNodeEvent(
  events: NarrativeEvent[],
  context: NarrativeContext,
): ResolvedNarrativeEvent | null {
  for (const event of events) {
    const resolved = resolveNarrativeEvent(event, context)
    if (resolved) return resolved
  }
  return null
}

export interface ChoiceResult {
  marksGained: number
  energyGained: number
  energyLost: number
  healthGained: number
  healthLost: number
  timeAdvanced: number
  flagsToSet: Record<string, boolean>
  codexToUnlock: string[]
  shouldStartCombat: boolean
  isBossCombat: boolean
  shouldCheckEvasion: boolean
  foundationStrengthen: boolean
  narrativeAdvance: boolean
  storyAdvance: boolean
  storyAlter: boolean
  techniqueUnlock: boolean
}

export function resolveChoiceEffects(effects: string[]): ChoiceResult {
  const result: ChoiceResult = {
    marksGained: 0,
    energyGained: 0,
    energyLost: 0,
    healthGained: 0,
    healthLost: 0,
    timeAdvanced: 0,
    flagsToSet: {},
    codexToUnlock: [],
    shouldStartCombat: false,
    isBossCombat: false,
    shouldCheckEvasion: false,
    foundationStrengthen: false,
    narrativeAdvance: false,
    storyAdvance: false,
    storyAlter: false,
    techniqueUnlock: false,
  }

  for (const effect of effects) {
    const [type, ...rest] = effect.split(':')
    const value = rest.join(':')

    switch (type) {
      case 'marks': {
        if (value === 'gain') {
          result.marksGained += 30
        } else if (value === 'gain:small') {
          result.marksGained += 10
        } else {
          const parsed = parseInt(value, 10)
          result.marksGained += isNaN(parsed) ? 30 : parsed
        }
        break
      }
      case 'energy': {
        if (value === 'gain') {
          result.energyGained += 15
        } else if (value === 'lose') {
          result.energyLost += 10
        } else {
          const parsed = parseInt(value, 10)
          if (value.startsWith('gain:')) {
            result.energyGained += isNaN(parsed) ? 15 : parsed
          } else if (parsed < 0) {
            result.energyLost += Math.abs(parsed)
          } else {
            result.energyGained += isNaN(parsed) ? 15 : parsed
          }
        }
        break
      }
      case 'heal': {
        const parsed = parseInt(value, 10)
        result.healthGained += isNaN(parsed) ? 50 : parsed
        break
      }
      case 'time': {
        const parsed = parseInt(value, 10)
        result.timeAdvanced += isNaN(parsed) ? 1 : parsed
        break
      }
      case 'combat': {
        if (value === 'start:boss') {
          result.shouldStartCombat = true
          result.isBossCombat = true
        } else {
          result.shouldStartCombat = true
        }
        break
      }
      case 'evasion': {
        result.shouldCheckEvasion = true
        break
      }
      case 'foundation': {
        result.foundationStrengthen = true
        break
      }
      case 'narrative': {
        if (value === 'advance') result.narrativeAdvance = true
        break
      }
      case 'story': {
        if (value === 'advance') result.storyAdvance = true
        else if (value === 'alter') result.storyAlter = true
        break
      }
      case 'technique': {
        result.techniqueUnlock = true
        break
      }
      case 'flag': {
        const [flagName, flagValue] = value.split(':')
        result.flagsToSet[flagName] = flagValue !== 'false'
        break
      }
      case 'codex': {
        result.codexToUnlock.push(value)
        break
      }
    }
  }

  return result
}

export function getCombatAftermathEvent(
  victory: boolean,
  events: NarrativeEvent[],
  context: NarrativeContext,
): ResolvedNarrativeEvent | null {
  const triggerType = victory ? 'combat-win' : 'combat-lose'
  const matching = events.filter((e) => e.trigger === triggerType)
  for (const event of matching) {
    const resolved = resolveNarrativeEvent(event, context)
    if (resolved) return resolved
  }
  return null
}

export function getCircleAscensionEvent(
  newCircle: number,
  events: NarrativeEvent[],
  context: NarrativeContext,
): ResolvedNarrativeEvent | null {
  const matching = events.filter(
    (e) => e.trigger === 'circle-ascend' && e.triggerSource === `circle-${newCircle}`,
  )
  for (const event of matching) {
    const resolved = resolveNarrativeEvent(event, context)
    if (resolved) return resolved
  }
  return null
}

export function checkAndUnlockCodex(
  entries: CodexEntry[],
  flags: Record<string, boolean>,
  circle: number,
  marks: number,
  nodeType?: string,
): CodexEntry[] {
  return entries.filter((entry) => {
    const c = entry.unlockCondition
    if (c.flag && flags[c.flag]) return true
    if (c.circle && circle >= c.circle) return true
    if (c.marks && marks >= c.marks) return true
    if (c.trigger && nodeType) return true
    if (c.nodeType && c.nodeType === nodeType) return true
    return false
  })
}

export function deriveMoodStyles(mood: string): { color: string; shadow: string } {
  switch (mood) {
    case 'calm':
      return { color: 'var(--spirit-blue)', shadow: '0 0 12px rgb(26 58 107 / 40%)' }
    case 'intense':
      return { color: 'var(--blood-red)', shadow: '0 0 12px rgb(139 26 26 / 40%)' }
    case 'amused':
      return { color: 'var(--gold-primary)', shadow: 'var(--glow-soft)' }
    case 'terrifying':
      return { color: '#ff4444', shadow: '0 0 16px rgb(255 68 68 / 50%)' }
    case 'voiceless':
      return { color: 'var(--glyph-glow)', shadow: '0 0 18px rgb(255 232 160 / 60%)' }
    case 'triumphant':
      return { color: 'var(--gold-bright)', shadow: 'var(--glow-hard)' }
    case 'somber':
      return { color: '#8b7355', shadow: '0 0 10px rgb(139 115 85 / 30%)' }
    case 'mysterious':
      return { color: '#9b30ff', shadow: '0 0 14px rgb(155 48 255 / 35%)' }
    default:
      return { color: 'var(--gold-primary)', shadow: 'var(--glow-soft)' }
  }
}
