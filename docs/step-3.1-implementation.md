# Step 3.1 — Combat Polish & Technique System

## Overview
Wired the technique system into combat, added a full technique selection UI, implemented diverse technique effects with status tracking, cooldown management, and improved combat balance.

## Implemented Features

### Technique System (`src/systems/techniqueSystem.ts`)
- **21 techniques** mapped across all archetypes from the existing `techniqueData.ts` database
- **18 distinct effect types**: damage, pierce-damage, scaling-damage, heal-stat, heal-flat, heal-over-time, lifesteal, shield, buff-damage, debuff-damage, dot, cleanse, cleanse-stun, hasten, expose, dodge, self-damage, enemy-damage-down, adaptive-heal, passive-damage
- **3 technique categories**: Active, Passive, Embodiment — with proper targeting (Self/Enemy/Field)
- **Energy cost and cooldown tracking** per technique (1-5 turn cooldowns)
- **Status effect engine**: Buffs (damage+, shield), Debuffs (damage-, exposed), DoTs, HoTs, Stuns, Dodge
- **Passive technique support**: Inner Flame (+15% damage, regen), Saint Presence (enemy -15% damage)
- **Damage scaling**: Buffs stack multiplicatively; base power scales with participant energy
- **Shield absorption**: Shields absorb damage before HP, displayed as shield badge
- **Lifesteal**: Essence Drain heals for 40% of damage dealt
- **Cleanse mechanics**: Purifying Fire removes debuffs/dots; Chain Breaker clears stuns
- **Adaptive techniques**: Adaptive Flow heals if below 50% HP, otherwise grants damage buff

### Updated Combat Types (`src/types/combat.ts`)
- **`StatusEffectKind`** enum: Buff, Debuff, HealOverTime, Shield, Stun, Dot
- **`StatusEffect`** interface: id, name, kind, value, turnsRemaining, sourceId
- **`CombatParticipant`** updated: `statuses` changed from `string[]` to `StatusEffect[]`; added `shield: number`
- **`CombatState`** updated: added `cooldowns: Record<string, number>` for technique cooldown tracking

### Updated Combat Engine (`src/systems/combatEngine.ts`)
- **`playerTechniqueAttack()`**: Executes technique via technique system, handles energy cost deduction
- **Status resolution**: Each enemy turn processes DoTs, HoTs, and ticks down buff/debuff durations
- **Shield mechanics**: Enemy attacks and player attacks now interact with shield absorption
- **Dodge/evasion**: Pilgrim Step grants 1-turn dodge that fully negates next enemy attack
- **Expose debuff**: Cosmic Awareness makes enemies take 50% more damage next hit
- **Enemy damage reduction**: Saint Presence buff reduces all enemy damage by 15%
- **Stun handling**: Stunned participants skip actions; stun clears at end of turn
- **Balance improvements**: Enemy power scales as `8 + circle * 2.5` (was `8 + circle * 3`); debuffs reduce enemy damage multiplicatively
- **`startInitiative()`**: Applies passive technique effects as combat-initializing buffs

### Updated GameScreen (`src/screens/GameScreen.tsx`)
- **Technique selection panel**: Grid of technique buttons showing name, energy cost, cooldown state
- **Active technique highlighting**: Gold glow on selected technique; disabled state for cooldown/insufficient energy
- **Technique button**: Use Technique (glows hard when technique selected) vs. basic Attack
- **Status effect display**: `StatusEffectList` component renders colored badges per participant
- **Shield badge**: Shows current shield value on player HUD
- **Energy bar in combat HUD**: Separate energy display alongside HP for technique cost visibility
- **Combat info panel**: Shows current turn, phase indicator (colored by player/enemy turn)
- **Expanded combat log**: Shows 8 lines (up from 5) for better technique action feedback

### CSS Additions (`src/styles/base.css`)
- Techniques panel layout with responsive grid
- Technique select buttons with hover/active/cooldown/no-energy states
- Status effect badges with 6 color-coded variants (buff=blue, debuff=red, hot=green, shield=gold, stun=orange, dot=red)
- Shield badge and phase indicator styling
- Responsive overrides for mobile technique grids

## Files Created
- `src/systems/techniqueSystem.ts` — Technique database, execution engine, status resolution

## Files Modified
- `src/types/combat.ts` — StatusEffect system, cooldowns, shield field
- `src/systems/combatEngine.ts` — Rewritten with technique attacks, status resolution, balance tuning
- `src/screens/GameScreen.tsx` — Technique selection UI, status display, energy bar in combat
- `src/styles/base.css` — ~100 lines of new technique/status CSS

## Technical Notes

### Technique Execution Flow
1. Player selects a technique (or defaults to Basic Attack)
2. `handlePlayerAttack()` dispatches to `playerAttack()` or `playerTechniqueAttack(state, techniqueId)`
3. `executeTechnique()` in techniqueSystem resolves all effects, calculates damage/healing/shield
4. Shield absorption applied, HP updated, status effects attached to participants
5. Cooldown set for the used technique; all cooldowns tick down by 1
6. Phase advances to EnemyTurn

### Status Effect Lifecycle
- **Applied**: Via technique execution or enemy abilities
- **Ticked**: Each enemyTurn, `resolveStatusEffects()` processes DoTs, HoTs, decays durations
- **Expired**: Effects with `turnsRemaining` reaching 0 are removed
- **Cleansed**: Purifying Fire removes debuffs/dots; Chain Breaker clears stuns

### Technique Data Mapping
The `TECHNIQUES` object maps technique IDs to full `Technique` types with:
- `effects: TechniqueEffect[]` specifying damage multipliers, buff percentages, durations
- `energyCost` and `cooldownTurns` for resource management
- `category` for active/passive/embodiment classification
- `target` for self/enemy/field targeting rules

### Balance Philosophy
- Basic Attack: `(10 + energy * 0.12) * buffs` — reliable, free
- Light Techniques (3-7 EP): 0.9-1.3x multiplier, 1-2 turn CD
- Medium Techniques (8-10 EP): 1.5-1.8x multiplier, 2-3 turn CD
- Heavy Techniques (11-15 EP): 1.8-2.8x multiplier, 3-5 turn CD
- Enemy damage: `(8 + circle * 2.5) * AI_mod * enemy_damage_mult * debuff_mult`
- Shields: Absorb before HP, value-based on max HP percentages (20-30%)

## Next Priority
**Step 3.2: Narrative Engine & Story Events** — Implement branching story events tied to world nodes, choice-driven narrative changes, reactive dialogue, and lore codex unlocks that respond to player Path and past decisions.

