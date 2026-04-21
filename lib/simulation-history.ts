import type { SimulationHistoryEntry } from "./types"

const STORAGE_KEY_PREFIX = "cp_simulation_history_"

function getStorageKey(contractId: string) {
  return `${STORAGE_KEY_PREFIX}${contractId}`
}

export function getSimulationHistory(contractId: string): SimulationHistoryEntry[] {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(contractId))
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw) as SimulationHistoryEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error("Failed to parse simulation history from localStorage", error)
    return []
  }
}

export function getAllSimulationHistory(): SimulationHistoryEntry[] {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const entries: SimulationHistoryEntry[] = []
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i)
      if (key?.startsWith(STORAGE_KEY_PREFIX)) {
        const raw = window.localStorage.getItem(key)
        if (!raw) {
          continue
        }
        const parsed = JSON.parse(raw) as SimulationHistoryEntry[]
        if (Array.isArray(parsed)) {
          entries.push(...parsed)
        }
      }
    }
    return entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (error) {
    console.error("Failed to read all simulation history from localStorage", error)
    return []
  }
}

export function saveSimulationHistory(contractId: string, entry: SimulationHistoryEntry): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    const existing = getSimulationHistory(contractId)
    const updated = [entry, ...existing].slice(0, 20)
    window.localStorage.setItem(getStorageKey(contractId), JSON.stringify(updated))
  } catch (error) {
    console.error("Failed to save simulation history to localStorage", error)
  }
}

export function clearSimulationHistory(contractId: string): void {
  if (typeof window === "undefined") {
    return
  }
  window.localStorage.removeItem(getStorageKey(contractId))
}
