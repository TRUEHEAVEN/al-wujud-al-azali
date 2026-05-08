import { CombatPhase, StatusEffectKind, type CombatState, type CombatParticipant, type CombatFieldState } from '../types/combat'
import type { Enemy } from '../types/enemy'
import type { Character } from '../types/character'
import {
  executeTechnique,
  resolveStatusEffects,
  getEnemyDamageMultiplier,
  TECHNIQUES,
} from './techniqueSystem'

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
    shield: 0,
  }

  const enemyParticipants: CombatParticipant[] = enemies.map((e) => ({
    id: e.id,
    kind: 'enemy',
    name: e.name,
    hp: e.maxHp,
    maxHp: e.maxHp,
    energy: e.maxHp,
    statuses: [],
    shield: 0,
  }))

  return {
    turn: 1,
    phase: CombatPhase.Initiative,
    participants: [participant, ...enemyParticipants],
    enemies,
    field,
    combatLog: [`Combat begins! ${enemies.map((e) => e.name).join(' and ')} ${enemies.length > 1 ? 'stand' : 'stands'} before you.`],
    autoCombat: false,
    cooldowns: {},
  }
}

// ── Basic Attack ───────────────────────────────────────────────────
export function playerAttack(state: CombatState): CombatState {
  const player = state.participants.find((p) => p.kind === 'player')
  const targets = state.participants.filter((p) => p.kind === 'enemy')
  if (!player || targets.length === 0) return state

  const buffs = player.statuses.filter((s) => s.kind === StatusEffectKind.Buff)
  const buffMult = 1 + buffs.reduce((sum, b) => sum + b.value, 0)
  const power = (10 + Math.floor(player.energy * 0.12)) * buffMult
  const damage = rollDamage(power)
  const target = targets[0]

  let actualDamage = damage
  const targetP = state.participants.find((p) => p.id === target.id)
  const targetShield = targetP?.shield ?? 0
  if (targetShield > 0) {
    const blocked = Math.min(targetShield, actualDamage)
    actualDamage -= blocked
  }

  const targetHp = Math.max(0, target.hp - actualDamage)
  const log = [...state.combatLog]
  if (actualDamage < damage) log.push(`(${Math.floor(damage - actualDamage)} absorbed by shield)`)
  log.push(`${player.name} strikes ${target.name} for ${Math.floor(actualDamage)} damage!`)

  const updatedParticipants = state.participants.map((p) => {
    if (p.id === target.id) return { ...p, hp: targetHp, shield: Math.max(0, (p.shield ?? 0) - damage + actualDamage) }
    return p
  })

  return finalizePlayerTurn({ ...state, participants: updatedParticipants, combatLog: log })
}

// ── Technique Attack ───────────────────────────────────────────────
export function playerTechniqueAttack(state: CombatState, techniqueId: string): CombatState {
  const player = state.participants.find((p) => p.kind === 'player')
  const targets = state.participants.filter((p) => p.kind === 'enemy')
  if (!player || targets.length === 0) return state

  const result = executeTechnique(state, techniqueId, player, targets)

  const log = [...state.combatLog, ...result.log]

  // Deduct energy
  const updatedPlayer = { ...player, currentEnergy: clamp(player.energy - result.userEnergyCost, 0, player.maxHp) }
  let updatedParticipants = result.updatedParticipants.map((p) => {
    if (p.id === player.id) return { ...updatedPlayer, statuses: p.statuses, shield: p.shield }
    return p
  })

  // Apply energy drain to player's participant entry
  updatedParticipants = updatedParticipants.map((p) => {
    if (p.id === player.id) return { ...p, energy: clamp(player.energy - result.userEnergyCost, 0, player.maxHp) }
    return p
  })

  return finalizePlayerTurn({
    ...state,
    participants: updatedParticipants,
    combatLog: log,
    cooldowns: result.updatedCooldowns,
    turn: state.turn + 1,
    phase: CombatPhase.EnemyTurn,
  })
}

function finalizePlayerTurn(state: CombatState): CombatState {
  const living = state.participants.filter((p) => p.hp > 0)
  const allEnemiesDead = living.filter((p) => p.kind === 'enemy').length === 0
  const playerAlive = living.find((p) => p.kind === 'player')

  if (allEnemiesDead) {
    return {
      ...state,
      turn: state.turn + 1,
      phase: CombatPhase.Resolution,
      participants: living,
      combatLog: [...state.combatLog, 'All enemies defeated!'],
    }
  }

  if (!playerAlive) {
    return {
      ...state,
      phase: CombatPhase.End,
      participants: living,
      combatLog: [...state.combatLog, 'You have fallen...'],
    }
  }

  return {
    ...state,
    turn: state.turn + 1,
    phase: CombatPhase.EnemyTurn,
  }
}

