# Step 3.3 — World Exploration & Event Nodes

## Overview
Enhanced the world map with environmental hazards, discovery minigames, region-specific mechanics, Six Sense perception, hidden nodes, loot drops, and combat modifiers — deepening exploration gameplay significantly.

## Implemented Features

### Exploration Types (`src/types/exploration.ts`)
- **`HazardType`** enum: 7 hazard types (PoisonSwamp, VoidStorm, BloodMist, DustWaste, BoneField, ResonanceCrack, EchoMaze)
- **`HazardDefinition`** interface: define hazard properties, effects, avoidance costs
- **`HazardEffect`** interface: typed effects (damage, energy drain, marks drain, time skip, combat start, stat penalty)
- **`HazardResult`** interface: resolution output with damage, energy loss, messages
- **`DiscoveryGameType`** enum: 4 minigame types (Memory, Resonance, GlyphMatch, VoidRiddle)
- **`DiscoveryGame`** interface: game definition with success/failure rewards
- **`DiscoveryReward`** interface: marks, energy, codex, technique rewards
- **`LootItem`** interface: inventory items with rarity (common/uncommon/rare/legendary)
- **`RegionMechanics`** interface: per-circle region rules (available hazards, hidden node chance, loot multiplier, minigame types)
- **`PerceptionField`** & **`SixSenseLevel`**: perception system with 5 tiers (Dormant → Infinite)
- **`RegionMechanicType`** enum: 5 region mechanics (SafeCradle, DangerFrontier, PerceptionGate, EmbodimentTrial, DustCycle)

### Enhanced WorldNode (`src/types/world.ts`)
- Added `hazard?: HazardType` — environmental hazard on node
- Added `hidden: boolean` — hidden nodes only visible with Six Sense
- Added `perceptionRequired: number` — Six Sense level to reveal
- Added `discoveryGame?: DiscoveryGame` — optional minigame trigger
- Added `loot?: LootItem[]` — loot drops on first visit
- Added `combatModifiers?: string[]` — node-specific combat field modifiers

### Hazard Data (`src/data/explorationData.ts`)
- **`HAZARDS`**: 7 hazard definitions with circle gating, region availability, avoid costs, and multi-effect resolution
- **`LOOT_TABLE`**: 8 loot items across 4 rarity tiers with Mark value scaling
- **`DISCOVERY_GAME_TEMPLATES`**: 4 minigame templates with success/failure rewards
- **`REGION_MECHANICS`**: 5 region configurations for circles 1–5 with increasing difficulty and reward multipliers
- Helper functions: `getRegionMechanics()`, `getHazardDefinition()`

### Exploration Engine (`src/systems/explorationEngine.ts`)
- **`resolveHazard()`**: Full hazard resolution with avoidance logic (agility-based chance check), energy cost for dodging, and fall-through damage/energy/marks drain
- **`generateDiscoveryGame()`**: Creates minigame instances from templates scaled by circle
- **`generateLootDrop()`**: Weighted rarity loot generation scaled by circle and region multiplier
- **`deriveSixSenseLevel()`**: Circle + Insight-based perception tier derivation
- **`derivePerceptionField()`**: Returns full PerceptionField with reveal radius and secret flavor text
- **`checkHiddenNodeVisibility()`**: Checks if perception field reveals hidden node
- **`evaluateDiscoveryMiniGame()`**: Resolves minigame outcomes (random-based for most, knowledge-check for riddle)

### Updated World Map Generator (`src/systems/worldMapGenerator.ts`)
- Nodes now assigned hazards based on region availability (danger/boss always get one, others 20% chance)
- Discovery nodes have 40% chance of spawning a minigame from their region's pool
- Discovery/boss nodes generate loot drops
- Danger/boss nodes receive combat modifiers
- **Hidden nodes**: 1+ hidden nodes generated per region, requiring Six Sense to reveal
- Hidden nodes use separate name pool, always Discovery type, always have minigames + loot

### Discovery Minigame Component (`src/components/DiscoveryOverlay.tsx`)
- **Intro phase**: Game title, description, difficulty stars, reward preview
- **Memory game**: Watch sequence then replicate — interactive 2×2 grid with animated cell highlighting
- **Resonance tuning**: Range slider with harmonic target and tolerance check
- **Glyph alignment**: Rotatable pieces (90° increments), alignment resolution
- **Void Riddle**: Multiple-choice philosophical question
- **Result phase**: Success/failure animation, reward breakdown (marks, bonus, energy, codex, technique)
- All phases animated with Framer Motion transitions
- Skip button to bypass minigames

### Store Updates (`src/store/gameStore.ts`)
- **`WorldState`** extended: `revealedHiddenNodeIds`, `inventory`, `discoveredGameIds`
- **`revealHiddenNode(id)`**: Unhides a hidden node and tracks revelation
- **`addLootToInventory(items)`**: Appends loot to player inventory
- **`markDiscoveryComplete(id)`**: Tracks completed minigames to prevent replay
- **`selectExplorableNodes`**: Now filters out hidden nodes from the map view

