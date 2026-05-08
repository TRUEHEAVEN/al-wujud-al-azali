import { HazardType, type HazardDefinition, type HazardResult, HazardEffectKind, SixSenseLevel, DiscoveryGameType, type DiscoveryGame, type DiscoveryReward, type LootItem, type PerceptionField } from '../types/exploration'
import { HAZARDS, DISCOVERY_GAME_TEMPLATES, LOOT_TABLE, getRegionMechanics } from '../data/explorationData'
import type { Character } from '../types/character'

let _gameIdCounter = 0
function discoveryGameId(): string {
  _gameIdCounter += 1
  return `discovery-game-${_gameIdCounter}`
}

export function resolveHazard(
  hazardType: string,
  character: Character,
  tryAvoid: boolean,
): HazardResult {
  const result: HazardResult = {
    avoided: false,
    damage: 0,
    energyLost: 0,
    marksLost: 0,
    timeSkipped: 0,
    combatTriggered: false,
    messages: [],
  }

  const hazard = HAZARDS[hazardType] as HazardDefinition | undefined
  if (!hazard || hazard.id === HazardType.None) return result

  if (character.circle < hazard.minCircle) return result

  if (tryAvoid && hazard.avoidable) {
    const energyAvailable = character.currentEnergy >= hazard.avoidEnergyCost
    if (!energyAvailable) {
      result.messages.push(`Not enough Path Energy to avoid ${hazard.name}. You must endure it.`)
    } else {
      const avoidChance = hazard.avoidChanceBase + (character.stats.agility / 50)
      const success = Math.random() < avoidChance
      if (success) {
        result.avoided = true
        result.energyLost = hazard.avoidEnergyCost
        result.messages.push(`You deftly avoid the ${hazard.name}, expending ${hazard.avoidEnergyCost} Energy.`)
        return result
      } else {
        result.energyLost = Math.floor(hazard.avoidEnergyCost / 2)
        result.messages.push(`You try to avoid the ${hazard.name} but stumble, losing ${result.energyLost} Energy.`)
      }
    }
  }

  for (const effect of hazard.effects) {
    switch (effect.kind) {
      case HazardEffectKind.Damage: {
        result.damage += effect.value
        result.messages.push(effect.message)
        break
      }
      case HazardEffectKind.EnergyDrain: {
        result.energyLost += effect.value
        result.messages.push(effect.message)
        break
      }
      case HazardEffectKind.MarksDrain: {
        result.marksLost += effect.value
        result.messages.push(effect.message)
        break
      }
      case HazardEffectKind.TimeSkip: {
        result.timeSkipped += effect.value
        result.messages.push(effect.message)
        break
      }
      case HazardEffectKind.StatPenalty: {
        result.messages.push(effect.message)
        break
      }
      case HazardEffectKind.CombatStart: {
        result.combatTriggered = true
        result.messages.push(effect.message)
        break
      }
    }
  }

  return result
}

export function generateDiscoveryGame(
  gameType: DiscoveryGameType,
  regionCircle: number,
): DiscoveryGame | null {
  if (gameType === DiscoveryGameType.None) return null

  const template = DISCOVERY_GAME_TEMPLATES[gameType]
  if (!template) return null

  const difficulty = Math.min(template.difficulty + Math.floor((regionCircle - 1) / 2), 5)

  return {
    ...template,
    id: discoveryGameId(),
    difficulty,
    onSuccess: { ...template.onSuccess, marks: template.onSuccess.marks * regionCircle },
    onFailure: { ...template.onFailure, marks: template.onFailure.marks * regionCircle },
  }
}

export function generateLootDrop(
  circle: number,
  nodeType: string,
): LootItem[] {
  const mechanics = getRegionMechanics(circle)
  const drops: LootItem[] = []

  const dropCount = nodeType === 'discovery'
    ? 1 + Math.floor(Math.random() * 3)
    : nodeType === 'boss'
      ? 2 + Math.floor(Math.random() * 3)
      : Math.random() < 0.3 ? 1 : 0

  for (let i = 0; i < dropCount; i++) {
    const rarityRoll = Math.random() * (1 + circle * 0.15)
    let rarity: LootItem['rarity']
    if (rarityRoll > 0.95) rarity = 'legendary'
    else if (rarityRoll > 0.75) rarity = 'rare'
    else if (rarityRoll > 0.45) rarity = 'uncommon'
    else rarity = 'common'

    const pool = LOOT_TABLE.filter((l) => l.rarity === rarity)
    if (pool.length === 0) {
      const fallback = LOOT_TABLE.filter((l) => l.rarity === 'common')
      const pick = fallback[Math.floor(Math.random() * fallback.length)]
      drops.push({ ...pick, value: Math.floor(pick.value * mechanics.lootMultiplier) })
    } else {
      const pick = pool[Math.floor(Math.random() * pool.length)]
      drops.push({ ...pick, value: Math.floor(pick.value * mechanics.lootMultiplier) })
    }
  }

  return drops
}

