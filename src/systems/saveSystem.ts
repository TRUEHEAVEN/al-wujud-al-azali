import type { GameState, SaveMeta } from '../types'

const STORAGE_PREFIX = 'al-wujud-al-azali'
const SAVE_SLOT_COUNT = 3
export const AUTO_SAVE_SLOT = 0
export const MANUAL_SAVE_SLOTS = [1, 2, 3] as const

type SaveReason = 'manual' | 'auto-combat-end' | 'auto-ascension-ready' | 'auto-story-beat'

interface SaveEnvelope {
  version: string
  slot: number
  reason: SaveReason
  checksum: string
  payload: string
  updatedAt: string
}

const saveKey = (slot: number) => `${STORAGE_PREFIX}:save:${slot}`
const metaKey = (slot: number) => `${STORAGE_PREFIX}:meta:${slot}`

const encodePayload = (state: GameState): string => {
  const compact = JSON.stringify(state)
  const bytes = new TextEncoder().encode(compact)
  let binary = ''
  bytes.forEach((value) => {
    binary += String.fromCharCode(value)
  })
  return btoa(binary)
}

const decodePayload = (payload: string): string => {
  const binary = atob(payload)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

const checksum = (value: string): string => {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }
  return String(hash)
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isValidGameState = (value: unknown): value is GameState => {
  if (!isObject(value)) return false
  if (typeof value.version !== 'string') return false
  if (!isObject(value.character)) return false
  if (!isObject(value.world)) return false
  if (!isObject(value.narrative)) return false
  if (!isObject(value.cultivation)) return false
  if (!isObject(value.time)) return false
  return true
}

export const saveGame = (
  slot: number,
  state: GameState,
  reason: SaveReason = 'manual',
): SaveMeta => {
  if (slot < 0 || slot > SAVE_SLOT_COUNT) {
    throw new Error(`Invalid save slot ${slot}.`)
  }

  const payload = encodePayload(state)
  const payloadChecksum = checksum(payload)
  const updatedAt = new Date().toISOString()

  const envelope: SaveEnvelope = {
    version: state.version,
    slot,
    reason,
    checksum: payloadChecksum,
    payload,
    updatedAt,
  }

  const metadata: SaveMeta = {
    slot,
    characterName: state.character.name,
    circle: state.character.circle,
    playtimeSeconds: state.time.ticks,
    updatedAt,
  }

  try {
    localStorage.setItem(saveKey(slot), JSON.stringify(envelope))
    localStorage.setItem(metaKey(slot), JSON.stringify(metadata))
  } catch {
    throw new Error('Unable to access localStorage for saving.')
  }

  return metadata
}

export const loadGame = (slot: number): GameState | null => {
  const raw = (() => {
    try {
      return localStorage.getItem(saveKey(slot))
    } catch {
      return null
    }
  })()
  if (!raw) return null

  try {
    const envelope = JSON.parse(raw) as SaveEnvelope
    if (!envelope?.payload || !envelope?.checksum) {
      throw new Error('Malformed save envelope.')
    }

    const actualChecksum = checksum(envelope.payload)
    if (actualChecksum !== envelope.checksum) {
      throw new Error('Save checksum mismatch.')
    }

    const decoded = decodePayload(envelope.payload)
    const parsed = JSON.parse(decoded)
    if (!isValidGameState(parsed)) {
      throw new Error('Save payload failed validation.')
    }

    return parsed
  } catch {
    try {
      localStorage.removeItem(saveKey(slot))
      localStorage.removeItem(metaKey(slot))
    } catch {
      // noop, corruption fallback still returns null
    }
    return null
  }
}

export const listSaves = (): SaveMeta[] => {
  const slots = [AUTO_SAVE_SLOT, ...MANUAL_SAVE_SLOTS]
  return slots
    .map((slot) => {
      const raw = (() => {
        try {
          return localStorage.getItem(metaKey(slot))
        } catch {
          return null
        }
      })()
      if (!raw) return null
      try {
        const meta = JSON.parse(raw) as SaveMeta
        if (typeof meta.characterName !== 'string') return null
        if (typeof meta.circle !== 'number') return null
        if (typeof meta.playtimeSeconds !== 'number') return null
        return meta
      } catch {
        return null
      }
    })
    .filter((meta): meta is SaveMeta => meta !== null)
    .sort((a, b) => a.slot - b.slot)
}

export const deleteSave = (slot: number): void => {
  try {
    localStorage.removeItem(saveKey(slot))
    localStorage.removeItem(metaKey(slot))
  } catch {
    // best effort
  }
}
