import type { PathArchetype, PathElement, RuneSymbolData, PathPassiveTrait } from '../types/path'

export interface ArchetypeTemplate {
  id: PathArchetype
  name: string
  basePhilosophy: string
  emotion: string
  tagRequirements: string[]
  statModifiers: {
    vitality: number
    strength: number
    agility: number
    insight: number
    will: number
    spirit: number
  }
  startingTechniques: string[]
  passiveTraits: PathPassiveTrait[]
}

export interface ElementTemplate {
  id: PathElement
  name: string
  auraColor: string
  philosophy: string
  tagAffinities: string[]
  runeTemplate: Omit<RuneSymbolData, 'id'>
}

export const ARCHETYPE_TEMPLATES: Record<PathArchetype, ArchetypeTemplate> = {
  'void-watcher': {
    id: 'void-watcher',
    name: 'Void Watcher',
    basePhilosophy: 'Embrace the emptiness within to see the truth beyond',
    emotion: 'Contemplation',
    tagRequirements: ['Truth', 'Philosophy', 'Contemplation', 'Identity', 'Memory'],
    statModifiers: {
      vitality: 8,
      strength: 6,
      agility: 7,
      insight: 12,
      will: 11,
      spirit: 10
    },
    startingTechniques: ['void-gaze', 'essence-sight', 'mind-clarity'],
    passiveTraits: [
      { id: 'void-insight', name: 'Void Insight', description: 'See through illusions and deceptions', value: 15 },
      { id: 'contemplative-mind', name: 'Contemplative Mind', description: 'Enhanced meditation and insight gathering', value: 10 },
      { id: 'emptiness-resilience', name: 'Emptiness Resilience', description: 'Resistance to mental fatigue', value: 8 }
    ]
  },
  'bone-harvester': {
    id: 'bone-harvester',
    name: 'Bone Harvester',
    basePhilosophy: 'Strength comes from claiming what others cannot hold',
    emotion: 'Ambition',
    tagRequirements: ['Power', 'Destruction', 'Ambition', 'Survival', 'Strength'],
    statModifiers: {
      vitality: 12,
      strength: 11,
      agility: 8,
      insight: 6,
      will: 10,
      spirit: 7
    },
    startingTechniques: ['bone-reinforcement', 'essence-drain', 'power-surge'],
    passiveTraits: [
      { id: 'bone-density', name: 'Bone Density', description: 'Enhanced physical durability', value: 12 },
      { id: 'essence-harvest', name: 'Essence Harvest', description: 'Drain power from defeated enemies', value: 10 },
      { id: 'unyielding-will', name: 'Unyielding Will', description: 'Resistance to fear and intimidation', value: 8 }
    ]
  },
  'silent-flame': {
    id: 'silent-flame',
    name: 'Silent Flame',
    basePhilosophy: 'Burn away impurities to reveal inner light',
    emotion: 'Transformation',
    tagRequirements: ['Transformation', 'Sacrifice', 'Justice', 'Mercy', 'Growth'],
    statModifiers: {
      vitality: 9,
      strength: 9,
      agility: 9,
      insight: 9,
      will: 9,
      spirit: 9
    },
    startingTechniques: ['inner-flame', 'purifying-fire', 'balanced-strike'],
    passiveTraits: [
      { id: 'inner-flame', name: 'Inner Flame', description: 'Internal fire provides warmth and clarity', value: 10 },
      { id: 'balanced-growth', name: 'Balanced Growth', description: 'Equal development across all attributes', value: 8 },
      { id: 'transformative-resilience', name: 'Transformative Resilience', description: 'Adapt to changing circumstances', value: 12 }
    ]
  },
  'oath-breaker': {
    id: 'oath-breaker',
    name: 'Oath Breaker',
    basePhilosophy: 'True freedom requires breaking all chains',
    emotion: 'Chaos',
    tagRequirements: ['Chaos', 'Freedom', 'Independence', 'Retaliation', 'Power'],
    statModifiers: {
      vitality: 7,
      strength: 10,
      agility: 12,
      insight: 8,
      will: 9,
      spirit: 8
    },
    startingTechniques: ['chain-breaker', 'freedom-rush', 'unbound-strike'],
    passiveTraits: [
      { id: 'chain-breaker', name: 'Chain Breaker', description: 'Break through restraints and limitations', value: 15 },
      { id: 'unbound-movement', name: 'Unbound Movement', description: 'Enhanced mobility and evasion', value: 10 },
      { id: 'freedom-spirit', name: 'Freedom Spirit', description: 'Resistance to control and manipulation', value: 8 }
    ]
  },
  'star-pilgrim': {
    id: 'star-pilgrim',
    name: 'Star Pilgrim',
    basePhilosophy: 'Journey through the cosmos to find ultimate truth',
    emotion: 'Wonder',
    tagRequirements: ['Wonder', 'Spirituality', 'Connection', 'Truth', 'Philosophy'],
    statModifiers: {
      vitality: 8,
      strength: 7,
      agility: 9,
      insight: 11,
      will: 10,
      spirit: 9
    },
    startingTechniques: ['star-gazing', 'cosmic-awareness', 'pilgrim-step'],
    passiveTraits: [
      { id: 'cosmic-awareness', name: 'Cosmic Awareness', description: 'Sense distant events and energies', value: 12 },
      { id: 'pilgrim-endurance', name: 'Pilgrim Endurance', description: 'Sustained energy for long journeys', value: 10 },
      { id: 'star-guidance', name: 'Star Guidance', description: 'Enhanced navigation and intuition', value: 8 }
    ]
  },
  'rift-saint': {
    id: 'rift-saint',
    name: 'Rift Saint',
    basePhilosophy: 'Bend reality itself to serve higher purpose',
    emotion: 'Transcendence',
    tagRequirements: ['Transcendence', 'Reality', 'Creativity', 'Power', 'Wisdom'],
    statModifiers: {
      vitality: 9,
      strength: 8,
      agility: 8,
      insight: 12,
      will: 8,
      spirit: 9
    },
    startingTechniques: ['rift-manipulation', 'reality-weave', 'saint-presence'],
    passiveTraits: [
      { id: 'rift-sensitivity', name: 'Rift Sensitivity', description: 'Detect and manipulate dimensional weaknesses', value: 15 },
      { id: 'reality-stability', name: 'Reality Stability', description: 'Resistance to dimensional instability', value: 10 },
      { id: 'transcendent-will', name: 'Transcendent Will', description: 'Bend probability to your favor', value: 8 }
    ]
  },
  'fusion': {
    id: 'fusion',
    name: 'Fusion',
    basePhilosophy: 'All paths converge in perfect unity',
    emotion: 'Unity',
    tagRequirements: ['Unity', 'Balance', 'Growth', 'Connection', 'Adaptability'],
    statModifiers: {
      vitality: 10,
      strength: 9,
      agility: 9,
      insight: 9,
      will: 9,
      spirit: 8
    },
    startingTechniques: ['fusion-strike', 'unity-field', 'adaptive-flow'],
    passiveTraits: [
      { id: 'fusion-synergy', name: 'Fusion Synergy', description: 'Combine different energies effectively', value: 12 },
      { id: 'adaptive-growth', name: 'Adaptive Growth', description: 'Learn and adapt to new situations quickly', value: 10 },
      { id: 'unity-bond', name: 'Unity Bond', description: 'Enhanced cooperation with allies', value: 8 }
    ]
  }
}

