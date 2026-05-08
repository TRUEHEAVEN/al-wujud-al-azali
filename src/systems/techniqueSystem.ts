import type { Technique, TechniqueEffect } from '../types/technique'
import { TechniqueCategory, TechniqueTarget } from '../types/technique'
import {
  StatusEffectKind,
  type CombatState,
  type CombatParticipant,
  type StatusEffect,
} from '../types/combat'
import type { Character } from '../types/character'

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function rollDamage(base: number, variance = 0.2): number {
  const factor = 1 - variance + Math.random() * variance * 2
  return Math.max(1, Math.floor(base * factor))
}

// ── Technique Database ────────────────────────────────────────────

export const TECHNIQUES: Record<string, Technique> = {
  'void-gaze': {
    id: 'void-gaze',
    name: 'Void Gaze',
    description: 'Pierce illusions and see the truth of things — reduces enemy damage next turn',
    category: TechniqueCategory.Active,
    target: TechniqueTarget.Enemy,
    energyCost: 5,
    cooldownTurns: 2,
    effects: [{ id: 'vg-1', kind: 'debuff-damage', value: 0.35 }],
    unlockCircle: 1,
  },
  'essence-sight': {
    id: 'essence-sight',
    name: 'Essence Sight',
    description: 'See the spiritual essence of beings — restores HP based on insight',
    category: TechniqueCategory.Active,
    target: TechniqueTarget.Self,
    energyCost: 8,
    cooldownTurns: 3,
    effects: [{ id: 'es-1', kind: 'heal-stat', value: 2.5 }],
    unlockCircle: 1,
  },
  'mind-clarity': {
    id: 'mind-clarity',
    name: 'Mind Clarity',
    description: 'Clear mental fog and enhance focus — gain a damage buff for 2 turns',
    category: TechniqueCategory.Active,
    target: TechniqueTarget.Self,
    energyCost: 3,
    cooldownTurns: 2,
    effects: [{ id: 'mc-1', kind: 'buff-damage', value: 0.25, durationTurns: 2 }],
    unlockCircle: 1,
  },
  'bone-reinforcement': {
    id: 'bone-reinforcement',
    name: 'Bone Reinforcement',
    description: 'Strengthen bones with mystic energy — gain shield equal to 30% max HP',
    category: TechniqueCategory.Active,
    target: TechniqueTarget.Self,
    energyCost: 6,
    cooldownTurns: 3,
    effects: [{ id: 'br-1', kind: 'shield', value: 0.3 }],
    unlockCircle: 1,
  },
  'essence-drain': {
    id: 'essence-drain',
    name: 'Essence Drain',
    description: 'Drain life force from enemies — deal damage and heal for 40% of it',
    category: TechniqueCategory.Active,
    target: TechniqueTarget.Enemy,
    energyCost: 10,
    cooldownTurns: 3,
    effects: [
      { id: 'ed-1', kind: 'damage', value: 1.6 },
      { id: 'ed-2', kind: 'lifesteal', value: 0.4 },
    ],
    unlockCircle: 1,
  },
  'power-surge': {
    id: 'power-surge',
    name: 'Power Surge',
    description: 'Burst of raw physical power — heavy single-target damage',
    category: TechniqueCategory.Active,
    target: TechniqueTarget.Enemy,
    energyCost: 12,
    cooldownTurns: 3,
    effects: [{ id: 'ps-1', kind: 'damage', value: 2.2 }],
    unlockCircle: 1,
  },
  'inner-flame': {
    id: 'inner-flame',
    name: 'Inner Flame',
    description: 'Ignite internal fire — passive +15% damage and HP regen each turn',
    category: TechniqueCategory.Passive,
    target: TechniqueTarget.Self,
    energyCost: 0,
    cooldownTurns: 0,
    effects: [
      { id: 'if-1', kind: 'passive-damage', value: 0.15 },
      { id: 'if-2', kind: 'heal-over-time', value: 5, durationTurns: 99 },
    ],
    unlockCircle: 1,
  },
  'purifying-fire': {
    id: 'purifying-fire',
    name: 'Purifying Fire',
    description: 'Burn away impurities — cleanse debuffs and restore moderate HP',
    category: TechniqueCategory.Active,
    target: TechniqueTarget.Self,
    energyCost: 8,
    cooldownTurns: 4,
    effects: [
      { id: 'pf-1', kind: 'cleanse', value: 1 },
      { id: 'pf-2', kind: 'heal-flat', value: 15 },
    ],
    unlockCircle: 1,
  },
  'balanced-strike': {
    id: 'balanced-strike',
    name: 'Balanced Strike',
    description: 'Strike with perfect harmony — moderate damage with no cooldown',
    category: TechniqueCategory.Active,
    target: TechniqueTarget.Enemy,
    energyCost: 7,
    cooldownTurns: 1,
    effects: [{ id: 'bs-1', kind: 'damage', value: 1.3 }],
    unlockCircle: 1,
  },
  'chain-breaker': {
    id: 'chain-breaker',
    name: 'Chain Breaker',
    description: 'Break through restraints — remove stuns and gain immunity for 1 turn',
    category: TechniqueCategory.Active,
    target: TechniqueTarget.Self,
    energyCost: 9,
    cooldownTurns: 4,
    effects: [
      { id: 'cb-1', kind: 'cleanse-stun', value: 1 },
      { id: 'cb-2', kind: 'buff-damage', value: 0.2, durationTurns: 1 },
    ],
    unlockCircle: 1,
  },
  'freedom-rush': {
    id: 'freedom-rush',
    name: 'Freedom Rush',
    description: 'Explosive burst of speed — strike first before the enemy next turn',
    category: TechniqueCategory.Active,
    target: TechniqueTarget.Enemy,
    energyCost: 6,
    cooldownTurns: 2,
    effects: [{ id: 'fr-1', kind: 'damage', value: 0.9 }, { id: 'fr-2', kind: 'hasten', value: 1 }],
    unlockCircle: 1,
  },
  'unbound-strike': {
    id: 'unbound-strike',
    name: 'Unbound Strike',
    description: 'Strike free from all limitations — massive damage that ignores 30% shield',
    category: TechniqueCategory.Active,
    target: TechniqueTarget.Enemy,
    energyCost: 11,
    cooldownTurns: 3,
    effects: [{ id: 'us-1', kind: 'pierce-damage', value: 1.8 }],
    unlockCircle: 1,
  },
  'star-gazing': {
    id: 'star-gazing',
    name: 'Star Gazing',
    description: 'Draw wisdom from the cosmos — boost all future damage for 3 turns',
    category: TechniqueCategory.Active,
    target: TechniqueTarget.Self,
    energyCost: 5,
    cooldownTurns: 3,
    effects: [{ id: 'sg-1', kind: 'buff-damage', value: 0.2, durationTurns: 3 }],
    unlockCircle: 1,
  },
  'cosmic-awareness': {
    id: 'cosmic-awareness',
    name: 'Cosmic Awareness',
    description: 'Sense distant energies — reveal enemy weakness, +50% damage next attack',
    category: TechniqueCategory.Active,
    target: TechniqueTarget.Enemy,
    energyCost: 7,
    cooldownTurns: 3,
    effects: [{ id: 'ca-1', kind: 'expose', value: 0.5, durationTurns: 1 }],
    unlockCircle: 1,
  },
  'pilgrim-step': {
    id: 'pilgrim-step',
    name: 'Pilgrim Step',
    description: 'Step through space — dodge next enemy attack entirely',
    category: TechniqueCategory.Active,
    target: TechniqueTarget.Self,
    energyCost: 10,
    cooldownTurns: 4,
    effects: [{ id: 'ps-1', kind: 'dodge', value: 1, durationTurns: 1 }],
    unlockCircle: 1,
  },
  'rift-manipulation': {
    id: 'rift-manipulation',
    name: 'Rift Manipulation',
    description: 'Create dimensional rifts — deal high damage and apply damage-over-time',
    category: TechniqueCategory.Active,
    target: TechniqueTarget.Enemy,
    energyCost: 12,
    cooldownTurns: 4,
    effects: [
      { id: 'rm-1', kind: 'damage', value: 1.5 },
      { id: 'rm-2', kind: 'dot', value: 6, durationTurns: 3 },
    ],
    unlockCircle: 1,
  },
  'reality-weave': {
    id: 'reality-weave',
    name: 'Reality Weave',
    description: 'Weave threads of reality — massive damage but costs extra HP',
    category: TechniqueCategory.Active,
    target: TechniqueTarget.Enemy,
    energyCost: 15,
    cooldownTurns: 5,
    effects: [
      { id: 'rw-1', kind: 'damage', value: 2.8 },
      { id: 'rw-2', kind: 'self-damage', value: 0.15 },
    ],
    unlockCircle: 1,
  },
  'saint-presence': {
    id: 'saint-presence',
    name: 'Saint Presence',
    description: 'Manifest transcendent authority — passive: enemies deal 15% less damage',
    category: TechniqueCategory.Passive,
    target: TechniqueTarget.Field,
    energyCost: 0,
    cooldownTurns: 0,
    effects: [{ id: 'sp-1', kind: 'enemy-damage-down', value: 0.15 }],
    unlockCircle: 1,
  },
  'fusion-strike': {
    id: 'fusion-strike',
    name: 'Fusion Strike',
    description: 'Combine multiple energies — damage scales with active buffs',
    category: TechniqueCategory.Active,
    target: TechniqueTarget.Enemy,
    energyCost: 10,
    cooldownTurns: 3,
    effects: [{ id: 'fs-1', kind: 'scaling-damage', value: 1.0 }],
    unlockCircle: 1,
  },
  'unity-field': {
    id: 'unity-field',
    name: 'Unity Field',
    description: 'Create harmonizing field — gain shield and healing over time',
    category: TechniqueCategory.Active,
    target: TechniqueTarget.Self,
    energyCost: 6,
    cooldownTurns: 3,
    effects: [
      { id: 'uf-1', kind: 'shield', value: 0.2 },
      { id: 'uf-2', kind: 'heal-over-time', value: 4, durationTurns: 3 },
    ],
    unlockCircle: 1,
  },
  'adaptive-flow': {
    id: 'adaptive-flow',
    name: 'Adaptive Flow',
    description: 'Flow with the situation — heal if below 50% HP, otherwise damage buff',
    category: TechniqueCategory.Active,
    target: TechniqueTarget.Self,
    energyCost: 5,
    cooldownTurns: 2,
    effects: [
      { id: 'af-1', kind: 'adaptive-heal', value: 20 },
      { id: 'af-2', kind: 'buff-damage', value: 0.2, durationTurns: 2 },
    ],
    unlockCircle: 1,
  },
}

