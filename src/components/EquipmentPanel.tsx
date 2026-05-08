import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { CosmicButton } from './CosmicButton'
import { RuneText } from './RuneText'
import { useGameStore } from '../store/gameStore'
import type { EquipmentItem, EquipmentState, EquipmentEffectKind } from '../types/equipment'
import { EquipmentSlot, SLOT_LABELS } from '../types/equipment'
import {
  getEffectiveStats,
  getBaseStats,
  getEquipmentSummary,
} from '../systems/equipmentEngine'

const RARITY_GLOW: Record<string, string> = {
  common: 'var(--ash-faint)',
  uncommon: 'var(--spirit-blue)',
  rare: 'var(--gold-primary)',
  legendary: 'var(--gold-bright)',
}

const SLOT_ICONS: Record<string, string> = {
  [EquipmentSlot.Weapon]: '\u2694\uFE0F',
  [EquipmentSlot.Armor]: '\u{1F6E1}',
  [EquipmentSlot.Accessory]: '\u{1F48D}',
  [EquipmentSlot.Relic]: '\u2728',
}

const SLOT_DESCRIPTIONS: Record<string, string> = {
  [EquipmentSlot.Weapon]: 'Your instrument of will. Grants strength and combat power.',
  [EquipmentSlot.Armor]: 'The shell between you and the void. Protects vitality.',
  [EquipmentSlot.Accessory]: 'A token of truth. Enhances spirit and insight.',
  [EquipmentSlot.Relic]: 'A fragment of eternity. Accelerates cultivation and grants unique effects.',
}

const EFFECT_LABELS: Record<EquipmentEffectKind, string> = {
  marksBoost: 'Mark Gain',
  energyRegen: 'Energy Regen',
  damageBoost: 'Combat Damage',
  damageReduce: 'Damage Reduction',
  cultivationSpeed: 'Cultivation Speed',
  hazardResist: 'Hazard Resist',
  lootBonus: 'Loot Bonus',
  dodgeChance: 'Dodge Chance',
  critChance: 'Crit Chance',
  techUnlock: 'Technique Unlock',
}

type EquipmentPanelProps = {
  onNotification?: (message: string, type: string) => void
}

export function EquipmentPanel({ onNotification }: EquipmentPanelProps) {
  const equipment = useGameStore((s) => s.world.equipment)
  const character = useGameStore((s) => s.character)
  const unequipItemAction = useGameStore((s) => s.unequipItemAction)

  const summary = useMemo(() => getEquipmentSummary(equipment), [equipment])
  const baseStats = useMemo(() => getBaseStats(character), [character])
  const effectiveStats = useMemo(
    () => getEffectiveStats(character, equipment),
    [character, equipment],
  )

  const notify = (message: string, type = 'info') => {
    onNotification?.(message, type)
  }

  const handleUnequip = (slot: keyof EquipmentState) => {
    const result = unequipItemAction(slot)
    notify(result.message, 'info')
  }

  const slots = useMemo(() => {
    const result: { slot: keyof EquipmentState; label: string; icon: string; description: string; item: EquipmentItem | null }[] = []
    for (const key of Object.keys(equipment) as (keyof EquipmentState)[]) {
      result.push({
        slot: key,
        label: SLOT_LABELS[key] ?? key,
        icon: SLOT_ICONS[key] ?? '\u25C9',
        description: SLOT_DESCRIPTIONS[key] ?? '',
        item: equipment[key],
      })
    }
    return result
  }, [equipment])

  return (
    <div className="equipment-panel">
      <div className="equipment-layout">
        <div className="equipment-slots-area">
          {slots.map(({ slot, label, icon, description, item }) => (
            <motion.div
              key={slot}
              className={`equipment-slot-card ${item ? 'filled' : 'empty'} rarity-${item?.rarity ?? 'common'}`}
              whileHover={{ scale: 1.02 }}
            >
              <div className="equipment-slot-header">
                <span className="equipment-slot-icon">{icon}</span>
                <span className="equipment-slot-label">{label}</span>
              </div>

              {item ? (
                <div className="equipment-slot-filled">
                  <div className="equipment-item-name" style={{ color: RARITY_GLOW[item.rarity] }}>
                    {item.name}
                  </div>
                  <p className="equipment-item-desc">{item.description}</p>
                  <p className="equipment-item-lore">
                    <em>"{item.lore}"</em>
                  </p>

                  {item.statBonuses.length > 0 && (
                    <div className="equipment-item-bonuses">
                      {item.statBonuses.map((b, i) => (
                        <span key={i} className="equipment-stat-bonus">
                          +{b.value} {b.stat}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.effects.length > 0 && (
                    <div className="equipment-item-effects">
                      {item.effects.map((e, i) => (
                        <span key={i} className="equipment-effect-tag">
                          {e.description}
                        </span>
                      ))}
                    </div>
                  )}

                  <CosmicButton
                    glow="soft"
                    size="small"
                    className="equipment-unequip-btn"
                    onClick={() => handleUnequip(slot)}
                  >
                    Unequip
                  </CosmicButton>
                </div>
              ) : (
                <div className="equipment-slot-empty">
                  <span className="equipment-empty-icon">{'\u25CB'}</span>
                  <p className="equipment-empty-desc">{description}</p>
                  <p className="equipment-empty-hint">Open inventory to equip items</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="equipment-stats-area">
          <div className="equipment-synergy-section">
            <h3 className="equipment-stats-title">Equipment Summary</h3>
            <div className="equipment-summary-stats">
              <div className="summary-stat">
                <label>Equipped</label>
                <span>{summary.equippedCount} / {Object.keys(EquipmentSlot).filter(k => EquipmentSlot[k as keyof typeof EquipmentSlot] !== EquipmentSlot.Consumable).length}</span>
              </div>
              {summary.emptySlots.length > 0 && (
                <div className="summary-stat">
                  <label>Empty Slots</label>
                  <span>{summary.emptySlots.map(s => SLOT_LABELS[s] ?? s).join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {Object.keys(summary.totalStats).length > 0 && (
            <div className="equipment-synergy-section">
              <h3 className="equipment-stats-title">Stat Bonuses</h3>
              <div className="equipment-stat-grid">
                {(Object.keys(baseStats) as (keyof typeof baseStats)[]).map((stat) => {
                  const bonus = summary.totalStats[stat] ?? 0
                  return (
                    <div key={stat} className={`equipment-stat-row ${bonus > 0 ? 'boosted' : ''}`}>
                      <span className="equipment-stat-label">{stat}</span>
                      <span className="equipment-stat-base">{baseStats[stat]}</span>
                      {bonus > 0 && (
                        <>
                          <span className="equipment-stat-arrow">{'\u2192'}</span>
                          <span className="equipment-stat-effective" style={{ color: 'var(--gold-bright)' }}>
                            {effectiveStats[stat]}
                          </span>
                          <span className="equipment-stat-bonus-text">(+{bonus})</span>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {summary.allEffects.length > 0 && (
            <div className="equipment-synergy-section">
              <h3 className="equipment-stats-title">Active Effects</h3>
              <div className="equipment-effects-list">
                {summary.allEffects.map((effect, i) => (
                  <div key={i} className="equipment-effect-row">
                    <span className="equipment-effect-kind">
                      {EFFECT_LABELS[effect.kind] ?? effect.kind}
                    </span>
                    <span className="equipment-effect-value">
                      +{effect.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Object.keys(summary.totalStats).length === 0 && (
            <div className="equipment-no-bonuses">
              <RuneText text="No equipment active." />
              <p>Equip items to gain stat bonuses and effects.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