export const ELEMENT_TEMPLATES: Record<PathElement, ElementTemplate> = {
  void: {
    id: 'void',
    name: 'Void',
    auraColor: '#1a1a2e',
    philosophy: 'Emptiness contains infinite possibility',
    tagAffinities: ['Truth', 'Philosophy', 'Contemplation', 'Identity', 'Memory'],
    runeTemplate: {
      auraColor: '#1a1a2e',
      inner: { shape: 'circle', strokeWidth: 2, opacity: 0.8, rotationDeg: 0 },
      outer: { shape: 'circle', strokeWidth: 1, opacity: 0.6, rotationDeg: 180 },
      lines: [
        { shape: 'spiral', strokeWidth: 1, opacity: 0.7, rotationDeg: 45 },
        { shape: 'spiral', strokeWidth: 1, opacity: 0.5, rotationDeg: 135 }
      ]
    }
  },
  flame: {
    id: 'flame',
    name: 'Flame',
    auraColor: '#ff6b35',
    philosophy: 'Transformation through destruction and rebirth',
    tagAffinities: ['Transformation', 'Sacrifice', 'Passion', 'Justice', 'Growth'],
    runeTemplate: {
      auraColor: '#ff6b35',
      inner: { shape: 'triangle', strokeWidth: 2, opacity: 0.9, rotationDeg: 0 },
      outer: { shape: 'triangle', strokeWidth: 1, opacity: 0.7, rotationDeg: 60 },
      lines: [
        { shape: 'cross', strokeWidth: 1, opacity: 0.8, rotationDeg: 0 },
        { shape: 'cross', strokeWidth: 1, opacity: 0.6, rotationDeg: 45 }
      ]
    }
  },
  ash: {
    id: 'ash',
    name: 'Ash',
    auraColor: '#8b7355',
    philosophy: 'From destruction comes new creation',
    tagAffinities: ['Destruction', 'Rebirth', 'Survival', 'Resilience', 'Change'],
    runeTemplate: {
      auraColor: '#8b7355',
      inner: { shape: 'hexagon', strokeWidth: 2, opacity: 0.8, rotationDeg: 0 },
      outer: { shape: 'hexagon', strokeWidth: 1, opacity: 0.6, rotationDeg: 30 },
      lines: [
        { shape: 'spiral', strokeWidth: 1, opacity: 0.7, rotationDeg: 0 },
        { shape: 'triangle', strokeWidth: 1, opacity: 0.5, rotationDeg: 180 }
      ]
    }
  },
  storm: {
    id: 'storm',
    name: 'Storm',
    auraColor: '#4a90e2',
    philosophy: 'Chaos brings freedom and renewal',
    tagAffinities: ['Chaos', 'Freedom', 'Independence', 'Change', 'Power'],
    runeTemplate: {
      auraColor: '#4a90e2',
      inner: { shape: 'spiral', strokeWidth: 2, opacity: 0.9, rotationDeg: 0 },
      outer: { shape: 'spiral', strokeWidth: 1, opacity: 0.7, rotationDeg: 90 },
      lines: [
        { shape: 'cross', strokeWidth: 1, opacity: 0.8, rotationDeg: 45 },
        { shape: 'triangle', strokeWidth: 1, opacity: 0.6, rotationDeg: 135 }
      ]
    }
  },
  bone: {
    id: 'bone',
    name: 'Bone',
    auraColor: '#f5f5dc',
    philosophy: 'Strength forged through hardship and will',
    tagAffinities: ['Strength', 'Endurance', 'Power', 'Survival', 'Structure'],
    runeTemplate: {
      auraColor: '#f5f5dc',
      inner: { shape: 'cross', strokeWidth: 2, opacity: 0.8, rotationDeg: 0 },
      outer: { shape: 'cross', strokeWidth: 1, opacity: 0.6, rotationDeg: 45 },
      lines: [
        { shape: 'hexagon', strokeWidth: 1, opacity: 0.7, rotationDeg: 0 },
        { shape: 'circle', strokeWidth: 1, opacity: 0.5, rotationDeg: 90 }
      ]
    }
  },
  tide: {
    id: 'tide',
    name: 'Tide',
    auraColor: '#00b4d8',
    philosophy: 'Flow with change, adapt to overcome',
    tagAffinities: ['Adaptability', 'Flow', 'Connection', 'Balance', 'Growth'],
    runeTemplate: {
      auraColor: '#00b4d8',
      inner: { shape: 'spiral', strokeWidth: 2, opacity: 0.8, rotationDeg: 0 },
      outer: { shape: 'circle', strokeWidth: 1, opacity: 0.6, rotationDeg: 0 },
      lines: [
        { shape: 'triangle', strokeWidth: 1, opacity: 0.7, rotationDeg: 60 },
        { shape: 'triangle', strokeWidth: 1, opacity: 0.5, rotationDeg: 120 }
      ]
    }
  },
  radiance: {
    id: 'radiance',
    name: 'Radiance',
    auraColor: '#ffd700',
    philosophy: 'Light reveals truth and guides the just',
    tagAffinities: ['Justice', 'Mercy', 'Truth', 'Guidance', 'Purity'],
    runeTemplate: {
      auraColor: '#ffd700',
      inner: { shape: 'circle', strokeWidth: 2, opacity: 0.9, rotationDeg: 0 },
      outer: { shape: 'hexagon', strokeWidth: 1, opacity: 0.7, rotationDeg: 0 },
      lines: [
        { shape: 'cross', strokeWidth: 1, opacity: 0.8, rotationDeg: 0 },
        { shape: 'cross', strokeWidth: 1, opacity: 0.6, rotationDeg: 45 }
      ]
    }
  },
  shadow: {
    id: 'shadow',
    name: 'Shadow',
    auraColor: '#2c2c2c',
    philosophy: 'In darkness lies hidden strength and wisdom',
    tagAffinities: ['Subtlety', 'Wisdom', 'Manipulation', 'Control', 'Mystery'],
    runeTemplate: {
      auraColor: '#2c2c2c',
      inner: { shape: 'triangle', strokeWidth: 2, opacity: 0.8, rotationDeg: 0 },
      outer: { shape: 'spiral', strokeWidth: 1, opacity: 0.6, rotationDeg: 180 },
      lines: [
        { shape: 'circle', strokeWidth: 1, opacity: 0.7, rotationDeg: 0 },
        { shape: 'hexagon', strokeWidth: 1, opacity: 0.5, rotationDeg: 30 }
      ]
    }
  }
}

export const NAME_ADJECTIVES = [
  'Eternal', 'Silent', 'Crimson', 'Azure', 'Golden', 'Shadowed', 'Radiant',
  'Ancient', 'Whispering', 'Thundering', 'Crystal', 'Void-born', 'Flame-kissed',
  'Storm-forged', 'Bone-carved', 'Tide-touched', 'Dawn-lit', 'Night-veiled'
]

export const PHILOSOPHICAL_CONCEPTS = [
  'the Infinite Path', 'Endless Possibility', 'Silent Truth', 'Burning Justice',
  'Ashen Rebirth', 'Storm Freedom', 'Bone Will', 'Flowing Change',
  'Radiant Mercy', 'Shadow Wisdom', 'Void Contemplation', 'Flame Sacrifice'
]