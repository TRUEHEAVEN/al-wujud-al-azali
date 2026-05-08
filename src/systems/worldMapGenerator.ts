import { WorldNodeType, type WorldNode, type NarrativeEvent } from '../types'
import type { Character } from '../types/character'
import { HazardType } from '../types/exploration'
import { getRegionMechanics } from '../data/explorationData'
import { generateDiscoveryGame, generateLootDrop } from './explorationEngine'

const REGIONS: Record<
  number,
  { name: string; description: string; nodeCount: number; dangerRatio: number }
> = {
  1: { name: 'The Mortal Expanse', description: 'Where all journeys begin. The veil between mortality and cultivation is thinnest here.', nodeCount: 7, dangerRatio: 0.3 },
  2: { name: 'The Aspirant Marches', description: 'A land of awakening senses. Whispers of the Path echo through ancient canyons.', nodeCount: 8, dangerRatio: 0.4 },
  3: { name: 'The Six-Sense Reaches', description: 'Perception expands beyond flesh. What was unseen becomes tangible.', nodeCount: 9, dangerRatio: 0.5 },
  4: { name: 'The Shifting Frontier', description: 'Reality bends. Embodiment stabilizes. The strong devour the weak.', nodeCount: 10, dangerRatio: 0.6 },
  5: { name: 'The Dust Provinces', description: 'The Red Dust settles on all things. Rebirth and decay walk hand in hand.', nodeCount: 12, dangerRatio: 0.7 },
}

const NODE_NAMES: Record<string, string[]> = {
  safe: [
    'Whispering Spring', 'Anchored Crossroads', 'The Resting Flame', 'Sanctuary of Echoes',
    'Veiled Oasis', 'Hearth of the Forgotten', 'Stillwater Grove', 'Pilgrim\'s Refuge',
    'The Moss-Covered Shrine', 'Dawnlit Clearing', 'Tranquil Hollow', 'The Old Watchtower',
  ],
  danger: [
    'Ravager\'s Den', 'The Shattered Gorge', 'Bone-Littered Pass', 'Howling Depths',
    'Crimson Thicket', 'The Scarred Plateau', 'Void-Touched Ruins', 'Serpent\'s Maw',
    'The Ashen Field', 'Storm-Eaten Ridge', 'Predator\'s Crossing', 'The Sunken Crypt',
  ],
  discovery: [
    'Forgotten Archive', 'Astral Observatory', 'The Blooming Rift', 'Memory-Glass Cavern',
    'Sky-Piercing Spire', 'The Sunken Library', 'Vein of Ancient Marks', 'Echo Chamber',
    'The Whispering Stone', 'Crystal-Dream Grotto', 'Resonance Pool', 'The Sealed Vault',
  ],
  boss: [
    'The Throne of Ashes', 'Tyrant\'s Perch', 'The Bleeding Throne', 'Abyssal Gate',
    'The Hollow Crown', 'Chamber of the Unmade', 'The Last Redoubt', 'Domain of the Forgotten King',
  ],
  story: [
    'The First Flame', 'Memory of the First Circle', 'The Silent Author\'s Echo',
    'Where the Path Began', 'The Unfinished Story', 'The Mirror of Self',
    'The Crossroads of Fate', 'Where All Paths Meet',
  ],
  hidden: [
    'The Veiled Font', 'Shrouded Sanctuary', 'Forgotten Nexus', 'The 13th Step',
    'Echo of the First', 'The Hidden Trial', 'Secret of the Void', 'Crack in Eternity',
  ],
}

const NODE_DESCRIPTIONS: Record<string, string[]> = {
  safe: [
    'A quiet space where the world\'s noise fades. Cultivators rest here between trials.',
    'Worn paths converge at this ancient waypoint. Travelers share tales and warnings.',
    'The air here is still, yet charged with dormant possibility. Safe, for now.',
    'Stone markers left by those who walked before. Their echoes offer protection.',
  ],
  danger: [
    'The ground trembles with hostile intent. Something hungry dwells nearby.',
    'Bloodstains mark the stones. Whatever hunts here has fed recently.',
    'The very air resists your presence. This place wants you gone—or dead.',
    'Shadows move where no light casts them. Danger prowls in every corner.',
  ],
  discovery: [
    'Ancient writings cover every surface. Knowledge waits for those who can read it.',
    'A place where the veil between worlds wears thin. Secrets shimmer in the air.',
    'Forgotten by time, this place holds truths that could reshape your Path.',
    'The resonance here is unusual. Something rare and valuable pulses beneath the surface.',
  ],
  boss: [
    'A sovereign of cultivation has claimed this domain. Their power saturates the air.',
    'The oppressive weight of a tyrant\'s presence crushes lesser wills. Only the strong survive here.',
    'This is no mere territory—it is a throne. And its ruler does not share power.',
  ],
  story: [
    'Something about this place feels impossibly old, impossibly important.',
    'The Path itself seems to bend toward this location. Destiny knots around it.',
    'You feel watched by something vast and patient. The story of this place is still being written.',
  ],
}

