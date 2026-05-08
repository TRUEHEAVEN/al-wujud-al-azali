# Step 3.4 — Cultivation Loop & Circle Ascension

## Overview
Implemented the complete cultivation progression loop: mystery mark refinement, circle ascension rituals, foundation evolution, bone forging mechanics, and cultivation breakthrough events. The game now supports full progression from Circle 1 (Mortality) through Circle 9 (AL-WUJUD AL-AZALI).

## Implemented Features

### Cultivation Data (`src/data/cultivationData.ts`)
- **9 Circle Requirements** with canonical names and lore descriptions
- **7 Mastery Stage Thresholds** (Formation → Ultimate)
- **5 Foundation Stages** (Egg → Dense) with evolution conditions
- **Bone Forging Rules** — 1 bone = 10,000 marks, 206 bones total
- **11 Breakthrough Milestones** for marks, bones, and circle thresholds
- **Circle Unlock Lists** — each circle grants specific abilities

### Cultivation Engine (`src/systems/cultivationEngine.ts`)
- **`checkCircleAscension()`** — validates all requirements (marks, bones, mastery, foundation)
- **`performAscension()`** — upgrades circle, boosts stats (+3/circle), increases lifespan and mind space
- **`checkBoneForge()`** / **`applyBoneForge()`** — converts marks to bones at 10K:1 ratio
- **`checkFoundationEvolution()`** / **`evolveFoundation()`** — auto-determines next foundation stage
- **`refineMysteryMarks()`** — recalculates mastery stage from total marks
- **`getCultivationSummary()`** — aggregates all cultivation metrics
- **`getCircleProgress()`** — percentage to next circle ascension
- **`checkBreakthroughMilestones()`** — detects milestone triggers

### Store Updates (`src/store/gameStore.ts`)
- **`ascendCircle()`** — performs circle ascension, returns updated character
- **`forgeBoneMax()`** — forges maximum possible bones from available marks
- **`evolveFoundationAction()`** — evolves foundation to next stage
- **`refineMasteryStage()`** — updates mastery stage based on mark totals
- **`useLootItem()`** — consumes inventory items (e.g., Foundation Essence for marks/integrity)
- Updated `gainMarks()` to use refinedTotal for accurate threshold calculations

### Cultivation Panel (`src/components/CultivationPanel.tsx`)
- **Circle Progress** — visual ring with marks progress bar to next ascension
- **Ascension Requirements** — grid showing marks, bones, mastery, foundation status
- **Ascension Ritual** — multi-step ritual with 7 phrases, animated circle display, Ascend button
- **Mastery Stage** — display with badge, total marks, boost multiplier, Refine button
- **Foundation Evolution** — 5-stage dot progression with descriptions, Evolve button
- **Bone Grid** — 16×13 visual grid (208 spots for 206 bones), forged bones glow gold
- **Circle Bonuses** — lifespan, mind space, Six Sense, and current circle unlock list
- **Auto-notification** — triggers when ascension/foundation evolution becomes available

### GameScreen Updates (`src/screens/GameScreen.tsx`)
- Added `'cultivation'` view with CultivationPanel embedded in GlyphPanel
- Added "Cultivate" nav button with sparkle icon
- **`useEffect` auto-check** — monitors marks/bones/circle changes and notifies when:
  - Circle ascension becomes available
  - Foundation can evolve

### Narrative Events (`src/data/narrativeEvents.ts`)
- Added ascension events for **Circles 4-9** with unique scenes and archetype variants
- Added **9 new codex entries**: Fourth through Ninth Circle lore, Controller mastery stage
- Each circle event includes thematic text, choice-driven rewards (marks, techniques, codex)

### CSS Additions (`src/styles/base.css`)
- Cultivation panel layout with section cards
- Circle progress section styles
- Ascension requirements grid (met/unmet states with color coding)
- Ascension ritual animation and ritual phrase styles
- Bone grid visualization (forged/unforged/empty states)
- Foundation stage evolution dots and descriptions
- Mastery stage badge and info
- Circle bonuses and unlock lists
- Responsive overrides for mobile

## Files Created
- `src/data/cultivationData.ts`
- `src/systems/cultivationEngine.ts`
- `src/components/CultivationPanel.tsx`

## Files Modified
- `src/store/gameStore.ts` — Added 5 new cultivation actions + loot item usage
- `src/screens/GameScreen.tsx` — Added cultivation view, nav button, auto-check effect
- `src/styles/base.css` — ~250 lines of cultivation CSS
- `src/data/narrativeEvents.ts` — Added 7 circle events + 9 codex entries

## Technical Notes

### Circle Progression Design
| Circle | Name | Min Marks | Min Bones | Mastery |
|--------|------|-----------|-----------|---------|
| 1 | Mortality | 0 | 0 | Formation |
| 2 | Adopt · Awakening | 100 | 0 | Formation |
| 3 | Transformation | 500 | 0 | Formation |
| 4 | Control | 2,000 | 10 | Newbie |
| 5 | Red Dust | 10,000 | 50 | Controller |
| 6 | Void Resonance | 50,000 | 100 | Controller |
| 7 | Eternal Return | 200,000 | 150 | Master |
| 8 | Silent Sovereignty | 500,000 | 180 | Saga |
| 9 | Eternal Existence | 1,000,000 | 200 | Supreme |

### Bone Forging Economics
- 1 bone costs 10,000 marks
- 206 bones required for full Controller architecture
- Maximum marks to forge all 206 bones: 2,060,000
- Bones are forged via the Cultivation panel manually (strategic choice)

### Auto-Refinement
- Mastery stage auto-updates when marks exceed thresholds
- Foundation auto-evolves when conditions met
- Circle ascension is player-triggered via ritual (requires manual action)

### Aesthetic Rule Compliance
- All animations use Framer Motion with fade/scale transitions (no bounces)
- Ascension ritual uses sequential phrase reveals with `initial/animate/exit`
- Bone grid uses CSS transitions for forged state
- Follows gold-on-black cosmic horror aesthetic

## Next Priority
**Step 3.5: Inventory & Equipment** — Implement inventory management, equipment slots, consumable usage, relic bonuses, and loot organization.
