import { EnemyTier, EnemyAiProfile, type Enemy } from '../types/enemy'
import type { PathElement } from '../types/path'

const ENEMY_BY_TIER: Record<string, { names: string[]; lore: string[]; abilities: string[]; hpMin: number; hpMax: number; marksMin: number; marksMax: number }> = {
  mortal: {
    names: ['Vagrant Cultivator', 'Feral Beast', 'Lost Spirit', 'Mad Hermit', 'Bandit Seeker', 'Corrupted Wanderer'],
    lore: [
      'A fallen cultivator who never found their Path. Desperation has made them dangerous.',
      'The wilds breed creatures touched by stray Mystery. Hungry and hostile.',
      'A soul caught between circles, unable to ascend or rest. It lashes out at the living.',
    ],
    abilities: ['basic-strike', 'wild-charge'],
    hpMin: 30, hpMax: 60, marksMin: 10, marksMax: 30,
  },
  seeker: {
    names: ['Aspirant Marauder', 'Void-Touched Warrior', 'Shattered Disciple', 'Rival Cultivator', 'Flame-Branded Reaver'],
    lore: [
      'A cultivator who traded morality for power. Now they prey on fellow seekers.',
      'Something from beyond the veil has taken residence in this warrior. They serve a darker master.',
      'A Path-walker whose foundation cracked under pressure. They seek to break others in turn.',
    ],
    abilities: ['energy-drain', 'bone-lance', 'shatter-strike'],
    hpMin: 60, hpMax: 120, marksMin: 30, marksMax: 80,
  },
  forged: {
    names: ['Bone-Sculpted Champion', 'Rift-Hunter', 'Ash-Crowned Knight', 'Chain-Bound Executioner', 'Storm Herald'],
    lore: [
      'A warrior who has reforged their body into a weapon. Each bone a testament to violence.',
      'One who hunts the rifts between worlds for power. To them, you are prey.',
      'Crowned by the ashes of their enemies, this champion has never known defeat. Yet.',
    ],
    abilities: ['bone-reinforcement', 'fracture', 'soul-rend', 'void-step'],
    hpMin: 120, hpMax: 220, marksMin: 80, marksMax: 200,
  },
  ascendant: {
    names: ['Domain Lord', 'Sixth-Sense Tyrant', 'Embodiment Breaker', 'Red Dust Sovereign', 'Path Devourer'],
    lore: [
      'A cultivator who has claimed dominion over a region. Their six-sense reaches for leagues.',
      'Few have witnessed an ascendant in combat and lived. Their power warps local reality.',
      'This being has devoured lesser Paths to fuel their own. They hunger for yours.',
    ],
    abilities: ['domain-pressure', 'path-devour', 'reality-sever', 'ascendant-will'],
    hpMin: 220, hpMax: 400, marksMin: 200, marksMax: 500,
  },
  boss: {
    names: ['The Ashen King', 'Void Matriarch', 'Bone Tyrant', 'Star-Eater Serpent', 'Silent Executioner', 'The Unwoven One'],
    lore: [
      'Legends speak of this being in whispers. Those who face it are never the same.',
      'A sovereign whose name has been erased from history. Only terror remains.',
      'What stands before you defies cultivation norms. This is a true test of your Path.',
    ],
    abilities: ['boss-slaughter', 'existence-rend', 'despair-field', 'ultimate-technique'],
    hpMin: 300, hpMax: 600, marksMin: 400, marksMax: 1000,
  },
}

const PATH_ELEMENTS: PathElement[] = ['void', 'flame', 'ash', 'storm', 'bone', 'tide', 'radiance', 'shadow']

const AI_PROFILES: EnemyAiProfile[] = ['aggressive', 'defensive', 'tactical', 'berserker', 'mysterious']

export function generateEnemy(playerCircle: number, isBoss = false): Enemy {
  const tier = isBoss
    ? EnemyTier.Boss
    : playerCircle <= 1
      ? EnemyTier.Mortal
      : playerCircle <= 2
        ? EnemyTier.Seeker
        : playerCircle <= 3
          ? EnemyTier.Forged
          : EnemyTier.Ascendant

  const template = ENEMY_BY_TIER[tier]
  const name = template.names[Math.floor(Math.random() * template.names.length)]
  const lore = template.lore[Math.floor(Math.random() * template.lore.length)]
  const abilities = [...template.abilities]
  const hp = template.hpMin + Math.floor(Math.random() * (template.hpMax - template.hpMin))
  const marks = template.marksMin + Math.floor(Math.random() * (template.marksMax - template.marksMin))
  const pathType = PATH_ELEMENTS[Math.floor(Math.random() * PATH_ELEMENTS.length)]
  const aiProfile = AI_PROFILES[Math.floor(Math.random() * AI_PROFILES.length)]
  const enemyCircle = Math.max(1, playerCircle + Math.floor(Math.random() * 3) - 1)

  return {
    id: `enemy-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: `${name} (Circle ${enemyCircle})`,
    tier,
    circle: enemyCircle,
    pathType,
    marks,
    maxHp: hp,
    abilities,
    aiProfile,
    lore,
  }
}

export function generateBoss(playerCircle: number): Enemy {
  return generateEnemy(playerCircle, true)
}

export function calculateMarksReward(enemy: Enemy): number {
  const baseReward = enemy.marks
  const tierMultiplier = {
    mortal: 1,
    seeker: 1.5,
    forged: 2.5,
    ascendant: 4,
    boss: 8,
  }
  return Math.floor(baseReward * (tierMultiplier[enemy.tier] || 1))
}
