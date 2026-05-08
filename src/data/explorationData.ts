import type {
  HazardDefinition,
  DiscoveryGame,
  RegionMechanics,
  LootItem,
} from '../types/exploration'
import { HazardType, DiscoveryGameType, RegionMechanicType, HazardEffectKind } from '../types/exploration'

export const HAZARDS: Record<string, HazardDefinition> = {
  [HazardType.PoisonSwamp]: {
    id: HazardType.PoisonSwamp,
    name: 'Poison Swamp',
    description: 'The ground exhales death. Miasmic vapors corrode both flesh and Path.',
    minCircle: 1,
    regions: [1, 2],
    effects: [
      { kind: HazardEffectKind.Damage, value: 15, message: 'The poison seeps into your wounds.' },
      { kind: HazardEffectKind.EnergyDrain, value: 10, message: 'Miasma drains your Path Energy.' },
    ],
    avoidable: true,
    avoidEnergyCost: 8,
    avoidChanceBase: 0.5,
  },
  [HazardType.VoidStorm]: {
    id: HazardType.VoidStorm,
    name: 'Void Storm',
    description: 'Reality itself fractures around you. The void hungers for essence.',
    minCircle: 1,
    regions: [2, 3, 4],
    effects: [
      { kind: HazardEffectKind.EnergyDrain, value: 20, message: 'The void devours your Path Energy.' },
      { kind: HazardEffectKind.MarksDrain, value: 15, message: 'Marks unravel from your Foundation.' },
    ],
    avoidable: true,
    avoidEnergyCost: 12,
    avoidChanceBase: 0.35,
  },
  [HazardType.BloodMist]: {
    id: HazardType.BloodMist,
    name: 'Blood Mist',
    description: 'Crimson fog writhes with the echoes of slaughtered cultivators.',
    minCircle: 2,
    regions: [2, 3, 4, 5],
    effects: [
      { kind: HazardEffectKind.Damage, value: 25, message: 'The Blood Mist tears at your flesh.' },
      { kind: HazardEffectKind.CombatStart, value: 0, message: 'Something stirs within the crimson haze.' },
    ],
    avoidable: true,
    avoidEnergyCost: 15,
    avoidChanceBase: 0.4,
  },
  [HazardType.DustWaste]: {
    id: HazardType.DustWaste,
    name: 'Dust Waste',
    description: 'The Red Dust blankets all. Time itself erodes in these forsaken expanses.',
    minCircle: 3,
    regions: [4, 5],
    effects: [
      { kind: HazardEffectKind.TimeSkip, value: 3, message: 'Years dissolve in the Dust Waste.' },
      { kind: HazardEffectKind.EnergyDrain, value: 15, message: 'The Dust grinds away your reserves.' },
      { kind: HazardEffectKind.StatPenalty, value: 2, message: 'Your vitality wanes under the Dust\'s weight.' },
    ],
    avoidable: false,
    avoidEnergyCost: 0,
    avoidChanceBase: 0,
  },
  [HazardType.BoneField]: {
    id: HazardType.BoneField,
    name: 'Bone Field',
    description: 'The skeletons of failed cultivators litter the ground. Their death-resonance poisons the air.',
    minCircle: 2,
    regions: [2, 3, 4],
    effects: [
      { kind: HazardEffectKind.Damage, value: 20, message: 'Death-resonance cracks your bones.' },
      { kind: HazardEffectKind.MarksDrain, value: 20, message: 'The dead hunger for your Marks.' },
    ],
    avoidable: true,
    avoidEnergyCost: 10,
    avoidChanceBase: 0.45,
  },
  [HazardType.ResonanceCrack]: {
    id: HazardType.ResonanceCrack,
    name: 'Resonance Crack',
    description: 'A wound in the fabric of cultivation itself. Unstable Marks burst like shrapnel.',
    minCircle: 3,
    regions: [3, 4, 5],
    effects: [
      { kind: HazardEffectKind.Damage, value: 30, message: 'Resonance shrapnel tears through you.' },
      { kind: HazardEffectKind.EnergyDrain, value: 25, message: 'The Crack consumes ambient Path energy.' },
    ],
    avoidable: true,
    avoidEnergyCost: 18,
    avoidChanceBase: 0.3,
  },
  [HazardType.EchoMaze]: {
    id: HazardType.EchoMaze,
    name: 'Echo Maze',
    description: 'Ancient cultivators\' memories twist space into impossible architectures.',
    minCircle: 3,
    regions: [4, 5],
    effects: [
      { kind: HazardEffectKind.TimeSkip, value: 2, message: 'You wander the maze for what feels like years.' },
      { kind: HazardEffectKind.StatPenalty, value: 3, message: 'The echoes erode your will.' },
    ],
    avoidable: false,
    avoidEnergyCost: 0,
    avoidChanceBase: 0,
  },
  [HazardType.None]: {
    id: HazardType.None,
    name: 'None',
    description: '',
    minCircle: 1,
    regions: [1, 2, 3, 4, 5],
    effects: [],
    avoidable: false,
    avoidEnergyCost: 0,
    avoidChanceBase: 0,
  },
}

