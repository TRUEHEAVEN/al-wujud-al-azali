# Step 3.5 — Inventory & Equipment

## Overview
Implemented a complete inventory management and equipment system: 20+ unique equipable items across 4 slots (Weapon, Armor, Accessory, Relic), consumables with varied effects, stat bonuses, special effects, rarity tiers, inventory filtering, and full UI panels for inventory management and equipment viewing.

## Implemented Features

### Equipment Types (`src/types/equipment.ts`)
- **`EquipmentSlot`** const enum: Weapon, Armor, Accessory, Relic, Consumable
- **`EquipmentItem`** interface: equipable items with slot, stat bonuses, effects, rarity, min circle, lore
- **`EquipmentStatBonus`**: stat-to-value mapping (vitality, strength, agility, insight, will, spirit)
- **`EquipmentEffect`**: 10 effect kinds (marksBoost, energyRegen, damageBoost, damageReduce, cultivationSpeed, hazardResist, lootBonus, dodgeChance, critChance, techUnlock)
- **`EquipmentState`**: typed record of 4 equip slots
- **`DEFAULT_EQUIPMENT_STATE`**: initial empty equipment

### Equipment Data (`src/data/equipmentData.ts`)
- **20 equipment items** across 4 slots + 4 consumables:
  - **Weapons (4)**: Rust Stake (common) → Dust Blade (uncommon) → Bone Saber (rare) → Void Spear (legendary)
  - **Armor (4)**: Ash Wraps (common) → Resonance Mail (uncommon) → Bone Plate (rare) → Void Mantle (legendary)
  - **Accessories (4)**: Mark Ring (common) → Blood Brooch (uncommon) → Rift Lens (rare) → Eternity Loop (legendary)
  - **Relics (4)**: Void Shard (common) → Foundation Anchor (uncommon) → Bone Censer (rare) → The Silent Pulse (legendary)
  - **Consumables (4)**: Mark Elixir, Spirit Draught, Bone Tonic, Foundation Crystal
- **Circle-gated**: items require specific circle to equip (1–6)
- **Lore text**: every item includes a thematic quote
- **`getEquipableLoot(circle)`**: returns equipment pool available at given circle
- **`getEquipmentForSlot(slot, circle)`**: filters by slot and circle

### Equipment Engine (`src/systems/equipmentEngine.ts`)
- **`canEquip(item, circle)`**: validates circle requirement, prevents consumable equipping
- **`equipItem(equipment, item, circle)`**: equips to slot, returns previously equipped item
- **`unequipItem(equipment, slot)`**: removes item from slot
- **`getEquippedStatBonuses(equipment)`**: aggregates all stat bonuses from equipped items
- **`getEffectiveStats(character, equipment)`**: base stats + equipment bonuses
- **`getTotalEffectValue(equipment, kind)`**: sums specific effect across all slots
- **`getEquipmentSummary(equipment)`**: comprehensive summary of stats, effects, equipped count, empty slots

### Store Updates (`src/store/gameStore.ts`)
- **`equipItemAction(itemIndex)`**: equips item from inventory by index, auto-unequips occupied slot
- **`unequipItemAction(slot)`**: moves item from equipment back to inventory
- **`discardItem(itemIndex)`**: permanently removes item from inventory
- **`useLootItem(itemId)`**: enhanced — handles LootItem consumables, Equipment consumables (elixir/draught/tonic/crystal), and rejects non-consumable equipment
- Updated `addLootToInventory` to accept `InventoryItem[]`
- Added `equipment` to WorldState initialization

### Inventory Panel (`src/components/InventoryPanel.tsx`)
- **Item grid**: visual grid with rarity-colored borders (common/uncommon/rare/legendary)
- **Filter tabs**: All, Weapon, Armor, Accessory, Relic, Consumable, Resource, Fragment, Relic
- **Equipped sidebar**: shows all 4 slots with item name, icon, rarity symbol
- **Equip/Unequip**: click to select item, Equip button in detail panel; click slot to unequip
- **Equip validation**: unavailable items show circle requirement and are dimmed
- **Item detail panel**: name (rarity-colored), description, lore quote, stat bonuses, effects, circle requirement
- **Use/Discard**: Use for consumables, Discard for any item
- **Stat bonus summary**: cumulative equipped bonuses displayed in sidebar

### Equipment Panel (`src/components/EquipmentPanel.tsx`)
- **4 slot cards**: each displays icon, label, item info or empty state with description
- **Filled states**: item name, description, lore, stat bonuses as tags, effects as tags, Unequip button
- **Empty states**: slot description, visual hint
- **Stats area**: base→effective stat comparison with +bonus annotations
- **Active effects**: aggregated effect list with percentage values
- **Equipment summary**: equipped/total count, empty slot names

