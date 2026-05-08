# Step 2.5 — Game World & Core Loop

## Overview
Implemented the node-based world exploration system, turn-based combat mechanics, and core cultivation progression loop. The GameScreen now hosts real gameplay instead of placeholders.

## Implemented Features

### World Map System (`src/systems/worldMapGenerator.ts`)
- **5 regions** scaled to player circle (Mortal Expanse → Dust Provinces)
- **5 node types**: Safe (energy restore), Danger (combat), Discovery (marks), Boss (hard combat), Story (narrative + marks)
- **Procedural generation**: 7-12 nodes per region with auto-wired connections
- **Narrative event templates** per node type with choice-driven outcomes
- **Connection graph**: Bipartite random connections ensuring all nodes reachable

### Enemy Generator (`src/systems/enemyGenerator.ts`)
- **5 tiers**: Mortal, Seeker, Forged, Ascendant, Boss — scaled to player circle
- **5 AI profiles**: Aggressive (1.3x dmg), Defensive (0.8x), Tactical (1.0x), Berserker (1.5x), Mysterious (variable)
- **8 path elements** with random assignment per enemy
- **Tier-based marks rewards**: mortal=1x, seeker=1.5x, forged=2.5x, ascendant=4x, boss=8x
- **Flavor**: Lore descriptions, ability sets, circle-appropriate naming

### Combat Engine (`src/systems/combatEngine.ts`)
- **Turn-based phases**: Initiative → PlayerTurn → EnemyTurn → Resolution → End
- **Damage calculation**: Base power + variance (0-20%), player damage scales with energy
- **Enemy AI**: Damage modifier per profile type
- **Combat state**: Participants list with HP tracking, combat log, field modifiers
- **Resolution**: Victory grants scaled marks; defeat ends combat
- **Auto-combat**: State flag for future auto-play support
- **Flee mechanic**: Player can flee on their turn (returns to previous node)

### GameScreen (`src/screens/GameScreen.tsx`)
- **Map view**: Shows current location, connected nodes as clickable cards with type icons/colors
- **Combat view**: Split-screen player vs enemy with HP bars, attack/flee buttons, combat log, post-combat resolution
- **Character view**: Full stats, foundation display, starting techniques
- **Codex view**: Path details, region lore, marks/bones progress
- **Techniques view**: List of unlocked techniques
- **Options view**: Return to menu, settings
- **Notifications**: Toast system for marks gained, energy restored, combat events
- **Auto-initialization**: World map generates on first load if none exists
- **HUD**: Energy bar, marks counter, character info, world context in side panels

### CSS Additions (`src/styles/base.css`)
- World map layout, node cards (with visited/hover states), type badges
- Combat participant panels, HP bars, action buttons, combat log
- Codex entries, technique cards, options layout
- Path info in left panel
- Responsive overrides for mobile combat/map views

## Files Created
- `src/systems/worldMapGenerator.ts`
- `src/systems/enemyGenerator.ts`
- `src/systems/combatEngine.ts`
- `docs/step-2.5-implementation.md`

## Files Modified
- `src/screens/GameScreen.tsx` — Full rewrite with game loop
- `src/styles/base.css` — ~150 lines of new game UI CSS
- `src/screens/CharacterCreationScreen.tsx` — Fixed `variant` → `glow` prop
- `src/screens/DoorsScreen.tsx` — Removed unused import
- `src/screens/FirstDreamScreen.tsx` — Removed unused import

## Technical Notes

### Combat Flow
1. Player explores a Danger/Boss node → `createCombatState()` with enemy + field
2. Phase set to `PlayerTurn` → player clicks Attack or Flee
3. `playerAttack()` → calculates damage, advances to EnemyTurn
4. After 800ms delay → `enemyTurn()` → AI-driven damage to player
5. Check `isCombatOver()` → if yes, `resolveCombat()` grants marks
6. Player clicks Continue → returns to map view

### World Map Generation
- Uses `Math.random()` (non-seeded) for variety each session
- Node names drawn from themed pools per type
- Connections ensure the graph is traversable
- Region auto-selected from `REGIONS[circle]` map

### State Flow
- Zustand store (`gameStore.ts`) already had world/combat slices from Step 0.3
- GameScreen directly calls store actions (setWorldNodes, startCombat, gainMarks, etc.)
- Combat state is synced between local component state and global store

## Known Issues (Pre-existing)
- `CharacterCreationScreen.tsx` — setState-in-effect lint warning
- `FirstDreamScreen.tsx` — setState-in-effect lint warning

## Next Priority
**Step 3.1: Combat Polish & Technique System** — Wire actual techniques into combat, add technique selection UI, implement technique effects (healing, buffs, statuses), improve combat balance.
