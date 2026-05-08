# Step 3.2 — Narrative Engine & Story Events

## Overview
Implemented a branching narrative engine tied to world nodes, choice-driven story events, Path-reactive dialogue, and a lore codex system. Narrative events now fire when entering nodes, during combat aftermath, and on circle ascension—with variant text per player archetype and branching choices that reshape the game state.

## Implemented Features

### Extended Narrative Types (`src/types/narrative.ts`)
- **`NarrativeEffectType`** enum: 17 distinct effect types (marks:gain, energy:gain, combat:start, codex:unlock, etc.)
- **`NarrativeEffect`** interface: typed effect with value and target
- **`NarrativeChoice`** extended: `conditionFlags`, `hideIfFlags`, `archetypeWeight` for branching + Path-reactivity
- **`NarrativeScene`** extended: `conditionFlags`, `hideIfFlags`, `archetypeVariant` for per-archetype text variants
- **`NarrativeEvent`** extended: `minCircle`/`maxCircle`, `archetypeFilter`, `onceOnly`, `flagOnComplete`, `codexOnView`
- **`CodexEntry`** interface: lore entries with categories (lore/path/technique/region/character/cosmic), unlock conditions (trigger/flag/circle/marks/nodeType), and cross-references
- **`NarrativeMood`** extended: added `triumphant`, `somber`, `mysterious` moods

### Narrative Engine (`src/systems/narrativeEngine.ts`)
- **`buildNarrativeContext()`**: Creates evaluation context from game state (path archetype, circle, marks, flags, kills)
- **`filterScenes()`**: Filters scenes by condition/hide flags, applies archetype variant text
- **`filterChoices()`**: Filters choices by flags, highlights archetype-weighted choices with ✨ marker
- **`resolveNarrativeEvent()`**: Full event resolution pipeline—onceOnly check, circle gating, archetype filtering, scene/choice filtering
- **`selectNodeEvent()`**: Picks the first valid node-type event for the current context
- **`resolveChoiceEffects()`**: Parses effect strings into structured `ChoiceResult` with marks, energy, health, time, combat, flags, codex unlocks, foundation/narrative/story modifiers
- **`getCombatAftermathEvent()`**: Returns victory/defeat narrative from combat event pool
- **`getCircleAscensionEvent()`**: Returns circle-specific ascension narrative
- **`checkAndUnlockCodex()`**: Evaluates codex entries against current state for auto-unlock
- **`deriveMoodStyles()`**: Maps narrative moods to CSS color/shadow values

### Narrative Events Data (`src/data/narrativeEvents.ts`)
- **`NODE_EVENTS`**: 5 node-type event pools (safe, danger, discovery, boss, story) with:
  - Per-archetype scene variants (e.g., Void Watcher sees truth outlines, Bone Harvester feels combat-ready)
  - Conditional scenes (visited-safe flag)
  - Branching choices with archetype weights and flag gating
  - `flagOnComplete` for story tracking
- **`COMBAT_EVENTS`**: Victory (triumphant) and defeat (somber) narrative events with archetype text variants
- **`CIRCLE_EVENTS`**: Circle 2 (Awakening) and Circle 3 (Embodiment) milestone events with unique flavor per archetype
- **`CODEX_ENTRIES`**: 8 lore entries including The Nature of Mystery Marks, The Thread of Fate, The Silent Choice, The Fallen Memorial, Second/Third Circle descriptions, Formation Stage, and The 206 Bones of Mastery
- **`getNodeEventsForType()`**: Event pool accessor by node type string
- **`getCodexEntriesForUnlock()`**: Batch codex unlock evaluator

### NarrativeOverlay Component (`src/components/NarrativeOverlay.tsx`)
- Full-screen modal overlay with backdrop blur
- Scene-by-scene progression with forward/back navigation
- Speaker display styled by mood color
- Mood label (Calm/Intense/Amused/Terrifying/Voiceless/Triumphant/Somber/Mysterious) with color coding
- Text rendered via `RuneText` for consistent typography
- Animated scene transitions (Framer Motion `AnimatePresence`)
- Choice panel at final scene with `CosmicButton` options
- Scene counter (X / N)
- Dismiss button on choice-less events

