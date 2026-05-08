import { create } from 'zustand'
import {
  CombatPhase,
  FoundationStage,
  MasteryStage,
  WorldNodeType,
  type Character,
  type CombatState,
  type GameState,
  type LootItem,
  type NarrativeEvent,
  type TimeState,
  type WorldNode,
} from '../types'

type CharacterSlice = {
  character: Character
  createCharacter: (character: Character) => void
  setCharacterName: (name: string) => void
  setChoiceAtDoors: (choice: 'peace' | 'ascent') => void
  gainEnergy: (amount: number) => void
  spendEnergy: (amount: number) => boolean
  setPathId: (pathId: string) => void
}

type WorldSlice = {
  world: GameState['world']
  setWorldNodes: (nodes: WorldNode[]) => void
  visitNode: (nodeId: string) => void
  setCurrentNode: (nodeId: string | null) => void
  revealHiddenNode: (nodeId: string) => void
  addLootToInventory: (items: LootItem[]) => void
  markDiscoveryComplete: (gameId: string) => void
}

type CombatSlice = {
  combat: CombatState | null
  startCombat: (payload: CombatState) => void
  setCombatPhase: (phase: CombatState['phase']) => void
  appendCombatLog: (line: string) => void
  endCombat: () => void
}

type NarrativeSlice = {
  narrative: GameState['narrative']
  queueEvent: (event: NarrativeEvent) => void
  setActiveEvent: (eventId: string | null) => void
  setNarrativeFlag: (key: string, value: boolean) => void
  dequeueEvent: () => NarrativeEvent | null
  unlockCodex: (entryId: string) => void
  hasCodexEntry: (entryId: string) => boolean
}

type CultivationSlice = {
  cultivation: GameState['cultivation']
  setMysteryBoostMultiplier: (multiplier: number) => void
  setCanAscend: (value: boolean) => void
  setAvailableTechniques: (techniques: string[]) => void
  gainMarks: (amount: number) => void
}

type TimeSlice = {
  time: TimeState
  advanceTicks: (ticks: number) => void
  advanceYears: (years: number) => void
  setEra: (era: string) => void
}

export type DerivedSelectors = {
  currentBoostMultiplier: number
  canAscend: boolean
  availableTechniques: string[]
}

type MetaSlice = {
  version: string
  createdAt: string
  updatedAt: string
  circles: GameState['circles']
  trials: GameState['trials']
  touchUpdatedAt: () => void
  getDerivedSelectors: () => DerivedSelectors
  toGameState: () => GameState
  loadGameState: (next: GameState) => void
}

export type GameStore = CharacterSlice &
  WorldSlice &
  CombatSlice &
  NarrativeSlice &
  CultivationSlice &
  TimeSlice &
  MetaSlice

const nowIso = () => new Date().toISOString()

const initialState: Omit<
  GameState,
  'circles' | 'trials' | 'character' | 'world' | 'combat' | 'narrative' | 'cultivation' | 'time'
> = {
  version: '0.1.0-alpha',
  createdAt: nowIso(),
  updatedAt: nowIso(),
}