export function getTechnique(id: string): Technique | undefined {
  return TECHNIQUES[id]
}

export function getTechniquesByIds(ids: string[]): Technique[] {
  return ids.map((id) => TECHNIQUES[id]).filter(Boolean)
}

export function getAvailableTechniques(character: Character, combat: CombatState): Technique[] {
  const known = getTechniquesByIds(character.techniques)
  const playerP = combat.participants.find((p) => p.kind === 'player')
  const availableEnergy = playerP?.energy ?? character.currentEnergy
  return known.filter((t) => {
    if (t.energyCost > availableEnergy) return false
    const cd = combat.cooldowns[t.id] ?? 0
    if (cd > 0) return false
    return true
  })
}

// ── Technique Execution ───────────────────────────────────────────

export interface TechniqueResult {
  log: string[]
  damage: number
  healing: number
  shieldGained: number
  newStatuses: StatusEffect[]
  selfDamage: number
}

export function executeTechnique(
  combat: CombatState,
  techniqueId: string,
  userParticipant: CombatParticipant,
  targets: CombatParticipant[],
): { log: string[]; updatedParticipants: CombatParticipant[]; updatedCooldowns: Record<string, number>; userEnergyCost: number } {
  const tech = TECHNIQUES[techniqueId]
  if (!tech) {
    return { log: ['Unknown technique.'], updatedParticipants: combat.participants, updatedCooldowns: combat.cooldowns, userEnergyCost: 0 }
  }

  const results: TechniqueResult = { log: [], damage: 0, healing: 0, shieldGained: 0, newStatuses: [], selfDamage: 0 }
  const userBuffs = userParticipant.statuses.filter((s) => s.kind === StatusEffectKind.Buff)
  const buffMultiplier = 1 + userBuffs.reduce((sum, b) => sum + b.value, 0)

  for (const effect of tech.effects) {
    applyEffect(effect, userParticipant, targets, results, buffMultiplier, combat)
  }

  const log = [`${userParticipant.name} uses **${tech.name}**!`, ...results.log]
  let updated = combat.participants

  // Apply damage to primary target
  if (results.damage > 0 && targets.length > 0) {
    const primary = targets[0]
    let actualDamage = results.damage
    if (primary.shield > 0) {
      const blocked = Math.min(primary.shield, actualDamage)
      primary.shield -= blocked
      actualDamage -= blocked
      if (blocked > 0) log.push(`${primary.name}'s shield absorbs ${blocked} damage.`)
    }
    const newHp = Math.max(0, primary.hp - actualDamage)
    log.push(`Dealt ${Math.floor(results.damage)} damage to ${primary.name}.`)
    updated = updatedParticipants(updated, primary.id, { hp: newHp, shield: primary.shield })
  }

  // Apply self-damage
  if (results.selfDamage > 0) {
    let sd = results.selfDamage
    if (userParticipant.shield > 0) {
      const blocked = Math.min(userParticipant.shield, sd)
      userParticipant.shield -= blocked
      sd -= blocked
    }
    const newHp = Math.max(0, userParticipant.hp - sd)
    log.push(`${userParticipant.name} suffers ${Math.floor(results.selfDamage)} self-damage.`)
    updated = updatedParticipants(updated, userParticipant.id, { hp: newHp, shield: userParticipant.shield })
  }

  // Apply healing
  if (results.healing > 0) {
    const newHp = Math.min(userParticipant.maxHp, userParticipant.hp + results.healing)
    log.push(`${userParticipant.name} recovers ${Math.floor(results.healing)} HP.`)
    updated = updatedParticipants(updated, userParticipant.id, { hp: newHp })
  }

  // Apply shield
  if (results.shieldGained > 0) {
    const newShield = userParticipant.shield + results.shieldGained
    log.push(`${userParticipant.name} gains ${Math.floor(results.shieldGained)} shield.`)
    updated = updatedParticipants(updated, userParticipant.id, { shield: newShield })
  }

  // Apply new status effects
  for (const se of results.newStatuses) {
    const participant = updated.find((p) => p.id === se.sourceId) ?? userParticipant
    // Attach to targets if it's a debuff, otherwise to user
    const targetParticipant = se.kind === StatusEffectKind.Debuff || se.kind === StatusEffectKind.Dot || se.kind === StatusEffectKind.Stun
      ? (targets[0] ?? participant)
      : participant
    updated = updatedParticipants(updated, targetParticipant.id, {
      statuses: [...targetParticipant.statuses.filter((s) => s.id !== se.id), se],
    })
  }

  // Update cooldowns
  const updatedCooldowns: Record<string, number> = {}
  for (const key of Object.keys(combat.cooldowns)) {
    const v = combat.cooldowns[key]
    if (v !== undefined && v > 0) updatedCooldowns[key] = v
  }
  for (const key of Object.keys(updatedCooldowns)) {
    const v = updatedCooldowns[key]
    if (v !== undefined) updatedCooldowns[key] = Math.max(0, v - 1)
  }
  if (tech.cooldownTurns > 0) {
    updatedCooldowns[techniqueId] = tech.cooldownTurns
  }

  return { log, updatedParticipants: updated, updatedCooldowns, userEnergyCost: tech.energyCost }
}

