import type { Range } from './common'

export interface CircleStage {
  id: string
  name: string
  order: number
  description: string
}

export interface CircleRequirements {
  minMarks: number
  minBones?: number
  minMasteryStage?: string
  customChecks: string[]
}

export const CircleId = {
  First: 1,
  Second: 2,
  Third: 3,
  Fourth: 4,
  Fifth: 5,
  Sixth: 6,
  Seventh: 7,
  Eighth: 8,
  Ninth: 9,
} as const

export type CircleId = (typeof CircleId)[keyof typeof CircleId]

export interface Circle {
  id: CircleId
  name: string
  stages: CircleStage[]
  requirements: CircleRequirements
  lifespan: Range
}
