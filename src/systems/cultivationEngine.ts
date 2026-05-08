import type { Character } from '../types/character'
import type { CircleRequirement } from '../data/cultivationData'
import type { FoundationStage as FoundationStageType } from '../types/foundation'
import type { MasteryStage as MasteryStageType } from '../types/mystery'
import {
  CIRCLE_REQUIREMENTS,
  BONE_MARK_COST,
  BONE_TOTAL,
  MASTERY_THRESHOLDS,
  FOUNDATION_STAGES,
  CULTIVATION_MILESTONES,
  getCircleRequirement,
  getMasteryStage,
} from '../data/cultivationData'
import { FoundationStage, MasteryStage } from '../types'

export interface AscensionCheck {
  can: boolean
  nextCircle: number
  requirement: CircleRequirement
  unmetReasons: string[]
}

export interface BoneForgeResult {
  success: boolean
  bonesForged: number
  marksSpent: number
  currentBones: number
  message: string
}

export interface MilestoneCheck {
  triggered: boolean
  milestone: (typeof CULTIVATION_MILESTONES)[number] | null
}

export function checkCircleAscension(character: Character): AscensionCheck {
  const nextCircle = character.circle + 1
  const requirement = getCircleRequirement(nextCircle)

  if (!requirement) {
    return {
      can: false,
      nextCircle,
      requirement: {
        circle: nextCircle,
        name: 'Beyond',
        description: 'No further circles exist.',
        minMarks: Infinity,
        minBones: Infinity,
        minMasteryStage: MasteryStage.Ultimate,
        lifespanGain: 0,
        unlocks: [],
      },
      unmetReasons: ['Maximum circle reached.'],
    }
  }

  const unmetReasons: string[] = []
  const marks = character.mystery.count + character.mystery.refinedTotal

  if (marks < requirement.minMarks) {
    unmetReasons.push(`Marks: ${marks.toLocaleString()} / ${requirement.minMarks.toLocaleString()} required`)
  }
  if (character.mystery.bones < requirement.minBones) {
    unmetReasons.push(`Bones: ${character.mystery.bones} / ${requirement.minBones} required`)
  }
  if (getMasteryStageIndex(character.mystery.masteryStage) < getMasteryStageIndex(requirement.minMasteryStage)) {
    unmetReasons.push(`Mastery: ${character.mystery.masteryStage} / ${requirement.minMasteryStage} required`)
  }
  if (requirement.foundationStage && getFoundationStageIndex(character.foundation.stage) < getFoundationStageIndex(requirement.foundationStage)) {
    unmetReasons.push(`Foundation: ${character.foundation.stage} / ${requirement.foundationStage} required`)
  }

  return {
    can: unmetReasons.length === 0,
    nextCircle,
    requirement,
    unmetReasons,
  }
}

export function performAscension(character: Character): Character {
  const check = checkCircleAscension(character)
  if (!check.can) return character

  const updated = { ...character }
  updated.circle = check.nextCircle
  updated.lifespan += check.requirement.lifespanGain
  updated.mindSpace += 50
  updated.currentEnergy = updated.mindSpace

  const statBoost = check.nextCircle * 3
  updated.stats = {
    ...updated.stats,
    vitality: updated.stats.vitality + statBoost,
    strength: updated.stats.strength + statBoost,
    agility: updated.stats.agility + statBoost,
    insight: updated.stats.insight + statBoost,
    will: updated.stats.will + statBoost,
    spirit: updated.stats.spirit + statBoost,
  }

  return updated
}

export function checkBoneForge(character: Character): BoneForgeResult {
  const totalMarks = character.mystery.count + character.mystery.refinedTotal
  const remainingBones = BONE_TOTAL - character.mystery.bones

  if (remainingBones <= 0) {
    return {
      success: false,
      bonesForged: 0,
      marksSpent: 0,
      currentBones: character.mystery.bones,
      message: 'All 206 bones have been forged. The architecture is complete.',
    }
  }

  if (totalMarks < BONE_MARK_COST) {
    return {
      success: false,
      bonesForged: 0,
      marksSpent: 0,
      currentBones: character.mystery.bones,
      message: `Not enough marks. ${BONE_MARK_COST.toLocaleString()} marks required per bone. (${totalMarks.toLocaleString()} / ${BONE_MARK_COST.toLocaleString()})`,
    }
  }

  const maxForgeable = Math.floor(totalMarks / BONE_MARK_COST)
  const toForge = Math.min(maxForgeable, remainingBones)
  const marksSpent = toForge * BONE_MARK_COST

  return {
    success: true,
    bonesForged: toForge,
    marksSpent,
    currentBones: character.mystery.bones + toForge,
    message: `Forged ${toForge} bone${toForge > 1 ? 's' : ''} from ${marksSpent.toLocaleString()} marks. (${character.mystery.bones + toForge} / ${BONE_TOTAL})`,
  }
}

export function applyBoneForge(character: Character, result: BoneForgeResult): Character {
  if (!result.success) return character

  return {
    ...character,
    mystery: {
      ...character.mystery,
      count: Math.max(0, character.mystery.count - result.marksSpent),
      bones: result.currentBones,
    },
  }
}