### GameScreen Integration (`src/screens/GameScreen.tsx`)
- **Node entry flow**: `handleExploreNode` now builds narrative context, checks for node-type events, shows NarrativeOverlay before executing node actions (combat/discovery/safe/story)
- **`pendingNodeAction`**: Deferred node action that fires after narrative choice/dismiss
- **`handleNarrativeChoice()`**: Processes choice effects—marks gain, energy changes, time advance, combat start (normal/boss), evasion checks, flag setting, codex unlocks, foundation/story/technique modifiers
- **`handleNarrativeDismiss()`**: Sets completion flags and codex unlocks, then executes pending node action
- **Combat aftermath**: Victory and defeat paths now generate narrative events via `getCombatAftermathEvent()`
- **Codex tracking**: `unlockCodex` and `hasCodexEntry` store actions to manage unlocked lore entries

### Store Updates (`src/store/gameStore.ts`)
- **`NarrativeState`** extended: added `unlockedCodexIds: string[]`
- **`unlockCodex(entryId)`**: Appends entry ID to unlocked list (deduplicated)
- **`hasCodexEntry(entryId)`**: Checks if codex entry is unlocked

### CSS Additions (`src/styles/base.css`)
- `.narrative-overlay`: Fixed full-screen overlay at z-200 with backdrop blur
- `.narrative-backdrop`: Dark translucent background
- `.narrative-container`: Constrained width (700px max, 90vw) with scroll
- `.narrative-header`: Speaker + mood layout with separator border
- `.narrative-text-container`: 1.15rem body text with 1.75 line height
- `.narrative-choices`: Grid of choice buttons with border separator
- `.narrative-choice-btn`: Left-aligned choice buttons with hover glow
- `.narrative-footer`: Scene counter + dismiss button layout
- Mobile responsive overrides (tighter padding, smaller fonts, 95vw width)

## Files Created
- `src/systems/narrativeEngine.ts` — Core narrative logic engine
- `src/data/narrativeEvents.ts` — Event pools, codex entries, node-type events
- `src/components/NarrativeOverlay.tsx` — Full-screen narrative modal component

## Files Modified
- `src/types/narrative.ts` — Rewritten with extended types, effect system, codex, conditions
- `src/types/gameState.ts` — Added `unlockedCodexIds` to NarrativeState
- `src/store/gameStore.ts` — Added `unlockCodex`/`hasCodexEntry` actions, updated initialState
- `src/screens/GameScreen.tsx` — Narrative integration in node exploration, combat aftermath, choice handling
- `src/styles/base.css` — ~100 lines of narrative overlay CSS

## Technical Notes

### Narrative Event Flow
1. Player clicks connected node → `handleExploreNode` called
2. Node visited, narrative context built from game state
3. `selectNodeEvent()` finds matching event for node type and context
4. If event found: `NarrativeOverlay` renders, node action deferred to `pendingNodeAction`
5. Player reads scenes, advances through them
6. At final scene, choices appear (or dismiss button if no choices)
7. `handleNarrativeChoice()` resolves effects (marks, combat, flags, codex) and triggers pending node action
8. If no event found: node action executes immediately (backward compatible)

### Choice Effect Resolution
Effect strings use `type:subtype:value` format:
- `marks:gain:50` → 50 mystery marks
- `energy:gain:25` → 25 path energy  
- `combat:start:boss` → boss combat
- `flag:set:has-killed-boss:true` → set narrative flag
- `codex:unlock:ancient-marks` → unlock codex entry
- `foundation:strengthen` → strengthen foundation
- `heal:30` → restore 30 HP

### Archetype-Reactive Text
Each scene has an optional `archetypeVariant` map. The engine checks the player's archetype and substitutes variant text:
```ts
archetypeVariant: {
  'void-watcher': 'You see the branching possibilities...',
  'bone-harvester': 'Your bones resonate with the challenge...',
}
```

### Codex Unlock Conditions
Codex entries unlock via multiple conditions:
- **flag**: Narrative flag set (e.g., `story-crossroads-done`)
- **circle**: Minimum circle reached (e.g., circle 3 unlocks Third Circle lore)
- **marks**: Minimum marks accumulated (e.g., 5000 marks unlocks Bones lore)
- **trigger**: Game event trigger (e.g., discovery node)
- Automatic on event view via `codexOnView` on NarrativeEvent

### Branching & Replayability
- `onceOnly: true` prevents event replay
- `conditionFlags`/`hideIfFlags` gate choices behind narrative state
- `archetypeWeight` highlights thematic choices (weight ≥ 3 gets ✨ marker)
- `minCircle`/`maxCircle` gates events to appropriate progression stages

## Next Priority
**Step 3.3: World Exploration & Event Nodes** — Enhance the world map with node-specific events, environmental hazards, discovery minigames, and region-specific mechanics that deepen exploration gameplay.
