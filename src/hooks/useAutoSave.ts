import { useEffect } from 'react'
import { AUTO_SAVE_SLOT, saveGame } from '../systems/saveSystem'
import { useGameStore } from '../store/gameStore'

export function useAutoSave() {
  useEffect(() => {
    let previousCombat = useGameStore.getState().combat
    let previousCanAscend = useGameStore.getState().cultivation.canAscend
    let previousEventId = useGameStore.getState().narrative.activeEventId

    const unsubscribe = useGameStore.subscribe((state) => {
      const snapshot = state.toGameState()
      const currentCombat = state.combat
      const currentCanAscend = state.cultivation.canAscend
      const currentEventId = state.narrative.activeEventId

      if (previousCombat && !currentCombat) {
        try {
          saveGame(AUTO_SAVE_SLOT, snapshot, 'auto-combat-end')
        } catch {
          // autosave should never interrupt gameplay
        }
      }

      if (!previousCanAscend && currentCanAscend) {
        try {
          saveGame(AUTO_SAVE_SLOT, snapshot, 'auto-ascension-ready')
        } catch {
          // autosave should never interrupt gameplay
        }
      }

      if (previousEventId !== currentEventId && currentEventId) {
        try {
          saveGame(AUTO_SAVE_SLOT, snapshot, 'auto-story-beat')
        } catch {
          // autosave should never interrupt gameplay
        }
      }

      previousCombat = currentCombat
      previousCanAscend = currentCanAscend
      previousEventId = currentEventId
    })

    return () => {
      unsubscribe()
    }
  }, [])
}