export const LOOT_TABLE: LootItem[] = [
  { id: 'loot-mark-shard', name: 'Mark Shard', type: 'resource', description: 'A crystallized fragment of cultivation essence.', rarity: 'common', value: 15 },
  { id: 'loot-void-ember', name: 'Void Ember', type: 'resource', description: 'A smoldering remnant of collapsed reality.', rarity: 'uncommon', value: 30 },
  { id: 'loot-blood-pearl', name: 'Blood Pearl', type: 'resource', description: 'Coagulated essence from a fallen cultivator.', rarity: 'uncommon', value: 35 },
  { id: 'loot-technique-fragment', name: 'Technique Fragment', type: 'fragment', description: 'A broken piece of forgotten martial wisdom.', rarity: 'rare', value: 50 },
  { id: 'loot-dust-crystal', name: 'Dust Crystal', type: 'resource', description: 'Compressed Red Dust, pulsing with eroded time.', rarity: 'rare', value: 45 },
  { id: 'loot-bone-relic', name: 'Bone Relic', type: 'relic', description: 'A finger bone of a Controller-stage cultivator. Still warm.', rarity: 'rare', value: 60 },
  { id: 'loot-codex-scroll', name: 'Codex Scroll', type: 'relic', description: 'Fragments of forbidden lore, barely legible.', rarity: 'legendary', value: 80 },
  { id: 'loot-foundation-essence', name: 'Foundation Essence', type: 'consumable', description: 'Pure cultivation energy. Strengthens your core.', rarity: 'legendary', value: 100 },
]

export const DISCOVERY_GAME_TEMPLATES: Record<string, Omit<DiscoveryGame, 'id'>> = {
  [DiscoveryGameType.Memory]: {
    type: DiscoveryGameType.Memory,
    title: 'Memory of the Ancients',
    description: 'Trace the pattern left by an ancient cultivator. Match the sequence of Marks to unlock their legacy.',
    difficulty: 1,
    onSuccess: { marks: 60, bonusMarks: 30, codexId: 'ancient-marks' },
    onFailure: { marks: 15, bonusMarks: 0 },
    gameData: { sequenceLength: 5, timeLimit: 10 },
  },
  [DiscoveryGameType.Resonance]: {
    type: DiscoveryGameType.Resonance,
    title: 'Resonance Tuning',
    description: 'Align your Path energy with the ambient resonance. Find the harmonic frequency.',
    difficulty: 2,
    onSuccess: { marks: 80, energy: 25, bonusMarks: 40, narrativeAdvance: true },
    onFailure: { marks: 20, bonusMarks: 0, energy: 5 },
    gameData: { harmonicTarget: 0.72, tolerance: 0.08 },
  },
  [DiscoveryGameType.GlyphMatch]: {
    type: DiscoveryGameType.GlyphMatch,
    title: 'Glyph Alignment',
    description: 'Rotate the fractured glyph until its pieces align. The Silent Author\'s script must be read correctly.',
    difficulty: 2,
    onSuccess: { marks: 70, bonusMarks: 50, techniqueId: 'glyph-insight' },
    onFailure: { marks: 20, bonusMarks: 0 },
    gameData: { pieceCount: 4, rotations: [0, 90, 180, 270] },
  },
  [DiscoveryGameType.VoidRiddle]: {
    type: DiscoveryGameType.VoidRiddle,
    title: 'Void Riddle',
    description: 'A question echoes from the void: "What exists before existence, and remains after annihilation?"',
    difficulty: 3,
    onSuccess: { marks: 100, bonusMarks: 60, codexId: 'void-truth', narrativeAdvance: true },
    onFailure: { marks: 25, bonusMarks: 0 },
    gameData: { answers: ['Silence', 'The Path', 'Nothing', 'The Will'], correctIndex: 2 },
  },
}

