import { FoundationStage, MasteryStage, type FoundationStage as FoundationStageType, type MasteryStage as MasteryStageType } from '../types'

export interface CircleRequirement {
  circle: number
  name: string
  description: string
  minMarks: number
  minBones: number
  minMasteryStage: MasteryStageType
  foundationStage?: FoundationStageType
  lifespanGain: number
  unlocks: string[]
}

export const MASTERY_THRESHOLDS: Record<MasteryStageType, number> = {
  [MasteryStage.Formation]: 0,
  [MasteryStage.Newbie]: 1000,
  [MasteryStage.Controller]: 10000,
  [MasteryStage.Master]: 100000,
  [MasteryStage.Saga]: 500000,
  [MasteryStage.Supreme]: 1000000,
  [MasteryStage.Ultimate]: 5000000,
}

export const BONE_MARK_COST = 10000

export const BONE_TOTAL = 206

export const FOUNDATION_STAGES: Record<FoundationStageType, { minMarks: number; minCircle: number; description: string }> = {
  [FoundationStage.Egg]: {
    minMarks: 0,
    minCircle: 1,
    description: 'A nascent egg, pulsing with potential. All cultivation begins in this fragile shell.',
  },
  [FoundationStage.Crystalline]: {
    minMarks: 500,
    minCircle: 2,
    description: 'The egg crystallizes into a geometric lattice. Each facet reflects a truth of your Path.',
  },
  [FoundationStage.Patterned]: {
    minMarks: 2000,
    minCircle: 3,
    description: 'Intricate patterns etch themselves into the crystalline structure—glyphs of power, memory, and destiny.',
  },
  [FoundationStage.Shelled]: {
    minMarks: 10000,
    minCircle: 4,
    description: 'A hardened shell forms around the core. Your Foundation can now withstand the pressure of higher realms.',
  },
  [FoundationStage.Dense]: {
    minMarks: 100000,
    minCircle: 6,
    description: 'The Foundation collapses inward, becoming impossibly dense. A singularity of cultivation that bends reality around it.',
  },
}

export const CIRCLE_REQUIREMENTS: CircleRequirement[] = [
  {
    circle: 1,
    name: 'Mortality',
    description: 'The starting point. Mortal flesh, mortal limits. The seed of eternity waits within.',
    minMarks: 0,
    minBones: 0,
    minMasteryStage: MasteryStage.Formation,
    lifespanGain: 0,
    unlocks: [
      'Basic cultivation',
      'Foundation formation',
      'Energy absorption',
    ],
  },
  {
    circle: 2,
    name: 'Adopt · Awakening',
    description: 'The veil thins. Colors deepen. Sounds gain texture. Path energy becomes visible as golden threads.',
    minMarks: 100,
    minBones: 0,
    minMasteryStage: MasteryStage.Formation,
    foundationStage: FoundationStage.Crystalline,
    lifespanGain: 400,
    unlocks: [
      'Six Sense — Stirring',
      'Enhanced perception',
      'Technique slot +1',
      'Second Circle codex',
    ],
  },
  {
    circle: 3,
    name: 'Transformation · Embodiment',
    description: 'The body transforms, taking on qualities of your Path. Void Watchers flicker. Bone Harvesters armor. Silent Flames burn.',
    minMarks: 500,
    minBones: 0,
    minMasteryStage: MasteryStage.Formation,
    foundationStage: FoundationStage.Patterned,
    lifespanGain: 600,
    unlocks: [
      'Six Sense — Awake',
      'Embodiment mechanics',
      'Technique slot +1',
      'Third Circle codex',
    ],
  },
  {
    circle: 4,
    name: 'Control',
    description: 'Mastery over the self, over the bones, over the flow of Marks. Control separates cultivators from true powers.',
    minMarks: 2000,
    minBones: 10,
    minMasteryStage: MasteryStage.Newbie,
    foundationStage: FoundationStage.Shelled,
    lifespanGain: 1000,
    unlocks: [
      'Six Sense — Vast',
      'Bone forging unlocked',
      'Technique slot +1',
      'Foundation shielding',
    ],
  },
  {
    circle: 5,
    name: 'Red Dust',
    description: 'The mortal world clings like red dust. To ascend beyond it requires rebirth—letting old attachments crumble to ash.',
    minMarks: 10000,
    minBones: 50,
    minMasteryStage: MasteryStage.Controller,
    lifespanGain: 2000,
    unlocks: [
      'Six Sense — Infinite (early)',
      'Domain awareness',
      'Technique slot +1',
      'Rebirth mechanics',
    ],
  },
  {
    circle: 6,
    name: 'Void Resonance',
    description: 'Your Path resonates with the void itself. Space bends to your will. Distance becomes a suggestion.',
    minMarks: 50000,
    minBones: 100,
    minMasteryStage: MasteryStage.Controller,
    foundationStage: FoundationStage.Dense,
    lifespanGain: 5000,
    unlocks: [
      'Six Sense — Infinite',
      'Spatial manipulation',
      'Technique slot +1',
      'Void-step travel',
    ],
  },
  {
    circle: 7,
    name: 'Eternal Return',
    description: 'Death becomes a doorway, not an end. Your Path loops back upon itself, gaining strength with each cycle.',
    minMarks: 200000,
    minBones: 150,
    minMasteryStage: MasteryStage.Master,
    lifespanGain: 10000,
    unlocks: [
      'Resurrection seed',
      'Path recursion',
      'Technique slot +1',
      'Eternal reversal',
    ],
  },
  {
    circle: 8,
    name: 'Silent Sovereignty',
    description: 'You approach the threshold of the Silent Author. Words lose meaning. Power becomes presence.',
    minMarks: 500000,
    minBones: 180,
    minMasteryStage: MasteryStage.Saga,
    lifespanGain: 50000,
    unlocks: [
      'Author\'s silence',
      'Reality authorship',
      'Technique slot +1',
      'Narrative perception',
    ],
  },
  {
    circle: 9,
    name: 'The Eternal Existence',
    description: 'AL-WUJUD AL-AZALI. The final circle. Existence itself becomes your cultivation. You are no longer walking the Path—you ARE the Path.',
    minMarks: 1000000,
    minBones: 200,
    minMasteryStage: MasteryStage.Supreme,
    lifespanGain: 100000,
    unlocks: [
      'True immortality',
      'Path embodiment',
      'Technique slot +1',
      'Cosmic integration',
    ],
  },
]

