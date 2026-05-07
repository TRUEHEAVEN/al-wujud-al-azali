export const TrialDomain = {
  Good: 'good',
  Evil: 'evil',
  Self: 'self',
} as const

export type TrialDomain = (typeof TrialDomain)[keyof typeof TrialDomain]

export interface TrialResult {
  questionId: string
  domain: TrialDomain
  answerId: string
  tags: string[]
}
