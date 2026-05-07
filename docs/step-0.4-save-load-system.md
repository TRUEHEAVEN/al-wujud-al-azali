# Step 0.4 — Save/Load System

## Status
Completed on 2026-05-07.

## Scope Delivered
- Implemented local save engine in `src/systems/saveSystem.ts`.
- Save slots supported:
  - auto-save slot `0`
  - manual slots `1`, `2`, `3`
- Core APIs implemented:
  - `saveGame(slot, state, reason)`
  - `loadGame(slot)`
  - `listSaves()`
  - `deleteSave(slot)`
- Serialization and compact payload encoding implemented.
- Corruption detection added with checksum validation.
- Graceful fallback for malformed/corrupted save data.
- Metadata previews implemented (name, circle, playtime, updated time).

## Store Integration
- Added snapshot + hydration methods in `src/store/gameStore.ts`:
  - `toGameState()`
  - `loadGameState(next)`
- Added persisted state fields needed by snapshots:
  - `circles`
  - `trials`

## Auto-Save
- Added `src/hooks/useAutoSave.ts`.
- Auto-save triggers wired for:
  - combat end
  - ascension-ready transition
  - major story beat (active narrative event changes)

## UI
- Added `src/components/SaveMenu.tsx`.
- Integrated save menu into:
  - `src/screens/MainMenuScreen.tsx`
  - `src/screens/SettingsScreen.tsx`

## Validation
- Lint and production build pass after integration.
