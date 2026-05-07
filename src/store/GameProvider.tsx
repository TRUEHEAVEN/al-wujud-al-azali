import { type PropsWithChildren, useMemo, useState } from 'react'
import { GameContext, type GameShellState } from './gameContext'

export function GameProvider({ children }: PropsWithChildren) {
  const [shell, setShell] = useState<GameShellState>({
    phase: 'main-menu',
    route: 'menu',
  })

  const value = useMemo(
    () => ({
      shell,
      setShell,
    }),
    [shell],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
