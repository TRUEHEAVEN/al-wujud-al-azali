import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CosmicButton } from './CosmicButton'
import { RuneText } from './RuneText'
import { useGameStore } from '../store/gameStore'
import type { EquipmentItem } from '../types/equipment'
import { EquipmentSlot, SLOT_LABELS } from '../types/equipment'
import type { LootItem } from '../types/exploration'
import type { InventoryItem } from '../types/gameState'
import { canEquip, getEquippedStatBonuses } from '../systems/equipmentEngine'

type InventoryPanelProps = {
  onNotification?: (message: string, type: string) => void
}

type InventoryFilter = 'all' | 'equipment' | 'consumable' | 'resource' | 'fragment' | 'relic' | 'weapon' | 'armor' | 'accessory' | 'relic-slot'

const FILTER_LABELS: Record<InventoryFilter, string> = {
  all: 'All',
  equipment: 'Equipment',
  consumable: 'Consumable',
  resource: 'Resource',
  fragment: 'Fragment',
  relic: 'Relic',
  weapon: 'Weapon',
  armor: 'Armor',
  accessory: 'Accessory',
  'relic-slot': 'Relics',
}

const RARITY_GLOW: Record<string, string> = {
  common: 'var(--ash-faint)',
  uncommon: 'var(--spirit-blue)',
  rare: 'var(--gold-primary)',
  legendary: 'var(--gold-bright)',
}

const RARITY_SYMBOL: Record<string, string> = {
  common: '\u25CB',
  uncommon: '\u25D0',
  rare: '\u25C9',
  legendary: '\u2B24',
}

const SLOT_ICONS: Record<string, string> = {
  [EquipmentSlot.Weapon]: '\u2694\uFE0F',
  [EquipmentSlot.Armor]: '\u{1F6E1}',
  [EquipmentSlot.Accessory]: '\u{1F48D}',
  [EquipmentSlot.Relic]: '\u2728',
}

