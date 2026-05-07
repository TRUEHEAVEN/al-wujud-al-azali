export const FoundationStage = {
  Egg: 'egg',
  Crystalline: 'crystalline',
  Patterned: 'patterned',
  Shelled: 'shelled',
  Dense: 'dense',
} as const

export type FoundationStage = (typeof FoundationStage)[keyof typeof FoundationStage]

export interface Foundation {
  stage: FoundationStage
  pattern: string
  shell: string
  weight: number
  chainUnlocked: boolean
  integrity: number
  cracked: boolean
}
