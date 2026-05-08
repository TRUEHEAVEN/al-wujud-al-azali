import type { Path, PathArchetype, PathElement } from '../types/path'
import type { TrialResult } from '../screens/TrialsScreen'
import { ARCHETYPE_TEMPLATES, ELEMENT_TEMPLATES, NAME_ADJECTIVES, PHILOSOPHICAL_CONCEPTS } from '../data/pathTemplates'
import { getTechniquesByTags } from '../data/techniqueData'

// Simple seeded random number generator for deterministic results
class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min
  }

  choose<T>(array: T[]): T {
    return array[this.nextInt(0, array.length)]
  }
}

export function generatePathFromTrials(trialResults: TrialResult[]): Path {
  // Create deterministic seed from trial results
  const seed = trialResults.reduce((acc, result) => {
    return acc + result.questionIndex * 1000 + result.answerIndex * 100 + result.tags.length
  }, 0)

  const random = new SeededRandom(seed)

  // Analyze tag frequencies
  const tagCounts = new Map<string, number>()
  trialResults.forEach(result => {
    result.tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
    })
  })

  // Sort tags by frequency
  const sortedTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag)

  // Determine archetype based on tag patterns
  const archetype = determineArchetype(sortedTags, random)

  // Determine element based on tag affinities
  const element = determineElement(sortedTags, random)

  // Generate procedural name
  const name = generatePathName(archetype, element, random)

  // Generate concept and description
  const concept = generateConcept(sortedTags, random)
  const description = generateDescription(archetype, element, random)

  // Get archetype template
  const archetypeTemplate = ARCHETYPE_TEMPLATES[archetype]
  const elementTemplate = ELEMENT_TEMPLATES[element]

  // Generate rune
  const rune = generateRune(archetype, element)

  // Select starting techniques
  const techniques = selectStartingTechniques(archetype, sortedTags)

  // Generate passive traits (with some randomization)
  const passiveTraits = generatePassiveTraits(archetypeTemplate.passiveTraits)

  return {
    id: `path-${archetype}-${element}-${seed}`,
    name,
    concept,
    element,
    archetype,
    philosophy: archetypeTemplate.basePhilosophy,
    emotion: archetypeTemplate.emotion,
    description,
    auraColor: elementTemplate.auraColor,
    rune,
    techniques,
    passiveTraits
  }
}

function determineArchetype(sortedTags: string[], random: SeededRandom): PathArchetype {
  const archetypes = Object.keys(ARCHETYPE_TEMPLATES) as PathArchetype[]

  // Score each archetype based on tag matches
  const scores = archetypes.map(archetype => {
    const template = ARCHETYPE_TEMPLATES[archetype]
    const matches = sortedTags.filter(tag => template.tagRequirements.includes(tag)).length
    return { archetype, score: matches }
  })

  // Sort by score, break ties randomly
  scores.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score
    return random.next() - 0.5
  })

  return scores[0].archetype
}

function determineElement(sortedTags: string[], random: SeededRandom): PathElement {
  const elements = Object.keys(ELEMENT_TEMPLATES) as PathElement[]

  // Score each element based on tag affinities
  const scores = elements.map(element => {
    const template = ELEMENT_TEMPLATES[element]
    const matches = sortedTags.filter(tag => template.tagAffinities.includes(tag)).length
    return { element, score: matches }
  })

  // Sort by score, break ties randomly
  scores.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score
    return random.next() - 0.5
  })

  return scores[0].element
}

function generatePathName(
  archetype: PathArchetype,
  element: PathElement,
  random: SeededRandom
): string {
  const archetypeTemplate = ARCHETYPE_TEMPLATES[archetype]

  // Choose adjective based on element theme
  let adjective = random.choose(NAME_ADJECTIVES)

  // Try to match adjective to element theme
  const elementAdjectives = {
    void: ['Silent', 'Eternal', 'Shadowed', 'Ancient'],
    flame: ['Crimson', 'Radiant', 'Burning', 'Golden'],
    ash: ['Ashen', 'Silent', 'Ancient', 'Shadowed'],
    storm: ['Azure', 'Thundering', 'Whispering', 'Storm-forged'],
    bone: ['Bone-carved', 'Ancient', 'Silent', 'Eternal'],
    tide: ['Azure', 'Flowing', 'Crystal', 'Whispering'],
    radiance: ['Golden', 'Radiant', 'Dawn-lit', 'Crimson'],
    shadow: ['Shadowed', 'Night-veiled', 'Silent', 'Ancient']
  }

  if (elementAdjectives[element] && random.next() < 0.7) {
    adjective = random.choose(elementAdjectives[element])
  }

  return `${adjective} ${archetypeTemplate.name}`
}

function generateConcept(sortedTags: string[], random: SeededRandom): string {
  // Choose a philosophical concept that matches dominant tags
  const conceptOptions = PHILOSOPHICAL_CONCEPTS.filter(concept => {
    const conceptWords = concept.toLowerCase().split(' ')
    return sortedTags.some(tag =>
      conceptWords.some(word => tag.toLowerCase().includes(word) || word.includes(tag.toLowerCase()))
    )
  })

  if (conceptOptions.length > 0 && random.next() < 0.8) {
    return random.choose(conceptOptions)
  }

  return random.choose(PHILOSOPHICAL_CONCEPTS)
}

function generateDescription(
  archetype: PathArchetype,
  element: PathElement,
  random: SeededRandom
): string {
  const archetypeTemplate = ARCHETYPE_TEMPLATES[archetype]

  const descriptions = [
    `A path that ${archetypeTemplate.basePhilosophy.toLowerCase()}. Those who walk this way embrace the ${element.toLowerCase()} and seek ${archetypeTemplate.emotion.toLowerCase()} through their journey.`,
    `The ${element} Path of the ${archetypeTemplate.name}, where ${archetypeTemplate.basePhilosophy.toLowerCase()}. Guided by ${archetypeTemplate.emotion.toLowerCase()}, practitioners master the balance of their inner nature.`,
    `Walkers of the ${archetypeTemplate.name} embrace ${ELEMENT_TEMPLATES[element].philosophy.toLowerCase()}. Through ${archetypeTemplate.emotion.toLowerCase()}, they cultivate their true potential to achieve transcendence.`
  ]

  return random.choose(descriptions)
}

function generateRune(
  archetype: PathArchetype,
  element: PathElement
): Path['rune'] {
  const elementTemplate = ELEMENT_TEMPLATES[element]

  return {
    id: `rune-${archetype}-${element}`,
    ...elementTemplate.runeTemplate
  }
}

function selectStartingTechniques(archetype: PathArchetype, sortedTags: string[]): string[] {
  const archetypeTemplate = ARCHETYPE_TEMPLATES[archetype]

  // Start with archetype-specific techniques
  const techniques = [...archetypeTemplate.startingTechniques]

  // Add techniques based on dominant tags
  const tagBasedTechniques = getTechniquesByTags(sortedTags.slice(0, 5))
    .filter(tech => !techniques.includes(tech.id))
    .slice(0, 2)
    .map(tech => tech.id)

  techniques.push(...tagBasedTechniques)

  return techniques.slice(0, 5) // Limit to 5 starting techniques
}

function generatePassiveTraits(baseTraits: Path['passiveTraits']): Path['passiveTraits'] {
  // Return base traits without randomization for now
  return baseTraits.map(trait => ({
    ...trait,
    value: trait.value // Keep base values
  }))
}