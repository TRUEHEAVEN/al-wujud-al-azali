# Step 0.2 — Core Type System

## Status
Completed on 2026-05-07.

## Goal
Define the complete foundational TypeScript type layer for game entities and systems.

## Files Added
- `src/types/common.ts`
- `src/types/path.ts`
- `src/types/technique.ts`
- `src/types/mystery.ts`
- `src/types/foundation.ts`
- `src/types/circle.ts`
- `src/types/narrative.ts`
- `src/types/world.ts`
- `src/types/enemy.ts`
- `src/types/combat.ts`
- `src/types/character.ts`
- `src/types/trials.ts`
- `src/types/gameState.ts`
- `src/types/index.ts`

## Coverage
- Character model: name, age, circle, path, foundation, mystery marks, mind space, lifespan, stats.
- Path model: archetype, philosophy, element, rune metadata, passives, technique references.
- Mystery model: mark count, mastery stage, bones, boost multiplier.
- Technique model: category, targeting, energy cost, cooldown, effect payloads.
- Combat model: phases, participants, battlefield state, log, auto-combat flag.
- Enemy model: tier, circle, path type, marks, abilities, AI profile, lore.
- World model: node types, connectivity, events, exploration state.
- Narrative model: triggers, scenes, choices, consequence tagging.
- Foundation + Circle models: structural progression requirements and lifecycle ranges.
- Root `GameState`: versioned canonical state with world/combat/narrative/cultivation/time and trial results.

## Validation
- Type system compiles in production build.
- Lint passes after integration.

## Notes
- The model is intentionally strict for early safety and easy expansion in Step 0.3 store slices.