export function checkFoundationEvolution(character: Character): { canEvolve: boolean; nextStage: FoundationStageType | null; requirement: string } {
  const stageOrder: FoundationStageType[] = [
    FoundationStage.Egg,
    FoundationStage.Crystalline,
    FoundationStage.Patterned,
    FoundationStage.Shelled,
    FoundationStage.Dense,
  ]

  const currentIndex = getFoundationStageIndex(character.foundation.stage)
  if (currentIndex >= stageOrder.length - 1) {
    return { canEvolve: false, nextStage: null, requirement: 'Maximum foundation stage reached.' }
  }

  const nextStage = stageOrder[currentIndex + 1]
  const req = FOUNDATION_STAGES[nextStage]

  const marks = character.mystery.count + character.mystery.refinedTotal

  if (marks >= req.minMarks && character.circle >= req.minCircle) {
    return { canEvolve: true, nextStage, requirement: `Requirements met. Evolve to ${nextStage}.` }
  }

  return {
    canEvolve: false,
    nextStage,
    requirement: `Requires ${req.minMarks.toLocaleString()} marks and Circle ${req.minCircle}+`,
  }
}

export function evolveFoundation(character: Character): Character {
  const check = checkFoundationEvolution(character)
  if (!check.canEvolve || !check.nextStage) return character

  const stageOrder: FoundationStageType[] = [
    FoundationStage.Egg,
    FoundationStage.Crystalline,
    FoundationStage.Patterned,
    FoundationStage.Shelled,
    FoundationStage.Dense,
  ]

  const currentIndex = stageOrder.indexOf(character.foundation.stage)
  const nextIndex = currentIndex + 1
  if (nextIndex >= stageOrder.length) return character

  return {
    ...character,
    foundation: {
      ...character.foundation,
      stage: stageOrder[nextIndex],
      integrity: Math.min(100, character.foundation.integrity + 20),
      weight: character.foundation.weight + 1,
    },
  }
}

export function refineMysteryMarks(character: Character): { character: Character; stageAdvanced: boolean; newStage: MasteryStageType } {
  const marks = character.mystery.count + character.mystery.refinedTotal
  const newStage = getMasteryStage(marks)
  const stageAdvanced = newStage !== character.mystery.masteryStage

  return {
    character: {
      ...character,
      mystery: {
        ...character.mystery,
        masteryStage: newStage,
      },
    },
    stageAdvanced,
    newStage,
  }
}

export function checkBreakthroughMilestones(character: Character): MilestoneCheck {
  const marks = character.mystery.count + character.mystery.refinedTotal
  const bones = character.mystery.bones
  const circle = character.circle

  for (const milestone of CULTIVATION_MILESTONES) {
    if (marks >= milestone.marks && bones >= milestone.bones && circle >= milestone.circle) {
      return { triggered: true, milestone }
    }
  }

  return { triggered: false, milestone: null }
}

export function getCircleProgress(character: Character): { current: number; target: number; percentage: number } {
  const currentReq = getCircleRequirement(character.circle)
  const nextReq = getCircleRequirement(character.circle + 1)
  if (!nextReq) return { current: 1, target: 1, percentage: 100 }

  const currentMin = currentReq?.minMarks ?? 0
  const targetMarks = nextReq.minMarks
  const marks = character.mystery.count + character.mystery.refinedTotal
  const raw = targetMarks > currentMin ? ((marks - currentMin) / (targetMarks - currentMin)) * 100 : 0
  return {
    current: marks,
    target: targetMarks,
    percentage: Math.min(100, Math.max(0, raw)),
  }
}

export function getCultivationSummary(character: Character) {
  const check = checkCircleAscension(character)
  const boneCheck = checkBoneForge(character)
  const foundationCheck = checkFoundationEvolution(character)
  const progress = getCircleProgress(character)

  return {
    circle: character.circle,
    circleProgress: progress,
    canAscend: check.can,
    ascensionCheck: check,
    boneCheck,
    foundationCheck,
    totalMarks: character.mystery.count + character.mystery.refinedTotal,
    rawMarks: character.mystery.count,
    bones: character.mystery.bones,
    bonesRemaining: BONE_TOTAL - character.mystery.bones,
    masteryStage: character.mystery.masteryStage,
    foundationStage: character.foundation.stage,
    boostMultiplier: character.mystery.boostMultiplier,
  }
}

function getMasteryStageIndex(stage: MasteryStageType): number {
  const order: MasteryStageType[] = [
    MasteryStage.Formation,
    MasteryStage.Newbie,
    MasteryStage.Controller,
    MasteryStage.Master,
    MasteryStage.Saga,
    MasteryStage.Supreme,
    MasteryStage.Ultimate,
  ]
  return order.indexOf(stage)
}

function getFoundationStageIndex(stage: FoundationStageType): number {
  const order: FoundationStageType[] = [
    FoundationStage.Egg,
    FoundationStage.Crystalline,
    FoundationStage.Patterned,
    FoundationStage.Shelled,
    FoundationStage.Dense,
  ]
  return order.indexOf(stage)
}
