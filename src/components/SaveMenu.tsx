import { useState } from 'react'
import type { SaveMeta } from '../types'
import {
  AUTO_SAVE_SLOT,
  MANUAL_SAVE_SLOTS,
  deleteSave,
  listSaves,
  loadGame,
  saveGame,
} from '../systems/saveSystem'
import { useGameStore } from '../store/gameStore'

const formatPlaytime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

export function SaveMenu() {
  const [message, setMessage] = useState<string>('')

  const saveState = useGameStore((state) => state.toGameState)
  const loadGameState = useGameStore((state) => state.loadGameState)

  const metadata = new Map<number, SaveMeta>()
  listSaves().forEach((meta) => metadata.set(meta.slot, meta))

  const saveToSlot = (slot: number) => {
    try {
      saveGame(slot, saveState(), 'manual')
      setMessage(`Saved to slot ${slot}.`)
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Save failed.'
      setMessage(reason)
    }
  }

  const loadFromSlot = (slot: number) => {
    const loaded = loadGame(slot)
    if (!loaded) {
      setMessage(`Slot ${slot} is empty or corrupted.`)
      return
    }
    loadGameState(loaded)
    setMessage(`Loaded slot ${slot}.`)
  }

  const removeSlot = (slot: number) => {
    if (!window.confirm(`Delete save slot ${slot}? This cannot be undone.`)) {
      return
    }
    deleteSave(slot)
    setMessage(`Deleted slot ${slot}.`)
  }

  return (
    <div className="save-menu">
      <h3 className="save-menu-title">Save Archive</h3>

      <div className="save-slot">
        <strong>Auto Save</strong>
        <span>{metadata.get(AUTO_SAVE_SLOT)?.characterName ?? 'Empty'}</span>
        <div className="save-actions">
          <button type="button" className="menu-link" onClick={() => loadFromSlot(AUTO_SAVE_SLOT)}>
            Load
          </button>
          <button type="button" className="menu-link" onClick={() => removeSlot(AUTO_SAVE_SLOT)}>
            Delete
          </button>
        </div>
      </div>

      {MANUAL_SAVE_SLOTS.map((slot) => {
        const slotMeta = metadata.get(slot)
        return (
          <div key={slot} className="save-slot">
            <strong>Slot {slot}</strong>
            <span>
              {slotMeta
                ? `${slotMeta.characterName} • Circle ${slotMeta.circle} • ${formatPlaytime(slotMeta.playtimeSeconds)}`
                : 'Empty'}
            </span>
            <div className="save-actions">
              <button type="button" className="menu-link" onClick={() => saveToSlot(slot)}>
                Save
              </button>
              <button type="button" className="menu-link" onClick={() => loadFromSlot(slot)}>
                Load
              </button>
              <button type="button" className="menu-link" onClick={() => removeSlot(slot)}>
                Delete
              </button>
            </div>
          </div>
        )
      })}

      <p className="save-feedback">{message}</p>
    </div>
  )
}