// ── Enemy Turn ─────────────────────────────────────────────────────
export function enemyTurn(state: CombatState): CombatState {
  // First resolve status effects (dots, hots)
  const resolved = resolveStatusEffects(state.participants)
  let participants = resolved.updatedParticipants
  let log = [...state.combatLog, ...resolved.log]

  const player = participants.find((p) => p.kind === 'player')
  const livingEnemies = participants.filter((p) => p.kind === 'enemy' && p.hp > 0)

  if (!player || livingEnemies.length === 0) {
    return { ...state, phase: CombatPhase.Resolution, participants, combatLog: log }
  }

  // Check if player is stunned
  const isStunned = player.statuses.some((s) => s.kind === StatusEffectKind.Stun)
  if (isStunned) {
    // Remove stun
    participants = participants.map((p) => {
      if (p.id === player.id) {
        return { ...p, statuses: p.statuses.filter((s) => s.kind !== StatusEffectKind.Stun) }
      }
      return p
    })
  }

  if (player.hp <= 0) {
    return {
      ...state,
      phase: CombatPhase.End,
      participants,
      combatLog: [...log, 'You have been defeated...'],
    }
  }

  // Enemy attacks
  for (const enemyP of livingEnemies) {
    const enemy = state.enemies.find((e) => e.id === enemyP.id)
    if (!enemy) continue

    // Check if player has dodge
    const hasDodge = player.statuses.some((s) => s.name === 'Ethereal')
    if (hasDodge) {
      log.push(`${player.name} evades ${enemy.name}'s attack with ethereal grace!`)
      participants = participants.map((p) => {
        if (p.id === player.id) return { ...p, statuses: p.statuses.filter((s) => s.name !== 'Ethereal') }
        return p
      })
      continue
    }

    const enemyDamageMult = getEnemyDamageMultiplier(state)
    const aiModifier = getAiDamageModifier(enemy.aiProfile)
    // Debuff from player reduces enemy damage
    const enemyDebuffs = enemyP.statuses.filter((s) => s.kind === StatusEffectKind.Debuff)
    const debuffMult = Math.max(0.2, 1 - enemyDebuffs.reduce((sum, d) => sum + d.value, 0))

    const basePower = (8 + enemy.circle * 2.5) * aiModifier * enemyDamageMult * debuffMult
    let damage = rollDamage(basePower, 0.25)

    // Check enemy expose debuff on enemy (from Cosmic Awareness)
    const exposeDebuff = enemyP.statuses.find((s) => s.name === 'Exposed')
    if (exposeDebuff) {
      damage = Math.floor(damage * (1 + exposeDebuff.value))
    }

    // Shield absorption
    let playerShield = player.shield
    if (playerShield > 0) {
      const blocked = Math.min(playerShield, damage)
      playerShield -= blocked
      damage -= blocked
      if (blocked > 0) log.push(`${player.name}'s shield absorbs ${blocked} damage.`)
    }

    const playerHp = Math.max(0, player.hp - damage)
    const abilityName = randomPick(enemy.abilities)
    log.push(`${enemy.name} uses ${abilityName.replace(/-/g, ' ')} — ${Math.floor(damage)} damage to ${player.name}!`)

    participants = participants.map((p) => {
      if (p.id === player.id) return { ...p, hp: playerHp, shield: playerShield }
      return p
    })

    if (playerHp <= 0) {
      return {
        ...state,
        phase: CombatPhase.End,
        participants,
        combatLog: [...log, 'You have been defeated...'],
      }
    }
  }

  // Tick down cooldowns
  const newCooldowns: Record<string, number> = {}
  for (const [key, val] of Object.entries(state.cooldowns)) {
    if (val > 1) newCooldowns[key] = val - 1
  }

  return {
    ...state,
    phase: CombatPhase.PlayerTurn,
    participants,
    combatLog: log,
    cooldowns: newCooldowns,
    turn: state.turn + 1,
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

// ── Resolution ─────────────────────────────────────────────────────
export function resolveCombat(state: CombatState): { state: CombatState; marksGained: number; victory: boolean } {
  const player = state.participants.find((p) => p.kind === 'player')
  const enemiesAlive = state.participants.filter((p) => p.kind === 'enemy' && p.hp > 0)
  const victory = !!(player && player.hp > 0 && enemiesAlive.length === 0)

  let marksGained = 0
  if (victory) {
    marksGained = state.enemies.reduce((sum, e) => {
      const mult: Record<string, number> = {
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
        if (p.kind === 'player') return { ...p, hp: clamp(p.hp, 0, p.maxHp), statuses: [], shield: 0 }
        return { ...p, statuses: [], shield: 0 }
      }),
      combatLog: finalLog,
      cooldowns: {},
    },
    marksGained,
    victory,
  }
}

export function startInitiative(state: CombatState): CombatState {
  // Apply passive techniques from player's known techniques
  const player = state.participants.find((p) => p.kind === 'player')
  if (player) {
    const passives = Object.values(TECHNIQUES).filter((t) => t.category === 'passive')
    // Apply passive effects as statuses
    for (const tech of passives) {
      for (const effect of tech.effects) {
        if (effect.kind === 'passive-damage' || effect.kind === 'enemy-damage-down') {
          if (!player.statuses.some((s) => s.id === `${effect.id}-${player.id}`)) {
            player.statuses = [...player.statuses, {
              id: `${effect.id}-${player.id}`,
              name: tech.name,
              kind: StatusEffectKind.Buff,
              value: effect.value,
              turnsRemaining: 99,
              sourceId: player.id,
            }]
          }
        }
      }
    }
  }
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