export function InventoryPanel({ onNotification }: InventoryPanelProps) {
  const inventory = useGameStore((s) => s.world.inventory)
  const equipment = useGameStore((s) => s.world.equipment)
  const character = useGameStore((s) => s.character)
  const equipItemAction = useGameStore((s) => s.equipItemAction)
  const unequipItemAction = useGameStore((s) => s.unequipItemAction)
  const discardItem = useGameStore((s) => s.discardItem)
  const useLootItem = useGameStore((s) => s.useLootItem)

  const [filter, setFilter] = useState<InventoryFilter>('all')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [selectedEquipSlot, setSelectedEquipSlot] = useState<string | null>(null)

  const notify = (message: string, type = 'info') => {
    onNotification?.(message, type)
  }

  const filteredInventory = useMemo(() => {
    return inventory
      .map((item, idx) => ({ item, idx }))
      .filter(({ item }) => {
        switch (filter) {
          case 'all':
            return true
          case 'equipment':
            return item.type === 'equipment'
          case 'consumable':
            return item.type === 'consumable' || (item.type === 'equipment' && (item as EquipmentItem).slot === EquipmentSlot.Consumable)
          case 'weapon':
            return item.type === 'equipment' && (item as EquipmentItem).slot === EquipmentSlot.Weapon
          case 'armor':
            return item.type === 'equipment' && (item as EquipmentItem).slot === EquipmentSlot.Armor
          case 'accessory':
            return item.type === 'equipment' && (item as EquipmentItem).slot === EquipmentSlot.Accessory
          case 'relic-slot':
            return item.type === 'equipment' && (item as EquipmentItem).slot === EquipmentSlot.Relic
          case 'resource':
          case 'fragment':
          case 'relic':
            return item.type === filter
          default:
            return true
        }
      })
  }, [inventory, filter])

  const equippedBonuses = useMemo(() => getEquippedStatBonuses(equipment), [equipment])

  const selectedItem = selectedIndex !== null ? inventory[selectedIndex] : null

  const isEquipable = (item: InventoryItem): item is EquipmentItem => {
    return item.type === 'equipment' && (item as EquipmentItem).slot !== EquipmentSlot.Consumable
  }

  const isConsumable = (item: InventoryItem): boolean => {
    return item.type === 'consumable' || (item.type === 'equipment' && (item as EquipmentItem).slot === EquipmentSlot.Consumable)
  }

  const handleEquip = (itemIndex: number) => {
    const result = equipItemAction(itemIndex)
    notify(result.message, result.success ? 'achievement' : 'info')
    setSelectedIndex(null)
  }

  const handleUnequip = (slot: string) => {
    const result = unequipItemAction(slot as 'weapon' | 'armor' | 'accessory' | 'relic')
    notify(result.message, result.success ? 'info' : 'info')
    setSelectedEquipSlot(null)
  }

  const handleUse = (item: InventoryItem) => {
    const result = useLootItem(item.id)
    notify(result.message, result.used ? 'achievement' : 'info')
    setSelectedIndex(null)
  }

  const handleDiscard = (itemIndex: number) => {
    const result = discardItem(itemIndex)
    notify(result.message, 'info')
    setSelectedIndex(null)
  }

  const canEquipItem = (item: EquipmentItem): { can: boolean; reason: string } => {
    return canEquip(item, character.circle)
  }

  const equippedSlots = useMemo(() => {
    const slots: { slot: string; item: EquipmentItem | null }[] = []
    for (const slotKey of Object.keys(equipment) as (keyof typeof equipment)[]) {
      slots.push({ slot: slotKey, item: equipment[slotKey] })
    }
    return slots
  }, [equipment])

  return (
    <div className="inventory-panel">
      <div className="inventory-layout">
        <div className="inventory-main">
          <div className="inventory-toolbar">
            <div className="filter-tabs">
              {(['all', 'weapon', 'armor', 'accessory', 'relic-slot', 'consumable', 'resource', 'fragment', 'relic'] as InventoryFilter[]).map((f) => (
                <button
                  key={f}
                  className={`filter-tab ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {FILTER_LABELS[f]}
                </button>
              ))}
            </div>
            <span className="inventory-count">
              {filteredInventory.length} / {inventory.length} items
            </span>
          </div>

          {filteredInventory.length === 0 ? (
            <div className="inventory-empty">
              <RuneText text="The void holds nothing of this kind." />
              <p className="inventory-empty-hint">
                Explore the world to find items. Loot drops from discovery nodes and bosses.
              </p>
            </div>
          ) : (
            <div className="inventory-grid-large">
              {filteredInventory.map(({ item, idx }) => {
                const equipCheck = isEquipable(item)
                  ? canEquipItem(item as EquipmentItem)
                  : null
                return (
                  <motion.div
                    key={`${item.id}-${idx}`}
                    className={`inventory-slot ${selectedIndex === idx ? 'selected' : ''} rarity-${item.rarity} ${equipCheck && !equipCheck.can ? 'unavailable' : ''}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedIndex(selectedIndex === idx ? null : idx)}
                  >
                    <div className="inventory-slot-icon">
                      <span className="rarity-symbol" style={{ color: RARITY_GLOW[item.rarity] }}>
                        {RARITY_SYMBOL[item.rarity]}
                      </span>
                      {item.type === 'equipment' && (item as EquipmentItem).slot !== EquipmentSlot.Consumable && (
                        <span className="slot-icon-small">
                          {SLOT_ICONS[(item as EquipmentItem).slot] ?? '\u25C9'}
                        </span>
                      )}
                    </div>
                    <div className="inventory-slot-name">{item.name}</div>
                    <div className="inventory-slot-type">
                      <span className="type-label">
                        {item.type === 'equipment'
                          ? SLOT_LABELS[(item as EquipmentItem).slot] ?? 'Consumable'
                          : item.type}
                      </span>
                    </div>
                    {equipCheck && !equipCheck.can && (
                      <div className="inventory-slot-req">
                        Req: Circle {((item as EquipmentItem) as EquipmentItem).minCircle}
                      </div>
                    )}
                    {item.value > 0 && isConsumable(item) && (
                      <div className="inventory-slot-value">+{item.value}</div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        <div className="inventory-sidebar">
          <div className="equipped-slots-section">
            <h3 className="sidebar-title">Equipped</h3>
            <div className="equipped-slots">
              {equippedSlots.map(({ slot, item }) => {
                const isSelected = selectedEquipSlot === slot
                return (
                  <motion.div
                    key={slot}
                    className={`equipped-slot ${item ? 'filled' : 'empty'} ${isSelected ? 'selected' : ''} rarity-${item?.rarity ?? 'common'}`}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => setSelectedEquipSlot(isSelected ? null : slot)}
                  >
                    <span className="equipped-slot-icon">
                      {SLOT_ICONS[slot] ?? '\u25C9'}
                    </span>
                    <div className="equipped-slot-info">
                      <span className="equipped-slot-label">
                        {SLOT_LABELS[slot] ?? slot}
                      </span>
                      <span className={`equipped-slot-name ${!item ? 'empty-text' : ''}`}>
                        {item ? item.name : '(empty)'}
                      </span>
                    </div>
                    {item && (
                      <span className="equipped-slot-rarity" style={{ color: RARITY_GLOW[item.rarity] }}>
                        {RARITY_SYMBOL[item.rarity]}
                      </span>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>

          {Object.keys(equippedBonuses).length > 0 && (
            <div className="equipment-bonuses-section">
              <h3 className="sidebar-title">Bonuses</h3>
              <div className="bonus-list">
                {(Object.keys(equippedBonuses) as (keyof typeof equippedBonuses)[]).map((stat) => (
                  <div key={stat} className="bonus-item">
                    <span className="bonus-stat">{stat}</span>
                    <span className="bonus-value">
                      {'+'}{equippedBonuses[stat]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="equipment-actions-sidebar">
            {selectedEquipSlot && equipment[selectedEquipSlot as keyof typeof equipment] && (
              <CosmicButton
                glow="soft"
                size="small"
                onClick={() => handleUnequip(selectedEquipSlot)}
              >
                Unequip {equipment[selectedEquipSlot as keyof typeof equipment]?.name}
              </CosmicButton>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="inventory-detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="inventory-detail-header">
              <h3 className="inventory-detail-name" style={{ color: RARITY_GLOW[selectedItem.rarity] }}>
                {RARITY_SYMBOL[selectedItem.rarity]} {selectedItem.name}
              </h3>
              <span className="inventory-detail-rarity">{selectedItem.rarity.toUpperCase()}</span>
            </div>

            <p className="inventory-detail-desc">{selectedItem.description}</p>

            {selectedItem.type === 'equipment' && 'lore' in selectedItem && (
              <p className="inventory-detail-lore">
                <em>"{selectedItem.lore}"</em>
              </p>
            )}

            {selectedItem.type === 'equipment' && (selectedItem as EquipmentItem).slot !== EquipmentSlot.Consumable && (
              <div className="inventory-detail-stats">
                {(selectedItem as EquipmentItem).statBonuses.length > 0 && (
                  <div className="detail-stat-group">
                    <h4>Stat Bonuses</h4>
                    <div className="stat-bonus-list">
                      {(selectedItem as EquipmentItem).statBonuses.map((b, i) => (
                        <span key={i} className="stat-bonus-tag">
                          +{b.value} {b.stat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {(selectedItem as EquipmentItem).effects.length > 0 && (
                  <div className="detail-effect-group">
                    <h4>Effects</h4>
                    <div className="effect-list">
                      {(selectedItem as EquipmentItem).effects.map((e, i) => (
                        <span key={i} className="effect-tag">{e.description}</span>
                      ))}
                    </div>
                  </div>
                )}
                {'minCircle' in selectedItem && (
                  <div className="detail-req">
                    Requires Circle {selectedItem.minCircle}
                    {selectedItem.minCircle > character.circle && ' (unavailable)'}
                  </div>
                )}
              </div>
            )}

            <div className="inventory-detail-actions">
              {isEquipable(selectedItem) && (
                <CosmicButton
                  glow="strong"
                  size="small"
                  onClick={() => handleEquip(selectedIndex!)}
                  disabled={!canEquipItem(selectedItem as EquipmentItem).can}
                  title={
                    !canEquipItem(selectedItem as EquipmentItem).can
                      ? canEquipItem(selectedItem as EquipmentItem).reason
                      : undefined
                  }
                >
                  Equip
                </CosmicButton>
              )}
              {isConsumable(selectedItem) && (
                <CosmicButton
                  glow="strong"
                  size="small"
                  onClick={() => handleUse(selectedItem)}
                >
                  Use
                </CosmicButton>
              )}
              <CosmicButton
                glow="soft"
                size="small"
                onClick={() => handleDiscard(selectedIndex!)}
              >
                Discard
              </CosmicButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