function applyEffect(
  effect: TechniqueEffect,
  user: CombatParticipant,
  targets: CombatParticipant[],
  results: TechniqueResult,
  buffMultiplier: number,
  combat: CombatState,
): void {
  const basePower = 10 + Math.floor(user.energy * 0.1)
  const primary = targets[0]

  switch (effect.kind) {
    case 'damage': {
      results.damage += rollDamage(basePower * effect.value * buffMultiplier)
      break
    }
    case 'pierce-damage': {
      // 30% damage ignores shield — handled outside
      results.damage += rollDamage(basePower * effect.value * buffMultiplier)
      break
    }
    case 'scaling-damage': {
      const buffCount = user.statuses.filter((s) => s.kind === StatusEffectKind.Buff).length
      const mult = effect.value + buffCount * 0.15
      results.damage += rollDamage(basePower * mult * buffMultiplier)
      break
    }
    case 'heal-stat': {
      results.healing += Math.floor(user.maxHp * 0.05 * effect.value)
      break
    }
    case 'heal-flat': {
      results.healing += Math.floor(effect.value * (1 + user.energy * 0.01))
      break
    }
    case 'heal-over-time': {
      results.newStatuses.push({
        id: `${effect.id}-${user.id}`,
        name: 'Regeneration',
        kind: StatusEffectKind.HealOverTime,
        value: effect.value,
        turnsRemaining: effect.durationTurns ?? 3,
        sourceId: user.id,
      })
      break
    }
    case 'lifesteal': {
      const steal = Math.floor(results.damage * effect.value)
      // Will be applied after damage calc
      results.healing += steal
      break
    }
    case 'shield': {
      results.shieldGained += Math.floor(user.maxHp * effect.value)
      break
    }
    case 'buff-damage': {
      results.newStatuses.push({
        id: `${effect.id}-${user.id}`,
        name: 'Empowered',
        kind: StatusEffectKind.Buff,
        value: effect.value,
        turnsRemaining: effect.durationTurns ?? 2,
        sourceId: user.id,
      })
      break
    }
    case 'debuff-damage': {
      if (primary) {
        results.newStatuses.push({
          id: `${effect.id}-${primary.id}`,
          name: 'Weakened',
          kind: StatusEffectKind.Debuff,
          value: effect.value,
          turnsRemaining: effect.durationTurns ?? 2,
          sourceId: primary.id,
        })
      }
      break
    }
    case 'dot': {
      if (primary) {
        results.newStatuses.push({
          id: `${effect.id}-${primary.id}`,
          name: 'Bleeding',
          kind: StatusEffectKind.Dot,
          value: effect.value,
          turnsRemaining: effect.durationTurns ?? 3,
          sourceId: primary.id,
        })
      }
      break
    }
    case 'cleanse': {
      // Remove debuffs and dots from user
      results.log.push('Purified of all afflictions!')
      // This is handled at participant level
      const cleansed = user.statuses.filter(
        (s) => s.kind !== StatusEffectKind.Debuff && s.kind !== StatusEffectKind.Dot && s.kind !== StatusEffectKind.Stun,
      )
      results.newStatuses.push(...cleansed)
      // Signal to remove all debuffs
      results.newStatuses.push({
        id: `cleanse-${user.id}`,
        name: 'Purified',
        kind: StatusEffectKind.Buff,
        value: 0,
        turnsRemaining: 1,
        sourceId: user.id,
      })
      break
    }
    case 'cleanse-stun': {
      // Remove stuns specifically
      results.log.push('Chains shattered!')
      break
    }
    case 'hasten': {
      // Grant extra turn — handled via participant status
      results.newStatuses.push({
        id: `${effect.id}-${user.id}`,
        name: 'Hastened',
        kind: StatusEffectKind.Buff,
        value: 1,
        turnsRemaining: 1,
        sourceId: user.id,
      })
      break
    }
    case 'expose': {
      if (primary) {
        results.newStatuses.push({
          id: `${effect.id}-${primary.id}`,
          name: 'Exposed',
          kind: StatusEffectKind.Debuff,
          value: effect.value,
          turnsRemaining: effect.durationTurns ?? 1,
          sourceId: primary.id,
        })
      }
      break
    }
    case 'dodge': {
      results.newStatuses.push({
        id: `${effect.id}-${user.id}`,
        name: 'Ethereal',
        kind: StatusEffectKind.Buff,
        value: 1,
        turnsRemaining: effect.durationTurns ?? 1,
        sourceId: user.id,
      })
      break
    }
    case 'self-damage': {
      results.selfDamage += Math.floor(user.maxHp * effect.value)
      break
    }
    case 'enemy-damage-down': {
      results.newStatuses.push({
        id: `${effect.id}-${user.id}`,
        name: 'Transcendent Authority',
        kind: StatusEffectKind.Buff,
        value: effect.value,
        turnsRemaining: 99,
        sourceId: user.id,
      })
      break
    }
    case 'adaptive-heal': {
      if (user.hp < user.maxHp * 0.5) {
        results.healing += effect.value
      }
      break
    }
    case 'passive-damage': {
      // Passive effects are applied automatically — tracked via status
      results.newStatuses.push({
        id: `${effect.id}-${user.id}`,
        name: 'Inner Flame',
        kind: StatusEffectKind.Buff,
        value: effect.value,
        turnsRemaining: 99,
        sourceId: user.id,
      })
      break
    }
    default:
      break
  }
}

