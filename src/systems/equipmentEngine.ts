import type { Character, CharacterStats } from '../types/character'
import type { EquipmentItem, EquipmentState, EquipmentEffectKind } from '../types/equipment'
import { EquipmentSlot } from '../types/equipment'
import { getEquipmentById } from '../data/equipmentData'

export interface EquipmentActionResult {
  success: boolean
  message: string
  updatedEquipment: EquipmentState
  inventoryIndex?: number
}

export function canEquip(
  item: EquipmentItem,
  characterCircle: number,
): { can: boolean; reason: string } {
  if (item.minCircle > characterCircle) {
    return {
      can: false,
      reason: `Requires Circle ${item.minCircle}. You are Circle ${characterCircle}.`,
    }
  }
  if (item.slot === EquipmentSlot.Consumable) {
    return { can: false, reason: 'Consumables cannot be equipped.' }
  }
  return { can: true, reason: '' }
}

export function equipItem(
  equipment: EquipmentState,
  item: EquipmentItem,
  characterCircle: number,
): EquipmentActionResult {
  const check = canEquip(item, characterCircle)
  if (!check.can) {
    return { success: false, message: check.reason, updatedEquipment: equipment }
  }

  const updated = { ...equipment }
  const existing = updated[item.slot]
  updated[item.slot] = item

  if (existing) {
    return {
      success: true,
      message: `Unequipped ${existing.name} and equipped ${item.name}.`,
      updatedEquipment: updated,
    }
  }

  return {
    success: true,
    message: `Equipped ${item.name}.`,
    updatedEquipment: updated,
  }
}

export function unequipItem(
  equipment: EquipmentState,
  slot: keyof EquipmentState,
): EquipmentActionResult {
  const item = equipment[slot]
  if (!item) {
    return { success: false, message: `No item in ${slot} slot.`, updatedEquipment: equipment }
  }

  const updated = { ...equipment, [slot]: null }
  return {
    success: true,
    message: `Unequipped ${item.name}.`,
    updatedEquipment: updated,
  }
}

export function getEquippedStatBonuses(
  equipment: EquipmentState,
): Partial<CharacterStats> {
  const bonuses: Partial<CharacterStats> = {}

  for (const slot of Object.values(EquipmentSlot)) {
    if (slot === EquipmentSlot.Consumable) continue
    const item = equipment[slot as keyof EquipmentState]
    if (!item) continue
    for (const bonus of item.statBonuses) {
      bonuses[bonus.stat] = (bonuses[bonus.stat] ?? 0) + bonus.value
    }
  }

  return bonuses
}

export function getBaseStats(character: Character): CharacterStats {
  return { ...character.stats }
}

export function getEffectiveStats(
  character: Character,
  equipment: EquipmentState,
): CharacterStats {
  const base = getBaseStats(character)
  const bonuses = getEquippedStatBonuses(equipment)

  const effective: CharacterStats = { ...base }
  for (const key of Object.keys(base) as (keyof CharacterStats)[]) {
    effective[key] = base[key] + (bonuses[key] ?? 0)
  }

  return effective
}

export function getTotalEffectValue(
  equipment: EquipmentState,
  kind: EquipmentEffectKind,
): number {
  let total = 0
  for (const slot of Object.values(EquipmentSlot)) {
    if (slot === EquipmentSlot.Consumable) continue
    const item = equipment[slot as keyof EquipmentState]
    if (!item) continue
    for (const effect of item.effects) {
      if (effect.kind === kind) {
        total += effect.value
      }
    }
  }
  return total
}

export function getEquipmentSummary(equipment: EquipmentState): {
  totalStats: Partial<CharacterStats>
  allEffects: { kind: EquipmentEffectKind; value: number; description: string }[]
  equippedCount: number
  emptySlots: string[]
} {
  const totalStats = getEquippedStatBonuses(equipment)
  const effectMap = new Map<EquipmentEffectKind, { value: number; description: string }>()
  let equippedCount = 0
  const emptySlots: string[] = []

  for (const slot of Object.values(EquipmentSlot)) {
    if (slot === EquipmentSlot.Consumable) continue
    const item = equipment[slot as keyof EquipmentState]
    if (item) {
      equippedCount++
      for (const effect of item.effects) {
        const existing = effectMap.get(effect.kind)
        effectMap.set(effect.kind, {
          value: (existing?.value ?? 0) + effect.value,
          description: effect.description,
        })
      }
    } else {
      emptySlots.push(slot)
    }
  }

  const allEffects = Array.from(effectMap.entries()).map(([kind, data]) => ({
    kind,
    value: data.value,
    description: data.description,
  }))

  return { totalStats, allEffects, equippedCount, emptySlots }
}
