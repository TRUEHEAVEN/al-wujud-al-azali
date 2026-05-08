# AL-WUJUD AL-AZALI — AI Development Context

## Project Overview
**AL-WUJUD AL-AZALI** (The Eternal Existence) is a browser-based cultivation RPG built with React + TypeScript + Vite. Features gold-on-black cosmic horror aesthetic, deep single-player narrative, turn-based combat, and procedural Path generation.

## Current Implementation Status
✅ **Completed Steps (as of 2026-05-08):**
- 0.1-0.4: Project foundation, types, state management, save system
- 1.1-1.4: Design system, UI components, main menu, game HUD
- 2.1-2.4: Character creation intro, doors choice, Three Trials questionnaire, and Path Generation Algorithm
- 3.1: Combat Polish & Technique System — 21 techniques, status effects, cooldowns, shield/dodge mechanics
- 3.2: Narrative Engine & Story Events — Branching narrative, choice-driven events, per-archetype text variants, codex unlocks
- 3.3: World Exploration & Event Nodes — Environmental hazards, discovery minigames, Six Sense perception, hidden nodes, loot system, region mechanics

🔄 **Next Priority:** Step 3.4 — Cultivation Loop & Circle Ascension

## Architecture & Conventions

### Tech Stack
- **Frontend:** React 18 + TypeScript (strict mode)
- **Build:** Vite with HMR
- **State:** Zustand (lightweight, no boilerplate)
- **Animation:** Framer Motion (production-grade)
- **Styling:** CSS Modules + Custom Properties
- **Routing:** React Router v6
- **Persistence:** localStorage (no backend)

### Code Organization
```
src/
├── components/     # Reusable UI components
├── screens/        # Full-screen views/pages
├── systems/        # Game logic engines
├── store/          # Global state (Zustand)
├── types/          # TypeScript definitions
├── hooks/          # Custom React hooks
├── styles/         # CSS (tokens.css, base.css)
├── data/           # Static game content
└── utils/          # Helpers and utilities
```

### Design System
- **Colors:** Gold-on-black (`--gold-primary: #C9A84C`, `--void-black: #050508`)
- **Typography:** Cinzel (display), EB Garamond (body), Noto Sans Arabic (lore)
- **Components:** Consistent with Framer Motion animations
- **Responsive:** Mobile-first with CSS Grid layouts

### Development Workflow
1. **Read the plan** from `docs/step-X.X-implementation.md`
2. **Implement features** following existing patterns
3. **Test in browser** at `http://localhost:5173/`
4. **Document completion** in implementation markdown
5. **Move to next step**

## Key Components & Patterns

### Screen Structure
```tsx
export function ScreenName() {
  return (
    <motion.div className="screen screen-name">
      {/* Content with Framer Motion animations */}
    </motion.div>
  )
}
```

### Component Props
```tsx
type ComponentProps = {
  // Required props first
  requiredProp: string
  // Optional with defaults
  optionalProp?: number
  // Size variants
  size?: 'small' | 'medium' | 'large'
}
```

### State Management
```tsx
// store/gameStore.ts
interface GameSlice {
  data: Type
  actions: () => void
}

// Component usage
const data = useGameStore(state => state.data)
const action = useGameStore(state => state.actions)
```

### Styling Convention
- CSS custom properties for theming
- Component-specific classes
- Responsive breakpoints
- Hardware-accelerated animations

## Game Systems Overview

### Cultivation System
- **Mystery Marks:** Accumulate through actions, boost all systems





















- **Mastery Stages:** Formation (1K) → Newbie (10K) → Controller (206 bones) → etc.
- **Foundation:** Evolving metaphysical core (egg → crystalline → shelled)
- **Circles:** 9 progression tiers with unique mechanics

### Character Creation
- **Three Trials:** Philosophical questionnaire (Good/Evil/Self)
- **Path Generation:** Procedural unique Path from trial answers
- **Rune System:** Visual symbol representing Path
- **Starting Stats:** Foundation, Mind Space, initial marks

### World & Combat
- **Node-based Map:** Exploration with events
- **Turn-based Combat:** Technique system with 21 abilities, status effects (buffs/debuffs/DoTs/HoTs/shields/dodge), cooldown management, energy costs
- **Six Sense:** Perception field that grows with circles
- **Embodiment:** Transformation mechanics (Third Circle+)

## Development Guidelines

### When Implementing New Features:
1. **Check existing patterns** in similar components
2. **Use TypeScript interfaces** from `src/types/`
3. **Follow naming conventions** (PascalCase components, camelCase functions)
4. **Add responsive design** considerations
5. **Include loading/error states** where appropriate
6. **Test animations** and interactions
7. **Document in step markdown** when complete

### Performance Considerations:
- Use `React.memo` for expensive components
- Prefer CSS animations over JS where possible
- Implement virtualization for large lists
- Optimize bundle size (tree shaking enabled)

### Accessibility:
- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- Screen reader friendly

## Current Development Focus
**Step 3.4: Cultivation Loop & Circle Ascension** — Implement mystery mark refinement, circle ascension rituals, foundation evolution, bone forging mechanics, and cultivation breakthrough events.

## Contact & Context
This project follows a detailed development plan in `docs/step-X.X-implementation.md` files. Each step builds upon previous work with full TypeScript coverage and comprehensive testing.

**Aesthetic Rule:** Everything flows or shatters — nothing bounces. Every major moment should feel like it costs something.