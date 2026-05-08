export interface TechniqueData {
  id: string
  name: string
  description: string
  energyCost: number
  type: 'offensive' | 'defensive' | 'utility' | 'passive'
  tags: string[]
}

export const TECHNIQUE_DATABASE: Record<string, TechniqueData> = {
  // Void Watcher techniques
  'void-gaze': {
    id: 'void-gaze',
    name: 'Void Gaze',
    description: 'Pierce illusions and see the truth of things',
    energyCost: 5,
    type: 'utility',
    tags: ['Truth', 'Perception', 'Void']
  },
  'essence-sight': {
    id: 'essence-sight',
    name: 'Essence Sight',
    description: 'See the spiritual essence of beings and objects',
    energyCost: 8,
    type: 'utility',
    tags: ['Spirituality', 'Perception', 'Insight']
  },
  'mind-clarity': {
    id: 'mind-clarity',
    name: 'Mind Clarity',
    description: 'Clear mental fog and enhance focus',
    energyCost: 3,
    type: 'utility',
    tags: ['Contemplation', 'Mental', 'Clarity']
  },

  // Bone Harvester techniques
  'bone-reinforcement': {
    id: 'bone-reinforcement',
    name: 'Bone Reinforcement',
    description: 'Strengthen bones and body with mystical energy',
    energyCost: 6,
    type: 'defensive',
    tags: ['Strength', 'Defense', 'Physical']
  },
  'essence-drain': {
    id: 'essence-drain',
    name: 'Essence Drain',
    description: 'Drain life force from defeated enemies',
    energyCost: 10,
    type: 'offensive',
    tags: ['Power', 'Drain', 'Destruction']
  },
  'power-surge': {
    id: 'power-surge',
    name: 'Power Surge',
    description: 'Burst of raw physical power',
    energyCost: 12,
    type: 'offensive',
    tags: ['Strength', 'Power', 'Physical']
  },

  // Silent Flame techniques
  'inner-flame': {
    id: 'inner-flame',
    name: 'Inner Flame',
    description: 'Ignite internal fire for warmth and clarity',
    energyCost: 4,
    type: 'passive',
    tags: ['Transformation', 'Internal', 'Balance']
  },
  'purifying-fire': {
    id: 'purifying-fire',
    name: 'Purifying Fire',
    description: 'Burn away impurities and negative effects',
    energyCost: 8,
    type: 'utility',
    tags: ['Purification', 'Transformation', 'Healing']
  },
  'balanced-strike': {
    id: 'balanced-strike',
    name: 'Balanced Strike',
    description: 'Strike with perfect harmony of force and precision',
    energyCost: 7,
    type: 'offensive',
    tags: ['Balance', 'Precision', 'Harmony']
  },

  // Oath Breaker techniques
  'chain-breaker': {
    id: 'chain-breaker',
    name: 'Chain Breaker',
    description: 'Break through physical and metaphysical restraints',
    energyCost: 9,
    type: 'utility',
    tags: ['Freedom', 'Breaking', 'Independence']
  },
  'freedom-rush': {
    id: 'freedom-rush',
    name: 'Freedom Rush',
    description: 'Explosive burst of speed and liberation',
    energyCost: 6,
    type: 'utility',
    tags: ['Freedom', 'Speed', 'Mobility']
  },
  'unbound-strike': {
    id: 'unbound-strike',
    name: 'Unbound Strike',
    description: 'Strike free from all limitations and constraints',
    energyCost: 11,
    type: 'offensive',
    tags: ['Freedom', 'Power', 'Unrestrained']
  },

  // Star Pilgrim techniques
  'star-gazing': {
    id: 'star-gazing',
    name: 'Star Gazing',
    description: 'Draw wisdom and guidance from the cosmos',
    energyCost: 5,
    type: 'utility',
    tags: ['Cosmic', 'Wisdom', 'Guidance']
  },
  'cosmic-awareness': {
    id: 'cosmic-awareness',
    name: 'Cosmic Awareness',
    description: 'Sense distant events and energies across vast distances',
    energyCost: 7,
    type: 'utility',
    tags: ['Awareness', 'Cosmic', 'Perception']
  },
  'pilgrim-step': {
    id: 'pilgrim-step',
    name: 'Pilgrim Step',
    description: 'Step through space with cosmic guidance',
    energyCost: 10,
    type: 'utility',
    tags: ['Movement', 'Cosmic', 'Teleportation']
  },

  // Rift Saint techniques
  'rift-manipulation': {
    id: 'rift-manipulation',
    name: 'Rift Manipulation',
    description: 'Create and control dimensional rifts',
    energyCost: 12,
    type: 'utility',
    tags: ['Reality', 'Manipulation', 'Dimensional']
  },
  'reality-weave': {
    id: 'reality-weave',
    name: 'Reality Weave',
    description: 'Weave threads of reality to alter local effects',
    energyCost: 15,
    type: 'utility',
    tags: ['Reality', 'Weaving', 'Alteration']
  },
  'saint-presence': {
    id: 'saint-presence',
    name: 'Saint Presence',
    description: 'Manifest transcendent authority and will',
    energyCost: 8,
    type: 'passive',
    tags: ['Transcendence', 'Authority', 'Presence']
  },

  // Fusion techniques
  'fusion-strike': {
    id: 'fusion-strike',
    name: 'Fusion Strike',
    description: 'Combine multiple energies into a unified attack',
    energyCost: 10,
    type: 'offensive',
    tags: ['Fusion', 'Combination', 'Unity']
  },
  'unity-field': {
    id: 'unity-field',
    name: 'Unity Field',
    description: 'Create a field that harmonizes allied energies',
    energyCost: 6,
    type: 'defensive',
    tags: ['Unity', 'Harmony', 'Field']
  },
  'adaptive-flow': {
    id: 'adaptive-flow',
    name: 'Adaptive Flow',
    description: 'Flow and adapt to any situation seamlessly',
    energyCost: 5,
    type: 'utility',
    tags: ['Adaptability', 'Flow', 'Flexibility']
  }
}

export function getTechniqueById(id: string): TechniqueData | undefined {
  return TECHNIQUE_DATABASE[id]
}

export function getTechniquesByTags(tags: string[]): TechniqueData[] {
  return Object.values(TECHNIQUE_DATABASE).filter(technique =>
    tags.some(tag => technique.tags.includes(tag))
  )
}