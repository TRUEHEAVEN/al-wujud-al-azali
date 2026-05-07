export const MasteryStage = {
  Formation: 'formation',
  Newbie: 'newbie',
  Controller: 'controller',
  Master: 'master',
  Saga: 'saga',
  Supreme: 'supreme',
  Ultimate: 'ultimate',
} as const

export type MasteryStage = (typeof MasteryStage)[keyof typeof MasteryStage]

export interface MysteryMark {
  count: number
  masteryStage: MasteryStage
  bones: number
  boostMultiplier: number
  refinedTotal: number
}