// ── Status Effect Resolution ──────────────────────────────────────

export function resolveStatusEffects(participants: CombatParticipant[]): { updatedParticipants: CombatParticipant[]; log: string[] } {
  const log: string[] = []
  const updated = participants.map((p) => {
    let hp = p.hp
    let shield = p.shield
    const remaining: StatusEffect[] = []

    for (const s of p.statuses) {
      const turnsLeft = s.turnsRemaining - 1
      switch (s.kind) {
        case StatusEffectKind.HealOverTime: {
          const heal = Math.min(s.value, p.maxHp - hp)
          if (heal > 0) {
            hp += heal
            log.push(`${p.name} regenerates ${Math.floor(heal)} HP.`)
          }
          if (turnsLeft > 0) remaining.push({ ...s, turnsRemaining: turnsLeft })
          break
        }
        case StatusEffectKind.Dot: {
          const dmg = Math.min(s.value, hp)
          hp = Math.max(0, hp - dmg)
          log.push(`${p.name} suffers ${Math.floor(dmg)} damage from affliction.`)
          if (turnsLeft > 0) remaining.push({ ...s, turnsRemaining: turnsLeft })
          break
        }
        case StatusEffectKind.Shield: {
          // Shield is handled separately — no tick needed
          if (turnsLeft > 0) remaining.push({ ...s, turnsRemaining: turnsLeft })
          break
        }
        case StatusEffectKind.Stun: {
          log.push(`${p.name} is stunned and cannot act!`)
          // Removed after this turn
          break
        }
        default: {
          // Buffs, debuffs — tick down
          if (turnsLeft > 0) remaining.push({ ...s, turnsRemaining: turnsLeft })
          break
        }
      }
    }

    return { ...p, hp, shield, statuses: remaining }
  })

  return { updatedParticipants: updated, log }
}

// ── Helpers ────────────────────────────────────────────────────────

function updatedParticipants(
  participants: CombatParticipant[],
  id: string,
  changes: Partial<CombatParticipant>,
): CombatParticipant[] {
  return participants.map((p) => (p.id === id ? { ...p, ...changes } : p))
}

export function getActiveBuffs(participant: CombatParticipant): StatusEffect[] {
  return participant.statuses.filter((s) => s.kind === StatusEffectKind.Buff)
}

export function getEnemyDamageMultiplier(combat: CombatState): number {
  // Check for player buffs that reduce enemy damage
  const player = combat.participants.find((p) => p.kind === 'player')
  if (!player) return 1
  const reductions = player.statuses
    .filter((s) => s.name === 'Transcendent Authority')
    .reduce((sum, s) => sum + s.value, 0)
  return Math.max(0.3, 1 - reductions)
}
