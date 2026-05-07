import { createContext } from 'react'

export type ShellPhase = 'boot' | 'main-menu' | 'first-dream'
export type ShellRoute = 'menu' | 'game' | 'codex' | 'settings'

export type GameShellState = {
  phase: ShellPhase
  route: ShellRoute
}

export type GameContextValue = {
  shell: GameShellState
  setShell: (next: GameShellState) => void
}

export const GameContext = createContext<GameContextValue | null>(null)