### GameScreen Integration (`src/screens/GameScreen.tsx`)
- **Six Sense**: Auto-reveals hidden nodes when perception threshold is met (effect hook on world.nodes change)
- **Hazard resolution**: On node exploration, non-void hazards fire before the node action — damage, energy drain, marks loss, time skip, combat trigger
- **Discovery minigames**: When a node has a discovery game, `DiscoveryOverlay` renders instead of immediate action
- **Loot collection**: Loot auto-collected on node visit, displayed via notifications and in character sheet
- **Hazard badges**: Nodes display hazard name + icon on the map card
- **Minigame indicators**: Nodes with minigames show a purple indicator
- **Six Sense display**: Left panel shows current perception level and flavor text
- **Inventory display**: Character sheet shows collected loot items with rarity-colored borders
- **Expanded notifications**: Added `hazard` and `loot` notification types with appropriate styling
- **Connected nodes filter**: Only shows non-hidden nodes; hidden nodes auto-join the list when revealed

### CSS Additions (`src/styles/base.css`)
- `~400 lines` of new CSS for:
  - Hazard badges and node hazard info
  - Mini-game indicators
  - Six Sense display in character panel
  - Inventory grid with rarity-based coloring
  - Full DiscoveryOverlay layout (backdrop, container, intro/playing/result phases)
  - Memory game grid with active/selected states
  - Resonance slider, wave visualization
  - Glyph piece grid with rotation styling
  - Void riddle styling
  - Discovery result animations
  - Hazard/loot notification types
  - Responsive overrides for mobile

## Files Created
- `src/types/exploration.ts` — Hazards, regions, discovery, loot, perception types
- `src/data/explorationData.ts` — Hazard definitions, LOOT_TABLE, minigame templates, region mechanics
- `src/systems/explorationEngine.ts` — Core exploration logic engine
- `src/components/DiscoveryOverlay.tsx` — Full-screen minigame component

## Files Modified
- `src/types/world.ts` — Added hazard, hidden, perception, discoveryGame, loot, combatModifiers fields
- `src/types/index.ts` — Added exploration types export
- `src/types/gameState.ts` — Added inventory, revealedHiddenNodeIds, discoveredGameIds to WorldState
- `src/store/gameStore.ts` — Added WorldSlice exploration actions, initial state, selector filter
- `src/systems/worldMapGenerator.ts` — Full rewrite with hazard assignment, hidden nodes, loot, minigame attachment
- `src/screens/GameScreen.tsx` — Hazard resolution, Six Sense, discovery overlay, loot collection, inventory display
- `src/styles/base.css` — ~400 lines of exploration CSS

## Technical Notes

### Hazard Flow
1. Player clicks connected node → `handleExploreNode` called
2. If node has non-None hazard and `hazardAwareness` is false → `resolveHazard()` fires
3. `hazardAwareness` set to true → next call proceeds to node action
4. Hazard effects: damage (displayed), energy drain (deducted from store), marks loss (notified), time skip (advanceYears), combat trigger (spawns enemy)
5. Avoidable hazards grant an agility-based avoidance roll at energy cost

### Six Sense Revelation
- Perception field derived from `character.circle` + `character.stats.insight`
- Effect hook checks all hidden nodes each render for threshold crossing
- When threshold met: node unhidden, revealedHiddenNodeIds updated, node appears in connected list

### Mini-Game Resolution
- Intro → Playing → Result phases with Framer Motion transitions
- Memory: show sequence animation, then player replicates via tap
- Resonance: slider adjusts harmonic value, compared against target ± tolerance
- Glyph: random rotations, player taps to rotate 90°, alignment check on submit
- Riddle: knowledge check with `correctIndex` comparison
- On success: full rewards (base + bonus marks, energy, codex, technique)
- On failure: partial marks only
- Game IDs tracked to prevent replay

### Loot System
- Weighted rarity roll using `circle * 0.15` scaling factor
- Legendary: >0.95 threshold, Rare: >0.75, Uncommon: >0.45, Common: else
- Values multiplied by region `lootMultiplier`
- Discovery nodes: 1-3 drops, Boss nodes: 2-5 drops, Others: 30% chance of 1 drop
- Loot auto-collected and displayed in Character Sheet inventory grid

### Region Difficulty Scaling
- Circle 1 (Mortal Expanse): Poison Swamp + None hazards, Memory minigame, 1.0x loot
- Circle 2 (Aspirant Marches): 5 hazard types, Memory+Resonance, 1.2x loot, 15% hidden chance
- Circle 3 (Six-Sense Reaches): 5 hazard types, +GlyphMatch, 1.5x loot, 25% hidden chance
- Circle 4 (Shifting Frontier): 6 hazard types, +VoidRiddle, 1.8x loot, 30% hidden chance
- Circle 5 (Dust Provinces): 5 hazard types (harder pool), GlyphMatch+VoidRiddle, 2.2x loot, 35% hidden chance

## Next Priority
**Step 3.4: Cultivation Loop & Circle Ascension** — Implement mystery mark refinement, circle ascension rituals, foundation evolution, bone forging mechanics, and cultivation breakthrough events.