const EVENT_TEMPLATES: Record<string, Omit<NarrativeEvent, 'id'>[]> = {
  safe: [
    {
      trigger: 'node-enter',
      scenes: [{ id: 'rest-1', text: 'You find a moment of peace. Your Path energy slowly replenishes.', mood: 'calm', speaker: 'Narrator' }],
      choices: [
        { id: 'rest', text: 'Rest and recover', tags: ['Recovery', 'Peace'], effects: ['energy+gain', 'Time+advance'] },
        { id: 'move-on', text: 'Continue your journey', tags: ['Determination', 'Progress'], effects: [] },
      ],
    },
  ],
  danger: [
    {
      trigger: 'node-enter',
      scenes: [{ id: 'danger-1', text: 'A malevolent presence stirs. Hostile cultivators or beasts block your path.', mood: 'intense', speaker: 'Narrator' }],
      choices: [
        { id: 'fight', text: 'Face the danger head-on', tags: ['Courage', 'Combat', 'Strength'], effects: ['combat:start'] },
        { id: 'evade', text: 'Attempt to slip past unnoticed', tags: ['Cunning', 'Caution'], effects: ['evasion:check'] },
      ],
    },
  ],
  discovery: [
    {
      trigger: 'node-enter',
      scenes: [{ id: 'discovery-1', text: 'You sense a concentration of Mystery Marks nearby. Something ancient slumbers here.', mood: 'amused', speaker: 'Narrator' }],
      choices: [
        { id: 'investigate', text: 'Investigate the source', tags: ['Curiosity', 'Discovery', 'Knowledge'], effects: ['marks:gain', 'narrative:advance'] },
        { id: 'observe', text: 'Observe carefully from a distance', tags: ['Caution', 'Wisdom'], effects: ['marks:gain:small'] },
      ],
    },
  ],
  story: [
    {
      trigger: 'node-enter',
      scenes: [{ id: 'story-1', text: 'The narrative thread of the world tightens around you. A pivotal moment approaches.', mood: 'voiceless', speaker: 'The Silent Author' }],
      choices: [
        { id: 'embrace', text: 'Embrace the narrative', tags: ['Destiny', 'Acceptance'], effects: ['story:advance', 'foundation:strengthen'] },
        { id: 'resist', text: 'Resist the ordained path', tags: ['Freedom', 'Defiance'], effects: ['story:alter', 'technique:unlock'] },
      ],
    },
  ],
}

let _nodeIdCounter = 0