export function getCircleRequirement(circle: number): CircleRequirement | undefined {
  return CIRCLE_REQUIREMENTS.find((r) => r.circle === circle)
}

export function getMasteryStage(marks: number): MasteryStageType {
  const stages = Object.entries(MASTERY_THRESHOLDS).reverse() as [MasteryStageType, number][]
  for (const [stage, threshold] of stages) {
    if (marks >= threshold) return stage
  }
  return MasteryStage.Formation
}

export function getFoundationStage(minMarks: number, minCircle: number): FoundationStageType {
  const stages = Object.entries(FOUNDATION_STAGES).reverse() as [FoundationStageType, typeof FOUNDATION_STAGES[FoundationStageType]][]
  for (const [stage, req] of stages) {
    if (minMarks >= req.minMarks && minCircle >= req.minCircle) return stage
  }
  return FoundationStage.Egg
}

export const CULTIVATION_MILESTONES: { id: string; marks: number; bones: number; circle: number; description: string; notification: string }[] = [
  { id: 'first-100-marks', marks: 100, bones: 0, circle: 1, description: 'You have gathered your first 100 Mystery Marks. The Path acknowledges your persistence.', notification: 'Milestone: 100 Marks gathered' },
  { id: 'first-500-marks', marks: 500, bones: 0, circle: 1, description: '500 Marks. Your Foundation stirs.', notification: 'Milestone: 500 Marks — Foundation stirs' },
  { id: 'first-1000-marks', marks: 1000, bones: 0, circle: 1, description: '1,000 Marks. You enter the Newbie mastery stage. The boost multiplier activates.', notification: 'Mastery: Newbie Stage — 2x Boost active' },
  { id: 'first-bone', marks: 10000, bones: 1, circle: 1, description: 'Your first Mystery Bone crystallizes. 1 of 206. The architecture of power begins.', notification: 'First Bone forged! (1 / 206)' },
  { id: 'first-10-bones', marks: 10000, bones: 10, circle: 1, description: '10 bones. The skeletal framework of your Foundation stabilizes.', notification: '10 Bones forged — Foundation stabilizes' },
  { id: 'first-50-bones', marks: 10000, bones: 50, circle: 1, description: '50 bones. Your Foundation resonates with harmonic strength.', notification: '50 Bones — Harmonic resonance achieved' },
  { id: 'first-100-bones', marks: 10000, bones: 100, circle: 1, description: '100 bones. Half the skeletal architecture complete. Void resonance begins.', notification: '100 Bones — Void resonance detected' },
  { id: 'first-150-bones', marks: 10000, bones: 150, circle: 1, description: '150 bones. The architecture groans with power. Reality warps around you.', notification: '150 Bones — Reality warps' },
  { id: 'first-180-bones', marks: 10000, bones: 180, circle: 1, description: '180 bones. You approach the full set. The Silent Author takes notice.', notification: '180 Bones — The Silent Author watches' },
  { id: 'first-200-bones', marks: 10000, bones: 200, circle: 1, description: '200 bones. Near complete. Only the skull remains—the hardest bone to forge.', notification: '200 Bones — Only the skull remains' },
  { id: 'first-206-bones', marks: 10000, bones: 206, circle: 1, description: '206 bones. The full skeletal architecture is complete. You are now a true Controller.', notification: '206 Bones complete — Full Controller architecture!' },
]
