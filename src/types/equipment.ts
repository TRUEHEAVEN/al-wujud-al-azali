import type { CharacterStats } from './character'

export const EquipmentSlot = {
  Weapon: 'weapon',
  Armor: 'armor',
  Accessory: 'accessory',
  Relic: 'relic',
  Consumable: 'consumable',
} as const

export type EquipmentSlot = (typeof EquipmentSlot)[keyof typeof EquipmentSlot]

export const SLOT_LABELS: Record<string, string> = {
  [EquipmentSlot.Weapon]: 'Weapon',
  [EquipmentSlot.Armor]: 'Armor',
  [EquipmentSlot.Accessory]: 'Accessory',
  [EquipmentSlot.Relic]: 'Relic',
}

export const EQUIPMENT_SLOTS = [
  EquipmentSlot.Weapon,
  EquipmentSlot.Armor,
  EquipmentSlot.Accessory,
  EquipmentSlot.Relic,
] as const

export interface EquipmentStatBonus {
  stat: keyof CharacterStats
  value: number
}

export type EquipmentEffectKind =
  | 'marksBoost'
  | 'energyRegen'
  | 'damageBoost'
  | 'damageReduce'
  | 'cultivationSpeed'
  | 'hazardResist'
  | 'lootBonus'
  | 'dodgeChance'
  | 'critChance'
  | 'techUnlock'

export interface EquipmentEffect {
  kind: EquipmentEffectKind
  value: number
  description: string
}

export interface EquipmentItem {
  id: string
  name: string
  type: 'equipment'
  slot: EquipmentSlot
  description: string
  lore: string
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
  minCircle: number
  statBonuses: EquipmentStatBonus[]
  effects: EquipmentEffect[]
  value: number
}

export interface EquipmentState {
  [EquipmentSlot.Weapon]: EquipmentItem | null
  [EquipmentSlot.Armor]: EquipmentItem | null
  [EquipmentSlot.Accessory]: EquipmentItem | null
  [EquipmentSlot.Relic]: EquipmentItem | null
}

export const DEFAULT_EQUIPMENT_STATE: EquipmentState = {
  [EquipmentSlot.Weapon]: null,
  [EquipmentSlot.Armor]: null,
  [EquipmentSlot.Accessory]: null,
  [EquipmentSlot.Relic]: null,
}

export type InventoryItem = EquipmentItem | import('./exploration').LootItem