const createDefaultCharacter = (): Character => ({
  id: 'player',
  name: 'Unnamed Seeker',
  age: 15,
  circle: 1,
  path: null,
  foundation: {
    stage: FoundationStage.Egg,
    pattern: 'unformed',
    shell: 'none',
    weight: 1,
    chainUnlocked: false,
    integrity: 100,
    cracked: false,
  },
  mystery: {
    count: 0,
    masteryStage: MasteryStage.Formation,
    bones: 0,
    boostMultiplier: 1,
    refinedTotal: 0,
  },
  mindSpace: 100,
  currentEnergy: 100,
  lifespan: 100,
  stats: {
    vitality: 10,
    strength: 10,
    agility: 10,
    insight: 10,
    will: 10,
    spirit: 10,
  },
  techniques: [],
})

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,
  circles: [],
  trials: [],
  character: createDefaultCharacter(),
  world: {
    currentNodeId: null,
    nodes: [],
    visitedNodeIds: [],
    revealedHiddenNodeIds: [],
    inventory: [],
    discoveredGameIds: [],
  },
  combat: null,
  narrative: {
    activeEventId: null,
    queue: [],
    flags: {},
    unlockedCodexIds: [],
  },
  cultivation: {
    mysteryBoostMultiplier: 1,
    canAscend: false,
    availableTechniques: [],
  },
  time: {
    year: 0,
    era: 'Age of Ash',
    ticks: 0,
    startedAt: nowIso(),
  },

  touchUpdatedAt: () => set({ updatedAt: nowIso() }),
  getDerivedSelectors: () => ({
    currentBoostMultiplier: get().cultivation.mysteryBoostMultiplier,
    canAscend: get().cultivation.canAscend,
    availableTechniques: get().cultivation.availableTechniques,
  }),
  toGameState: () => {
    const state = get()
    return {
      version: state.version,
      createdAt: state.createdAt,
      updatedAt: state.updatedAt,
      character: state.character,
      circles: state.circles,
      world: state.world,
      combat: state.combat,
      narrative: state.narrative,
      cultivation: state.cultivation,
      trials: state.trials,
      time: state.time,
    }
  },
  loadGameState: (next) =>
    set({
      version: next.version,
      createdAt: next.createdAt,
      updatedAt: next.updatedAt,
      character: next.character,
      circles: next.circles,
      world: next.world,
      combat: next.combat,
      narrative: next.narrative,
      cultivation: next.cultivation,
      trials: next.trials,
      time: next.time,
    }),

  createCharacter: (character) =>
    set(() => ({
      character,
      updatedAt: nowIso(),
    })),
  setCharacterName: (name) =>
    set((state) => ({
      character: { ...state.character, name },
      updatedAt: nowIso(),
    })),
  setChoiceAtDoors: (choice) =>
    set((state) => ({
      character: { ...state.character, choiceAtDoors: choice },
      updatedAt: nowIso(),
    })),
  gainEnergy: (amount) =>
    set((state) => {
      const max = state.character.mindSpace
      const nextEnergy = Math.min(max, state.character.currentEnergy + Math.max(0, amount))
      return {
        character: { ...state.character, currentEnergy: nextEnergy },
        updatedAt: nowIso(),
      }
    }),
  spendEnergy: (amount) => {
    const state = get()
    if (state.character.currentEnergy < amount) {
      return false
    }
    set({
      character: {
        ...state.character,
        currentEnergy: state.character.currentEnergy - amount,
      },
      updatedAt: nowIso(),
    })
    return true
  },
  setPathId: (pathId) =>
    set((state) => ({
      character: {
        ...state.character,
        path: state.character.path ? { ...state.character.path, id: pathId } : null,
      },
      updatedAt: nowIso(),
    })),

  setWorldNodes: (nodes) =>
    set((state) => ({
      world: { ...state.world, nodes },
      updatedAt: nowIso(),
    })),
  visitNode: (nodeId) =>
    set((state) => {
      const nextNodes = state.world.nodes.map((node) =>
        node.id === nodeId ? { ...node, visited: true } : node,
      )
      const nextVisited = state.world.visitedNodeIds.includes(nodeId)
        ? state.world.visitedNodeIds
        : [...state.world.visitedNodeIds, nodeId]
      return {
        world: {
          ...state.world,
          nodes: nextNodes,
          visitedNodeIds: nextVisited,
          currentNodeId: nodeId,
        },
        updatedAt: nowIso(),
      }
    }),
  setCurrentNode: (nodeId) =>
    set((state) => ({
      world: { ...state.world, currentNodeId: nodeId },
      updatedAt: nowIso(),
    })),
  revealHiddenNode: (nodeId) =>
    set((state) => {
      if (state.world.revealedHiddenNodeIds.includes(nodeId)) return state
      const nextNodes = state.world.nodes.map((node) =>
        node.id === nodeId ? { ...node, hidden: false } : node,
      )
      return {
        world: {
          ...state.world,
          nodes: nextNodes,
          revealedHiddenNodeIds: [...state.world.revealedHiddenNodeIds, nodeId],
        },
        updatedAt: nowIso(),
      }
    }),
  addLootToInventory: (items) =>
    set((state) => ({
      world: {
        ...state.world,
        inventory: [...state.world.inventory, ...items],
      },
      updatedAt: nowIso(),
    })),
  markDiscoveryComplete: (gameId) =>
    set((state) => {
      if (state.world.discoveredGameIds.includes(gameId)) return state
      return {
        world: {
          ...state.world,
          discoveredGameIds: [...state.world.discoveredGameIds, gameId],
        },
        updatedAt: nowIso(),
      }
    }),

  startCombat: (payload) =>
    set({
      combat: payload,
      updatedAt: nowIso(),
    }),
  setCombatPhase: (phase) =>
    set((state) => ({
      combat: state.combat ? { ...state.combat, phase } : state.combat,
      updatedAt: nowIso(),
    })),
  appendCombatLog: (line) =>
    set((state) => ({
      combat: state.combat
        ? {
            ...state.combat,
            combatLog: [...state.combat.combatLog, line],
          }
        : state.combat,
      updatedAt: nowIso(),
    })),
  endCombat: () =>
    set({
      combat: null,
      updatedAt: nowIso(),
    }),

  queueEvent: (event) =>
    set((state) => ({
      narrative: { ...state.narrative, queue: [...state.narrative.queue, event] },
      updatedAt: nowIso(),
    })),
  setActiveEvent: (eventId) =>
    set((state) => ({
      narrative: { ...state.narrative, activeEventId: eventId },
      updatedAt: nowIso(),
    })),
  setNarrativeFlag: (key, value) =>
    set((state) => ({
      narrative: {
        ...state.narrative,
        flags: {
          ...state.narrative.flags,
          [key]: value,
        },
      },
      updatedAt: nowIso(),
    })),
  dequeueEvent: () => {
    const state = get()
    const [first, ...rest] = state.narrative.queue
    if (!first) {
      return null
    }
    set({
      narrative: { ...state.narrative, queue: rest },
      updatedAt: nowIso(),
    })
    return first
  },
  unlockCodex: (entryId) =>
    set((state) => {
      if (state.narrative.unlockedCodexIds.includes(entryId)) return state
      return {
        narrative: {
          ...state.narrative,
          unlockedCodexIds: [...state.narrative.unlockedCodexIds, entryId],
        },
        updatedAt: nowIso(),
      }
    }),
  hasCodexEntry: (entryId) => {
    return get().narrative.unlockedCodexIds.includes(entryId)
  },

  setMysteryBoostMultiplier: (multiplier) =>
    set((state) => ({
      cultivation: { ...state.cultivation, mysteryBoostMultiplier: Math.max(1, multiplier) },
      updatedAt: nowIso(),
    })),
  setCanAscend: (value) =>
    set((state) => ({
      cultivation: { ...state.cultivation, canAscend: value },
      updatedAt: nowIso(),
    })),
  setAvailableTechniques: (techniques) =>
    set((state) => ({
      cultivation: { ...state.cultivation, availableTechniques: techniques },
      updatedAt: nowIso(),
    })),
  gainMarks: (amount) =>
    set((state) => {
      const nextCount = Math.max(0, state.character.mystery.count + amount)
      const thresholdMultiplier = 1 + Math.floor(nextCount / 1000)
      return {
        character: {
          ...state.character,
          mystery: {
            ...state.character.mystery,
            count: nextCount,
            boostMultiplier: thresholdMultiplier,
          },
        },
        cultivation: {
          ...state.cultivation,
          mysteryBoostMultiplier: thresholdMultiplier,
        },
        updatedAt: nowIso(),
      }
    }),

  advanceTicks: (ticks) =>
    set((state) => ({
      time: {
        ...state.time,
        ticks: state.time.ticks + Math.max(0, ticks),
      },
      updatedAt: nowIso(),
    })),
  advanceYears: (years) =>
    set((state) => ({
      time: {
        ...state.time,
        year: state.time.year + Math.max(0, years),
      },
      updatedAt: nowIso(),
    })),
  setEra: (era) =>
    set((state) => ({
      time: {
        ...state.time,
        era,
      },
      updatedAt: nowIso(),
    })),
}))

export const selectCurrentBoostMultiplier = (state: GameStore) =>
  state.cultivation.mysteryBoostMultiplier

export const selectCanAscend = (state: GameStore) => state.cultivation.canAscend

export const selectAvailableTechniques = (state: GameStore) =>
  state.cultivation.availableTechniques

export const selectIsInCombat = (state: GameStore) =>
  state.combat?.phase !== undefined && state.combat.phase !== CombatPhase.End

export const selectExplorableNodes = (state: GameStore) => {
  const visited = new Set(state.world.visitedNodeIds)
  return state.world.nodes.filter((node) => {
    if (node.hidden) return false
    if (node.type === WorldNodeType.Safe || node.type === WorldNodeType.Story) {
      return true
    }
    return visited.has(node.id) || node.connections.some((id) => visited.has(id))
  })
}
