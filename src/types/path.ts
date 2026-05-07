export const PathElement = {
  Void: 'void',
  Flame: 'flame',
  Ash: 'ash',
  Storm: 'storm',
  Bone: 'bone',
  Tide: 'tide',
  Radiance: 'radiance',
  Shadow: 'shadow',
} as const

export type PathElement = (typeof PathElement)[keyof typeof PathElement]

export const PathArchetype = {
  VoidWatcher: 'void-watcher',
  BoneHarvester: 'bone-harvester',
  SilentFlame: 'silent-flame',
  OathBreaker: 'oath-breaker',
  StarPilgrim: 'star-pilgrim',
  RiftSaint: 'rift-saint',
  Fusion: 'fusion',
} as const

export type PathArchetype = (typeof PathArchetype)[keyof typeof PathArchetype]

export interface PathPassiveTrait {
  id: string
  name: string
  description: string
  value: number
}

export interface RuneLayerSpec {
  shape: 'triangle' | 'circle' | 'spiral' | 'cross' | 'hexagon'
  strokeWidth: number
  opacity: number
  rotationDeg: number
}

export interface RuneSymbolData {
  id: string
  auraColor: string
  inner: RuneLayerSpec
  outer: RuneLayerSpec
  lines: RuneLayerSpec[]
}

export interface Path {
  id: string
  name: string
  concept: string
  element: PathElement
  archetype: PathArchetype
  philosophy: string
  emotion: string
  description: string
  auraColor: string
  rune: RuneSymbolData
  techniques: string[]
  passiveTraits: PathPassiveTrait[]
}