export function deriveSixSenseLevel(character: Character): SixSenseLevel {
  const circle = character.circle
  const insight = character.stats.insight

  if (circle >= 5 || insight >= 25) return SixSenseLevel.Infinite
  if (circle >= 4 || insight >= 20) return SixSenseLevel.Vast
  if (circle >= 3 || insight >= 15) return SixSenseLevel.Awake
  if (circle >= 2 || insight >= 10) return SixSenseLevel.Stirring
  return SixSenseLevel.Dormant
}

export function derivePerceptionField(character: Character): PerceptionField {
  const level = deriveSixSenseLevel(character)

  const radiusMap: Record<number, number> = {
    [SixSenseLevel.Dormant]: 0,
    [SixSenseLevel.Stirring]: 1,
    [SixSenseLevel.Awake]: 2,
    [SixSenseLevel.Vast]: 3,
    [SixSenseLevel.Infinite]: 4,
  }

  const secretMap: Record<number, string> = {
    [SixSenseLevel.Dormant]: 'Your senses are mundane. Hidden truths remain veiled.',
    [SixSenseLevel.Stirring]: 'Faint whispers reach you. Something stirs at the edge of perception.',
    [SixSenseLevel.Awake]: 'The world sharpens. Hidden paths flicker in your awareness.',
    [SixSenseLevel.Vast]: 'Your perception spans leagues. Few secrets can hide from your gaze.',
    [SixSenseLevel.Infinite]: 'Nothing is hidden from you. The Path itself reveals its architecture.',
  }

  return {
    level,
    revealRadius: radiusMap[level] ?? 0,
    hiddenNodesRevealed: [],
    secretText: secretMap[level] ?? '',
  }
}

export function checkHiddenNodeVisibility(
  nodeCircleReq: number,
  perceptionField: PerceptionField,
): boolean {
  return perceptionField.revealRadius >= nodeCircleReq
}

export function evaluateDiscoveryMiniGame(
  game: DiscoveryGame,
  playerChoice: string,
): { success: boolean; reward: DiscoveryReward; message: string } {
  switch (game.type) {
    case DiscoveryGameType.VoidRiddle: {
      const answers = game.gameData.answers as string[] | undefined
      const correct = game.gameData.correctIndex as number | undefined
      if (answers && correct !== undefined) {
        const chosenIdx = parseInt(playerChoice, 10)
        const success = chosenIdx === correct
        return {
          success,
          reward: success ? game.onSuccess : game.onFailure,
          message: success
            ? '"Nothing" is the answer. The void acknowledges your wisdom.'
            : 'The void remains silent. Wrong answer.',
        }
      }
      break
    }
    case DiscoveryGameType.GlyphMatch: {
      const success = Math.random() < 0.4 + game.difficulty * 0.1
      return {
        success,
        reward: success ? game.onSuccess : game.onFailure,
        message: success
          ? 'The glyph pieces snap into alignment! Ancient knowledge floods your mind.'
          : 'The glyph shatters further. You salvage what you can.',
      }
    }
    case DiscoveryGameType.Resonance: {
      const success = Math.random() < 0.35 + game.difficulty * 0.1
      return {
        success,
        reward: success ? game.onSuccess : game.onFailure,
        message: success
          ? 'Your energy harmonizes perfectly! The resonance amplifies your Path.'
          : 'The frequency wobbles. You extract partial resonance.',
      }
    }
    case DiscoveryGameType.Memory: {
      const success = Math.random() < 0.5 + game.difficulty * 0.1
      return {
        success,
        reward: success ? game.onSuccess : game.onFailure,
        message: success
          ? 'The pattern burns into your memory! The ancient cultivator\'s legacy is yours.'
          : 'The pattern fades before you can capture it. A fragment remains.',
      }
    }
  }

  return {
    success: false,
    reward: game.onFailure,
    message: 'The discovery eludes you.',
  }
}