### GameScreen Updates (`src/screens/GameScreen.tsx`)
- Added `'inventory'` to GameView type
- Added **"Items"** nav button (🎒 icon) between Cultivate and Options
- Inventory view renders `InventoryPanel` in `GlyphPanel`
- Character sheet now embeds `EquipmentPanel` for equipment summary
- Inventory items in character sheet show `Equip` badge for equipment items

### Loot Integration
- **Exploration engine** (`src/systems/explorationEngine.ts`): `generateLootDrop` now returns `InventoryItem[]` — ~30-55% chance (scaling with circle) per drop of generating equipment instead of resource loot
- **WorldNode** (`src/types/world.ts`): `loot` field updated to `InventoryItem[]`
- Equipment items drop alongside regular loot on discovery and boss nodes

### CSS Additions (`src/styles/base.css`)
- `~500 lines` of new CSS:
  - Inventory panel layout (main grid + sidebar)
  - Filter tabs (active/hover states)
  - Inventory grid items (rarity borders, selected state, unavailable dimming)
  - Item detail panel (header, description, lore, stats, effects, actions)
  - Equipped slot sidebar (filled/empty, rarity borders, selected highlight)
  - Equipment panel (slot cards, stat comparison rows, effect list)
  - Bonus/effect tags styling
  - Responsive overrides for mobile (<768px): single-column layout, sidebar reordering

## Files Created
- `src/types/equipment.ts`
- `src/data/equipmentData.ts`
- `src/systems/equipmentEngine.ts`
- `src/components/InventoryPanel.tsx`
- `src/components/EquipmentPanel.tsx`

## Files Modified
- `src/types/index.ts` — Added equipment types export
- `src/types/gameState.ts` — Added equipment state, InventoryItem union type
- `src/types/world.ts` — Updated loot type to InventoryItem[]
- `src/store/gameStore.ts` — Added EquipmentSlice (equip, unequip, discard, enhanced use), updated inventory types
- `src/screens/GameScreen.tsx` — Added inventory view, EquipmentPanel in character sheet, Items nav button
- `src/systems/explorationEngine.ts` — generateLootDrop now produces equipment items
- `src/styles/base.css` — ~500 lines of inventory & equipment CSS

## Technical Notes

### Equipment Design
| Slot | Common | Uncommon | Rare | Legendary |
|------|--------|----------|------|-----------|
| Weapon | Rust Stake (+2 str) | Dust Blade (+3 str, +2 agi, +5% dmg) | Bone Saber (+5 str, +3 will, +10% dmg, +5% crit) | Void Spear (+8 str, +5 ins, +4 spi, +20% dmg, +10% crit, +5 EP) |
| Armor | Ash Wraps (+2 vit) | Resonance Mail (+3 vit, +2 will, -5% dmg) | Bone Plate (+5 vit, +3 str, -10% dmg, +15% hazard) | Void Mantle (+8 vit, +5 ins, -20% dmg, +10% dodge, +25% hazard) |
| Accessory | Mark Ring (+2 spi, +5% marks) | Blood Brooch (+2 vit, +3 spi, +3 EP, +8% marks) | Rift Lens (+5 ins, +3 spi, +15% marks, +10% hazard) | Eternity Loop (+8 ins, +6 spi, +5 will, +25% marks, +15% cult, +8 EP) |
| Relic | Void Shard (+1 ins, +5% cult) | Foundation Anchor (+3 will, +2 ins, +10% cult, +5% hazard) | Bone Censer (+5 spi, +4 will, +20% cult, +10% marks) | The Silent Pulse (+10 spi, +8 will, +6 ins, +35% cult, +20% marks, +15 EP, +20% hazard) |

### Loot Drop Rates
- Equipment chance per drop: 25% + circle × 5% (30% at circle 1, 55% at circle 6)
- Available equipment pool grows with circle (items filtered by minCircle)
- Legendary equipment locked behind circle 4–6

### Consumable Effects
- **Mark Elixir**: +30 Mystery Marks
- **Spirit Draught**: +40 Path Energy
- **Bone Tonic**: +50 Marks, +5 Foundation integrity
- **Foundation Crystal**: +100 Marks, evolves Foundation (Egg→Crystalline→Patterned) or full integrity restore

### Aesthetic Rule Compliance
- All animations use Framer Motion fade/scale transitions
- Gold-on-black color scheme throughout
- Rarity-colored borders and symbols
- Lore quotes on every equipment item
- Cultivation-thematic naming and descriptions

## Next Priority
**Step 3.6: Embodiment System** — Implement Third Circle transformation mechanics, visual form changes, elemental affinities, and embodiment progression.