function nodeId(type: string): string {
  _nodeIdCounter += 1
  return `node-${type}-${_nodeIdCounter}`
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

const WORLD_NODE_TYPE_MAP: Record<string, WorldNode['type']> = {
  safe: WorldNodeType.Safe,
  danger: WorldNodeType.Danger,
  discovery: WorldNodeType.Discovery,
  boss: WorldNodeType.Boss,
  story: WorldNodeType.Story,
}

export function generateWorldMap(character: Character): WorldNode[] {
  _nodeIdCounter = 0
  const circle = Math.min(character.circle, 5)
  const region = REGIONS[circle] ?? REGIONS[5]
  const regionMechanics = getRegionMechanics(circle)
  const nodes: WorldNode[] = []

  const nodeDistribution: { type: keyof typeof NODE_NAMES; count: number }[] = [
    { type: 'safe', count: Math.max(2, Math.floor(region.nodeCount * 0.3)) },
    { type: 'danger', count: Math.max(2, Math.floor(region.nodeCount * region.dangerRatio)) },
    { type: 'discovery', count: Math.max(1, Math.floor(region.nodeCount * 0.2)) },
    { type: 'story', count: Math.max(1, Math.floor(region.nodeCount * 0.15)) },
  ]

  if (circle >= 2) {
    nodeDistribution.push({ type: 'boss', count: 1 })
  }
  if (circle >= 3) {
    nodeDistribution.push({ type: 'boss', count: 1 })
  }

  for (const dist of nodeDistribution) {
    const names = shuffle([...NODE_NAMES[dist.type]])
    const descs = [...NODE_DESCRIPTIONS[dist.type]]
    for (let i = 0; i < dist.count; i++) {
      const nameBase = names[i % names.length]
      const perceptionReq = 0

      const hazard =
        dist.type === 'danger' || dist.type === 'boss'
          ? pickRandom(
              regionMechanics.availableHazards.filter((h) => h !== HazardType.None),
            )
          : Math.random() < 0.2
            ? pickRandom(regionMechanics.availableHazards)
            : HazardType.None

      let discoveryGame = undefined
      if (dist.type === 'discovery' && regionMechanics.minigameTypes.length > 0 && Math.random() < 0.4) {
        const gameType = pickRandom(regionMechanics.minigameTypes)
        const game = generateDiscoveryGame(gameType, circle)
        if (game) discoveryGame = game
      }

      const loot = dist.type === 'discovery' || dist.type === 'boss'
        ? generateLootDrop(circle, dist.type)
        : undefined

      const combatModifiers =
        dist.type === 'danger'
          ? ['hostile-territory']
          : dist.type === 'boss'
            ? ['oppressive-atmosphere', 'boss-arena']
            : undefined

      const node: WorldNode = {
        id: nodeId(dist.type),
        type: WORLD_NODE_TYPE_MAP[dist.type] ?? WorldNodeType.Safe,
        region: region.name,
        name: `${nameBase}${i > 0 ? ` ${i + 1}` : ''}`,
        description: descs[i % descs.length],
        connections: [],
        events: EVENT_TEMPLATES[dist.type]?.map((t, idx) => ({
          ...t,
          id: `${nodeId(dist.type)}-event-${idx}`,
          choices: t.choices.map((c, cIdx) => ({
            ...c,
            id: `${nodeId(dist.type)}-choice-${cIdx}`,
          })),
        })) ?? [],
        visited: false,
        hazard,
        hidden: false,
        perceptionRequired: perceptionReq,
        discoveryGame,
        loot,
        combatModifiers,
      }
      nodes.push(node)
    }
  }

  const hiddenCount = Math.max(1, Math.floor(region.nodeCount * regionMechanics.hiddenNodeChance))
  const hiddenNames = shuffle([...NODE_NAMES.hidden])
  for (let i = 0; i < hiddenCount; i++) {
    const perceptionReq = 1 + Math.floor(Math.random() * 3)

    const node: WorldNode = {
      id: nodeId('hidden'),
      type: WorldNodeType.Discovery,
      region: region.name,
      name: hiddenNames[i % hiddenNames.length],
      description: 'A location obscured from ordinary perception. Only those with awakened senses can find it.',
      connections: [],
      events: [],
      visited: false,
      hazard: pickRandom(regionMechanics.availableHazards.filter((h) => h === HazardType.None || h === HazardType.ResonanceCrack)),
      hidden: true,
      perceptionRequired: perceptionReq,
      discoveryGame: regionMechanics.minigameTypes.length > 0
        ? generateDiscoveryGame(pickRandom(regionMechanics.minigameTypes), circle) ?? undefined
        : undefined,
      loot: generateLootDrop(circle, 'discovery'),
    }
    nodes.push(node)
  }

  for (let i = 0; i < nodes.length; i++) {
    const connectionCount = 1 + Math.floor(Math.random() * 3)
    const candidates = nodes.filter(
      (_, j) => j !== i && !nodes[i].connections.includes(nodes[j].id),
    )
    const shuffled = shuffle(candidates)
    for (let k = 0; k < Math.min(connectionCount, shuffled.length); k++) {
      nodes[i].connections.push(shuffled[k].id)
      if (!shuffled[k].connections.includes(nodes[i].id)) {
        shuffled[k].connections.push(nodes[i].id)
      }
    }
  }

  return nodes
}

export function getRegionForCircle(
  circle: number,
): { name: string; description: string } {
  const region = REGIONS[Math.min(circle, 5)] ?? REGIONS[5]
  return { name: region.name, description: region.description }
}
