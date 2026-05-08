import { CombatPhase, type CombatState, type CombatParticipant, type CombatFieldState } from '../types/combat'
import type { Enemy } from '../types/enemy'
import type { Character } from '../types/character'

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function rollDamage(base: number, variance = 0.2): number {
  const factor = 1 - variance + Math.random() * variance * 2
  return Math.max(1, Math.floor(base * factor))
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function createCombatState(
  player: Character,
  enemies: Enemy[],
  field: CombatFieldState,
): CombatState {
  const participant: CombatParticipant = {
    id: player.id,
    kind: 'player',
    name: player.name,
    hp: player.currentEnergy,
    maxHp: player.mindSpace,
    energy: player.currentEnergy,
    statuses: [],
  }

  const enemyParticipants: CombatParticipant[] = enemies.map((e) => ({
    id: e.id,
    kind: 'enemy',
    name: e.name,
    hp: e.maxHp,
    maxHp: e.maxHp,
    energy: e.maxHp,
    statuses: [],
  }))

  return {
    turn: 1,
    phase: CombatPhase.Initiative,
    participants: [participant, ...enemyParticipants],
    enemies,
    field,
    combatLog: [`Combat begins! ${enemies.map((e) => e.name).join(' and ')} ${enemies.length > 1 ? 'stand' : 'stands'} before you.`],
    autoCombat: false,
  }
}

export function playerAttack(state: CombatState): CombatState {
  const player = state.participants.find((p) => p.kind === 'player')
  const targets = state.participants.filter((p) => p.kind === 'enemy')
  if (!player || targets.length === 0) return state

  const power = 10 + Math.floor(player.energy * 0.15)
  const damage = rollDamage(power)
  const target = targets[0]
  const targetHp = Math.max(0, target.hp - damage)

  const log = [...state.combatLog, `${player.name} strikes ${target.name} for ${damage} damage!`]

  const updatedParticipants = state.participants.map((p) => {
    if (p.id === target.id) return { ...p, hp: targetHp }
    return p
  })

  const living = updatedParticipants.filter((p) => p.hp > 0)
  const allEnemiesDead = living.filter((p) => p.kind === 'enemy').length === 0
  const playerAlive = living.find((p) => p.kind === 'player')

  if (allEnemiesDead) {
    return {
      ...state,
      turn: state.turn + 1,
      phase: CombatPhase.Resolution,
      participants: living,
      combatLog: [...log, 'All enemies defeated!'],
    }
  }

  if (!playerAlive) {
    return {
      ...state,
      phase: CombatPhase.End,
      participants: living,
      combatLog: [...log, 'You have fallen...'],
    }
  }

  return {
    ...state,
    turn: state.turn + 1,
    phase: CombatPhase.EnemyTurn,
    participants: updatedParticipants,
    combatLog: log,
  }
}

export function enemyTurn(state: CombatState): CombatState {
  const player = state.participants.find((p) => p.kind === 'player')
  const enemy = state.enemies.find((e) =>
    state.participants.find((p) => p.id === e.id && p.hp > 0),
  )
  if (!player || !enemy) return { ...state, phase: CombatPhase.Resolution }

  const enemyParticipant = state.participants.find((p) => p.id === enemy.id)
  if (!enemyParticipant) return { ...state, phase: CombatPhase.Resolution }

  const aiModifier = getAiDamageModifier(enemy.aiProfile)
  const basePower = 8 + enemy.circle * 3
  const damage = rollDamage(basePower * aiModifier, 0.25)
  const playerHp = Math.max(0, player.hp - damage)

  const abilityName = randomPick(enemy.abilities)
  const log = [...state.combatLog, `${enemy.name} uses ${abilityName.replace(/-/g, ' ')} — ${damage} damage to ${player.name}!`]

  const updatedParticipants = state.participants.map((p) => {
    if (p.id === player.id) return { ...p, hp: playerHp }
    return p
  })

  if (playerHp <= 0) {
    return {
      ...state,
      phase: CombatPhase.End,
      participants: updatedParticipants,
      combatLog: [...log, 'You have been defeated...'],
    }
  }

  return {
    ...state,
    phase: CombatPhase.PlayerTurn,
    participants: updatedParticipants,
    combatLog: log,
  }
}

function getAiDamageModifier(profile: string): number {
  switch (profile) {
    case 'aggressive': return 1.3
    case 'berserker': return 1.5
    case 'defensive': return 0.8
    case 'tactical': return 1.0
    case 'mysterious': return 0.9 + Math.random() * 0.4
    default: return 1.0
  }
}

export function resolveCombat(state: CombatState): { state: CombatState; marksGained: number; victory: boolean } {
  const player = state.participants.find((p) => p.kind === 'player')
  const enemiesAlive = state.participants.filter((p) => p.kind === 'enemy' && p.hp > 0)
  const victory = !!(player && player.hp > 0 && enemiesAlive.length === 0)

  let marksGained = 0
  if (victory) {
    marksGained = state.enemies.reduce((sum, e) => {
      const mult = {
        mortal: 1, seeker: 1.5, forged: 2.5, ascendant: 4, boss: 8,
      }
      return sum + Math.floor(e.marks * (mult[e.tier] ?? 1))
    }, 0)
  }

  const finalLog = [...state.combatLog]
  if (victory) {
    finalLog.push(`Victory! Gained ${marksGained} Mystery Marks.`)
  } else {
    finalLog.push('Combat has ended.')
  }

  return {
    state: {
      ...state,
      phase: CombatPhase.End,
      participants: state.participants.map((p) => {
        if (p.kind === 'player') return { ...p, hp: clamp(p.hp, 0, p.maxHp) }
        return p
      }),
      combatLog: finalLog,
    },
    marksGained,
    victory,
  }
}

export function startInitiative(state: CombatState): CombatState {
  return { ...state, phase: CombatPhase.PlayerTurn }
}

export function getCombatSummary(state: CombatState): string {
  const player = state.participants.find((p) => p.kind === 'player')
  const enemies = state.participants.filter((p) => p.kind === 'enemy')
  if (!player) return 'No combatant found.'
  return `Turn ${state.turn} — ${player.name}: ${player.hp}/${player.maxHp} HP | Enemies: ${enemies.map((e) => `${e.name}: ${e.hp}/${e.maxHp}`).join(', ')}`
}

export function isCombatOver(state: CombatState): boolean {
  return state.phase === CombatPhase.End || state.phase === CombatPhase.Resolution
}

export function getWinner(state: CombatState): 'player' | 'enemy' | null {
  const player = state.participants.find((p) => p.kind === 'player')
  if (!player || player.hp <= 0) return 'enemy'
  const enemiesAlive = state.participants.some((p) => p.kind === 'enemy' && p.hp > 0)
  if (!enemiesAlive) return 'player'
  return null
}