export const REGION_MECHANICS: RegionMechanics[] = [
  {
    circle: 1,
    name: 'The Mortal Expanse',
    mechanic: RegionMechanicType.SafeCradle,
    description: 'Where all journeys begin. Hazards are mild, and the Path is forgiving to new seekers.',
    availableHazards: [HazardType.PoisonSwamp, HazardType.None],
    hiddenNodeChance: 0.1,
    lootMultiplier: 1.0,
    minigameTypes: [DiscoveryGameType.Memory],
    narrativeEvents: [],
  },
  {
    circle: 2,
    name: 'The Aspirant Marches',
    mechanic: RegionMechanicType.DangerFrontier,
    description: 'A land of awakening senses. Hazards sharpen, and each step forward demands more of you.',
    availableHazards: [HazardType.PoisonSwamp, HazardType.VoidStorm, HazardType.BloodMist, HazardType.BoneField, HazardType.None],
    hiddenNodeChance: 0.15,
    lootMultiplier: 1.2,
    minigameTypes: [DiscoveryGameType.Memory, DiscoveryGameType.Resonance],
    narrativeEvents: [],
  },
  {
    circle: 3,
    name: 'The Six-Sense Reaches',
    mechanic: RegionMechanicType.PerceptionGate,
    description: 'Perception expands beyond flesh. What was unseen becomes tangible. Hidden paths reveal themselves.',
    availableHazards: [HazardType.VoidStorm, HazardType.BloodMist, HazardType.BoneField, HazardType.ResonanceCrack, HazardType.None],
    hiddenNodeChance: 0.25,
    lootMultiplier: 1.5,
    minigameTypes: [DiscoveryGameType.Memory, DiscoveryGameType.Resonance, DiscoveryGameType.GlyphMatch],
    narrativeEvents: [],
  },
  {
    circle: 4,
    name: 'The Shifting Frontier',
    mechanic: RegionMechanicType.EmbodimentTrial,
    description: 'Reality bends. Your body transforms to match your Path. The world tests your new form relentlessly.',
    availableHazards: [HazardType.VoidStorm, HazardType.BloodMist, HazardType.DustWaste, HazardType.ResonanceCrack, HazardType.EchoMaze, HazardType.None],
    hiddenNodeChance: 0.3,
    lootMultiplier: 1.8,
    minigameTypes: [DiscoveryGameType.Resonance, DiscoveryGameType.GlyphMatch, DiscoveryGameType.VoidRiddle],
    narrativeEvents: [],
  },
  {
    circle: 5,
    name: 'The Dust Provinces',
    mechanic: RegionMechanicType.DustCycle,
    description: 'The Red Dust settles on all things. Rebirth and decay walk hand in hand. Only the strongest endure.',
    availableHazards: [HazardType.BloodMist, HazardType.DustWaste, HazardType.ResonanceCrack, HazardType.EchoMaze, HazardType.None],
    hiddenNodeChance: 0.35,
    lootMultiplier: 2.2,
    minigameTypes: [DiscoveryGameType.GlyphMatch, DiscoveryGameType.VoidRiddle],
    narrativeEvents: [],
  },
]

export function getRegionMechanics(circle: number): RegionMechanics {
  const idx = Math.min(circle, 5) - 1
  return REGION_MECHANICS[idx] ?? REGION_MECHANICS[0]
}

export function getHazardDefinition(hazardType: string): HazardDefinition | undefined {
  return HAZARDS[hazardType]
}
